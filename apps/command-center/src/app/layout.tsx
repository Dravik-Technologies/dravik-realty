import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { TenantBrandingProvider } from "@/components/brand/TenantBrandingProvider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dravik Realty",
    template: "%s · Dravik Realty",
  },
  description: "Dravik Realty proprietary CRM & mortgage platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-surface">
        <TenantBrandingProvider>{children}</TenantBrandingProvider>
      </body>
    </html>
  );
}
