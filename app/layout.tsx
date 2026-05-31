import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { AppProvider } from "../context/AppContext";
import { AppLayout } from "../components/AppLayout";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Antugas — Academic Dashboard",
  description: "Dashboard produktivitas akademik untuk manajemen tugas dan jadwal kuliah. Terintegrasi dengan Google Classroom.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <head>
        {/* Google Identity Services */}
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
        {/* Google API Client */}
        <Script src="https://apis.google.com/js/api.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col">
        <AppProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AppProvider>
      </body>
    </html>
  );
}


