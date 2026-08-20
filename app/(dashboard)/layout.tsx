export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 md:py-24">
      {children}
    </div>
  );
}
