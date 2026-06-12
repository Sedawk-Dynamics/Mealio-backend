import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "eatiso — Registration",
  description: "Join eatiso. Register with your details and Aadhaar document.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
