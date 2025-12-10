# VCTX Feedback Hub

An MVP web app for idea validation with paid feedback, powered by Solana.

## Features

- Founders post ideas and pay a fixed fee (SOL/USDC)
- Community members provide detailed feedback
- Founders accept useful feedback
- Automatic payouts to contributors from escrow

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase/Neon compatible)
- **Blockchain**: Solana (web3.js)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and treasury wallet private key
```

3. Set up database:
```bash
npx prisma generate
npx prisma db push
# Or use migrations: npx prisma migrate dev
```

4. Run development server:
```bash
npm run dev
```

## Security Notes

- Treasury wallet private key is stored in `.env` and never logged
- All sensitive operations happen server-side
- Wallet addresses are used for authentication (no passwords needed)

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (pages)/           # Public pages
│   └── layout.tsx         # Root layout
├── components/            # React components
├── lib/                   # Utilities and helpers
│   ├── prisma.ts         # Prisma client
│   ├── solana.ts         # Solana utilities
│   └── validations.ts    # Zod schemas
├── prisma/               # Prisma schema and migrations
└── docs/                 # Documentation
```


