import { BootSequence } from "@/components/home/BootSequence";
import { BrandsDirectory } from "@/components/home/BrandsDirectory";
import {
  defaultHeroSlides,
  HeroCarousel,
} from "@/components/home/HeroCarousel";
import { MissionSection } from "@/components/home/MissionSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ShopAllMarquee } from "@/components/home/ShopAllMarquee";
import { SpatialRailSection } from "@/components/home/SpatialRailSection";
import { TopPicksSection } from "@/components/home/TopPicksSection";

interface HomeExperienceProps {
  basePath: string;
}

export function HomeExperience({ basePath }: HomeExperienceProps) {
  return (
    <div className="apex-home storefront-home-flow">
      <BootSequence />
      <HeroCarousel slides={defaultHeroSlides} basePath={basePath} />
      <TopPicksSection basePath={basePath} />
      <SpatialRailSection basePath={basePath} />
      <ShopAllMarquee basePath={basePath} />
      <BrandsDirectory basePath={basePath} />
      <MissionSection />
      <NewsletterSection />
    </div>
  );
}
