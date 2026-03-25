'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Phone, Truck } from 'lucide-react';

const FLASH_TEXT = '⚡ FLASH OFFER: 15% Off All Battery Jumpstarts Today! Use Code: JUMP15  •  🚛 Fast, Reliable, Transparent Pricing  •  ⚡ FLASH OFFER: 15% Off All Battery Jumpstarts Today! Use Code: JUMP15  •  🚛 Fast, Reliable, Transparent Pricing  •  ';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <>
      {/* Flash offer ticker */}
      <div className="w-full bg-[#FF6200] overflow-hidden" style={{ height: 36 }}>
        <div className="flex animate-marquee whitespace-nowrap h-full items-center">
          <span className="text-white text-[11px] font-black uppercase tracking-widest">
            {FLASH_TEXT}{FLASH_TEXT}
          </span>
        </div>
      </div>

      {/* Main navbar */}
      <nav
        className="sticky top-0 z-50 w-full border-b border-[--border]"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-[#FF6200] rounded-lg flex items-center justify-center">
              <Truck size={16} color="#fff" strokeWidth={2.5} />
            </div>
            <span
              className="font-display text-[22px] font-black tracking-[0.12em] uppercase text-white"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              SwiftTow
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: 'Services',        href: '/#services' },
              { label: 'Fleet',           href: '/#fleet' },
              { label: 'Track My Driver', href: '/service-map', highlight: true },
            ].map(({ label, href, highlight }) => (
              <Link
                key={label}
                href={href}
                className={`text-[13px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 ${
                  highlight
                    ? 'text-[#00D16C] hover:text-black'
                    : 'text-[#64748b] hover:text-black'
                }`}
              >
                {highlight && (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D16C] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D16C]" />
                  </span>
                )}
                {label}
              </Link>
            ))}
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-3 shrink-0">
            {session ? (
              <Link
                href="/emergency-report"
                className="hidden sm:flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-[--muted] hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden sm:flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-[#64748b] hover:text-black transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-[--border] text-[12px] font-black uppercase tracking-widest text-[#0f172a] hover:border-[#00D16C] transition-all"
                >
                  Create Account
                </Link>
              </>
            )}
            <a
              href="tel:+14155550123"
              className="flex items-center gap-2 bg-[#FF6200] hover:bg-[#e55800] text-white px-4 py-2 rounded-lg text-[12px] font-black uppercase tracking-widest transition-all active:scale-95"
            >
              <Phone size={13} strokeWidth={2.5} />
              <span className="hidden sm:inline">Call +1 (415) 555-0123</span>
              <span className="sm:hidden">Call</span>
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
