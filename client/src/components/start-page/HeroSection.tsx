import AETLogo from "@/assets/Logo_AET_schwarz_512x512.svg";
import TUMLogo from "@/assets/TUM_Web_Logo_blau.svg";
import { APP_DESCRIPTION } from "@/config/app";

export function HeroSection() {
  return (
    <section className="border-b bg-muted/30 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Logos */}
          <div className="flex items-center gap-4">
            <img src={AETLogo} alt="AET Logo" className="h-10 md:h-12" />
            <div className="h-8 w-px bg-border" />
            <img src={TUMLogo} alt="TUM Logo" className="h-8 md:h-10" />
          </div>

          {/* Description */}
          <p className="max-w-md text-center text-sm text-muted-foreground sm:text-right">
            {APP_DESCRIPTION}
          </p>
        </div>
      </div>
    </section>
  );
}
