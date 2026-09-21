import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgroBuyer Intelligence",
  description: "Descubrimiento y priorización de compradores agrícolas B2B.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
