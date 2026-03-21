import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function PageLayout({
  children,
  className = "",
  showHeader = true,
  showFooter = true,
}: PageLayoutProps) {
  return (
    <div className={`flex min-h-screen flex-col ${className}`}>
      {showHeader && <Header />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
