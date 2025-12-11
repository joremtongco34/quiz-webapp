import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../lib/contexts/ThemeContext";

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
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
