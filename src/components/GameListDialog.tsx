import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Gamepad2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Game {
  id: string;
  name: string;
  player_x: string;
  created_at: string;
}

interface GameListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoinGame: (gameId: string) => void;
  userId: string;
}

const GameListDialog = ({ open, onOpenChange, onJoinGame, userId }: GameListDialogProps) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadGames();
    }
  }, [open]);

  const loadGames = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('games')
        .select('id, name, player_x, created_at')
        .eq('status', 'waiting')
        .is('player_o', null)
        .neq('player_x', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load games',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            Available Games
          </DialogTitle>
          <DialogDescription>
            Choose a game to join
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading games...
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No games available. Create one instead!
            </div>
          ) : (
            games.map((game) => (
              <Card key={game.id} className="hover:border-primary transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{game.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>Waiting for opponent</span>
                      </div>
                    </div>
                    <Button onClick={() => onJoinGame(game.id)}>
                      Join Game
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameListDialog;
