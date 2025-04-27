/**
 * FONT INTEGRATION GUIDE FOR NEXT.JS 15
 * 
 * There are two main approaches to adding custom fonts in Next.js:
 * 
 * 1. Using Next.js built-in font system (Recommended)
 * 2. Using local font files
 * 
 * This file demonstrates both approaches.
 */

import { Inter, Roboto_Mono } from 'next/font/google';
import localFont from 'next/font/local';

/**
 * METHOD 1: Using Google Fonts with next/font
 * 
 * Benefits:
 * - Automatically optimized and self-hosted
 * - No external network requests
 * - No Cumulative Layout Shift
 */
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

/**
 * METHOD 2: Using Local Font Files
 * 
 * Steps:
 * 1. Add your font files to public/fonts/ directory
 * 2. Create a localFont instance referencing those files
 * 3. Use the font in your components or global styles
 */

// CryptoStarter Logo Font - Metavers
export const logoFont = localFont({
  src: [
    {
      path: '../../public/fonts/Metavers.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-logo',
  display: 'swap',
});

// Example of using a local font file
/* 
// Uncomment and update paths when you have additional custom fonts
export const customFont = localFont({
  src: [
    {
      path: '../../public/fonts/YourFont-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/YourFont-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-custom',
});
*/

/**
 * USAGE IN YOUR APP:
 * 
 * 1. In layout.tsx, add the font variables to the body className:
 * 
 * import { inter, robotoMono, customFont } from '@/lib/fonts';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="en">
 *       <body className={`${inter.variable} ${robotoMono.variable} ${customFont.variable}`}>
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * 
 * 2. In your CSS or Tailwind config, use the variables:
 * 
 * CSS example:
 * .my-element {
 *   font-family: var(--font-custom);
 * }
 * 
 * Material UI theme:
 * const theme = createTheme({
 *   typography: {
 *     fontFamily: 'var(--font-custom), "Roboto", "Helvetica", sans-serif',
 *   },
 * });
 */

// These are the fonts currently used in your app
export const appFonts = {
  inter: inter.variable,
  robotoMono: robotoMono.variable,
  logoFont: logoFont.variable,
  // Add additional custom fonts here when available
}; 