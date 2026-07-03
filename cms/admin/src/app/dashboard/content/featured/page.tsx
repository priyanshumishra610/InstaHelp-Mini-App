import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ContentListPage } from "@/components/content/content-list-page";

export default function FeaturedPage() {
  return (
    <DashboardLayout>
      <ContentListPage
        title="Featured This Week"
        description="Manage featured cards shown on the home screen"
        endpoint="/api/admin/featured-cards"
        createEndpoint="/api/admin/featured-cards"
        fields={[
          { key: "title", label: "Title", type: "text", required: true },
          { key: "imageUrl", label: "Image URL", type: "url", required: true },
          { key: "description", label: "Description", type: "textarea" },
          { key: "category", label: "Category", type: "text" },
          { key: "deepLink", label: "Deep Link", type: "text" },
          { key: "ctaText", label: "CTA Text", type: "text" },
        ]}
      />
    </DashboardLayout>
  );
}
