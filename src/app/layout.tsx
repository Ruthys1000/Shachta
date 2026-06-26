import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "מתרגלת ערבית",
  description: "אפליקציה אישית לתרגול ערבית מדוברת",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)] font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
