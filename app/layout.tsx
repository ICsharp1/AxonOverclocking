import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
