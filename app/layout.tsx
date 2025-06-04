// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // O globals.css é importado aqui
import Header from "@/components/Header"; 
import MainMenuTabs from "@/components/MainMenuTabs"; 
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "FaceMind",
  description: "Sistema de gestão para clínicas de estética",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      {/* ✨ GARANTA QUE ESTA CLASSE ESTÁ AQUI E É CLARA ✨ */}
      <body className="bg-slate-100 antialiased"> 
        <Header />
        <MainMenuTabs />
        <main>{children}</main>
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}