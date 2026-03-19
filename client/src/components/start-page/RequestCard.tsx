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
      <CardHeader className="pb-1 pt-3 2xl:pb-2 2xl:pt-6">
        <div className="flex items-start justify-between">
          <Icon className="h-5 w-5 2xl:h-8 2xl:w-8 text-primary transition-transform group-hover:scale-110" />
          {isLocked && (
            <Badge variant="highlighted" className="gap-1">
              <Lock className="h-3 w-3" />
              Sign in required
            </Badge>
          )}
        </div>
        <CardTitle className="text-sm 2xl:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-3 pt-0 2xl:pb-6">
        <CardDescription className="text-xs 2xl:text-sm">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
