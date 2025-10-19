import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Circle, Trophy, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GameBoardProps {
  gameId: string;
}

interface GameState {
  id: string;
  player_x: string;
  player_o: string | null;
  current_turn: string;
  board: string[];
  status: 'waiting' | 'active' | 'finished';
  winner: string | null;
  winner_symbol: string | null;
}

const GameBoard = ({ gameId }: GameBoardProps) => {
  const [game, setGame] = useState<GameState | null>(null);
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isWriting, setIsWriting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchGame = async () => {
      if (isWriting) return; // Don't fetch while a local write is in progress

      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) {
        console.error("Failed to fetch game state:", error);
        return;
      }

      setGame(currentGame => {
        if (JSON.stringify(currentGame) !== JSON.stringify(data)) {
          if (user.id === data.player_x) {
            setPlayerSymbol('X');
          } else if (user.id === data.player_o) {
            setPlayerSymbol('O');
          }
          return data as GameState;
        }
        return currentGame;
      });
    };

    fetchGame(); // Initial fetch

    const intervalId = setInterval(() => {
      setGame(currentGame => {
        if (currentGame && currentGame.status !== 'finished') {
          fetchGame();
        }
        return currentGame;
      });
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId);
  }, [gameId, user, toast, navigate, isWriting]);

  const makeMove = async (index: number) => {
    if (!game || !user || !playerSymbol || isWriting) return;

    if (game.status !== 'active') {
      toast({
        title: 'Game not active',
        description: game.status === 'waiting' ? 'Waiting for opponent' : 'Game has ended',
      });
      return;
    }

    if (game.current_turn !== playerSymbol) {
      toast({
        title: 'Not your turn',
        description: 'Please wait for your opponent',
      });
      return;
    }

    if (game.board[index]) {
      toast({
        title: 'Invalid move',
        description: 'This cell is already taken',
      });
      return;
    }

    setIsWriting(true);
    const newBoard = [...game.board];
    newBoard[index] = playerSymbol;

    const winner = checkWinner(newBoard);
    const isDraw = !winner && newBoard.every(cell => cell !== '');

    const { error } = await supabase
      .from('games')
      .update({
        board: newBoard,
        current_turn: playerSymbol === 'X' ? 'O' : 'X',
        status: winner || isDraw ? 'finished' : 'active',
        winner: winner ? (playerSymbol === 'X' ? game.player_x : game.player_o) : null,
        winner_symbol: winner || null,
      })
      .eq('id', gameId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to make move',
        variant: 'destructive',
      });
    }
    setIsWriting(false);
  };

  const checkWinner = (board: string[]): string | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return null;
  };

  const joinGame = async () => {
    if (!game || !user || isWriting) return;
    if (game.status !== 'waiting' || game.player_x === user.id || game.player_o) return;

    setIsWriting(true);
    const { data, error } = await supabase
      .from('games')
      .update({ player_o: user.id, status: 'active' })
      .eq('id', gameId)
      .is('player_o', null)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to join game. Someone else might have joined first.', variant: 'destructive' });
      setIsWriting(false);
      return;
    }

    if (data) {
      setGame(data as GameState);
      setPlayerSymbol('O');
    }
    setIsWriting(false);
  };

  const renderCell = (index: number) => {
    const value = game?.board[index];
    const isWinningCell = game?.winner_symbol && value === game.winner_symbol;
    const canClick = game?.status === 'active' && 
                     game?.current_turn === playerSymbol && 
                     !value;

    return (
      <button
        onClick={() => makeMove(index)}
        disabled={!canClick}
        className={`
          aspect-square min-h-[120px] rounded-xl border-4 transition-all duration-300
          flex items-center justify-center text-4xl font-bold bg-card
          ${canClick ? 'hover:bg-accent/50 hover:scale-105 cursor-pointer hover:shadow-lg' : 'cursor-not-allowed opacity-70'}
          ${isWinningCell ? 'bg-win-glow/20 border-win-glow animate-pulse' : 'border-border'}
          ${value === 'X' ? 'text-[hsl(var(--player-x))]' : ''}
          ${value === 'O' ? 'text-[hsl(var(--player-o))]' : ''}
        `}
      >
        {value === 'X' && <X className="w-16 h-16 stroke-[3]" />}
        {value === 'O' && <Circle className="w-16 h-16 stroke-[3]" />}
      </button>
    );
  };

  if (!game) {
    return <div className="text-center p-8">Loading game...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Game Status
            </span>
            {game.status === 'finished' && (
              <Trophy className="w-5 h-5 text-win-glow" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Your Symbol:</span>
            <span className="font-bold">
              {playerSymbol === 'X' ? (
                <X className="w-5 h-5 inline text-[hsl(var(--player-x))]" />
              ) : (
                <Circle className="w-5 h-5 inline text-[hsl(var(--player-o))]" />
              )}
            </span>
          </div>
          
          {game.status === 'waiting' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Waiting for opponent to join...</p>
              {user?.id && user.id !== game.player_x && !game.player_o && (
                <Button onClick={joinGame} className="w-full">Join this Game</Button>
              )}
            </div>
          )}
          
          {game.status === 'active' && (
            <p className="text-sm">
              {game.current_turn === playerSymbol ? (
                <span className="text-primary font-semibold">Your turn!</span>
              ) : (
                <span className="text-muted-foreground">Opponent's turn</span>
              )}
            </p>
          )}
          
          {game.status === 'finished' && (
            <div className="space-y-2">
              {game.winner ? (
                <p className="text-sm font-semibold">
                  {game.winner === user?.id ? (
                    <span className="text-win-glow"> You won!</span>
                  ) : (
                    <span className="text-destructive">You lost</span>
                  )}
                </p>
              ) : (
                <p className="text-sm font-semibold text-muted-foreground">It's a draw!</p>
              )}
              <Button onClick={() => navigate('/')} className="w-full">
                Back to Menu
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-game)]">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i}>{renderCell(i)}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameBoard;