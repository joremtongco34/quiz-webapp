# Setup Instructions

## Environment Variables

Create a `.env.local` file in the `webapp` directory with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pyaupwiqzauccqopnfrn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YXVwd2lxemF1Y2Nxb3BuZnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MjkwNzEsImV4cCI6MjA4MTAwNTA3MX0.bd9DmjrjpiMAPRBQUUEqZvQj9oDJQx9zirIcOBVk-x8
```

## Database Tables

The following tables have been created in Supabase:
- `quizzes` - Stores quiz sessions
- `participants` - Stores quiz participants
- `answers` - Stores participant answers

Realtime is enabled on all tables for live updates.

## Running the Application

1. Install dependencies:
```bash
cd webapp
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

## Usage Flow

1. Host creates a quiz at `/host` - receives a unique quiz code
2. Participants join at `/participant/[code]` using the quiz code
3. Host starts the quiz when ready
4. Questions are displayed to participants in real-time
5. Participants submit answers (top 3 fastest correct answers get points)
6. Rankings are shown between questions
7. Final winners are displayed when quiz completes

