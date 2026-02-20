import { User } from "lucide-react";

export const FloatingAbout = () => {
  return (
    <button className="fixed bottom-8 right-8 z-50 flex items-center gap-3 pl-4 pr-1.5 py-1.5 rounded-full glass-panel group hover:bg-white/10 transition-all hover:scale-105 border-cyan-500/30 shadow-[0_0_20px_rgba(0,229,255,0.15)]">
      <span className="text-sm font-medium text-white">Haqqımda</span>
      <div className="relative">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px]">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
             <User className="w-5 h-5 text-gray-300" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border-2 border-black">
          <span className="text-[10px] font-bold text-white">1</span>
        </div>
      </div>
    </button>
  );
};