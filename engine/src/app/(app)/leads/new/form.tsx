'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createLeadAction, type LeadFormState } from '../actions';
import { Field, Notice } from '@/components/ui';
import { LEAD_SOURCE_LABELS } from '@/lib/labels';

export function LeadCreateForm() {
  const [state, action, pending] = useActionState<LeadFormState, FormData>(createLeadAction, null);
  const v = state?.values ?? {};
  const e = state?.errors ?? {};

  return (
    <form action={action} className="stack" noValidate>
      {state?.formError ? (
        <Notice kind="error">
          {state.formError}
          {state.duplicateId ? <> <Link href={`/leads/${state.duplicateId}`}>Open the existing lead</Link>.</> : null}
        </Notice>
      ) : null}
      <div className="card">
        <h2>Contact</h2>
        <div className="fields">
          <Field label="First name *" name="first_name" error={e.first_name}>
            <input id="first_name" name="first_name" defaultValue={v.first_name ?? ''} required maxLength={80} aria-invalid={!!e.first_name} />
          </Field>
          <Field label="Last name" name="last_name" error={e.last_name}>
            <input id="last_name" name="last_name" defaultValue={v.last_name ?? ''} maxLength={80} />
          </Field>
          <Field label="Job title" name="job_title" error={e.job_title}>
            <input id="job_title" name="job_title" defaultValue={v.job_title ?? ''} maxLength={120} />
          </Field>
          <Field label="Email" name="email" error={e.email} hint="Email or phone is required.">
            <input id="email" name="email" type="email" defaultValue={v.email ?? ''} maxLength={254} autoComplete="off" aria-invalid={!!e.email} />
          </Field>
          <Field label="Phone" name="phone" error={e.phone} hint="Include the country code, for example +966 5X XXX XXXX.">
            <input id="phone" name="phone" type="tel" defaultValue={v.phone ?? ''} maxLength={32} autoComplete="off" aria-invalid={!!e.phone} />
          </Field>
          <Field label="Preferred language" name="preferred_language" error={e.preferred_language}>
            <select id="preferred_language" name="preferred_language" defaultValue={v.preferred_language ?? 'en'}>
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="card">
        <h2>Company and need</h2>
        <div className="fields">
          <Field label="Company" name="company_name" error={e.company_name}>
            <input id="company_name" name="company_name" defaultValue={v.company_name ?? ''} maxLength={160} />
          </Field>
          <Field label="Website" name="website" error={e.website}>
            <input id="website" name="website" defaultValue={v.website ?? ''} maxLength={200} />
          </Field>
          <Field label="City" name="city" error={e.city}>
            <input id="city" name="city" defaultValue={v.city ?? ''} maxLength={80} />
          </Field>
          <Field label="Industry" name="industry" error={e.industry}>
            <input id="industry" name="industry" defaultValue={v.industry ?? ''} maxLength={120} />
          </Field>
          <Field label="Company size" name="company_size" error={e.company_size}>
            <input id="company_size" name="company_size" defaultValue={v.company_size ?? ''} maxLength={40} placeholder="For example 11–50" />
          </Field>
          <Field label="Service of interest" name="service_of_interest" error={e.service_of_interest}>
            <select id="service_of_interest" name="service_of_interest" defaultValue={v.service_of_interest ?? 'not_sure'}>
              <option value="not_sure">Not sure yet</option>
              <option value="essential">Essential</option>
              <option value="growth">Growth</option>
              <option value="managed_growth_plus">Managed Growth Plus</option>
              <option value="custom">Custom scope</option>
            </select>
          </Field>
          <Field label="Estimated value (SAR, optional)" name="estimated_value" error={e.estimated_value} hint="An estimate from the conversation, not a quote.">
            <input id="estimated_value" name="estimated_value" inputMode="decimal" defaultValue={v.estimated_value ?? ''} maxLength={32} />
          </Field>
        </div>
      </div>

      <div className="card">
        <h2>Source and consent</h2>
        <div className="fields">
          <Field label="Where did this lead come from? *" name="source" error={e.source} hint="Recorded once as the original source. It is not overwritten later.">
            <select id="source" name="source" defaultValue={v.source ?? ''} required aria-invalid={!!e.source}>
              <option value="" disabled>Choose a source</option>
              {Object.entries(LEAD_SOURCE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Campaign or referrer (optional)" name="source_campaign" error={e.source_campaign}>
            <input id="source_campaign" name="source_campaign" defaultValue={v.source_campaign ?? ''} maxLength={120} />
          </Field>
          <Field label="Priority" name="priority" error={e.priority}>
            <select id="priority" name="priority" defaultValue={v.priority ?? 'medium'}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </Field>
          <Field label="Marketing consent" name="communication_consent" error={e.communication_consent} hint="Record only what the person has told you.">
            <select id="communication_consent" name="communication_consent" defaultValue={v.communication_consent ?? 'unknown'}>
              <option value="unknown">Not yet asked</option>
              <option value="granted">Granted</option>
              <option value="declined">Declined</option>
            </select>
          </Field>
          <Field label="Notes" name="notes" error={e.notes} wide>
            <textarea id="notes" name="notes" defaultValue={v.notes ?? ''} maxLength={2000} />
          </Field>
        </div>
      </div>

      <div className="actions">
        <button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save lead'}</button>
        <Link href="/leads" className="button secondary">Cancel</Link>
      </div>
    </form>
  );
}
