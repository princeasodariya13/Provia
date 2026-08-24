import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { JobDetailsClient } from "./client";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Job Details | Provia Operations",
};

export default async function JobDetailsPage(props: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const params = await props.params;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div>
        <Link href="/operations/jobs" className="inline-flex items-center text-sm font-bold text-text-secondary hover:text-brand transition-colors mb-4">
          <IconArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Link>
        <PageHeader
          title="Job Details"
          description={`Diagnostic view for job ${params.id}`}
        />
      </div>
      <JobDetailsClient jobId={params.id} />
    </div>
  );
}
