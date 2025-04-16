'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db, Expense } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

export default function ViewExpensePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadExpense = async () => {
      try {
        const expenseData = await db.expenses.get(params.id);
        if (!expenseData) {
          setError('Expense not found');
          setIsLoading(false);
          return;
        }
        
        setExpense(expenseData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading expense:', err);
        setError('Failed to load expense details');
        setIsLoading(false);
      }
    };

    loadExpense();
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="card py-8 text-center">
            <p>Loading expense details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !expense) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="card py-8 text-center">
            <p className="text-error">{error || 'Expense not found'}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-primary hover:underline"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Calculate total percentage to verify splits
  const totalPercentage = expense.participants.reduce((sum, p) => sum + p.share, 0);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-primary flex items-center hover:underline"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold mt-2">Expense Details</h1>
        </div>

        <div className="card mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{expense.title}</h2>
              <p className="text-sm text-gray-400">
                {new Date(expense.date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {formatCurrency(expense.amount)}
              </p>
            </div>
          </div>

          {expense.notes && (
            <div className="mt-4 p-3 bg-gray-800 rounded-md">
              <h3 className="text-sm text-gray-400 mb-1">Notes</h3>
              <p>{expense.notes}</p>
            </div>
          )}
        </div>

        <div className="card mb-4">
          <h3 className="font-semibold mb-3">Payment Details</h3>
          <p className="mb-3">
            <span className="text-gray-400">Paid by:</span> {expense.paidBy}
          </p>
          
          <h3 className="font-semibold mt-4 mb-2">Participants</h3>
          <div className="space-y-2">
            {expense.participants.map((participant, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                <span>{participant.name}</span>
                <div className="text-right">
                  <span className="font-medium">{formatCurrency((expense.amount * participant.share) / 100)}</span>
                  <span className="text-gray-400 text-sm ml-2">({participant.share.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
          
          {Math.abs(totalPercentage - 100) > 0.1 && (
            <p className="text-error text-sm mt-3">
              Warning: Shares don't add up to 100% (Total: {totalPercentage.toFixed(1)}%)
            </p>
          )}
        </div>

        <div className="flex justify-between">
          <Link
            href={`/expenses/edit/${expense.id}`}
            className="btn btn-outline"
          >
            Edit Expense
          </Link>
          <button
            onClick={async () => {
              if (confirm('Are you sure you want to delete this expense?')) {
                await db.expenses.delete(expense.id);
                router.push('/activity');
              }
            }}
            className="btn btn-error"
          >
            Delete
          </button>
        </div>
      </div>
    </main>
  );
} 