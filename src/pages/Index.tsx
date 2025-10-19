import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Leaderboard from '@/components/Leaderboard';
import CreateGameDialog from '@/components/CreateGameDialog';
import GameListDialog from '@/components/GameListDialog';
import { useToast } from '@/hooks/use-toast';
import { Gamepad2, Plus, Search, LogOut, User } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState<string>('');
  const [creatingGame, setCreatingGame] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [gameListOpen, setGameListOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      loadProfile();
    }
  }, [user, loading, navigate]);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (data) {
      setUsername(data.username);
    }
  };

  const createGame = async (gameName: string) => {
    if (!user) return;

    setCreatingGame(true);
    try {
      const { data, error } = await supabase
        .from('games')
        .insert({
          player_x: user.id,
          status: 'waiting',
          name: gameName,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Game created!',
        description: 'Waiting for an opponent...',
      });

      setCreateDialogOpen(false);
      navigate(`/game?id=${data.id}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCreatingGame(false);
    }
  };

  const joinGame = async (gameId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('games')
        .update({
          player_o: user.id,
          status: 'active',
        })
        .eq('id', gameId)
        .is('player_o', null);

      if (error) throw error;

      toast({
        title: 'Joined game!',
        description: 'Starting match...',
      });

      setGameListOpen(false);
      navigate(`/game?id=${gameId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Tic-Tac-Toe
              </h1>
              <p className="text-sm text-muted-foreground">Multiplayer Game</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{username}</span>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Main Actions */}
          <div className="space-y-6">
            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle className="text-2xl">Start Playing</CardTitle>
                <CardDescription>
                  Create a new game or find an opponent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="w-full h-20 text-lg"
                  size="lg"
                >
                  <Plus className="w-6 h-6 mr-2" />
                  Create Game
                </Button>
                
                <Button
                  onClick={() => setGameListOpen(true)}
                  variant="secondary"
                  className="w-full h-20 text-lg"
                  size="lg"
                >
                  <Search className="w-6 h-6 mr-2" />
                  Find Game
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle>How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>• Create a game or find an existing one</p>
                <p>• Take turns placing X or O on the board</p>
                <p>• Get three in a row to win!</p>
                <p>• Games update in real-time</p>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div>
            <Leaderboard />
          </div>
        </div>
      </div>

      <CreateGameDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateGame={createGame}
        isCreating={creatingGame}
      />

      <GameListDialog
        open={gameListOpen}
        onOpenChange={setGameListOpen}
        onJoinGame={joinGame}
        userId={user?.id || ''}
      />
    </div>
  );
};

export default Index;
