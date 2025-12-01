# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is a brain training application currently in the planning phase. The repository contains comprehensive specification documents but no implementation yet. All code will be built from scratch following these specifications.

**Environment**: Windows (win32) - Use Git Bash or PowerShell for commands. File paths use backslashes on Windows but forward slashes work in Git Bash.

## Agent System

This project uses a multi-agent architecture with 6 specialized agents, each owning a specific domain. When working on this codebase, delegate to the appropriate agent based on the task. See `docs/AGENTS.md` for detailed agent descriptions.

### Available Agents

**database-architect**
- **Use for**: Prisma schema, migrations, database models, indexes, seed data
- **Owns**: `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`, `lib/db/`
- **When**: Setting up database, modifying models, optimizing queries, creating seed data

**auth-guardian**
- **Use for**: NextAuth configuration, authentication, login/register, route protection
- **Owns**: `auth.ts`, `app/api/auth/`, `app/api/register/`, `app/login/`, `app/register/`, `middleware.ts`
- **When**: Implementing auth, adding OAuth providers, securing routes, session management

**content-strategist**
- **Use for**: Content service, word selection, exclusion algorithm, word databases
- **Owns**: `lib/content-service/`, `data/words/`
- **When**: Building content service, creating word data, implementing exclusion, optimizing selection

**ui-designer**
- **Use for**: Design system, UI components, styling, animations, glassmorphism
- **Technologies**: Next.js 16+ App Router, TypeScript, Tailwind CSS (no CSS Modules/styled-components)
- **Owns**: `app/globals.css`, `components/ui/`, layout components
- **When**: Creating reusable components, styling pages, implementing animations, responsive design
- **Key skills**: Client vs Server Components, 'use client' directive, Tailwind utilities, TypeScript props

**api-orchestrator**
- **Use for**: API routes, request validation, error handling, backend integration
- **Owns**: `app/api/content/`, `app/api/training/`, API utilities
- **When**: Creating endpoints, integrating services, validating requests, handling errors

**training-builder**
- **Use for**: Training modules, dashboard, training components, session logic
- **Owns**: `components/trainings/`, `app/training/`, `app/dashboard/`
- **When**: Building training modules, implementing 4-phase pattern, creating dashboard

### Agent Delegation Workflow

**Phase 1 (Foundation)**:
1. database-architect → Create Prisma schema and migrations
2. auth-guardian → Implement NextAuth and authentication

**Phase 2 (Services & Design)**:
3. content-strategist → Build content service and word database
4. ui-designer → Create design system and component library

**Phase 3 (Integration)**:
5. api-orchestrator → Create API routes
6. training-builder → Build Word Memory module and dashboard

### When to Use Agents vs. Main Claude

**Use Agents**:
- Focused work within a single domain
- Building new features in their specialty area
- Optimizing or debugging domain-specific issues
- Creating comprehensive implementations

**Use Main Claude**:
- Cross-domain integration and testing
- High-level architecture decisions
- Bug fixes spanning multiple domains
- Small tweaks or quick changes
- Final deployment and testing

## Tech Stack

- **Frontend**: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (development) → PostgreSQL (production on Vercel)
- **Auth**: NextAuth.js v5 with JWT sessions
- **ORM**: Prisma 6
- **Design**: Glassmorphism with purple-to-indigo gradient theme

## Development Commands

```bash
# Install dependencies
npm install

# Database setup
npx prisma migrate dev
npx prisma generate

# Development server
npm run dev

# Build for production
npm run build
npm start

# Database management
npx prisma studio          # Open database GUI
npx prisma migrate reset   # Reset database (dev only)
```

## Architecture Overview

### Database Models (5 core models)

1. **User** - User accounts and profiles
2. **TrainingModule** - Training definitions with JSON configuration for extensibility
3. **TrainingSession** - Individual session records with JSON results
4. **UserProgress** - Aggregated user progress per training
5. **ContentUsage** - Track content shown to users (for smart exclusion)

### Content Service Pattern

The content service (`lib/content-service/`) is a critical architectural component that manages reusable content (words, images, audio). Key features:

- **ExclusionTracker**: Prevents showing same content in consecutive sessions (last 3 sessions tracked)
- **WordService**: Selects words based on difficulty, categories, and user history
- Word data stored in `data/words/*.json` (common, uncommon, rare)
- Usage tracked in ContentUsage table for smart exclusion

### Extensibility via JSON

