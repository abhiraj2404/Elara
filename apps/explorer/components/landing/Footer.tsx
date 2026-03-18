import Link from "next/link";
import { Hexagon } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-black/5 py-12 px-6 lg:px-20 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="size-6 bg-[#39FF14] flex items-center justify-center rounded">
            <Hexagon className="size-3 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-[#121212] font-bold tracking-tight">Elara Labs</span>
        </div>

        <div className="flex gap-8">
          <Link className="text-sm text-slate-500 hover:text-[#121212] transition-colors" href="#">
            Twitter
          </Link>
          <Link className="text-sm text-slate-500 hover:text-[#121212] transition-colors" href="#">
            GitHub
          </Link>
          <Link className="text-sm text-slate-500 hover:text-[#121212] transition-colors" href="#">
            Discord
          </Link>
        </div>

        <p className="text-xs text-slate-400">© 2024 Elara Protocol. All rights reserved.</p>
      </div>
    </footer>
  );
}
