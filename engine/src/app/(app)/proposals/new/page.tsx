import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHead, ResultNotice } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { UUID_PATTERN } from '@/lib/actions/helpers';
import { messageFor } from '@/lib/errors';
import { ProposalForm } from './form';

export const dynamic = 'force-dynamic';

export default async function NewProposalPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireCapability('proposals.write');
  const sp = await searchParams;
  const oppId = sp.opportunity ?? '';
  if (!UUID_PATTERN.test(oppId)) notFound();
  const supabase = await createClient();
  const { data: opp } = await supabase.from('opportunities').select('id, name, stage').eq('id', oppId).maybeSingle();
  if (!opp) notFound();
  return (
    <>
      <PageHead title="New proposal draft" description={`For ${opp.name}. The draft is saved internally and starts as a draft.`} />
      <ResultNotice error={sp.error ? messageFor(sp.error) ?? undefined : undefined} />
      <div style={{ marginTop: 16 }}><ProposalForm opportunityId={oppId} defaultTitle={`${opp.name} — proposal`} /></div>
      <p className="small" style={{ marginTop: 12 }}><Link href={`/opportunities/${oppId}`}>Back to the opportunity</Link></p>
    </>
  );
}
