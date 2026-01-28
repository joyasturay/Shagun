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
  title: "Your App",
  description: "Your app description",
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
