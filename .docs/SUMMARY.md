# Quiz Application - Summary Documentation

## Overview

A real-time quiz application built with Next.js and Supabase, allowing hosts to create quizzes and participants to join and answer questions in real-time. The application features independent question navigation for participants, automatic scoring based on response time, and live leaderboard updates. The application is fully mobile-responsive and includes QR code sharing functionality.

## Key Features

### Host Features
- **Create Quiz**: Hosts can create a new quiz with customizable timer duration (5-300 seconds)
- **Share Quiz**: 
  - QR code generation for easy mobile scanning
  - Copy quiz URL functionality for easy sharing with participants
- **Quiz Management**: 
  - View real-time leaderboard (shows all participants) and overall quiz timer when quiz is in progress
  - Control quiz progression (start quiz, move to next question)
  - See participant count and manage quiz state
- **Random Questions**: Each quiz randomly selects at least 10 questions from a pool of 15+ questions
- **Clean Interface**: When quiz is in progress, host sees only leaderboard and timer (no question details)
- **Full Leaderboard Access**: Host can see all participants, not limited to top 3
    
### Participant Features
- **Join Quiz**: Participants join using a unique quiz code or by scanning QR code
- **Independent Navigation**: Participants can navigate through questions at their own pace
- **Auto-Submit**: Answers are automatically submitted and scored when clicking "Next Question"
- **Overall Quiz Timer**: Displays total remaining time for the entire quiz at the top
- **Real-time Scoring**: Scores update in real-time based on:
  - Correctness of answer
  - Response time (top 3 fastest correct answers get points)
  - Position ranking (1st: 100pts, 2nd: 50pts, 3rd: 25pts, adjusted by speed)
- **Timer Expiry**: When per-question timer expires, UI switches to leaderboard-only view
- **Live Leaderboard**: Real-time updates of participant rankings displayed in sidebar
  - Shows top 3 participants when there are more than 3 participants
  - Shows all participants when there are 3 or fewer
- **Mobile Responsive**: Fully optimized for mobile, tablet, and desktop devices

## Architecture

### Technology Stack
- **Frontend**: Next.js 14 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime subscriptions
- **Styling**: Tailwind CSS with responsive design
- **State Management**: React hooks with Supabase Realtime
- **QR Code**: qrcode.react library for QR code generation

### Project Structure

```
webapp/
├── app/
│   ├── host/
│   │   ├── page.tsx              # Create quiz page
│   │   └── [code]/page.tsx       # Host control interface
│   ├── participant/
│   │   └── [code]/page.tsx       # Participant interface
│   └── page.tsx                   # Home page
├── components/
│   ├── QuestionDisplay.tsx        # Question display component (timer optional)
│   ├── RankingsDisplay.tsx        # Leaderboard component (mobile responsive)
│   ├── Timer.tsx                  # Countdown timer with circular progress
│   └── AnswerForm.tsx             # Answer submission form
├── lib/
│   ├── services/
│   │   ├── quizService.ts        # Quiz operations
│   │   ├── participantService.ts # Participant operations
│   │   └── answerService.ts      # Answer submission & scoring
│   ├── hooks/
│   │   ├── useQuizRealtime.ts    # Quiz state subscriptions
│   │   ├── useParticipantsRealtime.ts # Participant updates
│   │   └── useAnswersRealtime.ts # Answer updates
│   └── supabase.ts               # Supabase client & types
└── lib/constants/
    └── questions.ts              # Pre-defined quiz questions
```

## Database Schema

### Tables

#### `quizzes`
- `id` (UUID, Primary Key)
- `code` (Text, Unique) - Unique quiz code for URL sharing
- `host_name` (Text) - Name of the quiz host
- `status` (Text) - 'waiting', 'in_progress', 'completed'
- `current_question_index` (Integer) - Host's current question index
- `question_indices` (Integer[]) - Array of selected question indices
- `timer_seconds` (Integer) - Total quiz duration in seconds (default: 30)
- `started_at` (Timestamp, Nullable) - When quiz was started (for overall timer calculation)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `participants`
- `id` (UUID, Primary Key)
- `quiz_id` (UUID, Foreign Key → quizzes.id)
- `name` (Text) - Unique per quiz
- `score` (Integer) - Total points accumulated
- `joined_at` (Timestamp)
- Unique constraint: (quiz_id, name)

