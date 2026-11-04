import type { Metadata } from "next";
import {isPortfolioDemo} from "@/lib/demo-mode";
import "./globals.css";
import "./typography.css";
import "./disclosure.css";
import "./bank.css";
import "./reading.css";
import "./demo.css";
import "./demo-studio.css";
import "./demo-type.css";

export const metadata: Metadata = {
  title: "ITP Practice Lab",
  description: "Latihan mandiri dan simulasi format TOEFL ITP Level 1 dengan soal orisinal.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang={isPortfolioDemo()?"en":"id"}><body>{children}</body></html>;
}
