import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, AlertCircle } from 'lucide-react';
import { Screen, CustomChallenge } from '../types';
import { supabase } from '../lib/supabase';

interface AdminScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function AdminScreen({ onNavigate }: AdminScreenProps) {
  const [challenges, setChallenges] = useState<CustomChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();

    const channel = supabase
      .channel('admin_challenges_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_challenges',
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setChallenges((prev) => prev.filter((c) => c.id !== payload.old.id));
          } else if (payload.eventType === 'INSERT') {
            setChallenges((prev) => [payload.new as CustomChallenge, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setChallenges((prev) =>
              prev.map((c) => (c.id === payload.new.id ? (payload.new as CustomChallenge) : c))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, shareCode: string) => {
    if (!confirm(`Are you sure you want to delete challenge ${shareCode}?`)) {
      return;
    }

    setDeleting(id);
    try {
      const { error } = await supabase
        .from('custom_challenges')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setChallenges(challenges.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete challenge:', err);
      alert('Failed to delete challenge');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-primary text-white p-4 flex items-center gap-3 shadow-lg">
        <button onClick={() => onNavigate('home')}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-lg">Admin Panel</h1>
          <p className="text-sm opacity-90">Manage challenges</p>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading challenges...</p>
            </div>
          ) : challenges.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No challenges found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-primary">
                        {challenge.challenge_name || challenge.share_code}
                      </h3>
                      <span className="text-sm text-gray-500">
                        by {challenge.creator_name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Code: {challenge.share_code}
                    </p>
                    <p className="text-sm text-gray-600">
                      Created: {new Date(challenge.created_at).toLocaleDateString('da-DK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Center: {challenge.center_lat.toFixed(6)}, {challenge.center_lng.toFixed(6)} |
                      Target: {challenge.target_lat.toFixed(6)}, {challenge.target_lng.toFixed(6)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(challenge.id, challenge.share_code)}
                    disabled={deleting === challenge.id}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
