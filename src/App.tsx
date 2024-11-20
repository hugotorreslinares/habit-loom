import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import Login from "./pages/Login";
import Categories from "./pages/Categories";
import CalendarView from "./pages/CalendarView";
import Index from "./pages/Index";
import Header from './components/Header';
import ProfilePage from './pages/ProfilePage';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  if (isAuthenticated === null) {
    return <div className="container min-h-screen flex flex-col items-center justify-center bg-gray-100">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Header />
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar/:categoryId"
            element={
              <ProtectedRoute>
                <Header />
                <CalendarView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/description"
            element={
              <ProtectedRoute>
                <Header />
                <Index />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;