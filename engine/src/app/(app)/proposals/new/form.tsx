'use client';

import { useState } from 'react';
import { createProposalAction } from '../actions';
import { Field } from '@/components/ui';
import { PACKAGES, ADVERTISING_SPEND_NOTE, type PackageKey } from '@/lib/domain/packages';
import { minorToInput } from '@/lib/domain/money';

export function ProposalForm({ opportunityId, defaultTitle }: { opportunityId: string; defaultTitle: string }) {
  const [pkg, setPkg] = useState<PackageKey>('growth');
  const price = PACKAGES[pkg].minMonthlyMinor;
  return (
    <form action={createProposalAction} className="stack">
      <input type="hidden" name="opportunity_id" value={opportunityId} />
      <div className="card">
        <h2>Package and fees</h2>
        <p className="small muted">{ADVERTISING_SPEND_NOTE} Prices are monthly and provisional. Fees must not be below the package starting price.</p>
        <div className="fields">
          <Field label="Proposal title *" name="title"><input id="title" name="title" required minLength={3} maxLength={200} defaultValue={defaultTitle} /></Field>
          <Field label="Package *" name="service_package">
            <select id="service_package" name="service_package" value={pkg} onChange={(e) => setPkg(e.target.value as PackageKey)}>
              {(Object.keys(PACKAGES) as PackageKey[]).map((k) => <option key={k} value={k}>{PACKAGES[k].label}</option>)}
            </select>
          </Field>
          <Field label="Monthly fee (SAR) *" name="monthly_fee" hint={PACKAGES[pkg].priceNote}>
            <input id="monthly_fee" name="monthly_fee" inputMode="decimal" key={pkg} defaultValue={minorToInput(price, 'SAR')} required />
          </Field>
          <Field label="Setup fee (SAR)" name="setup_fee" hint="Enter 0 if there is no setup fee.">
            <input id="setup_fee" name="setup_fee" inputMode="decimal" defaultValue="0" />
          </Field>
          <Field label="Valid until" name="valid_until"><input id="valid_until" name="valid_until" type="date" /></Field>
          <Field label="Payment schedule" name="payment_schedule" wide><input id="payment_schedule" name="payment_schedule" maxLength={1000} placeholder="For example: monthly in advance" /></Field>
        </div>
      </div>
      <div className="card">
        <h2>Scope</h2>
        <div className="fields">
          <Field label="Scope of work *" name="scope_of_work" wide><textarea id="scope_of_work" name="scope_of_work" required minLength={10} maxLength={8000} /></Field>
          <Field label="Deliverables" name="deliverables" wide><textarea id="deliverables" name="deliverables" maxLength={4000} /></Field>
          <Field label="Exclusions" name="exclusions" wide><textarea id="exclusions" name="exclusions" maxLength={4000} /></Field>
          <Field label="Timeline" name="timeline_text" wide><input id="timeline_text" name="timeline_text" maxLength={1000} /></Field>
          <Field label="Assumptions" name="assumptions" wide><textarea id="assumptions" name="assumptions" maxLength={4000} /></Field>
          <Field label="Client responsibilities" name="client_responsibilities" wide><textarea id="client_responsibilities" name="client_responsibilities" maxLength={4000} /></Field>
        </div>
      </div>
      <div className="actions"><button type="submit">Save draft</button></div>
      <p className="small muted">A draft is internal. Sending it to the client, and recording any decision, happens in separate steps that are logged.</p>
    </form>
  );
}
