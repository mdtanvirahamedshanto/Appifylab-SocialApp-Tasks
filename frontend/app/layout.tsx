import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "../components/providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Buddy Script",
  description: "Social feed application for the Appifylab selection task.",
  icons: {
    icon: "/buddy-script/assets/images/logo-copy.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="/buddy-script/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/buddy-script/assets/css/common.css" />
        <link rel="stylesheet" href="/buddy-script/assets/css/main.css" />
        <link rel="stylesheet" href="/buddy-script/assets/css/responsive.css" />
      </head>
      <body suppressHydrationWarning className="min-h-full bg-[#f6f7fb] text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
