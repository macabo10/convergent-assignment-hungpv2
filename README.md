# Project Overview

This is **PVH Persona AI Trainer**, a Next.js application for conversational training with dynamic persona customization. Users interact with AI personas in various scenarios (tax compliance, gaming support, etc.) and receive real-time feedback hints during conversations.

# Commands
```bash
npm install
npm run dev        # Start development server
```

Server will start on http://localhost:3000

# Environment setup

Required environment variables (put in `.env` file):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)

# Architecture

## Database & Backend (Supabase)
The app uses Supabase for:
- **Authentication** - Email/password auth with password reset flow
- **PostgreSQL Database** - Real-time data storage with the following schema:
  - `conversations` - Main conversation threads (linked to user, persona, scenario)
  - `messages` - Individual messages (types: `user`, `persona`, `hint`)
  - `personas` - AI personality profiles with Big Five personality traits (o_score, c_score, e_score, a_score, n_score)
  - `scenarios` - Conversation contexts (e.g., tax compliance, game support)
- **Realtime Subscriptions** - Messages stream in real-time via Postgres changes
- **Webhooks** - Database triggers call `/api/scripted-ai/route.ts` when users send messages

**Next.js 16 App Router** with the following layout:
- `/app/page.tsx` - Main chat interface (conversation view)
- `/app/auth/*` - Authentication pages (login, register, forget-password, update-password, confirm)
- `/app/account-settings` - User account management
- `/app/api/scripted-ai/route.ts` - Webhook endpoint for AI response generation

**Key Components:**
- `components/Sidebar.tsx` - Collapsible navigation with conversation history
- `components/LayoutWrapper.tsx` - Conditional sidebar rendering (hidden on auth pages)
- `components/AuthWrapper.tsx` - Protected route wrapper
- `components/ui/*` - Radix UI-based components (shadcn/ui pattern)

**State Management:**
- `context/AuthContext.tsx` - Global auth state using React Context
- Local state for conversations, messages, and persona data
- Real-time updates via Supabase subscriptions

## Data Flow

1. **User sends message** → Inserted into `messages` table with `sender_type: "user"`
2. **Database trigger** → Fires webhook to `/api/scripted-ai/route.ts`
3. **API route** → Generates AI persona response + hint based on:
   - Persona traits (Big Five scores)
   - Scenario context (tax vs gaming)
   - User input content
4. **Response + hint inserted** → Both messages added to database
5. **Realtime subscription** → Client receives new messages instantly via Supabase channel

## Authentication Flow

1. User logs in → `AuthContext` tracks session
2. `AuthWrapper` redirects unauthenticated users to `/auth/login`
3. Auth pages (`/auth/*`) do not show sidebar (handled in `LayoutWrapper`)

## Conversation Lifecycle

- New conversation created when user sends first message without an active conversation ID
- Random persona and scenario selected from database
- Router navigates to `/?id={conversation_id}` once created
- Real-time channel subscribed to specific conversation messages

## Soft Deletes

Conversations use soft delete pattern (`is_deleted: true`) instead of hard deletion to preserve data integrity.


