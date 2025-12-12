import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  onAdminSettingsClick?: () => void;
}

export function PageLayout({
  children,
  className = "",
  showHeader = true,
  showFooter = true,
  onAdminSettingsClick,
}: PageLayoutProps) {
  return (
    <div className={`flex min-h-screen flex-col ${className}`}>
      {showHeader && <Header onAdminSettingsClick={onAdminSettingsClick} />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
