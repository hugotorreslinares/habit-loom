import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Adjust the import based on your button component
import { Sun, Moon,Scale } from 'lucide-react'; // Import icons from Lucide

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
      <h1 className="flex justify-between text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>
       <Scale className="h-5 w-5 mr-3"/> Balanced
      </h1>
      <div className="flex justify-between">
        <Button onClick={() => navigate('/description')} className="mr-4">
          Description
        </Button>
        <Button onClick={handleLogout}  className="mr-4">
          Logout
        </Button>
        <Button onClick={toggleTheme} variant="secondary" className="flex items-center">
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
};

export default Header; 