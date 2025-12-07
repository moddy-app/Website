// app/layout.js
import './globals.css';
import './theme.css';

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Flex:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
