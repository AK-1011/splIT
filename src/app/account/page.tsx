'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, User } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function AccountPage() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !user) return;
    
    try {
      const now = new Date();
      
      // Update user profile
      await db.users.update(user.id, {
        name: name.trim(),
        email: email.trim() || undefined,
        updatedAt: now
      });
      
      setIsEditing(false);
      // Reload the page to refresh user data
      window.location.reload();
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await logout();
      router.push('/login');
    }
  };

  if (loading || !user) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Account</h1>
          <div className="card">
            <p className="text-center">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Account</h1>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="card space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn flex-1 bg-gray-700 hover:bg-gray-600 text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
              >
                Save Profile
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="card p-4">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  {user.email && (
                    <p className="text-gray-400">{user.email}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setIsEditing(true)}
                className="btn w-full bg-gray-700 hover:bg-gray-600 text-white"
              >
                Edit Profile
              </button>
              
              <button
                onClick={handleLogout}
                className="btn w-full bg-red-600 hover:bg-red-500 text-white"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 