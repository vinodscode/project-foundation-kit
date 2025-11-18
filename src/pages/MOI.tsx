import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Calculator, Menu, LogOut, User } from "lucide-react";
import { formatCurrency, useLoanStore } from "@/lib/store";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Logo from "@/components/Logo";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import MOIDashboard from "@/components/MOIDashboard";

const MOI = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const getTotalMOI = useLoanStore((state) => state.getTotalMOI);
  const moiEntries = useLoanStore((state) => state.moiEntries);

  // Debug: Log MOI calculation
  const totalMOI = getTotalMOI();
  console.log('MOI Debug:', { moiEntries, totalMOI });

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
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 w-full">
      {/* MOI Header */}
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
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 w-full"
                      >
                        <span>Lending Dashboard</span>
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
          
          {/* Total MOI Card */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 p-4 md:p-5 rounded-xl shadow-sm relative overflow-hidden border border-green-100 dark:border-gray-700">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-200/30 dark:bg-green-700/20 rounded-full blur-xl"></div>
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald-200/30 dark:bg-emerald-700/20 rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500/20 dark:bg-green-500/30" style={{paddingBottom: '5px'}}>
                      <span className="text-green-700 dark:text-green-300 text-xs font-bold">ரு</span>
                    </div>
                    <h2 className="text-xs sm:text-sm text-green-800 dark:text-green-300 uppercase tracking-wider font-medium">Total MOI</h2>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalMOI)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 pb-20 w-full">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Lending Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
          <MOIDashboard />
        </div>
      </main>
    </div>
  );
};

export default MOI;
