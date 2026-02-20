import { cn } from "@/lib/utils";
import { useState } from "react";

const categories = [
  { id: "all", label: "HAMISI" },
  { id: "acquisition", label: "MƏNİMSƏMƏ" },
  { id: "conversion", label: "KONVERSİYA" },
  { id: "other", label: "DİGƏR" },
];

export const FilterBar = () => {
  const [active, setActive] = useState("acquisition");

  return (
    <div className="sticky top-20 z-40 py-6 mb-8 flex justify-center">
      <div className="flex items-center gap-2 p-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-300",
              active === cat.id
                ? "bg-transparent text-white shadow-[0_0_15px_rgba(0,229,255,0.3)] border border-cyan-500/50 text-shadow-glow"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
            style={active === cat.id ? { textShadow: "0 0 10px rgba(0, 229, 255, 0.5)" } : {}}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};