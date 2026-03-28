'use client';

import Link from 'next/link';
import { Truck, Phone, MapPin, Clock } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Emergency Towing',    href: '/emergency-report' },
  { label: 'Roadside Assistance', href: '/emergency-report' },
  { label: 'Become a Partner',    href: '/auth/register' },
  { label: 'Contact Us',          href: 'tel:+12089695688' },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[--border] bg-[--surface]">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-[#FF6200] rounded-lg flex items-center justify-center">
                <Truck size={18} color="#fff" strokeWidth={2.5} />
              </div>
              <span
                className="font-display text-[22px] font-black tracking-[0.12em] uppercase text-white"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                SwiftTow
              </span>
            </div>
            <p className="text-[--muted] text-[13px] leading-relaxed max-w-xs">
              The modern standard for roadside assistance. We combine cutting-edge technology with
              professional service to get you moving again.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-display text-[13px] font-black uppercase tracking-[0.2em] text-[--muted] mb-5"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Quick Links
            </h4>
            <ul className="flex flex-col gap-3">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[13px] text-[--muted] hover:text-white transition-colors font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="font-display text-[13px] font-black uppercase tracking-[0.2em] text-[--muted] mb-5"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Contact
            </h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-2 text-[13px] text-[--muted]">
                <Phone size={14} className="text-[#FF6200] shrink-0" />
                <a href="tel:+12089695688" className="hover:text-white transition-colors">
                  +1 (208) 969-5688
                </a>
              </li>
              <li className="flex items-center gap-2 text-[13px] text-[--muted]">
                <MapPin size={14} className="text-[#FF6200] shrink-0" />
                <span>San Francisco, CA</span>
              </li>
              <li className="flex items-center gap-2 text-[13px] text-[--muted]">
                <Clock size={14} className="text-[#FF6200] shrink-0" />
                <span>Available 24/7/365</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[--border] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-[--dim] font-bold uppercase tracking-widest">
            © 2026 SwiftTow Solutions Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[11px] text-[--dim] hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-[11px] text-[--dim] hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
