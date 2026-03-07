import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
      <div className="text-center max-w-sm animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-bold text-blue-500">404</span>
        </div>

        <h1 className="text-xl font-semibold mb-2">Page Not Found</h1>
        <p className="text-sm text-muted-foreground mb-8">
          The page you're looking for doesn't exist.
        </p>

        <Button
          onClick={() => navigate("/")}
          className="rounded-2xl shadow-lg shadow-blue-600/20 gap-2 h-11 px-6"
        >
          <Home size={16} />
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
