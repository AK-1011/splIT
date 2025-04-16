'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { getAllUsers } from '@/lib/initialData';

export default function SettingsPage() {
  const [userName, setUserName] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [userId, setUserId] = useState('self');
  
  const unsyncedData = useLiveQuery(async () => {
    const expenses = await db.expenses.where({ synced: false }).count();
    const groups = await db.groups.where({ synced: false }).count();
    return { expenses, groups };
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const users = await getAllUsers();
        const currentUser = users.find(u => u.id === 'self');
        
        if (currentUser) {
          setUserName(currentUser.name);
          setUserId(currentUser.id);
        } else {
          // Create a self user if it doesn't exist
          const now = new Date();
          await db.users.add({
            id: 'self',
            name: 'You',
            password: '',
            createdAt: now,
            updatedAt: now
          });
          setUserName('You');
          setUserId('self');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    
    loadUserData();
  }, []);

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const saveUserName = async () => {
    if (!userName.trim()) return;
    
    const now = new Date();
    
    try {
      // Try to get user, update if exists, create if not
      const existingUser = await db.users.get(userId);
      
      if (existingUser) {
        await db.users.update(userId, { 
          name: userName.trim(),
          updatedAt: now
        });
      } else {
        await db.users.add({
          id: userId,
          name: userName.trim(),
          password: '', // Default empty password for self user
          createdAt: now,
          updatedAt: now
        });
      }
      
      alert('Profile saved successfully');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile');
    }
  };

  const syncData = async () => {
    setSyncStatus('syncing');
    try {
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSyncStatus('success');
    } catch (error) {
      console.error('Failed to sync:', error);
      setSyncStatus('error');
    }
  };

  const exportData = async () => {
    setIsExporting(true);
    try {
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Data exported successfully');
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="userName"
                className="input"
                value={userName}
                onChange={handleUserNameChange}
                placeholder="Enter your name"
              />
            </div>
            
            <button
              onClick={saveUserName}
              className="btn btn-primary w-full"
              disabled={!userName.trim()}
            >
              Save Profile
            </button>
          </div>
        </div>

        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4">Data Management</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Unsynced Items:</span>
              <span className="font-medium">
                {unsyncedData ? unsyncedData.expenses + unsyncedData.groups : 0}
              </span>
            </div>
            
            <button
              onClick={syncData}
              className={`btn ${
                syncStatus === 'idle' ? 'bg-primary text-white' :
                syncStatus === 'syncing' ? 'bg-yellow-500 text-white' :
                syncStatus === 'success' ? 'bg-green-500 text-white' :
                'bg-red-500 text-white'
              }`}
              disabled={syncStatus !== 'idle' || (unsyncedData && unsyncedData.expenses + unsyncedData.groups === 0)}
            >
              {syncStatus === 'idle' ? 'Sync Now' :
               syncStatus === 'syncing' ? 'Syncing...' :
               syncStatus === 'success' ? 'Success!' :
               'Failed!'}
            </button>
          </div>
          
          <div className="border-t border-gray-700 pt-4">
            <button
              onClick={exportData}
              className="btn w-full bg-gray-700 hover:bg-gray-600 text-white"
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export All Data'}
            </button>
          </div>
        </div>

        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          
          <div className="text-text-secondary">
            <p className="mb-2"><span className="logo-split">spl<span className="text-primary">IT</span></span> - Expense Tracker</p>
            <p className="mb-4">Version 0.1.0</p>
            <p className="text-xs">
              A local-first PWA for tracking and splitting expenses with friends and family.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}