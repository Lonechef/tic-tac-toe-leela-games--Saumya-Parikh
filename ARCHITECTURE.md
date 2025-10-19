# Multiplayer Tic-Tac-Toe - Architecture & Design

## 🎮 Overview
A real-time, server-authoritative multiplayer Tic-Tac-Toe game built with React, TypeScript, (Supabase backend).

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Backend**: MERN
  - PostgreSQL Database
  - Real-time subscriptions
  - Row-Level Security (RLS)
  - Authentication
- **State Management**: React Context API + TanStack Query

### Key Design Decisions

#### 1. Server-Authoritative Game Logic
All game state is managed on the server via PostgreSQL:
- Game moves are validated server-side
- Win conditions checked in the database
- Client sends move requests; server updates authoritative state
- Real-time sync ensures all players see consistent state

#### 2. Database Schema

**profiles**
- Stores user information (username)
- 1:1 relationship with auth.users

**games**
- Tracks game state including:
  - Players (X and O)
  - Board state (JSONB array)
  - Current turn
  - Status (waiting/active/finished)
  - Winner information
- Real-time enabled for instant updates

**leaderboard**
- Automatic stat tracking via database triggers
- Calculates wins/losses/draws
- Updates when games finish

#### 3. Matchmaking System
Simple but effective matchmaking:
- **Create Game**: Player creates a new game as Player X
- **Find Game**: Searches for waiting games and joins as Player O
- Game status automatically changes to 'active' when second player joins

#### 4. Real-time Updates
Uses Supabase Realtime for WebSocket connections:
- Players subscribe to their game's changes
- Board updates appear instantly
- No polling required

#### 5. Security
- Row-Level Security (RLS) policies on all tables
- Players can only update their own games
- Server validates all moves
- Function search paths secured

## 🎨 Design System

### Color Palette
- **Primary**: Purple gradient (262, 83%, 58%)
- **Secondary**: Magenta (280, 70%, 65%)
- **Accent**: Cyan (195, 92%, 56%)
- **Player X**: Coral (14, 100%, 64%)
- **Player O**: Cyan (195, 92%, 56%)

### Key Features
- Mobile-first responsive design
- Smooth animations and transitions
- Gradient backgrounds
- Card-based layouts
- Custom button variants

## 📁 Project Structure

```
src/
├── components/
│   ├── GameBoard.tsx       # Game board with move logic
│   ├── Leaderboard.tsx     # Top players display
│   └── ui/                 # shadcn components
├── contexts/
│   └── AuthContext.tsx     # Auth state management
├── pages/
│   ├── Index.tsx           # Home/matchmaking
│   ├── Auth.tsx            # Login/signup
│   └── Game.tsx            # Active game page
└── integrations/
    └── supabase/           # Auto-generated types
```

## 🔒 Security Features

1. **Row-Level Security (RLS)**
   - All tables have RLS enabled
   - Users can only access their own data
   - Public read for profiles and leaderboard

2. **Input Validation**
   - Move validation on server
   - Turn checking
   - Game state validation

3. **Secure Functions**
   - All database functions use `search_path = ''`
   - SECURITY DEFINER functions properly scoped

## 🚀 Deployment

The application can be deployed to any modern cloud platform that supports Node.js frontends (e.g., Vercel, Netlify, AWS, Google Cloud).
- Database: Managed PostgreSQL instance
- Real-time: WebSocket connections managed by Supabase

## 📱 Features Implemented

✅ User authentication (email/password)
✅ Profile creation with usernames
✅ Create new games
✅ Find and join existing games
✅ Real-time gameplay
✅ Server-authoritative move validation
✅ Win/draw detection
✅ Automatic leaderboard updates
✅ Mobile-responsive design
✅ Beautiful UI with animations

## 🎯 Game Flow

1. User signs up/logs in
2. From home screen, user can:
   - Create a new game (becomes Player X)
   - Find an existing game (becomes Player O)
3. Game starts when both players are present
4. Players take turns (validated server-side)
5. Game ends on win or draw
6. Stats automatically update leaderboard

## 🔄 Real-time Synchronization

```typescript
// Client subscribes to game updates
supabase
  .channel(`game-${gameId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'games',
    filter: `id=eq.${gameId}`
  }, (payload) => {
    // Update local state
    setGame(payload.new);
  })
  .subscribe();
```

## 🏆 Leaderboard Logic

Implemented via database trigger:
- Fires when game status changes to 'finished'
- Updates both players' statistics
- Calculates wins/losses/draws
- Uses UPSERT for automatic stat creation

## 📊 Scalability Considerations

- Database indexes on frequently queried fields
- Real-time channels scoped per game
- Stateless frontend (easy horizontal scaling)
- PostgreSQL connection pooling via Supabase
- CDN-ready static assets

## 🔮 Future Enhancements

- AI opponent (single player mode)
- Game history and replay
- Friend system and private matches
- Chat during games
- Tournament mode
- Different board sizes
- Time limits per move
- ELO rating system
