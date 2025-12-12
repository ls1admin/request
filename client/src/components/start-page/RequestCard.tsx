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
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Icon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
          {isLocked && (
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              Sign in required
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
