'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export default function LoginBackupPage() {
  const router = useRouter();
  const [splTAG, setSplTAG] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const users = useLiveQuery(() => db.users.toArray());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!splTAG || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      // Find user by name (splTAG) or email
      const user = users?.find(
        user => user.name === splTAG || user.email === splTAG
      );

      if (!user) {
        setError('User not found');
        return;
      }

      if (user.password !== password) {
        setError('Invalid password');
        return;
      }

      // Simple login with localStorage
      localStorage.setItem('userId', user.id);
      localStorage.setItem('authToken', 'temp-token');
      
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    }
  }

  return (
    <div className="flex flex-col justify-center items-center h-full overflow-y-auto py-6">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-blue-500">splIT</span> <small>(Backup Login)</small>
          </h1>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Emergency Login</h2>
          
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 rounded-md p-3 mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="splTAG" className="block text-sm font-medium mb-1">
                #splTAG or Email
              </label>
              <input
                type="text"
                id="splTAG"
                value={splTAG}
                onChange={(e) => setSplTAG(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                placeholder="ada, bob, cha or email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                placeholder="password123"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 