import Link from "next/link";
import { BrandLogo } from "./brand-logo";

export function BrandNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-frosted-glass bg-snow-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6 lg:px-8">
        <BrandLogo />
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how" className="text-sm text-pewter transition-colors hover:text-forest-depths">
            How it works
          </a>
          <a href="#features" className="text-sm text-pewter transition-colors hover:text-forest-depths">
            Features
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm text-pewter transition-colors hover:text-forest-depths sm:inline"
          >
            Sign in
          </Link>
          <Link href="/signup" className="btn-primary px-5 py-2.5 text-sm">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
