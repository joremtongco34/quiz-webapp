# Quiz App Frontend

Real-time quiz application built with Next.js and Supabase.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the `webapp` directory with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Run the development server:
```bash
npm run dev
```

## Usage

- **Create a Quiz**: Navigate to `/host` to create a new quiz as a host
- **Join a Quiz**: Navigate to `/participant/[code]` where `[code]` is the quiz code shared by the host

## Features

- Real-time quiz updates using Supabase Realtime
- Host interface for creating and controlling quizzes
- Participant interface for joining and answering questions
- Live leaderboard updates
- Timer-based scoring system (top 3 fastest correct answers get points)

