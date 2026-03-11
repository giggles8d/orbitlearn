import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DinnerDrop — Five weeknight dinners. One grocery run.",
  description: "Smart weekly dinner planner that generates personalized 5-dinner meal plans and pushes the grocery list to Instacart.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
