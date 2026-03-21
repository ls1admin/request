import { useNavigate } from "react-router-dom";
import { ExternalLinksAdmin } from "@/components/admin/ExternalLinksAdmin";
import { PageLayout } from "@/components/layout/PageLayout";

export function ExternalLinksAdminPage() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <ExternalLinksAdmin onClose={() => navigate("/")} />
      </div>
    </PageLayout>
  );
}
