import type { Metadata } from "next";
import "~/app/globals.css";
import WagmiProvider from "~/components/providers/WagmiProvider";
import Navigation from "~/components/Navigation";

export const metadata: Metadata = {
  title: "Farstore",
  description: "Farcaster App Store",
  icons: [
    { rel: "icon", url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "shortcut icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png", sizes: "180x180" },
  ],
  appleWebApp: {
    title: "Farstore",
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <body>
        <WagmiProvider>
          <Navigation />
          {children}
        </WagmiProvider>
      </body>
    </html>
  );
}
