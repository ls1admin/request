import { HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SupportSection() {
  const navigate = useNavigate();

  return (
    <section className="py-2 2xl:py-6">
      <div className="container mx-auto px-4">
        <h2 className="mb-2 2xl:mb-4 text-base 2xl:text-lg font-medium text-muted-foreground">
          Need Help?
        </h2>
        <Card
          className="group cursor-pointer transition-all hover:border-primary hover:bg-muted/50 hover:shadow-md"
          onClick={() => navigate("/request/support")}
        >
          <CardHeader className="pb-1 pt-3 2xl:pb-2 2xl:pt-6">
            <div className="flex items-start">
              <HelpCircle className="h-5 w-5 2xl:h-8 2xl:w-8 text-primary transition-transform group-hover:scale-110" />
            </div>
            <CardTitle className="text-sm 2xl:text-lg">
              Support Request
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 pt-0 2xl:pb-6">
            <CardDescription className="text-xs 2xl:text-sm">
              Submit a support ticket for bug reports, feature requests,
              questions, or general inquiries.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
