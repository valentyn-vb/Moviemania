import type { Metadata } from "next";
import { Poppins, Permanent_Marker } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-permanent-marker",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Moviemania",
    template: "%s | Moviemania",
  },
  description: "Browse trending, upcoming and top-rated movies. Powered by TMDB.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} ${permanentMarker.variable}`}>
      <body>
        <div className="pc:grid pc:min-h-screen pc:grid-cols-[minmax(256px,290px)_5fr]">
          <Header />
          <section className="px-4 py-8">{children}</section>
        </div>
      </body>
    </html>
  );
}
