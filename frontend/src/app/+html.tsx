import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Root HTML template for Expo Router web builds.
 * This is the place to configure global <head> elements for the web app.
 * The viewport meta `viewport-fit=cover` is critical for proper safe area
 * handling on iOS Safari (notch, home indicator, etc.).
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Proper mobile viewport with safe area support */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        {/* iOS Web App meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BLUBLU" />

        {/* Android / Chrome Web App meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#F5F5F7" />

        {/* Expo's ScrollView CSS reset — keeps the body from overflowing */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
