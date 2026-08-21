import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-taupe/10 rounded-full blur-2xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-9 h-9 bg-brand text-white font-bold flex items-center justify-center text-xl tracking-tighter">
            P
          </div>
          <span className="font-bold text-2xl tracking-tight text-text-primary group-hover:text-brand transition-colors">
            PROVIA
          </span>
        </Link>
        <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Professional Identity Operating System
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-surface border border-border-strong px-4 py-8 shadow-xl sm:px-10">
          {children}
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-text-secondary relative z-10">
        &copy; {new Date().getFullYear()} Provia Platform. All rights reserved.
      </div>
    </div>
  );
}