The database schema uses JSON fields for training-specific data to allow adding new training modules without schema changes:

- `TrainingModule.configuration`: JSON field for training-specific config
- `TrainingSession.results`: JSON field for training-specific results
- `UserProgress.currentDifficulty`: JSON field for adaptive difficulty state

This means you can add new training types without database migrations.

## Key Implementation Patterns

### Training Module Structure

Each training module follows a 4-phase pattern:

1. **Intro Phase**: Explain training, show "Start Training" button
2. **Study Phase**: User studies content (e.g., 20 words for 60 seconds)
3. **Recall Phase**: User performs recall task (e.g., type remembered words)
4. **Results Phase**: Calculate score, show breakdown, save to database

See `02-WORD-MEMORY-SPEC.md` for the complete example implementation.

### API Routes

```
POST /api/register              - Create new user account
POST /api/auth/[...nextauth]    - NextAuth endpoints
POST /api/content/words         - Fetch words with exclusion
POST /api/training/save-session - Save training session and update progress
```

### Protected Routes

Use NextAuth session checking:
```typescript
import { getServerSession } from 'next-auth';
// Check session and redirect if not authenticated
```

Dashboard and training pages are protected routes.

## Word Memory Training Calculations

When implementing the Word Memory module, use these exact formulas:

```typescript
score = (correctWords.length / totalWords.length) × 100
accuracy = (correctWords.length / recalledWords.length) × 100
correctWords = recalled words that were in original list
incorrectWords = recalled words NOT in original list
missedWords = original words NOT recalled
```

Handle edge case: If user recalls 0 words, accuracy = 0 (not NaN).

## Content Service Usage

When fetching words for a training session:

```typescript
import { contentService } from '@/lib/content-service';

const words = await contentService.getWords({
  count: 20,
  difficulty: 'medium',  // or 'easy', 'hard'
  userId: session.user.id,
  categories: ['food', 'animals'],  // optional
  minLength: 3,  // optional
  maxLength: 8   // optional
});
```

After showing content to user, track usage:
```typescript
// This happens automatically in WordService.getWords()
// But you must call it when session is saved
```

## Design System

Reference `04-DESIGN-SYSTEM.md` when it exists. Key design principles:

- **Glassmorphism**: Semi-transparent cards with backdrop-blur
- **Animated Blobs**: Background animations using CSS (7s loop)
- **Purple Gradient**: Primary brand colors purple-to-indigo
- **Color Coding**:
  - Green: Correct answers, success
  - Red: Incorrect answers, errors
  - Yellow: Missed items, warnings
  - Purple: Primary actions, branding

## Project Documentation Structure

All documentation is in the `docs/` folder. Read in this order when starting:

1. `README.md` (root) - Documentation overview
2. `docs/01-WORD-MEMORY-SPEC.md` - First training module specification
3. `docs/02-CONTENT-SERVICE.md` - Content management architecture
4. `docs/AGENTS.md` - Agent system descriptions

## Adding New Training Modules

To add a new training module:

1. Create component in `components/trainings/NewTraining.tsx`
2. Follow the 4-phase pattern (intro → exercise → results)
3. Register in `app/training/[id]/page.tsx`
4. Add card to dashboard
5. Training module record will be auto-created on first session save
6. Use JSON fields for training-specific config and results

## Important Implementation Notes

- **Never repeat content**: Always use ContentService with exclusion tracking
- **Extensible schema**: Use JSON fields instead of adding new columns
- **Session validation**: Validate all training results server-side
- **Timer accuracy**: Use `setInterval` with cleanup in `useEffect`
- **Responsive design**: Test on mobile (2 columns) and desktop (4 columns)
- **Auto-focus**: Focus input fields in recall phases for better UX
- **Error handling**: Gracefully handle insufficient content scenarios

## Database Index Requirements

When creating the schema, ensure these indexes exist for performance:

```prisma
model ContentUsage {
  @@index([userId, contentType, usedAt])
}

model TrainingSession {
  @@index([userId, createdAt])
}

model UserProgress {
  @@index([userId, trainingModuleId])
}
```

## Testing Checklist for Training Modules

When implementing a training module, verify:

- Timer counts down correctly (study and recall phases)
- Phase transitions work smoothly
- Results calculate correctly (handle 0 recalls without NaN)
- Session saves to database
- UserProgress updates correctly
- ContentUsage tracks words shown
- No duplicate word entry allowed during recall
- Responsive on mobile, tablet, desktop
- Back navigation works from all phases
