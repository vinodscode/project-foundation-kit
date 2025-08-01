import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Calculator, Menu, LogOut, User } from "lucide-react";
import { formatCurrency, useLoanStore } from "@/lib/store";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Logo from "./Logo";
import NotificationDropdown from "./NotificationDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  totalAmount: number;
  monthlyInterest: number;
  totalInterestReceived: number;
  remainingPrincipal: number;
}

const Header = ({ totalAmount, monthlyInterest }: HeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  // MOI Mode
  const moiMode = useLoanStore((state) => state.moiMode);
  const setMoiMode = useLoanStore((state) => state.setMoiMode);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm w-full">
      <div className="page-container py-4 md:py-6">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <div className="flex items-center" onClick={() => navigate('/')} role="button">
            <Logo size={isMobile ? "sm" : "md"} />
          </div>
          
          {isMobile ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/calculator')}
                className="flex items-center justify-center"
              >
                <Calculator size={18} />
              </Button>

              <NotificationDropdown />
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                  >
                    <Menu size={18} />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 py-6">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User size={16} className="text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user?.email}</p>
                        <p className="text-xs text-muted-foreground">Account</p>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/calculator')}
                      className="flex items-center justify-start gap-2 w-full"
                    >
                      <Calculator size={16} />
                      <span>Calculator</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/moi')}
                      className="flex items-center justify-start gap-2 w-full"
                    >
                      <span>MOI Dashboard</span>
                    </Button>

                    <div className="flex items-center justify-between border-t pt-4">
                      <span className="text-sm font-medium">Theme</span>
                      <ThemeToggle />
                    </div>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleSignOut}
                      className="flex items-center justify-start gap-2 w-full mt-4"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/calculator')}
                className="flex items-center gap-1.5"
              >
                <Calculator size={16} />
                <span>Calculator</span>
              </Button>

              <NotificationDropdown />
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                  >
                    <Settings size={18} />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User size={16} className="text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user?.email}</p>
                        <p className="text-xs text-muted-foreground">Account</p>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/moi')}
                      className="flex items-center justify-center gap-2 w-full"
                    >
                      <span>MOI Dashboard</span>
                    </Button>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Theme</span>
                      <ThemeToggle />
                    </div>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleSignOut}
                      className="flex items-center justify-center gap-2 w-full"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* New design for Total Amount Lent card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 p-4 md:p-5 rounded-xl shadow-sm relative overflow-hidden border border-blue-100 dark:border-gray-700">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-200/30 dark:bg-blue-700/20 rounded-full blur-xl"></div>
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-indigo-200/30 dark:bg-indigo-700/20 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500/20 dark:bg-blue-500/30" style={{paddingBottom: '5px'}}>
                  <span className="text-blue-700 dark:text-blue-300 text-xs font-bold">ரு</span>
                </div>
                <h2 className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 uppercase tracking-wider font-medium">Total Amount Lent</h2>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
          
          {/* New design for Monthly Interest card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-900 p-4 md:p-5 rounded-xl shadow-sm relative overflow-hidden border border-amber-100 dark:border-gray-700">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-200/30 dark:bg-amber-700/20 rounded-full blur-xl"></div>
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-orange-200/30 dark:bg-orange-700/20 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-500/20 dark:bg-amber-500/30" style={{paddingBottom: '5px'}}>
                  <span className="text-amber-700 dark:text-amber-300 text-xs font-bold">ரு</span>
                </div>
                <h2 className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 uppercase tracking-wider font-medium">Monthly Interest</h2>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(monthlyInterest)}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
