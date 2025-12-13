import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sorteador Premium",
  description: "App de sorteios para henlau.com.br",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`antialiased font-sans`}>{children}</body>
    </html>
  );
}
