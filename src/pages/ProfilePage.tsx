import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";


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
        setEmail(user?.email || 'user');
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
    <div className="container mx-auto p-4 ">
      <h1 className="text-1xl font-bold">Profile Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-4 leading-10">
    <div className="p-4 w-full bg-slate-50 rounded-xl col-span-1 md:row-span-3">
        <h1>User Info</h1>
        <div className="profile-info mt-3">
            <Avatar>
                <AvatarImage src="/src/assets/runner.png" alt="User's Avatar" />
                <AvatarFallback>U</AvatarFallback> {/* Fallback content, e.g., initials */}
            </Avatar>
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
    <div className="p-4 w-full bg-zinc-100 rounded-xl col-span-1 md:col-span-2">Categories</div>
    <div className="p-4 w-full bg-stone-100 rounded-xl col-span-1 md:row-span-2 md:col-span-2">
         <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>This is the content for Tab 1.</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>This is the content for Tab 2.</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p>This is the content for Tab 3.</p>
      </TabsContent>
    </Tabs>
    </div>
</div>
      
    </div>
  );
};

export default ProfilePage; 