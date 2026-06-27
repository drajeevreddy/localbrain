# LocalBrain

> Your knowledge, connected.

LocalBrain is an AI-powered knowledge graph app that turns your notes into a living, connected knowledge base with intelligent search and chat.

**Live App:** [https://www.localbrain.in](https://www.localbrain.in)

![LocalBrain Hero](public/screenshot.png)

---

## Features

### Core
- **Notes** — Create, edit, and organize notes with Markdown support
- **Knowledge Graph** — Interactive graph visualization with React Flow
- **RAG Chat** — Chat with your notes using AI-powered retrieval
- **PDF Import** — Upload PDFs and extract text automatically
- **Multi-Provider LLM** — 10+ providers with encrypted API key storage

### Student Tools
- **Flashcard Generator** — Create study flashcards from any note
- **Quiz Generator** — Multiple choice quizzes with scoring
- **Study Summary** — AI-generated overviews with key concepts
- **Key Points** — Extract the most important facts

### Corporate Tools
- **Email Draft** — Generate professional emails and replies
- **Action Items** — Extract tasks with assignees and priorities
- **Meeting Summary** — Structured meeting notes
- **Project Status** — Generate status updates
- **Presentation Outline** — Create slide decks with speaker notes
- **Reports** — Weekly, executive, and client summaries
- **Decision Log** — Track decisions with rationale

### Productivity
- **Smart Search** — AI-powered semantic search across notes
- **Tags System** — Color-coded tags for organization
- **Export** — Markdown, Text, HTML, JSON formats
- **Note Templates** — 12 templates for students and professionals
- **Pomodoro Timer** — Built-in focus timer
- **Voice Input** — Speech-to-text in the editor
- **Keyboard Shortcuts** — Ctrl+S, Ctrl+N, Ctrl+K

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + Tailwind CSS
- **Backend:** Next.js API Routes (Edge-compatible)
- **Database:** Supabase (PostgreSQL + pgvector)
- **Auth:** Supabase Auth (Email + Google OAuth)
- **Graph:** React Flow (@xyflow/react)
- **Design:** Resend-inspired dark theme

---

## Supported LLM Providers

| Provider | Embedding | Free Tier |
|----------|-----------|-----------|
| NVIDIA NIM | Yes | 40 RPM |
| Groq | No | 30 RPM |
| Google Gemini | No | 60 RPM |
| OpenRouter | No | 50+ free models |
| Together AI | Yes | 60 RPM |
| Cohere | Yes | 20 RPM |
| Cerebras | No | 30 RPM |
| Hugging Face | Yes | 30 RPM |
| Ollama (local) | Yes | Unlimited |
| Mistral | No | Yes |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/animeprints/localbrain.git
cd localbrain
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration SQL from `supabase/migrations/`
3. Enable Email Auth in Dashboard → Authentication → Providers → Email

### 3. Configure environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SETTINGS_ENCRYPTION_KEY=your-32-char-random-string
```

### 4. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Deployment

### Vercel

```bash
vercel --prod
```

Or connect your GitHub repo to Vercel and set environment variables in the dashboard.

### Environment Variables (Vercel)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `SETTINGS_ENCRYPTION_KEY` | 32-char key for AES-256 encryption |

---

## Project Structure

```
localbrain/
├── app/
│   ├── (auth)/          # Login & Signup pages
│   ├── api/             # API routes
│   │   ├── chat/        # RAG chat endpoint
│   │   ├── corporate/   # Corporate tools
│   │   ├── graph/       # Knowledge graph
│   │   ├── notes/       # Note CRUD + ingest
│   │   ├── search/      # Smart search
│   │   ├── settings/    # Provider settings
│   │   ├── study/       # Study tools
│   │   └── tags/        # Tag management
│   └── app/             # Protected app pages
├── components/
│   ├── chat/            # Chat UI
│   ├── corporate/       # Corporate tools
│   ├── graph/           # Knowledge graph
│   ├── notes/           # Note editor, templates
│   ├── study/           # Study tools, timer
│   └── ui/              # Shared components
├── lib/
│   ├── llm/             # Multi-provider LLM adapter
│   └── supabase/        # Supabase client setup
└── supabase/
    └── migrations/      # Database migrations
```

---

## Database Schema

- **notes** — User notes with content
- **chunks** — Text chunks with pgvector embeddings
- **graph_nodes** — Knowledge graph nodes (concept/entity/tag)
- **graph_edges** — Relationships between nodes
- **user_settings** — Encrypted provider configurations
- **note_tags** — Tag definitions
- **note_tag_relations** — Note-tag associations

---

## Security

- API keys encrypted with AES-256 before storage
- Row Level Security (RLS) on all tables
- Auth middleware on all protected routes
- No API keys exposed in client responses

---

## License

MIT

---

Built with Next.js, Supabase, and ❤️
