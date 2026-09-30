import Hero from "@/components/home/Hero";
import Impact from "@/components/home/Impact";
import About from "@/components/home/About";
import ScoutSections from "@/components/home/ScoutSections";
import Hub from "@/components/home/Hub";
import Values from "@/components/home/Values";
import Achievements from "@/components/home/Achievements";
import Gallery from "@/components/home/Gallery";
import CTA from "@/components/home/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Impact />
      <About />
      <ScoutSections />
      <Hub />
      <Values />
      <Achievements />
      <Gallery />
      {/* <CTA /> */}
    </>
  );
}
