import { PageHead } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { LeadCreateForm } from './form';

export const dynamic = 'force-dynamic';

export default async function NewLeadPage() {
  await requireCapability('leads.write');
  return (
    <>
      <PageHead title="New lead" description="Record only what you know. Every lead needs a source and at least one contact method." />
      <LeadCreateForm />
    </>
  );
}
