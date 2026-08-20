import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-light bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-4 md:px-12 xl:px-24">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-brand flex items-center justify-center">
               <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="inline-block font-bold text-xl tracking-tight text-text-primary uppercase">Provia</span>
          </Link>
          <nav className="hidden md:flex gap-8">
            <Link href="#features" className="text-sm font-semibold tracking-wide text-text-secondary transition-colors hover:text-brand uppercase">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-semibold tracking-wide text-text-secondary transition-colors hover:text-brand uppercase">
              How it Works
            </Link>
            <Link href="#examples" className="text-sm font-semibold tracking-wide text-text-secondary transition-colors hover:text-brand uppercase">
              Examples
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold tracking-wide text-text-primary hover:text-brand transition-colors hidden sm:block uppercase">
            Sign In
          </Link>
          <Button asChild variant="outline" className="border-border-strong text-text-primary rounded-none">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
