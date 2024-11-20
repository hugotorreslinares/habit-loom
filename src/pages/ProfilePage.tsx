import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        setError(error.message);
      } else {
        setUser(user);
        setName(user?.user_metadata?.name || '');
        setEmail(user?.email || '');
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    const { error } = await supabase.auth.update({
      data: { name },
    });

    if (error) {
      setError(error.message);
    } else {
      alert('Profile updated successfully!');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Profile Page</h1>
      <div className="profile-info mt-4">
        <h2 className="text-2xl">{name}</h2>
        <p className="text-lg">{email}</p>
        <div className="mt-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded p-2"
          />
          <Button onClick={handleUpdate} className="mt-2">
            Update
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 