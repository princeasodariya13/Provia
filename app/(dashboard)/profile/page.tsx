import { ProfileForm } from "./ProfileForm";
import { AvatarUploader } from "./AvatarUploader";
import { ResumeIntelligence } from "./ResumeIntelligence";
import { PageHeader } from "@/components/ui/page-header";

export default function ProfilePage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      <PageHeader
        title="Profile Workspace"
        description="Manage your canonical professional identity. The verified data here seeds your portfolio and AI analysis."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Profile", href: "/profile" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <AvatarUploader />
          <ResumeIntelligence />
        </div>
        <div className="lg:col-span-2">
          <ProfileForm />
        </div>
      </div>
    </div>
  );
}
