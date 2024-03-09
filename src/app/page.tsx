import { AboutSection } from "@/components/about-section";
import { SearchSection } from "@/components/search-section";

export default function Home() {
  return (
    <main>
      <SearchSection id="search-now" />
      <AboutSection id="about" />
    </main>
  );
}
