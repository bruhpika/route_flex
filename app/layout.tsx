import type { Metadata } from "next";
import { 
  Orbitron, 
  Space_Mono, 
  DM_Mono, 
  Press_Start_2P, 
  Courier_Prime 
} from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const orbitron = Orbitron({ 
  subsets: ["latin"], 
  variable: "--font-orbitron" 
});

const spaceMono = Space_Mono({ 
  subsets: ["latin"], 
  weight: ["400", "700"], 
  variable: "--font-space-mono" 
});

const dmMono = DM_Mono({ 
  subsets: ["latin"], 
  weight: ["400", "500"], 
  variable: "--font-dm-mono" 
});

const pressStart2P = Press_Start_2P({ 
  subsets: ["latin"], 
  weight: "400", 
  variable: "--font-press-start" 
});

const courierPrime = Courier_Prime({ 
  subsets: ["latin"], 
  weight: ["400", "700"], 
  variable: "--font-courier" 
});

export const metadata: Metadata = {
  title: "RouteFlex",
  description: "Turn your drive into a flex.",
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
        "antialiased",
        orbitron.variable,
        spaceMono.variable,
        dmMono.variable,
        pressStart2P.variable,
        courierPrime.variable
      )}
    >
      <head>
        <link 
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

