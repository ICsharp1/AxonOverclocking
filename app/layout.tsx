import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AnimatedBackground } from "@/components/layout";

export const metadata: Metadata = {
  title: "Axon Overclocking - Brain Training",
  description: "Intensive neuroplasticity-based brain training exercises",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AnimatedBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
