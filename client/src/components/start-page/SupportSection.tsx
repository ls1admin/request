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
    <section className="py-6 3xl:py-8">
      <div className="container mx-auto px-4">
        <h2 className="mb-4 text-lg font-medium text-muted-foreground">
          Need Help?
        </h2>
        <Card
          className="group cursor-pointer transition-all hover:border-primary hover:bg-muted/50 hover:shadow-md"
          onClick={() => navigate("/request/support")}
        >
          <CardHeader className="pb-1">
            <div className="flex items-start">
              <HelpCircle className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            </div>
            <CardTitle className="text-base">Support Request</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-xs">
              Submit a support ticket for bug reports, feature requests,
              questions, or general inquiries.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
