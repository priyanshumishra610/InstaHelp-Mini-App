import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ContentListPage } from "@/components/content/content-list-page";

export default function DealsPage() {
  return (
    <DashboardLayout>
      <ContentListPage
        title="Deals & Offers"
        description="Manage affiliate deals and promotional offers"
        endpoint="/api/admin/deals"
        createEndpoint="/api/admin/deals"
        fields={[
          { key: "dealTitle", label: "Deal Title", type: "text", required: true },
          { key: "dealBannerUrl", label: "Banner URL", type: "url" },
          { key: "merchantLogoUrl", label: "Merchant Logo", type: "url" },
          { key: "discount", label: "Discount", type: "text" },
          { key: "couponCode", label: "Coupon Code", type: "text" },
          { key: "affiliateUrl", label: "Affiliate URL", type: "url" },
          { key: "description", label: "Description", type: "textarea" },
        ]}
      />
    </DashboardLayout>
  );
}
