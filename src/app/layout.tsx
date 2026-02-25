import type { Metadata } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import React from "react";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CINWIO Domains | Dashboard",
  description: "Domain Reseller and Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} ${spaceGrotesk.variable} ${outfit.variable}`}>
        <header className="header">
          <div className="container nav-container">
            <Link href="/" className="logo">
              CINWIO<span className="highlight">.</span> Domains
            </Link>
            <nav className="nav">
              <ul className="nav-list">
                <li>
                  <Link href="/domains" className="nav-link">Domains</Link>
                </li>
                <li>
                  <Link href="/dns" className="nav-link">DNS</Link>
                </li>
                <li>
                  <Link href="/login" className="btn btn-outline">Login</Link>
                </li>
                <li>
                  <Link href="/register" className="btn btn-primary">Register</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
