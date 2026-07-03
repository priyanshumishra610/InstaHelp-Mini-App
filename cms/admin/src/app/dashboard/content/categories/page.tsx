import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ContentListPage } from "@/components/content/content-list-page";

export default function CategoriesPage() {
  return (
    <DashboardLayout>
      <ContentListPage
        title="Categories"
        description="Manage app service categories"
        endpoint="/api/admin/categories"
        createEndpoint="/api/admin/categories"
        fields={[
          { key: "name", label: "Name", type: "text", required: true },
          { key: "slug", label: "Slug", type: "text", required: true },
          { key: "iconUrl", label: "Icon URL", type: "url" },
          { key: "themeColor", label: "Theme Color", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
        ]}
      />
    </DashboardLayout>
  );
}
