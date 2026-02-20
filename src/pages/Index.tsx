import { BentoCard } from "@/components/BentoCard";
import { FilterBar } from "@/components/FilterBar";
import { FloatingAbout } from "@/components/FloatingAbout";
import { Navbar } from "@/components/Navbar";
import { Music, Layout, Terminal } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#050505] selection:bg-cyan-500/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-20">
        <FilterBar />
        
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
          
          {/* Hero Card */}
          <div className="md:col-span-2 md:row-span-2">
            <BentoCard
              size="hero"
              title="Loom-un 10 milyon istifadəçiyə çatma strategiyası"
              category="Kopiraytinq"
              readTime="1 dəq"
              colorTheme="blue"
              image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
              className="h-full"
            />
          </div>

          {/* Square Card 1 */}
          <div className="md:col-span-1 md:row-span-1">
            <BentoCard
              size="square"
              title="Spotify-ın fərdiləşdirilmiş pleylistlərinin sirri"
              category="Sosial"
              readTime="30 san"
              colorTheme="pink"
              icon={<Music className="w-10 h-10 text-pink-400" />}
              className="h-full bg-gradient-to-br from-[#1a0b14] to-black"
            />
          </div>

          {/* Square Card 2 */}
          <div className="md:col-span-1 md:row-span-1">
            <BentoCard
              size="square"
              title="Notion-un viral böyümə döngüsü"
              category="Brend"
              readTime="2 dəq"
              colorTheme="yellow"
              icon={<Terminal className="w-10 h-10 text-yellow-400" />}
              className="h-full bg-gradient-to-br from-[#1a180b] to-black"
            />
          </div>

          {/* Wide Card */}
          <div className="md:col-span-2 md:row-span-1">
            <BentoCard
              size="wide"
              title="Marketing nümunələrini çalma strategiyası"
              category="Kopiraytinq"
              readTime="5 dəq"
              colorTheme="blue"
              image="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop"
              className="h-full"
            />
          </div>

          {/* Standard Cards Fillers */}
          <div className="md:col-span-1 md:row-span-1">
            <BentoCard
              title="Airbnb-nin dizayn sistemi"
              category="Dizayn"
              readTime="3 dəq"
              colorTheme="pink"
              image="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop"
              className="h-full"
            />
          </div>

          <div className="md:col-span-1 md:row-span-1">
             <BentoCard
              title="Duolingo gamification"
              category="Məhsul"
              readTime="4 dəq"
              colorTheme="yellow"
              icon={<Layout className="w-8 h-8 text-green-400" />}
              size="square"
              className="h-full"
            />
          </div>

        </div>
      </main>

      <FloatingAbout />
    </div>
  );
};

export default Index;