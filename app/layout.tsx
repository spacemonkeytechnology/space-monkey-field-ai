import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Space Monkey Field AI",
  description: "AI-assisted job-site analysis and service reports for field technicians.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cockpit font-sans antialiased">{children}</body>
    </html>
  );
}
