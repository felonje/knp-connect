import knpLogo from "@/assets/knp-logo.png";
import { Bell, Search } from "lucide-react";

const AppHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border safe-top">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2.5">
          <img src={knpLogo} alt="KNP Connect" className="w-8 h-8 rounded-lg" />
          <div>
            <span className="text-base font-bold knp-gradient-text leading-none block">KNP Connect</span>
            <span className="text-[9px] text-muted-foreground font-medium leading-none">Kisii National Polytechnic</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
