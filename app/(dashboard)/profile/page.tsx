import { ProfileForm } from "./ProfileForm";
import { AvatarUploader } from "./AvatarUploader";
import { ResumeIntelligence } from "./ResumeIntelligence";

export default function ProfilePage() {
  return (
    <div className="space-y-8 relative z-10 w-full max-w-4xl mx-auto pb-24">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-10 rounded-full mix-blend-multiply pointer-events-none -z-10" />
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Professional Profile</h1>
        <p className="text-text-secondary text-lg">Manage your canonical professional data. This seeds your portfolio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <AvatarUploader />
          <ResumeIntelligence />
        </div>
        <div className="md:col-span-2">
          <ProfileForm />
        </div>
      </div>
    </div>
  );
}
