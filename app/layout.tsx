import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema ERP CRM",
  description: "Sistema de gestão para vendas, CRM e ERP com permissões por função."
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const setting = await prisma.systemSetting.findUnique({ where: { id: 1 } });
  const cssVars: React.CSSProperties = {
    ["--primary" as string]: setting?.primaryColor ?? "#0057B8",
    ["--secondary" as string]: setting?.secondaryColor ?? "#0A2540"
  };

  return (
    <html lang="pt-BR">
      <body style={cssVars}>{children}</body>
    </html>
  );
}
