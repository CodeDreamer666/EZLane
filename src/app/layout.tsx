import "~/styles/globals.css";

import { type Metadata } from "next";
import { Cormorant_Garamond, Geist, Lora } from "next/font/google";

import MessageCenter from "~/app/_components/shell/MessageCenter";
import EzlaneProvider from "~/lib/store";
import TRPCReactProvider from "~/trpc/react";

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
      className={`${geist.variable} ${cormorant.variable} ${lora.variable} [&::-webkit-scrollbar-corner]:bg-bg [&::-webkit-scrollbar-thumb]:border-bg [&::-webkit-scrollbar-thumb]:bg-text/16 [&::-webkit-scrollbar-thumb:hover]:bg-text/28 [&::-webkit-scrollbar-track]:bg-bg scheme-dark [&::-webkit-scrollbar]:h-[10px] [&::-webkit-scrollbar]:w-[10px] [&::-webkit-scrollbar-thumb]:rounded-[6px] [&::-webkit-scrollbar-thumb]:border-2`}
    >
      <body className="bg-bg font-body text-text selection:bg-accent/30 m-0 text-[15px] leading-[1.55] font-normal">
        <TRPCReactProvider>
          <EzlaneProvider>{children}</EzlaneProvider>
        </TRPCReactProvider>
        <MessageCenter />
      </body>
    </html>
  );
}
