'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/logo';

export function ToolsNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 h-[60px] bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-white/8">
      <div className="h-full flex items-center px-4 md:px-8">
        <Logo />

        <div className="w-px h-6 bg-white/12 mx-5 hidden sm:block" />

        <div className="flex items-center gap-1 ml-auto sm:ml-0">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
              pathname === '/' ? 'bg-white/[.08] text-white' : 'text-[#888] hover:bg-white/[.04] hover:text-white'
            }`}
          >
            Chat
          </Link>
          <Link
            href="/tools"
            className={`px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
              pathname === '/tools' ? 'bg-white/[.08] text-white' : 'text-[#888] hover:bg-white/[.04] hover:text-white'
            }`}
          >
            Tools
          </Link>
        </div>
      </div>
    </nav>
  );
}
