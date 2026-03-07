import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calculator, Menu, LogOut, User, BarChart3, IndianRupee, TrendingUp, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/store";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import NotificationDropdown from "./NotificationDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  totalAmount: number;
  monthlyInterest: number;
  totalInterestEarned: number;
  labels?: { first: string; second: string; third: string };
}

const Header = ({ totalAmount, monthlyInterest, totalInterestEarned, labels }: HeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: "Signed out", description: "You have been logged out." });
      navigate('/auth');
    } catch {
      toast({ title: "Sign out failed", variant: "destructive" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="px-4 sm:px-6 max-w-screen-2xl mx-auto">
          {/* Nav row */}
          <div className="flex justify-between items-center h-14">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <IndianRupee size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Lendly</span>
            </button>

            <div className="flex items-center gap-1.5">
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/calculator')}
                  className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5"
                >
                  <Calculator size={15} />
                  <span>Calculator</span>
                </Button>
              )}
              <NotificationDropdown />
              <Sheet>
                <SheetTrigger asChild>
                  <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                    <Menu size={16} className="text-white" />
                  </button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-3 py-6">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <User size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.email}</p>
                        <p className="text-xs text-muted-foreground">Account</p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/calculator')}
                      className="flex items-center justify-start gap-2.5 w-full h-11 rounded-xl"
                    >
                      <Calculator size={16} />
                      <span>Calculator</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/moi')}
                      className="flex items-center justify-start gap-2.5 w-full h-11 rounded-xl"
                    >
                      <BarChart3 size={16} />
                      <span>MOI Dashboard</span>
                    </Button>

                    <div className="flex items-center justify-between px-3 py-2 border-t mt-1 pt-4">
                      <span className="text-sm font-medium">Theme</span>
                      <ThemeToggle />
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="flex items-center justify-start gap-2.5 w-full h-11 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 mt-1"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2.5 pb-4 pt-1">
            <div className="bg-white/10 rounded-2xl px-3 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Wallet size={11} className="text-blue-200" />
                <p className="text-[10px] text-blue-200 uppercase tracking-wider font-medium">{labels?.first ?? 'Outstanding'}</p>
              </div>
              <p className="text-base sm:text-lg font-bold text-white truncate">{formatCurrency(totalAmount)}</p>
            </div>

            <div className="bg-white/10 rounded-2xl px-3 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 mb-1.5">
                <IndianRupee size={11} className="text-blue-200" />
                <p className="text-[10px] text-blue-200 uppercase tracking-wider font-medium">{labels?.second ?? 'Monthly Int.'}</p>
              </div>
              <p className="text-base sm:text-lg font-bold text-white truncate">{formatCurrency(monthlyInterest)}</p>
            </div>

            <div className="bg-white/10 rounded-2xl px-3 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp size={11} className="text-blue-200" />
                <p className="text-[10px] text-blue-200 uppercase tracking-wider font-medium">{labels?.third ?? 'Int. Earned'}</p>
              </div>
              <p className="text-base sm:text-lg font-bold text-white truncate">{formatCurrency(totalInterestEarned)}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
