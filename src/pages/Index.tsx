import Nav from "@/components/Nav";
import HeroSection from "@/components/HeroSection";
import UpcomingRaces from "@/components/UpcomingRaces";
import RecentResults from "@/components/RecentResults";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div style={{ backgroundColor: "#f5f4f0", minHeight: "100vh" }}>
      <Nav />
      <HeroSection />
      <UpcomingRaces />
      <RecentResults />
      <SiteFooter />
    </div>
  );
};

export default Index;
