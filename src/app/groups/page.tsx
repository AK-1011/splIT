'use client';

import { useState, useEffect } from 'react';
import { db, User, Member } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GroupsPage() {
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  const groups = useLiveQuery(async () => {
    return await db.groups.toArray();
  });

  const friends = useLiveQuery(async () => {
    return await db.users.toArray();
  });

  const router = useRouter();

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const now = new Date();
      const members: Member[] = selectedFriends.map(friendId => {
        const friend = friends?.find(f => f.id === friendId);
        return {
          id: friendId,
          name: friend?.name || ''
        };
      }).filter(member => member.name !== '');

      // Get current user
      const currentUser = await db.users.where('authToken').notEqual('').first();
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      await db.groups.add({
        id: `group-${Date.now()}`,
        name: newGroupName.trim(),
        members,
        createdAt: now,
        updatedAt: now,
        synced: false,
        userId: currentUser.id
      });
      setNewGroupName('');
      setSelectedFriends([]);
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const startEditGroup = (groupId: string) => {
    const group = groups?.find(g => g.id === groupId);
    if (group) {
      setEditingGroup(groupId);
      setEditName(group.name);
      setSelectedFriends(group.members.map(m => m.id));
    }
  };

  const updateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editingGroup) return;

    try {
      const group = groups?.find(g => g.id === editingGroup);
      if (!group) return;

      const members: Member[] = selectedFriends.map(friendId => {
        const friend = friends?.find(f => f.id === friendId);
        return {
          id: friendId,
          name: friend?.name || ''
        };
      }).filter(member => member.name !== '');

      await db.groups.update(editingGroup, {
        name: editName.trim(),
        members,
        updatedAt: new Date(),
        synced: false
      });
      
      cancelEdit();
    } catch (error) {
      console.error('Failed to update group:', error);
    }
  };

  const cancelEdit = () => {
    setEditingGroup(null);
    setEditName('');
    setSelectedFriends([]);
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const deleteGroup = async (groupId: string) => {
    if (confirm('Are you sure you want to delete this group?')) {
      try {
        await db.groups.delete(groupId);
      } catch (error) {
        console.error('Failed to delete group:', error);
        alert('Failed to delete group');
      }
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Groups</h1>

        {!isCreating && !editingGroup ? (
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary w-full mb-6"
          >
            Create New Group
          </button>
        ) : isCreating ? (
          <form onSubmit={createGroup} className="card mb-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  id="groupName"
                  className="input"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Members
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-700 rounded">
                  {!friends || friends.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      No friends added yet. Add friends in the Friends tab first.
                    </p>
                  ) : (
                    friends.map((friend) => (
                      <div key={friend.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`friend-${friend.id}`}
                          className="mr-2 h-4 w-4"
                          checked={selectedFriends.includes(friend.id)}
                          onChange={() => toggleFriendSelection(friend.id)}
                        />
                        <label htmlFor={`friend-${friend.id}`} className="text-sm">
                          {friend.name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedFriends([]);
                  }}
                  className="btn flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={!newGroupName.trim() || selectedFriends.length === 0}
                >
                  Create
                </button>
              </div>
            </div>
          </form>
        ) : editingGroup && (
          <form onSubmit={updateGroup} className="card mb-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="editGroupName" className="block text-sm font-medium mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  id="editGroupName"
                  className="input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter group name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Members
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-700 rounded">
                  {!friends || friends.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      No friends added yet. Add friends in the Friends tab first.
                    </p>
                  ) : (
                    friends.map((friend) => (
                      <div key={friend.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`edit-friend-${friend.id}`}
                          className="mr-2 h-4 w-4"
                          checked={selectedFriends.includes(friend.id)}
                          onChange={() => toggleFriendSelection(friend.id)}
                        />
                        <label htmlFor={`edit-friend-${friend.id}`} className="text-sm">
                          {friend.name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={!editName.trim() || selectedFriends.length === 0}
                >
                  Update
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {groups?.length === 0 && (
            <p className="text-center text-text-secondary py-4">
              You don't have any groups yet.
            </p>
          )}
          
          {groups?.map((group) => (
            <div
              key={group.id}
              className="card"
            >
              <div className="flex justify-between items-center">
                <div 
                  className="cursor-pointer flex-grow"
                  onClick={() => router.push(`/groups/${group.id}`)}
                >
                  <h3 className="font-medium">{group.name}</h3>
                  <p className="text-sm text-text-secondary">
                    {group.members.length} members
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="text-primary p-2 rounded-full hover:bg-gray-700"
                    onClick={() => startEditGroup(group.id)}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    className="text-error p-2 rounded-full hover:bg-gray-700"
                    onClick={() => deleteGroup(group.id)}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {group.members.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-sm font-medium mb-1">Members:</p>
                  <div className="flex flex-wrap gap-1">
                    {group.members.map(member => (
                      <span 
                        key={member.id} 
                        className="inline-block bg-gray-800 text-xs rounded-full px-2 py-1"
                      >
                        {member.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 