# PortalJualan ID

Profil usaha rapi dari cerita sederhana — untuk UMKM Indonesia.

## Tech Stack

- **Framework**: SvelteKit 5 + TypeScript
- **Database**: Supabase (PostgreSQL + pgvector)
- **Auth**: Supabase Magic Link
- **AI**: Gemini (extraction) + OpenRouter (embeddings)
- **Storage**: S3-compatible (Supabase Storage)
- **CSS**: Tailwind CSS

## Setup

```bash
npm install
cp .env.example .env
# fill in .env with your Supabase + API keys
npm run dev
```

## API Keys Needed

| Key | Description |
|-----|-------------|
| `PUBLIC_SUPABASE_URL` | Supabase project URL |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GEMINI_API_KEY` | Gemini via CLI proxy |
| `OPENROUTER_API_KEY` | OpenRouter via Airouter proxy |
| `STORAGE_ENDPOINT` | S3 storage endpoint |
| `STORAGE_ACCESS_KEY` | S3 access key |
| `STORAGE_SECRET_KEY` | S3 secret key |
| `STORAGE_BUCKET` | S3 bucket name |

## Supabase Setup

1. Run migrations: `supabase/migrations/0001_init.sql` in SQL Editor
2. Create storage bucket `evidence` (public)
3. Seed partners: `supabase/seed/partners.sql`
