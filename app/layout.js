// app/layout.js
import './globals.css';
import { Sora, Epilogue } from 'next/font/google';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});
const epilogue = Epilogue({
  subsets: ['latin'],
  variable: '--font-epilogue',
  display: 'swap',
});

export const metadata = {
  title: 'Moddy - Under Construction',
  description: 'Moddy is in development and will be available soon.',
  icons: {
    // Mets un favicon local dans /public/favicon.ico si tu veux
    icon: 'https://moddy.app/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sora.variable} ${epilogue.variable}`}>
      <body>{children}</body>
    </html>
  );
}
