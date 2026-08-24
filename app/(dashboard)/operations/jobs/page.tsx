import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { OperationsJobsClient } from "./client";

export const metadata = {
  title: "Job Operations | Provia",
};

export default async function OperationsJobsPage() {
  await requireRole("ADMIN");

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
      <PageHeader
        title="Job Operations"
        description="Background processing control center and Dead Letter Queue management."
      />
      <OperationsJobsClient />
    </div>
  );
}
