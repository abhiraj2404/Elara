import Link from "next/link";
import { Hexagon } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-black/5 bg-white/80 backdrop-blur-md lg:px-20">
      <div className="flex items-center gap-2">
        <div className="size-8 bg-[#39FF14] flex items-center justify-center rounded">
          <Hexagon className="size-5 text-black" strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[#121212]">Elara</h2>
      </div>

      <nav className="hidden md:flex items-center gap-10">
        <Link className="text-sm font-medium text-slate-500 hover:text-[#121212] transition-colors" href="#">
          Protocol
        </Link>
        <Link className="text-sm font-medium text-slate-500 hover:text-[#121212] transition-colors" href="#">
          Developers
        </Link>
        <Link className="text-sm font-medium text-slate-500 hover:text-[#121212] transition-colors" href="#">
          Ecosystem
        </Link>
        <Link className="text-sm font-medium text-slate-500 hover:text-[#121212] transition-colors" href="/docs">
          Docs
        </Link>
      </nav>

      <Link
        href="/dashboard"
        className="bg-[#121212] hover:bg-black text-white text-sm font-bold h-10 px-6 rounded transition-all inline-flex items-center"
      >
        Launch App
      </Link>
    </header>
  );
}
