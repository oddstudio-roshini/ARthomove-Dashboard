import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARthoMove Admin Portal",
  description: "ARthoMove Doctor Account Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
