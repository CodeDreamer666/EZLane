import "~/styles/globals.css";

import { type Metadata } from "next";
import { Cormorant_Garamond, Geist, Lora } from "next/font/google";

import { EzlaneProvider } from "~/lib/store";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "EZLane",
  description: "Clients, proposals and projects — one flow.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-cormorant",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-lora",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${cormorant.variable} ${lora.variable}`}
    >
      <body>
        <TRPCReactProvider>
          <EzlaneProvider>{children}</EzlaneProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
