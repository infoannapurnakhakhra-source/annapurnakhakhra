// // // app/layout.js — FINAL: NO CART LOGIC AT ALL (Super clean)

// // import "./globals.css";
// // import Link from "next/link";
// // import Script from "next/script";
// // import Header from "@/components/header";
// // import Footer from "@/components/Footer";
// // import ClientLayout from "@/components/ClientLayout";
// // import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
// // import GoToTopButton from "@/components/GoToTopButton";
// // import PixelEvents from "@/components/PixelEvents";


// // export const dynamic = "force-dynamic";

// // export default function RootLayout({ children }) {
// //   return (
// //     <html lang="en">
// //       <body className="min-h-screen bg-gray-50">
// //         {/* Google Analytics */}
// //         <Script
// //           src="https://www.googletagmanager.com/gtag/js?id=G-BWC85W6WHQ"
// //           strategy="afterInteractive"
// //         />
// //         <Script id="google-analytics" strategy="afterInteractive">
// //           {`
// //             window.dataLayer = window.dataLayer || [];
// //             function gtag(){dataLayer.push(arguments);}
// //             gtag('js', new Date());
// //             gtag('config', 'G-BWC85W6WHQ');
// //           `}
// //         </Script>

// //         {/* Meta Pixel */}
// //         <Script id="meta-pixel" strategy="afterInteractive">
// //           {`
// //             !function(f,b,e,v,n,t,s)
// //             {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
// //             n.callMethod.apply(n,arguments):n.queue.push(arguments)};
// //             if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
// //             n.queue=[];t=b.createElement(e);t.async=!0;
// //             t.src=v;s=b.getElementsByTagName(e)[0];
// //             s.parentNode.insertBefore(t,s)}(window, document,'script',
// //             'https://connect.facebook.net/en_US/fbevents.js');
// //             fbq('init', '1226926032689901');
// //           `}
// //         </Script>

// //      {/* Microsoft Clarity */}
// // <Script id="microsoft-clarity" strategy="afterInteractive">
// //   {`
// //     (function(c,l,a,r,i,t,y){
// //       c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
// //       t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
// //       y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
// //     })(window, document, "clarity", "script", "uz4dudvfuk");
// //   `}
// // </Script>

// //         <noscript>
// //           <img height="1" width="1" style={{ display: 'none' }}
// //             src="https://www.facebook.com/tr?id=1226926032689901&ev=PageView&noscript=1"
// //           />
// //         </noscript>

// //         {/* Header — No cart count, no () call */}
// //         {/* <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
// //           <Header/>
// //         </header> */}
// //         <ClientLayout>{children}
// //           <PixelEvents />
// //           <WhatsAppFloatingButton />
// //           <GoToTopButton />
// //         </ClientLayout>

// //         {/* Footer */}
// //         <Footer />
// //       </body>
// //     </html>
// //   );
// // }


// // app/layout.js — FB In-App Browser SAFE VERSION

// "use client";

// import "./globals.css";
// import Script from "next/script";
// import Footer from "@/components/Footer";
// import ClientLayout from "@/components/ClientLayout";
// import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
// import GoToTopButton from "@/components/GoToTopButton";
// import PixelEvents from "@/components/PixelEvents";
// import { useEffect, useState } from "react";

// export const dynamic = "force-dynamic";

// export default function RootLayout({ children }) {
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);

//     // 🔒 GLOBAL SAFETY FOR FB IN-APP BROWSER
//     try {
//       localStorage.setItem("__test", "1");
//       localStorage.removeItem("__test");
//     } catch (e) {
//       window.localStorage = {
//         getItem: () => null,
//         setItem: () => {},
//         removeItem: () => {},
//         clear: () => {},
//       };
//     }

//     try {
//       sessionStorage.setItem("__test", "1");
//       sessionStorage.removeItem("__test");
//     } catch (e) {
//       window.sessionStorage = {
//         getItem: () => null,
//         setItem: () => {},
//         removeItem: () => {},
//         clear: () => {},
//       };
//     }

//   }, []);

//   // 🚫 Prevent hydration crash (CRITICAL)
//   if (!mounted) return null;

//   return (
//     <html lang="en">
//       <body className="min-h-screen bg-gray-50">

//         {/* Google Analytics */}
//         <Script
//           src="https://www.googletagmanager.com/gtag/js?id=G-BWC85W6WHQ"
//           strategy="afterInteractive"
//         />
//         <Script id="google-analytics" strategy="afterInteractive">
//           {`
//             window.dataLayer = window.dataLayer || [];
//             function gtag(){dataLayer.push(arguments);}
//             gtag('js', new Date());
//             gtag('config', 'G-BWC85W6WHQ');
//           `}
//         </Script>

//         {/* Meta Pixel */}
//         <Script id="meta-pixel" strategy="afterInteractive">
//           {`
//             !function(f,b,e,v,n,t,s)
//             {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
//             n.callMethod.apply(n,arguments):n.queue.push(arguments)};
//             if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
//             n.queue=[];t=b.createElement(e);t.async=!0;
//             t.src=v;s=b.getElementsByTagName(e)[0];
//             s.parentNode.insertBefore(t,s)}(window, document,'script',
//             'https://connect.facebook.net/en_US/fbevents.js');
//             fbq('init', '1226926032689901');
//           `}
//         </Script>

//         {/* Microsoft Clarity */}
//         <Script id="microsoft-clarity" strategy="afterInteractive">
//           {`
//             (function(c,l,a,r,i,t,y){
//               c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
//               t=l.createElement(r);t.async=1;
//               t.src="https://www.clarity.ms/tag/"+i;
//               y=l.getElementsByTagName(r)[0];
//               y.parentNode.insertBefore(t,y);
//             })(window, document, "clarity", "script", "uz4dudvfuk");
//           `}
//         </Script>

//         <noscript>
//           <img
//             height="1"
//             width="1"
//             style={{ display: "none" }}
//             src="https://www.facebook.com/tr?id=1226926032689901&ev=PageView&noscript=1"
//           />
//         </noscript>

//         {/* App Content */}
//         <ClientLayout>
//           {children}
//           <PixelEvents />
//           <WhatsAppFloatingButton />
//           <GoToTopButton />
//         </ClientLayout>

//         <Footer />
//       </body>
//     </html>
//   );
// }



// app/layout.js — CORRECT & SAFE (SERVER COMPONENT)

import "./globals.css";
import Script from "next/script";
import Footer from "@/components/Footer";
import ClientLayout from "@/components/ClientLayout";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import GoToTopButton from "@/components/GoToTopButton";
import PixelEvents from "@/components/PixelEvents";
import ClientSafetyWrapper from "@/components/ClientSafetyWrapper";

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
          `}
        </Script>

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;
              t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];
              y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "uz4dudvfuk");
          `}
        </Script>

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1226926032689901&ev=PageView&noscript=1"
          />
        </noscript>

        {/* ✅ CLIENT SAFETY WRAPPER */}
        <ClientSafetyWrapper>
          <ClientLayout>
            {children}
            <PixelEvents />
            <WhatsAppFloatingButton />
            <GoToTopButton />
          </ClientLayout>
          <Footer />
        </ClientSafetyWrapper>

      </body>
    </html>
  );
}
