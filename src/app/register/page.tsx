'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { nanoid } from 'nanoid';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [splTAG, setSplTAG] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  
  // If already logged in, redirect to home
  if (isAuthenticated) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword || !splTAG) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Check if email already exists
      const existingUserWithEmail = await db.users.where('email').equals(email).first();
      
      if (existingUserWithEmail) {
        setError('Email is already in use');
        setIsLoading(false);
        return;
      }
      
      // Check if username already exists
      const existingUserWithTag = await db.users.where('name').equals(splTAG).first();
      
      if (existingUserWithTag) {
        setError('#splTAG is already in use');
        setIsLoading(false);
        return;
      }
      
      // Create new user
      const now = new Date();
      const userId = nanoid();
      
      await db.users.add({
        id: userId,
        name: splTAG, // Use splTAG as the user's name in the database
        email,
        password, // In a real app, hash this password
        createdAt: now,
        updatedAt: now,
        displayName: name // Store the display name separately
      });
      
      // Log in the new user
      const success = await login(email, password);
      
      if (success) {
        router.push('/');
      } else {
        setError('Registration successful, but login failed. Please log in manually.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-full overflow-y-auto py-6">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">
            <span className="logo-split">spl<span className="text-blue-500">IT</span></span>
          </h1>
          <p className="text-gray-400 text-sm">Track and split expenses with friends</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create Account</h2>
          
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 rounded-md p-3 mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="splTAG" className="block text-sm font-medium mb-1">
                #splTAG (Username)
              </label>
              <input
                type="text"
                id="splTAG"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                value={splTAG}
                onChange={(e) => setSplTAG(e.target.value)}
                placeholder="Choose a unique username"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Your friends will use this to add you
              </p>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Register'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Already have an account? <Link href="/login" className="text-blue-400 hover:underline">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 