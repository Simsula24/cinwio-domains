import type { Metadata } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import React from "react";
import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import { logout } from "./actions/auth";
import { getTranslation } from "./i18n";
import { I18nProvider } from "./I18nProvider";

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

  const lang = user?.language || 'en';
  const theme = user?.theme || 'system';
  const currency = user?.currency || 'USD';
  const t = (section: any, key: string) => getTranslation(lang, section, key);

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var theme = '${theme}';
              if (theme === 'system') {
                document.documentElement.setAttribute('data-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              } else {
                document.documentElement.setAttribute('data-theme', theme);
              }
            })();
          `
        }} />
      </head>
      <body className={`${outfit.className} ${spaceGrotesk.variable} ${outfit.variable}`}>
        <I18nProvider lang={lang} currency={currency} theme={theme}>
          <header className="header">
            <div className="container nav-container">
              <Link href="/" className="logo">
                CINWIO<span className="highlight">.</span> Domains
              </Link>
              <nav className="nav">
                <ul className="nav-list">
                  <li>
                    <Link href="/domains" className="nav-link">{t('nav', 'domains')}</Link>
                  </li>
                  <li>
                    <Link href="/dns" className="nav-link">{t('nav', 'dns')}</Link>
                  </li>
                  {user ? (
                    <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {t('nav', 'loggedInAs')} <strong style={{ color: 'white' }}>{user.email}</strong>
                      </span>
                      {(user.role === 'admin' || user.role === 'master') && (
                        <Link href="/admin" className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.3)' }}>{t('nav', 'admin')}</Link>
                      )}
                      <Link href="/settings" className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>{t('nav', 'settings')}</Link>
                      <form action={logout}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                          {t('nav', 'logout')}
                        </button>
                      </form>
                    </li>
                  ) : (
                    <>
                      <li>
                        <Link href="/login" className="btn btn-outline">{t('nav', 'login')}</Link>
                      </li>
                      <li>
                        <Link href="/register" className="btn btn-primary">{t('nav', 'register')}</Link>
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
        </I18nProvider>
      </body>
    </html>
  );
}
