import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border-strong bg-background py-12 md:py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-12 xl:px-24 flex flex-col gap-10 md:flex-row md:justify-between md:items-start md:gap-12">
        <div className="flex flex-col gap-4 md:gap-6 max-w-sm">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-brand flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="font-bold text-xl tracking-tight text-text-primary uppercase">Provia</span>
          </Link>
          <p className="text-sm font-medium text-text-secondary leading-relaxed">
            The professional portfolio generation platform designed for a distinct, editorial presence.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-8 sm:gap-16">
          <div className="flex flex-col gap-3 md:gap-4">
            <h4 className="font-bold tracking-widest text-xs uppercase text-text-primary mb-1 md:mb-2 border-b border-border-light pb-2">Product</h4>
            <Link href="#" className="text-sm font-medium text-text-secondary hover:text-brand transition-colors">Features</Link>
            <Link href="#" className="text-sm font-medium text-text-secondary hover:text-brand transition-colors">Pricing</Link>
            <Link href="#" className="text-sm font-medium text-text-secondary hover:text-brand transition-colors">Templates</Link>
          </div>
          <div className="flex flex-col gap-3 md:gap-4">
            <h4 className="font-bold tracking-widest text-xs uppercase text-text-primary mb-1 md:mb-2 border-b border-border-light pb-2">Company</h4>
            <Link href="/about" className="text-sm font-medium text-text-secondary hover:text-brand transition-colors">About</Link>
            <Link href="/blog" className="text-sm font-medium text-text-secondary hover:text-brand transition-colors">Blog</Link>
            <Link href="/contact" className="text-sm font-medium text-text-secondary hover:text-brand transition-colors">Contact</Link>
          </div>
          <div className="flex flex-col gap-3 md:gap-4">
            <h4 className="font-bold tracking-widest text-xs uppercase text-text-primary mb-1 md:mb-2 border-b border-border-light pb-2">Legal</h4>
            <Link href="#" className="text-sm font-medium text-text-secondary hover:text-brand transition-colors">Privacy</Link>
            <Link href="#" className="text-sm font-medium text-text-secondary hover:text-brand transition-colors">Terms</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-12 xl:px-24 mt-10 md:mt-16 pt-6 md:pt-8 border-t border-border-light text-xs font-semibold tracking-widest uppercase text-text-secondary flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
        <span>&copy; {new Date().getFullYear()} Provia.</span>
        <span>Editorial Output Engine</span>
      </div>
    </footer>
  )
}
