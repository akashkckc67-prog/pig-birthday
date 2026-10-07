import type { Metadata } from "next";
import "./globals.css";
import "@/components/birthday/improvements.css";
import BirthdayExperience from "@/components/birthday/Experience";

export const metadata: Metadata = {
  title: "Nayana · Twenty Eight",
  description:
    "A little birthday magic. An animated birthday celebration for Nayana Jain, with four personal photos, playful pigs, 28 little wishes, and a whole lot of yellow.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <BirthdayExperience />
        {children}
      </body>
    </html>
  );
}
