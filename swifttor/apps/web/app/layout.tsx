import type { Metadata } from "next";
import "./globals.css";
import NextAuthProvider from "@/components/SessionProvider";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";
import Providers from '@/components/Providers';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import BackendPinger from "@/components/BackendPinger";

export const metadata: Metadata = {
  title: "SwiftTow | Emergency Roadside Assistance",
  description: "Fast, reliable, and transparent towing and roadside assistance. Professional drivers dispatched in minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <NextAuthProvider>
            <GoogleMapsProvider>
              <Providers>
                <BackendPinger />
                {children}
              </Providers>
            </GoogleMapsProvider>
          </NextAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