#### `answers`
- `id` (UUID, Primary Key)
- `quiz_id` (UUID, Foreign Key → quizzes.id)
- `participant_id` (UUID, Foreign Key → participants.id)
- `question_index` (Integer) - Which question was answered
- `answer` (Text) - Participant's answer
- `is_correct` (Boolean)
- `points_awarded` (Integer) - Points for this answer
- `response_time_ms` (Integer) - Time taken to answer
- `answered_at` (Timestamp)
- Unique constraint: (quiz_id, participant_id, question_index)

### Realtime Configuration
- All tables have Realtime enabled via Supabase Realtime
- Row Level Security (RLS) policies allow public read/write access

## User Flows

### Host Flow
1. Host navigates to `/host`
2. Enters name and sets timer duration
3. Quiz is created with unique code
4. Host sees QR code and copy URL button for sharing
5. Host waits for participants to join
6. Host clicks "Start Quiz"
7. **Host view switches to leaderboard and overall timer only** (no question details)
8. Host can view real-time participant rankings
9. Host can see overall quiz time remaining
10. Quiz completes, final winners displayed

### Participant Flow
1. Participant navigates to `/participant/[code]` or scans QR code
2. Enters unique name and joins quiz
3. Waits for host to start quiz
4. Quiz starts, participant sees:
   - **Overall quiz timer at the top** (total time remaining)
   - Current question with answer options
   - Leaderboard in sidebar
5. Participant selects answer
6. Participant clicks "Next Question" → answer auto-submitted and scored
7. Participant can navigate freely between questions (Previous/Next buttons)
8. When per-question timer expires → leaderboard-only view shown
9. Participant can review rankings anytime in sidebar
10. Quiz completes, final rankings displayed

## UI/UX Features

### Mobile Responsiveness
- **Responsive Layout**: All pages adapt to mobile, tablet, and desktop screens
- **Breakpoints**: 
  - Mobile: Default (< 640px)
  - Tablet: `sm:` (≥ 640px)
  - Desktop: `lg:` (≥ 1024px)
- **Touch-Friendly**: Buttons and interactive elements sized appropriately for mobile
- **Flexible Grids**: Layouts stack vertically on mobile, side-by-side on desktop
- **Responsive Typography**: Text sizes scale appropriately across devices
- **QR Code**: Optimized sizing for mobile scanning

### Host Interface
- **Waiting Screen**: 
  - Large QR code for easy scanning
  - Copy URL button (no visible URL field)
  - Quiz code prominently displayed
- **In-Progress Screen**:
  - **Leaderboard only** (main content area)
  - **Overall quiz timer** (sidebar)
  - Clean, distraction-free interface

### Participant Interface
- **Header**: Quiz info, overall timer, and score badge
- **Main Content**: Question display with answer options
- **Sidebar**: Real-time leaderboard (sticky on desktop)
- **Navigation**: Previous/Next question buttons
- **Overall Timer**: Shows total quiz time remaining, not per-question time

## Scoring System

### Point Calculation
- **Top 3 Fastest Correct Answers** receive points:
  - 1st place: 100 base points
  - 2nd place: 50 base points
  - 3rd place: 25 base points
- **Speed Adjustment**: Points scaled by response time ratio
  - Formula: `basePoints * (0.5 + 0.5 * timeRatio)`
  - `timeRatio = max(0, 1 - responseTimeMs / maxTime)`
  - Faster answers get closer to 100% of base points
- **Incorrect Answers**: 0 points
- **Beyond Top 3**: 0 points (even if correct)

### Real-time Updates
- Scores update immediately when answers are submitted
- Leaderboard refreshes automatically via Supabase Realtime
- All participants see updated rankings in real-time

## Key Components

### QuestionDisplay
- Displays question text and multiple-choice options
- Optional timer display (can be hidden)
- Handles answer selection
- Triggers timer completion callback
- Fully mobile responsive

### RankingsDisplay
- Shows participant leaderboard
- Highlights top 3 with special styling (medals and gradient backgrounds)
- Displays scores in descending order
- Updates in real-time
- Mobile responsive with appropriate text sizing and spacing
- Handles long participant names with text truncation
- Supports `maxParticipants` prop to limit displayed participants
- Shows "Showing top N" message when participants are limited
- **Host view**: Shows all participants (no limit)
- **Participant view**: Shows top 3 when there are more than 3 participants

