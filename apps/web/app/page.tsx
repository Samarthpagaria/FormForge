import { LandingNavbar } from "@/components/landing-navbar";
import { LandingHero } from "@/components/landing-hero";
import { FeaturesAlternatingLayout01 } from "@/components/landing-features";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-[#f5f5f3] dark:bg-[#09090b]">
      <LandingNavbar />
      <LandingHero />
      <FeaturesAlternatingLayout01 />
    </main>
  );
}


