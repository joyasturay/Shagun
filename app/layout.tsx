import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Shagun.ai | The Modern Wedding Ledger",
    template: "%s | Shagun.ai",
  },
  description:
    "Ditch the diary. Digitize the Shagun. Securely collect, auto-scan, and reconcile wedding envelopes in real-time.",
  keywords: [
    "Indian wedding",
    "Shagun tracker",
    "wedding registry",
    "digital ledger",
    "cash gift tracker",
    "event management",
  ],
  openGraph: {
    title: "Shagun.ai | The Modern Wedding Ledger",
    description:
      "The chaos of WhatsApp photos and 2 AM Excel sheets is over. Digitize your wedding Shagun.",
    url: "https://shagun-e1ex.vercel.app",
    siteName: "Shagun.ai",
    images: [
      {
        url: "https://shagun-e1ex.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shagun.ai Dashboard Preview",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shagun.ai | The Modern Wedding Ledger",
    description: "Digitize your wedding Shagun securely and instantly.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`
          ${poppins.variable}
          ${inter.variable}
          antialiased
        `}
      >
        {children}

        <div className="hidden md:block">
          <Toaster
            richColors
            position="top-right"
            offset={24}
            closeButton
            hotkey={[]}
            expand={false}
          />
        </div>

        <div className="block md:hidden">
          <Toaster
            richColors
            position="top-center"
            offset={16}
            closeButton
            hotkey={[]}
            expand={false}
          />
        </div>
      </body>
    </html>
  );
}
