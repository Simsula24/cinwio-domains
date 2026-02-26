import type { Metadata } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import React from "react";
import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import { logout } from "./actions/auth";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth')?.value;
  let user = null;

  if (pbAuth) {
    try {
      const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/');
      pb.authStore.save(pbAuth, null);
      if (pb.authStore.isValid) {
        await pb.collection('users').authRefresh();
        user = pb.authStore.model;
      }
    } catch (err) {
      // Token might be expired or invalid
    }
  }
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
                {user ? (
                  <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Logged in as <strong style={{ color: 'white' }}>{user.email}</strong>
                    </span>
                    {(user.role === 'admin' || user.role === 'master') && (
                      <Link href="/admin" className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.3)' }}>Admin</Link>
                    )}
                    <Link href="/settings" className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Settings</Link>
                    <form action={logout}>
                      <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                        Logout
                      </button>
                    </form>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link href="/login" className="btn btn-outline">Login</Link>
                    </li>
                    <li>
                      <Link href="/register" className="btn btn-primary">Register</Link>
                    </li>
                  </>
                )}
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
