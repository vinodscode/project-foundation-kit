
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import AddLoan from "./pages/AddLoan";
import LoanDetails from "./pages/LoanDetails";
import EditLoan from "./pages/EditLoan";
import NotFound from "./pages/NotFound";
import Calculator from "./pages/Calculator";
import Auth from "./pages/Auth";
import MOI from "./pages/MOI";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";

// Remove App.css import as it conflicts with our styling

const queryClient = new QueryClient();

const App = () => {
  // Add meta viewport tag for better mobile experience
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/add-loan" element={<ProtectedRoute><AddLoan /></ProtectedRoute>} />
                <Route path="/loans/:id" element={<ProtectedRoute><LoanDetails /></ProtectedRoute>} />
                <Route path="/loans/:id/edit" element={<ProtectedRoute><EditLoan /></ProtectedRoute>} />
                <Route path="/calculator" element={<ProtectedRoute><Calculator /></ProtectedRoute>} />
                <Route path="/moi" element={<ProtectedRoute><MOI /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
