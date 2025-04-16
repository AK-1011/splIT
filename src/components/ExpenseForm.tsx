import { useState, useEffect } from 'react';
import { createExpense, db } from '@/lib/db';
import type { Participant, User, Group, Expense } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAuth } from '@/lib/auth';

interface ExpenseFormProps {
  onComplete?: (expenseId: string) => void;
  initialGroupId?: string;
  initialExpense?: Expense;
  requireFriends?: boolean;
}

export default function ExpenseForm({ onComplete, initialGroupId, initialExpense, requireFriends = false }: ExpenseFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialExpense?.title || '');
  const [amount, setAmount] = useState(initialExpense?.amount.toString() || '');
  const [paidBy, setPaidBy] = useState(initialExpense?.paidBy || user?.id || '');
  const [participants, setParticipants] = useState<Participant[]>(
    initialExpense?.participants || []
  );
  const [notes, setNotes] = useState(initialExpense?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(true);
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [groupId, setGroupId] = useState<string | undefined>(initialExpense?.groupId || initialGroupId);

  // Fetch groups for the dropdown
  const groups = useLiveQuery(() => {
    if (user) {
      return db.groups.where('userId').equals(user.id).toArray();
    }
    return [];
  }, [user]);

  // Fetch friends
  const friends = useLiveQuery(() => {
    if (user) {
      return db.users.toArray();
    }
    return [];
  }, [user]);

  // Initialize with current user
  useEffect(() => {
    if (user && participants.length === 0) {
      setParticipants([
        { 
          id: user.id, 
          name: user.name, 
          share: 100 
        }
      ]);
      setPaidBy(user.id);
    }
  }, [user, participants.length]);

  // If initialGroupId is provided and a group is selected, load group members as participants
  useEffect(() => {
    const loadGroupMembers = async () => {
      if (groupId && user) {
        try {
          const group = await db.groups.get(groupId);
          if (group && group.members.length > 0) {
            // Convert group members to participants with equal shares
            const share = 100 / (group.members.length + 1); // +1 for current user
            
            // Add current user if not already in group
            const currentUserInGroup = group.members.some(m => m.id === user.id);
            
            const groupParticipants: Participant[] = [
              ...(!currentUserInGroup ? [{ id: user.id, name: user.name, share }] : []),
              ...group.members.map(member => ({
                id: member.id,
                name: member.name,
                share
              }))
            ];
            
            setParticipants(groupParticipants);
            // Set the current user as default payer
            setPaidBy(user.id);
          }
        } catch (error) {
          console.error('Failed to load group members:', error);
        }
      }
    };
    
    if (groupId) {
      loadGroupMembers();
    }
  }, [groupId, user]);

  // Update shares when participants or split type changes
  useEffect(() => {
    if (splitType === 'equal' && participants.length > 0) {
      const equalShare = 100 / participants.length;
      const updatedParticipants = participants.map(p => ({
        ...p,
        share: equalShare
      }));
      setParticipants(updatedParticipants);
    }
  }, [participants.length, splitType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !amount || !paidBy || !user) return;
    
    if (participants.length < 2) {
      alert('You need at least one friend to split the expense with.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Normalize the share percentages
      const totalShares = participants.reduce((sum, p) => sum + p.share, 0);
      const normalizedParticipants = participants.map(p => ({
        ...p,
        share: (p.share / totalShares) * 100
      }));
      
      if (initialExpense) {
        // Update existing expense
        await db.expenses.update(initialExpense.id, {
          title,
          amount: parseFloat(amount),
          paidBy,
          participants: normalizedParticipants,
          date: initialExpense.date,
          notes,
          groupId,
          updatedAt: new Date(),
          userId: user.id
        });
        
        // Show success message
        alert('Expense updated successfully!');
      } else {
        // Create new expense
        const expenseId = await createExpense({
          title,
          amount: parseFloat(amount),
          paidBy,
          participants: normalizedParticipants,
          date: new Date(),
          notes,
          groupId,
          userId: user.id
        });
        
        // Show success message
        alert('Expense added successfully!');
        
        if (onComplete) {
          onComplete(expenseId);
        }
      }
      
      // Reset form if not editing
      if (!initialExpense) {
        setTitle('');
        setAmount('');
        setNotes('');
      }
    } catch (error) {
      console.error('Failed to create expense:', error);
      alert('Failed to create expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFriend = (friend: User) => {
    // Check if friend is already a participant
    if (participants.some(p => p.id === friend.id)) {
      return;
    }
    
    const newParticipant = { 
      id: friend.id, 
      name: friend.name, 
      share: splitType === 'equal' ? 100 / (participants.length + 1) : 0 
    };
    
    const newParticipants = [...participants, newParticipant];
    
    if (splitType === 'equal') {
      // Recalculate all shares for equal split
      const equalShare = 100 / newParticipants.length;
      setParticipants(newParticipants.map(p => ({ ...p, share: equalShare })));
    } else {
      setParticipants(newParticipants);
    }
  };

  const removeParticipant = (index: number) => {
    // Don't remove if it's the last participant or if it's the current user
    if (participants.length <= 1) return;
    
    const participantToRemove = participants[index];
    
    // Don't allow removing the current user
    if (participantToRemove.id === user?.id) {
      return;
    }
    
    // If the removed participant is the payer, reset the payer to current user
    if (participantToRemove.id === paidBy) {
      setPaidBy(user?.id || '');
    }
    
    const newParticipants = participants.filter((_, i) => i !== index);
    
    if (splitType === 'equal' && newParticipants.length > 0) {
      // Recalculate equal shares
      const equalShare = 100 / newParticipants.length;
      setParticipants(newParticipants.map(p => ({ ...p, share: equalShare })));
    } else {
      setParticipants(newParticipants);
    }
  };

  const toggleSplitType = () => {
    if (splitType === 'custom') {
      setSplitType('equal');
      // Reset to equal shares
      const equalShare = 100 / participants.length;
      setParticipants(participants.map(p => ({ ...p, share: equalShare })));
    } else {
      setSplitType('custom');
    }
  };

  // Calculate total shares for explanation text
  const totalShares = participants.reduce((sum, p) => sum + p.share, 0);

  if (!user || !friends) {
    return <div className="py-4 text-center">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="E.g., Dinner at Restaurant"
          required
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-1">
          Amount
        </label>
        <input
          type="number"
          id="amount"
          className="input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.01"
          step="0.01"
          placeholder="0.00"
          required
        />
      </div>

      {/* Group selection dropdown */}
      {groups && groups.length > 0 && (
        <div>
          <label htmlFor="groupId" className="block text-sm font-medium mb-1">
            Group (optional)
          </label>
          <select
            id="groupId"
            className="input"
            value={groupId || ''}
            onChange={(e) => setGroupId(e.target.value || undefined)}
          >
            <option value="">No group (personal expense)</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="paidBy" className="block text-sm font-medium mb-1">
          Paid By
        </label>
        <select
          id="paidBy"
          className="input"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          required
        >
          <option value="">Select who paid</option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}{p.id === user.id ? ' (You)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Friends to Split With</label>
          <button
            type="button"
            onClick={toggleSplitType}
            className="text-xs px-2 py-1 rounded bg-gray-800 text-white"
          >
            {splitType === 'equal' ? 'Custom Split' : 'Equal Split'}
          </button>
        </div>
        
        <div className="border border-gray-700 rounded p-2 max-h-40 overflow-y-auto mb-2">
          {friends.filter(f => f.id !== user.id).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">
              Add friends in the Friends tab first
            </p>
          ) : (
            <div className="space-y-1">
              {friends.filter(f => f.id !== user.id).map(friend => (
                <div key={friend.id} className="flex items-center justify-between">
                  <label className="text-sm flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={participants.some(p => p.id === friend.id)}
                      onChange={() => participants.some(p => p.id === friend.id) 
                        ? removeParticipant(participants.findIndex(p => p.id === friend.id))
                        : addFriend(friend)
                      }
                    />
                    {friend.name}
                  </label>
                  
                  {participants.some(p => p.id === friend.id) && splitType === 'custom' && (
                    <input
                      type="number"
                      className="input w-16 text-xs py-1"
                      value={participants.find(p => p.id === friend.id)?.share.toFixed(0) || 0}
                      onChange={(e) => {
                        const index = participants.findIndex(p => p.id === friend.id);
                        if (index >= 0) {
                          const updatedParticipants = [...participants];
                          updatedParticipants[index] = {
                            ...updatedParticipants[index],
                            share: parseFloat(e.target.value) || 0
                          };
                          setParticipants(updatedParticipants);
                        }
                      }}
                      min="1"
                      placeholder="Share"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-400">
          {splitType === 'equal' 
            ? 'Expense will be split equally' 
            : 'Expense will be split based on share values'}
        </p>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          className="input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Add any additional details here..."
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isSubmitting || participants.length < 2}
      >
        {isSubmitting ? 'Saving...' : initialExpense ? 'Update Expense' : 'Add Expense'}
      </button>
    </form>
  );
} 