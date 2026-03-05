import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhatWeDoSection from "@/components/WhatWeDoSection";
import ServicesSection from "@/components/ServicesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="relative overflow-hidden scanline">
      <Navbar />
      <HeroSection />
      <WhatWeDoSection />
      <ServicesSection />
      <Footer />
    </main>
  );
};

export default Index;
