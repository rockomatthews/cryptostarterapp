import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeRegistry from '../lib/ThemeRegistry';
import Navbar from '../components/Navbar';
import AuthProvider from '../components/AuthProvider';
import { logoFont } from '../lib/fonts';

// Import fonts using the Next.js font system
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// You can also import local fonts using next/font/local
// Example:
// import localFont from 'next/font/local';
// const customFont = localFont({
//   src: '../public/fonts/YourFont.woff2',
//   variable: '--font-custom',
// });

export const metadata: Metadata = {
  title: "CryptoStarter",
  description: "A decentralized crowdfunding platform",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${logoFont.variable}`}>
        <AuthProvider>
          <ThemeRegistry>
            <Navbar />
        {children}
          </ThemeRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}
