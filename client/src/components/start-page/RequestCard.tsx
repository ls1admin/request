import type { LucideIcon } from "lucide-react";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RequestCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  requiresAuth?: boolean;
  isAuthenticated: boolean;
  onLogin: () => void;
}

export function RequestCard({
  title,
  description,
  icon: Icon,
  to,
  requiresAuth = false,
  isAuthenticated,
  onLogin,
}: RequestCardProps) {
  const navigate = useNavigate();
  const isLocked = requiresAuth && !isAuthenticated;

  const handleClick = () => {
    if (isLocked) {
      onLogin();
    } else {
      navigate(to);
    }
  };

  return (
    <Card
      className="group cursor-pointer transition-all hover:border-primary hover:bg-muted/50 hover:shadow-md"
      onClick={handleClick}
    >
      <CardHeader className="pb-1">
        <div className="flex items-start justify-between">
          <Icon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
          {isLocked && (
            <Badge variant="highlighted" className="gap-0.5 text-[10px] sm:gap-1 sm:text-xs">
              <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">Sign in required</span>
              <span className="sm:hidden">Login</span>
            </Badge>
          )}
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
