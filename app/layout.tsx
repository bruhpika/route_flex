import type { Metadata, Viewport } from "next";
import { 
  Playfair_Display, 
  Outfit 
} from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-display" 
});

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-body" 
});

export const metadata: Metadata = {
  title: "RouteFlex",
  description: "Turn your drive into a flex.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RouteFlex",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0B0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={cn(
        "antialiased dark",
        playfair.variable,
        outfit.variable
      )}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

