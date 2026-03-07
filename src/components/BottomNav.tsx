import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calculator, BarChart3, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!user || location.pathname === '/auth') return null;

  const items = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Calculator, label: "Calculator", path: "/calculator" },
    { icon: PlusCircle, label: "Add", path: "/add-loan", accent: true },
    { icon: BarChart3, label: "MOI", path: "/moi" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-800/80">
        <div className="flex items-center justify-around px-2 py-1.5">
          {items.map(({ icon: Icon, label, path, accent }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all min-w-[56px]",
                  isActive
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
                    : accent
                      ? "text-blue-500"
                      : "text-gray-400 dark:text-gray-500 active:text-gray-600"
                )}
              >
                <Icon
                  size={accent ? 22 : 20}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
                <span className={cn(
                  "text-[10px] leading-none",
                  isActive ? "font-semibold" : "font-medium"
                )}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
