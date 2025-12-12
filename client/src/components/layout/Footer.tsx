import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { APP_VERSION } from "@/config/app";

const footerLinks = [
  { label: "About", to: "/about" },
  { label: "Privacy", to: "/privacy" },
  { label: "Imprint", to: "/imprint" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <nav className="flex items-center gap-4">
            {footerLinks.map((link, index) => (
              <div key={link.to} className="flex items-center gap-4">
                <Link
                  to={link.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
                {index < footerLinks.length - 1 && (
                  <Separator orientation="vertical" className="h-4" />
                )}
              </div>
            ))}
          </nav>
          <p className="text-sm text-muted-foreground">v{APP_VERSION}</p>
        </div>
      </div>
    </footer>
  );
}
