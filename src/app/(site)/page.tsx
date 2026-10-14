import Hero from "@/components/home/Hero";
import HomeIntro from "@/components/home/HomeIntro";
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

// Photo-led and parent-first: who we are, the stages, photos, how to join,
// then recent news. Activities, history, camps and the map live on /about.
// The statistics band (components/home/Impact) is left out until leadership
// confirms the numbers; the joining section replaces the old closing CTA.
export default function Home() {
  return (
    <>
      <Hero />
      <HomeIntro />
      <ScoutSections />
      <Gallery />
      <JoinPreview />
      <LatestNews />
    </>
  );
}
