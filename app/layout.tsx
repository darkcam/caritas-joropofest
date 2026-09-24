import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BrandProvider } from "./brand-provider";
import { brandCssVariables } from "./lib/brand";
import { getBrandTheme } from "./lib/brand-store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const theme = await getBrandTheme();

  return {
    title: `${theme.eventName} Card`,
    description: `Captura una foto y conviértela en una card 16-bit de ${theme.eventName}.`,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getBrandTheme();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={brandCssVariables(theme) as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col">
        <BrandProvider initialTheme={theme}>{children}</BrandProvider>
      </body>
    </html>
  );
}
