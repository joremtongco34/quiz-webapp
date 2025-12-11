import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quiz App",
  description: "A modern quiz application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
