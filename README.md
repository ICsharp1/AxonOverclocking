# Brain Training App - Documentation

This folder contains complete documentation for building the brain training application from scratch.

## Quick Start

If you're starting fresh, read the documents in this order:

1. **00-PROJECT-OVERVIEW.md** - Understand the vision and requirements
2. **01-ARCHITECTURE.md** - Learn the system architecture
3. **05-IMPLEMENTATION-GUIDE.md** - Follow step-by-step instructions
4. **02-WORD-MEMORY-SPEC.md** - Understand the first training module
5. **03-CONTENT-SERVICE.md** - Learn about content management
6. **04-DESIGN-SYSTEM.md** - Reference for UI components

## Document Descriptions

### 00-PROJECT-OVERVIEW.md
**Purpose**: Big picture understanding

**Contains**:
- Project vision and concept
- Core requirements
- User flow
- Tech stack overview
- Future training ideas

**Read this**: Before starting the project

---

### 01-ARCHITECTURE.md
**Purpose**: Technical architecture and design decisions

**Contains**:
- Complete tech stack details
- Database schema with all 5 models
- Directory structure
- Data flow diagrams
- Extensibility patterns
- Why we chose this architecture

**Read this**: Before writing any code

---

### 02-WORD-MEMORY-SPEC.md
**Purpose**: Detailed specification for the first training module

**Contains**:
- All 4 training phases (intro, study, recall, results)
- UI elements for each phase
- Data structures
- Calculation formulas
- Adaptive difficulty logic (future)
- Testing checklist

**Read this**: When implementing the Word Memory component

---

### 03-CONTENT-SERVICE.md
**Purpose**: Design for reusable content management

**Contains**:
- WordService implementation
- ExclusionTracker design
- Word database structure
- Selection algorithm
- Future extensions (images, audio)
- Performance considerations

**Read this**: When building the content service and API routes

---

### 04-DESIGN-SYSTEM.md
**Purpose**: Complete UI/UX reference

**Contains**:
- Color palette
- Typography system
- Spacing and sizing
- Component examples (buttons, cards, forms)
- Animations (blob background)
- Layout patterns
- Responsive design breakpoints
- Accessibility guidelines

**Read this**: When building any UI components

---

### 05-IMPLEMENTATION-GUIDE.md
**Purpose**: Step-by-step build instructions

**Contains**:
- Exact commands to run
- Code snippets for every file
- Configuration examples
- Installation steps
- Testing instructions
- Deployment guide
- Troubleshooting tips

**Read this**: When actually building the app

---

## Key Concepts

### Extensible Training System
The app uses JSON fields in the database to store training-specific configuration and results. This means you can add new training modules without changing the database schema.

### Content Service with Exclusion
Words, images, and other content are managed by a centralized service that tracks usage and prevents showing the same content in consecutive sessions.

### Glassmorphism Design
The UI uses a modern glass-morphism design with:
- Semi-transparent backgrounds
- Backdrop blur effects
- Animated blob backgrounds
- Purple-to-indigo gradient theme

### NextAuth + Prisma + Next.js
- **NextAuth**: Handles authentication (credentials + Google OAuth)
- **Prisma**: ORM for database operations
- **Next.js App Router**: Server and client components

## Quick Reference

### Database Models
1. **User** - User accounts and profiles
2. **TrainingModule** - Training definitions (extensible via JSON)
3. **TrainingSession** - Individual session records
4. **UserProgress** - Aggregated user progress per training
5. **ContentUsage** - Track what content was shown (for exclusion)

### Main Pages
- `/` - Home page (public)
- `/login` - Login page (public)
- `/register` - Register page (public)
- `/dashboard` - User dashboard (protected)
- `/training/[id]` - Training session (protected)

### API Routes
- `POST /api/register` - Create new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- `POST /api/content/words` - Fetch words
- `POST /api/training/save-session` - Save training session

### Tech Stack Summary
```
Frontend: Next.js 16+ (App Router) + TypeScript + Tailwind CSS
Backend: Next.js API Routes
Database: SQLite (dev) → PostgreSQL (prod)
Auth: NextAuth.js v5 (JWT sessions)
ORM: Prisma 6
Styling: Tailwind CSS + Glassmorphism
```

## Development Workflow

1. **Set up environment**
   ```bash
   npm install
   npx prisma migrate dev
   npx prisma generate
   ```

2. **Create word database**
   - Add 500+ words to `data/words/common.json`

3. **Build in order**
   - Database models ✓
   - Auth system ✓
   - Content service ✓
   - Pages (home, login, register, dashboard) ✓
   - Training component ✓
   - API routes ✓

4. **Test**
   ```bash
   npm run dev
   ```

5. **Deploy**
   - Push to GitHub
   - Connect to Vercel
   - Add Postgres database
   - Run migrations

## Common Tasks

### Add a new training module
1. Create component in `components/trainings/NewTraining.tsx`
2. Register in `app/training/[id]/page.tsx`
3. Add card to dashboard
4. Training module will be auto-created on first session save

### Add more words
1. Edit `data/words/common.json`
2. Add word objects with required fields
3. No restart needed (loaded on demand)

### Change difficulty algorithm
1. Edit `lib/content-service/word-service.ts`
2. Modify filtering logic in `getWords()` method

### Customize design
1. Reference `docs/04-DESIGN-SYSTEM.md`
2. Update `app/globals.css` for global styles
3. Use Tailwind classes for component-specific styles

## Getting Help

If something is unclear:
1. Check the relevant doc file first
2. Look at the implementation guide for code examples
3. Check the architecture doc for how things connect
4. Review the design system for UI patterns

## Future Additions

When ready to add more features:
- Dual N-Back training
- Progress charts (Chart.js or Recharts)
- Achievements system
- Leaderboards
- Daily challenges
- Mobile app (React Native)

Each new feature should have its own spec document following the pattern of `02-WORD-MEMORY-SPEC.md`.
