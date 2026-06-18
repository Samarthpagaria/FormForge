import { LandingNavbar } from "@/components/landing-navbar";
import { LandingHero } from "@/components/landing-hero";
import { FeaturesAlternatingLayout01 } from "@/components/landing-features";
import { LandingWhyChooseUs } from "@/components/landing-why-choose-us";
import { LandingDemo } from "@/components/landing-demo";
import { LandingTestimonials } from "@/components/landing-testimonials";
import { LandingFaq } from "@/components/landing-faq";
import { LandingFooter } from "@/components/landing-footer";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-[#f5f5f3] dark:bg-[#09090b]">
      <LandingNavbar />
      <LandingHero />
      <FeaturesAlternatingLayout01 />
      <LandingWhyChooseUs />
      <LandingDemo />
      <LandingTestimonials />
      <LandingFaq />
      <LandingFooter />
    </main>
  );
}


