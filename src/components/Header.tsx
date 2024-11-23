import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button'; 
import { Sun, Moon, CircleSlash2, UserPen, LogOut, Info } from 'lucide-react'; // Import icons from Lucide

const Header = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
    } else {
      navigate('/login'); // Redirect to login page after logout
    }
  };
  const handleProfile = async () => {
      navigate('/profile'); // Redirect to login page after logout
  };

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark', !isDarkMode);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  return (
    <header className="container flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="flex justify-between text-xl font-bold cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-green-500" onClick={() => navigate('/')}>
       <CircleSlash2 className="h-5 w-5 mr-3"/> BeBalanced
      </h1>
      <div className="flex justify-between">
        <Button onClick={() => navigate('/description')} className="mr-4">
          <Info className="h-5 w-5" />
        </Button>
        <Button onClick={handleLogout}  className="mr-4">
          <LogOut className="h-5 w-5"/>
          Logout
        </Button>
                <Button onClick={handleProfile}  className="mr-4">
          <UserPen className="h-5 w-5" /> Profile
        </Button>

        <Button onClick={toggleTheme} variant="secondary" className="hidden items-center">
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
};

export default Header; 