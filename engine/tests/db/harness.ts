// Test harness: real Postgres (embedded binaries, no Docker) with a minimal stand-in for
// Supabase's auth schema (auth.users and auth.uid()) and the anon/authenticated roles.
// Each user action runs inside a transaction that is rolled back, so tests stay isolated.
import { readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import EmbeddedPostgres from 'embedded-postgres';
import pg from 'pg';

const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');

export type Db = {
  admin: pg.Client;
  port: number;
  stop: () => Promise<void>;
};

export async function startDb(port: number): Promise<Db> {
  const databaseDir = mkdtempSync(join(tmpdir(), 'yech-pg-'));
  const instance = new EmbeddedPostgres({
    databaseDir,
    user: 'postgres',
    password: 'postgres',
    port,
    persistent: false,
    onLog: () => {},
    onError: () => {},
  });
  await instance.initialise();
  await instance.start();

  const admin = new pg.Client({ host: '127.0.0.1', port, user: 'postgres', password: 'postgres', database: 'postgres' });
  await admin.connect();
  await admin.query(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (
      id uuid primary key,
      email text,
      raw_user_meta_data jsonb not null default '{}'::jsonb
    );
    create or replace function auth.uid() returns uuid
      language sql stable
      as $$ select coalesce(
        nullif(current_setting('request.jwt.claim.sub', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
      )::uuid $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
  `);

  for (const file of readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort()) {
    await admin.query(readFileSync(join(MIGRATIONS_DIR, file), 'utf8'));
  }

  return {
    admin,
    port,
    stop: async () => {
      await admin.end().catch(() => {});
      await instance.stop();
      rmSync(databaseDir, { recursive: true, force: true });
    },
  };
}

export async function createAuthUser(db: Db, id: string, email: string, fullName = ''): Promise<void> {
  await db.admin.query(
    `insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`,
    [id, email, JSON.stringify({ full_name: fullName })],
  );
}

/** Superuser activation (no JWT): the same path a founder uses in the SQL editor for bootstrap. */
export async function setRole(db: Db, id: string, role: string, active = true): Promise<void> {
  await db.admin.query(`update public.profiles set role = $2::public.app_role, is_active = $3 where id = $1`, [id, role, active]);
}

export type AsUser = {
  /** Switches the session to another user (or anonymous when null) inside the same transaction. */
  become: (uid: string | null) => Promise<void>;
  /** Trusted setup only (database owner, no role switch). Used to bootstrap a founder inside a test transaction. */
  adminRun: (sql: string, params?: unknown[]) => Promise<void>;
  /** Runs SQL as the given user and rolls back at the end. Returns rows. */
  run: <T = any>(sql: string, params?: unknown[]) => Promise<T[]>;
  /** Runs SQL inside a savepoint. Returns the error message, or null on success. */
  attempt: (sql: string, params?: unknown[]) => Promise<string | null>;
  rowCount: (sql: string, params?: unknown[]) => Promise<number>;
};

/** Opens a transaction as the given user (or anonymous when uid is null). Always rolls back. */
export async function withUser<T>(db: Db, uid: string | null, fn: (u: AsUser) => Promise<T>): Promise<T> {
  const c = new pg.Client({ host: '127.0.0.1', port: db.port, user: 'postgres', password: 'postgres', database: 'postgres' });
  await c.connect();
  try {
    await c.query('begin');
    await c.query(`set local role ${uid ? 'authenticated' : 'anon'}`);
    if (uid) {
      await c.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: uid, role: 'authenticated' })]);
    }
    let savepoint = 0;
    const user: AsUser = {
      adminRun: async (sql, params) => {
        await c.query('reset role');
        await c.query(`select set_config('request.jwt.claims', '', true)`);
        await c.query(sql, params as any[]);
      },
      become: async (next) => {
        await c.query(`set local role ${next ? 'authenticated' : 'anon'}`);
        await c.query(`select set_config('request.jwt.claims', $1, true)`, [
          next ? JSON.stringify({ sub: next, role: 'authenticated' }) : '',
        ]);
      },
      run: async (sql, params) => (await c.query(sql, params as any[])).rows,
      attempt: async (sql, params) => {
        const name = `sp_${savepoint++}`;
        await c.query(`savepoint ${name}`);
        try {
          await c.query(sql, params as any[]);
          await c.query(`release savepoint ${name}`);
          return null;
        } catch (err) {
          await c.query(`rollback to savepoint ${name}`);
          return (err as Error).message;
        }
      },
      rowCount: async (sql, params) => (await c.query(sql, params as any[])).rowCount ?? 0,
    };
    return await fn(user);
  } finally {
    await c.query('rollback').catch(() => {});
    await c.end().catch(() => {});
  }
}