### Timer
- Visual countdown with circular progress indicator
- Changes color when time is low (red when ≤10 seconds)
- Triggers completion callback when timer reaches 0
- Supports custom sizing via className prop
- Used for per-question timer (hidden from participant view during quiz)

## Timer System

### Overall Quiz Timer
- **Duration**: Uses `timer_seconds` directly (the value entered during quiz creation)
  - Example: If host sets 30 seconds, the quiz has 30 seconds total (not per question)
- Starts when quiz status changes to 'in_progress'
- Updates every second based on `started_at` timestamp
- Displayed prominently at the top of participant view and in host sidebar
- Shows in MM:SS format (e.g., "7:19" for 439 seconds)
- No duplicate display - single time format shown

### Per-Question Timer
- Hidden from participant view (still functional for auto-submit)
- Visible in host view during waiting phase
- Counts down from configured `timer_seconds` (same value as overall timer)
- Auto-submits answer when timer expires
- Note: The `timer_seconds` value represents total quiz time, not per-question time

## Configuration

### Environment Variables
Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Dependencies
- `next`: ^14.2.5
- `react`: ^18.3.1
- `react-dom`: ^18.3.1
- `@supabase/supabase-js`: ^2.39.3
- `qrcode.react`: ^4.2.0 (QR code generation)
- `tailwindcss`: ^3.4.4 (styling)

### Questions
- Questions are pre-defined in `lib/constants/questions.ts`
- Currently contains 15+ questions
- Each quiz randomly selects at least 10 questions
- Questions include: question text, options array, correct answer

## Technical Highlights

### Real-time Synchronization
- Uses Supabase Realtime subscriptions for live updates
- Participants see quiz state changes instantly
- Leaderboard updates automatically as scores change
- No polling required

### Independent Navigation
- Each participant maintains their own question index
- Participants can answer questions in any order
- Can navigate forward and backward freely
- Answers tracked per participant per question

### Mobile-First Design
- Responsive breakpoints throughout the application
- Touch-optimized buttons and interactive elements
- Flexible layouts that adapt to screen size
- QR code optimized for mobile scanning
- Text truncation for long content

### Error Handling
- Comprehensive error handling in all service functions
- User-friendly error messages
- Retry logic for transient failures
- Validation at multiple levels

### Performance
- Efficient database queries with proper indexing
- Real-time subscriptions optimized for minimal data transfer
- Client-side state management reduces server load
- Optimized re-renders with React hooks

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd webapp
   npm install
   ```

2. **Configure Environment**
   - Create `.env.local` file
   - Add Supabase URL and anon key:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Open `http://localhost:3000`
   - Create quiz as host or join as participant
   - Test QR code functionality on mobile device

## Recent Updates

### Latest Features (2024)
- ✅ QR code generation for easy quiz sharing
- ✅ Overall quiz timer system:
  - Timer value entered during creation is the total quiz duration (not per question)
  - Single MM:SS format display (no duplicate timers)
  - Shown at top of participant view and in host sidebar
- ✅ Mobile-responsive design across all pages
- ✅ Simplified host view (leaderboard + timer only when quiz in progress)
- ✅ Enhanced participant view with overall timer at top
- ✅ Improved RankingsDisplay component:
  - Mobile optimization
  - Top 3 limit for participants (when more than 3 participants)
  - Full leaderboard for host view
- ✅ Responsive QuestionDisplay component
- ✅ Touch-friendly buttons and navigation

## Future Enhancements

Potential improvements:
- Per-question timer configuration per question
- Question categories/themes
- Quiz history and analytics
- Participant authentication
- Quiz templates
- Export results functionality
- Enhanced mobile app features
- Dark mode support
- Accessibility improvements (ARIA labels, keyboard navigation)

## Notes

- The application uses a modern, clean design with elegant styling
- All operations happen client-side via Supabase client
- No Express backend API required (Supabase handles all backend operations)
- Real-time features powered by Supabase Realtime subscriptions
- Scoring happens automatically when participants submit answers
- QR codes use high error correction level (H) for reliability
- Mobile-first responsive design ensures great experience on all devices
- Host interface is intentionally minimal during quiz to reduce distractions
- Leaderboard visibility differs: Host sees all participants, participants see top 3 (when applicable)
- Timer system: The `timer_seconds` value represents total quiz duration, not per-question time
