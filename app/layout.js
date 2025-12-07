// app/layout.js
import './globals.css';
import './theme.css';
import Script from 'next/script';

export const metadata = {
  title: 'Moddy - Under Construction',
  description: 'Moddy is in development and will be available soon.',
  icons: {
    icon: 'https://moddy.app/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Flex:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Script id="md-typescale" strategy="beforeInteractive">
          {`
            // Material Design 3 typography setup
            import('@material/web/typography/md-typescale-styles.js').then(module => {
              document.adoptedStyleSheets.push(module.styles.styleSheet);
            });
          `}
        </Script>
      </body>
    </html>
  );
}
