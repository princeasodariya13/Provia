import { ProfileForm } from "./ProfileForm";
import { AvatarUploader } from "./AvatarUploader";
import { ResumeIntelligence } from "./ResumeIntelligence";
import { PageHeader } from "@/components/ui/page-header";

export default function ProfilePage() {
  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Profile Workspace"
        description="Manage your canonical professional identity. The verified data here seeds your portfolio and AI analysis."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Profile", href: "/profile" },
        ]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
        <div className="xl:col-span-1 space-y-10 sticky top-24">
          <AvatarUploader />
          <ResumeIntelligence />
        </div>
        <div className="xl:col-span-2">
          <ProfileForm />
        </div>
      </div>
    </div>
  );
}
