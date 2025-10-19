#  Tic-Tac-Toe Arena
# Deployed URL : https://tic-tac-toe-leela-games-saumya-pari.vercel.app/
A modern, real-time multiplayer Tic-Tac-Toe game built with React, Vite, and a Supabase backend.

![Screenshot Placeholder](https://via.placeholder.com/800x450.png?text=Your+App+Screenshot+Here)

## ✨ Features

- **Real-time Multiplayer**: Play against opponents live.
- **Authentication**: Secure user sign-up and login.
- **Matchmaking**: Create new games or join existing ones.
- **Leaderboard**: Tracks wins, losses, and draws automatically.
- **Responsive Design**: Play on any device, desktop or mobile.

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)

## 🚀 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

- [Bun](https://bun.sh/) (or Node.js and npm)
- A [Supabase](https://supabase.com/) account

### Local Development

1.  **Clone the repository:**
    ```sh
    git clone <your-repo-url>
    cd <your-repo-name>
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Set up Supabase Backend:**
    - Create a new project on [Supabase](https://app.supabase.com/new).
    - In the Supabase dashboard, go to the **SQL Editor**.
    - Create a **New query** and paste the entire content of each `.sql` file from the `supabase/migrations` directory, running them one by one.

4.  **Set up Environment Variables:**
    - Rename the `.env.example` file to `.env`.
    - Go to your Supabase project's **Settings > API**.
    - Copy your **Project URL**, **`anon` public key**, and **Project ID** into the `.env` file.

5.  **Run the Development Server:**
    ```sh
    bun run dev
    ```

    The application should now be running on `http://localhost:8080` (or another port if specified).

## 📄 License

This project is open source. Feel free to add a license like MIT if you wish.
