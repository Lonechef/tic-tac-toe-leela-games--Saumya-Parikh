import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  wins: number;
  losses: number;
  draws: number;
  total_games: number;
  profiles: {
    username: string;
  };
}

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select(`
        *,
        profiles (
          username
        )
      `)
      .order('wins', { ascending: false })
      .limit(10);

    if (!error && data) {
      setEntries(data as LeaderboardEntry[]);
    }
    setLoading(false);
  };

  const getWinRate = (entry: LeaderboardEntry) => {
    if (entry.total_games === 0) return 0;
    return Math.round((entry.wins / entry.total_games) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading leaderboard...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Top Players
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No players yet. Be the first!
            </p>
          ) : (
            entries.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`
                    text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center
                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' : ''}
                    ${index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' : ''}
                    ${index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' : ''}
                    ${index > 2 ? 'bg-muted text-muted-foreground' : ''}
                  `}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{entry.profiles.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.total_games} games played
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                    <TrendingUp className="w-4 h-4" />
                    {getWinRate(entry)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {entry.wins}W {entry.losses}L {entry.draws}D
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
