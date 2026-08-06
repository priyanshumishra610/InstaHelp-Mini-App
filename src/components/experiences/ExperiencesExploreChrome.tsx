import { ExploreTabHeader } from "@/components/explore/ExploreTabHeader";

type CatalogMode = "resorts" | "holidays";

type Props = {
  greeting: string;
  query: string;
  onQueryChange: (value: string) => void;
  statusLine: string;
  propertyCount: number;
  mode?: CatalogMode;
};

export function ExperiencesExploreChrome({
  greeting,
  query,
  onQueryChange,
  statusLine,
  propertyCount,
  mode = "resorts",
}: Props) {
  const isHolidays = mode === "holidays";

  return (
    <ExploreTabHeader
      title={isHolidays ? "Holiday packages" : "Resorts & stays"}
      subtitle={`Hi ${greeting} · ${statusLine}`}
      searchValue={query}
      onSearchChange={onQueryChange}
      searchPlaceholder={
        isHolidays
          ? "Search destination, theme, or trip"
          : "Search resort, city, or experience"
      }
      searchTypingPlaceholders={
        isHolidays
          ? ["Singapore luxury", "Thailand beaches", "Japan cherry blossom"]
          : ["Goa beach resort", "Kerala backwaters", "Rajasthan palace"]
      }
      stat={{
        value: propertyCount,
        label: isHolidays ? "Trips" : "Stays",
      }}
    />
  );
}
