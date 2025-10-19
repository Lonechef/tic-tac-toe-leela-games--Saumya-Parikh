import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import GameBoard from '@/components/GameBoard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Game = () => {
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('id');
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [gameExists, setGameExists] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (gameId) {
      checkGame();
    } else {
      navigate('/');
    }
  }, [gameId, user, loading, navigate]);

  const checkGame = async () => {
    if (!gameId) return;

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error || !data) {
      navigate('/');
      return;
    }

    setGameExists(true);
    setChecking(false);
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!gameExists || !gameId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>
        
        <GameBoard gameId={gameId} />
      </div>
    </div>
  );
};

export default Game;
