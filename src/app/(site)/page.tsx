import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import ScoutSections from "@/components/home/ScoutSections";
import JoinPreview from "@/components/home/JoinPreview";
import LatestNews from "@/components/home/LatestNews";
import Gallery from "@/components/home/Gallery";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  description:
    "الموقع الرسمي لفوج روضة الفيحاء، جمعية الكشاف المسلم في لبنان – مفوضية الشمال، طرابلس. نُنمّي الإنسان، ونبني القائد، ونصنع الذكريات.",
  path: "/",
});

// Parent-first: who we are, the stages, how to join, then recent news and
// photos. Activities, history, camps and the map live on /about.
// The statistics band (components/home/Impact) is left out until leadership
// confirms the numbers; the joining section replaces the old closing CTA.
export default function Home() {
  return (
    <>
      <Hero />
      <About variant="home" />
      <ScoutSections />
      <JoinPreview />
      <LatestNews />
      <Gallery />
    </>
  );
}
