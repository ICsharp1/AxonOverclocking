# Brain Training App - Project Overview

## Vision
An intensive brain training application inspired by "The Brain That Changes Itself" by Norman Doidge. The app focuses on neuroplasticity-based exercises that actually enhance cognitive abilities through adaptive difficulty and consistent practice.

## Core Concept
Users log in and choose from various training modules. Each training session is:
- **Intensive**: Challenging exercises that push cognitive limits
- **Adaptive**: Difficulty adjusts based on performance
- **Tracked**: Detailed progress analytics and statistics
- **Scientific**: Based on neuroplasticity research

## First Training Module: Word Memory Challenge
- User studies 20 words for 60 seconds
- User recalls as many words as possible in 60 seconds
- System provides immediate feedback
- Difficulty adapts based on performance (more/fewer words in next session)

## Key Requirements

### Authentication
- Username/password login
- Google OAuth option
- User profiles with progress tracking

### Session Management
- Minimum session: 5 minutes (adjustable to 10/15 minutes)
- Different trainings can have different durations
- Sessions are saved with full results

### Extensibility
- System must easily support adding new training modules
- Each training has its own configuration and progression rules
- Database schema supports different training types

### Content Management
- Reusable content service for words, images, audio
- Smart exclusion: don't show same content in consecutive sessions
- Scalable to 500+ words, many images, audio files

### Tech Stack
- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (local dev) → PostgreSQL (production on Vercel)
- **Auth**: NextAuth.js with JWT sessions
- **ORM**: Prisma 6
- **Design**: Modern glassmorphism with purple gradient theme

## User Flow
1. Land on homepage → See app description and features
2. Sign up or log in (username/password or Google)
3. Dashboard shows:
   - User stats (total sessions, streak, average score)
   - Available training modules
   - Progress charts (future)
4. Click "Start Training" on a module
5. Complete training session (intro → exercise → results)
6. See results, save to database, update progress
7. Return to dashboard or train again

## Success Metrics
- User retention (daily streaks)
- Performance improvement over time
- Session completion rate
- User satisfaction with adaptive difficulty

## Future Training Ideas
- Dual N-Back (working memory)
- Perceptual narrowing exercises
- Speed reading with comprehension
- Pattern recognition
- Auditory discrimination
- Mental math challenges

## Design Philosophy
- **Clean & Modern**: Glassmorphism design with smooth animations
- **Focus**: Minimal distractions during training
- **Feedback**: Immediate, clear results after each session
- **Motivation**: Show progress, celebrate improvements
- **Accessibility**: Responsive design, clear typography
