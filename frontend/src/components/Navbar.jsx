import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, History, LogOut, User as UserIcon, Settings, LifeBuoy } from "lucide-react";
import OCTVisionLogo from "@/components/OCTVisionLogo";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
        <Dialog>
          <DialogTrigger asChild>
            <button type="button" className="flex items-center gap-2 text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="h-9 w-11 rounded-xl bg-primary/15 grid place-items-center text-primary shadow-elegant"><OCTVisionLogo className="h-7 w-9" /></div>
              <span className="font-display text-lg font-bold tracking-tight">OCT<span className="text-primary">Vision</span></span>
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-border bg-card-gradient">
            <DialogHeader>
              <div className="flex items-center gap-3 text-primary"><OCTVisionLogo className="h-10 w-12" /><DialogTitle className="font-display text-2xl">OCTVision</DialogTitle></div>
              <DialogDescription className="leading-relaxed pt-2">A research and educational retinal OCT classification workspace for CNV, DME, drusen, and normal-pattern images. Results are model outputs, not clinical diagnoses.</DialogDescription>
            </DialogHeader>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl border border-border bg-background/50 p-4"><p className="font-semibold">Web development</p><p className="mt-2 text-muted-foreground">B. Jai Abhishek<br />M. Chandrashekar Naik</p></div>
              <div className="rounded-2xl border border-border bg-background/50 p-4"><p className="font-semibold">Model</p><p className="mt-2 text-muted-foreground">Anuj</p></div>
            </div>
          </DialogContent>
        </Dialog>

        <nav className="flex items-center gap-2">
          <Link to="/home">
            <Button variant="ghost" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">OCT scan</span>
            </Button>
          </Link>
          <Link to="/history">
            <Button variant="ghost" size="sm" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                <div className="h-7 w-7 rounded-full bg-primary/10 grid place-items-center">
                  <UserIcon className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {user?.name || user?.email?.split("@")[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2">
                <p className="text-sm font-medium truncate">
                  {user?.name || user?.email?.split("@")[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="cursor-pointer gap-2"
              >
                <Settings className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/support")} className="cursor-pointer gap-2">
                <LifeBuoy className="h-4 w-4" />
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await signOut();
                  navigate("/login");
                }}
                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
