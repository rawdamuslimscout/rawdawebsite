import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import ScoutSections from "@/components/home/ScoutSections";
import Activities from "@/components/home/Activities";
import Events from "@/components/home/Events";
import Camps from "@/components/home/Camps";
import Achievements from "@/components/home/Achievements";
import Values from "@/components/home/Values";
import News from "@/components/home/News";
import Gallery from "@/components/home/Gallery";
import CTA from "@/components/home/CTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <ScoutSections />
        <Activities />
        <Events />
        <Camps />
        <Achievements />
        <Values />
        <News />
        <Gallery />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
