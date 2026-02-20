import { Search, MonitorPlay } from "lucide-react";
import { Button } from "./ui/button";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 shadow-lg overflow-hidden group-hover:scale-105 transition-transform">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">M</span>
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-wider text-white leading-none">MARKETİNQ</span>
            <span className="text-xs font-medium text-gray-400 tracking-wider leading-none">NÜMUNƏLƏRİ</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(0,229,255,0.1)] transition-all"
          />
        </div>

        {/* Subscribe Button */}
        <Button className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium px-6 shadow-[0_0_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all">
          Abunə ol
        </Button>
      </div>
    </nav>
  );
};