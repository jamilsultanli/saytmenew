import { User, Github, Globe, Linkedin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const FloatingAbout = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
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
      </DialogTrigger>
      <DialogContent className="glass-card border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Marketinq Nümunələri
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Real marketinq strategiyaları və uğur hekayələri.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 py-4">
          <div className="flex items-start gap-4">
            <div className="min-w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <User className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="space-y-1">
              <h4 className="font-medium leading-none text-white">Müəllif haqqında</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Bu platforma marketinq sahəsindəki ən son tendensiyaları və case study-ləri Azərbaycan dilində oxuculara çatdırmaq üçün yaradılmışdır.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <a href="#" target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
               <Github className="w-5 h-5 text-gray-400 group-hover:text-white" />
               <span className="text-sm font-medium text-gray-300 group-hover:text-white">GitHub</span>
             </a>
             <a href="#" target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
               <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
               <span className="text-sm font-medium text-gray-300 group-hover:text-white">LinkedIn</span>
             </a>
          </div>

          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-xs text-cyan-200 text-center">
              "Marketinq məhsulların savaşı deyil, qavrayışların savaşıdır." <br/>
              <span className="opacity-70 mt-1 block">— Al Ries</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};