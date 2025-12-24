// app/layout.js — FINAL: NO CART LOGIC AT ALL (Super clean)

import "./globals.css";
import Link from "next/link";
import Script from "next/script";
import Header from "@/components/header";
import Footer from "@/components/Footer";
import ClientLayout from "@/components/ClientLayout";



export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BWC85W6WHQ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BWC85W6WHQ');
          `}
        </Script>

        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1226926032689901');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1226926032689901&ev=PageView&noscript=1"
          />
        </noscript>

        {/* Header — No cart count, no () call */}
        {/* <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
          <Header/>
        </header> */}
        <ClientLayout>{children}</ClientLayout>

        {/* Footer */}
        <Footer/>
      </body>
    </html>
  );
}
