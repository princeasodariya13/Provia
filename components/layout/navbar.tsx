"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Navbar as AceternityNavbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { Menu, MenuItem, HoveredLink } from "@/components/ui/navbar-menu";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const navItems = [
    { name: "Home", link: "/" },
    { name: "How it Works", link: "/how-it-works" },
    { name: "Examples", link: "/#examples" },
  ];

  return (
    <div className="relative w-full z-50">
      <AceternityNavbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <Menu setActive={setActive}>
              <MenuItem setActive={setActive} active={active} item="Home" href="/" />
              <MenuItem setActive={setActive} active={active} item="Features">
                <div className="flex flex-col space-y-4 text-sm p-4">
                  <HoveredLink href="/#portfolio">Portfolio Generation</HoveredLink>
                  <HoveredLink href="/#ai">AI Extraction</HoveredLink>
                  <HoveredLink href="/#design">Premium Designs</HoveredLink>
                </div>
              </MenuItem>
              <MenuItem setActive={setActive} active={active} item="How it Works" href="/how-it-works" />
            </Menu>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold tracking-wide text-text-primary hover:text-brand transition-colors">
              Sign In
            </Link>
            <NavbarButton variant="primary" href="/register">
              Get Started
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
          >
            {navItems.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300 font-bold px-4 py-2"
              >
                <span className="block">{item.name}</span>
              </Link>
            ))}
            <div className="flex w-full flex-col gap-4 mt-4">
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="secondary"
                href="/login"
                className="w-full text-center"
              >
                Sign In
              </NavbarButton>
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                href="/register"
                className="w-full text-center"
              >
                Get Started
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </AceternityNavbar>
    </div>
  );
}
