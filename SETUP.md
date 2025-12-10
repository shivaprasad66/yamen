# Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase, Neon, or self-hosted)
- Solana wallet (Phantom recommended)
- Treasury wallet with private key

## Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vctx?schema=public"

# Solana
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
# OR use Helius
# HELIUS_API_KEY=your_helius_api_key

# Treasury Wallet (CRITICAL - Never commit this!)
# Format: JSON array of numbers, e.g., [1,2,3,...]
# Generate with: solana-keygen new --outfile treasury.json
# Then: cat treasury.json
TREASURY_WALLET_PRIVATE_KEY=[1,2,3,...]

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Generate Prisma Client:**
```bash
npx prisma generate
```

4. **Set up database:**
```bash
# Push schema to database
npx prisma db push

# OR use migrations
npx prisma migrate dev --name init
```

5. **Create treasury wallet (if needed):**
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Generate new wallet
solana-keygen new --outfile treasury.json

# Get public key
solana-keygen pubkey treasury.json

# Get private key (JSON array format)
cat treasury.json

# Fund the wallet (devnet)
solana airdrop 1 <PUBLIC_KEY> --url devnet
```

6. **Run development server:**
```bash
npm run dev
```

Visit `http://localhost:3000`

## Required APIs and Services

### 1. Database API (Prisma)

**Service:** PostgreSQL database
**Provider Options:**
- Supabase (recommended for quick setup)
- Neon (serverless Postgres)
- Self-hosted PostgreSQL

**Setup:**
1. Create a PostgreSQL database
2. Get connection string
3. Add to `DATABASE_URL` in `.env`

**Prisma Commands:**
- `npx prisma generate` - Generate Prisma Client
- `npx prisma db push` - Push schema changes
- `npx prisma migrate dev` - Create and run migrations
- `npx prisma studio` - Open database GUI

### 2. Solana RPC API

**Service:** Solana blockchain RPC endpoint
**Provider Options:**
- Public RPC (free, rate-limited)
  - Devnet: `https://api.devnet.solana.com`
  - Mainnet: `https://api.mainnet-beta.solana.com`
- Helius (recommended for production)
  - Sign up at https://helius.xyz
  - Get API key
  - Add to `HELIUS_API_KEY` in `.env`
- Other RPC providers:
  - QuickNode
  - Alchemy
  - Triton

**Setup:**
1. Choose a provider
2. Get RPC URL or API key
3. Add to `.env`:
   - `SOLANA_RPC_URL` (for direct URL)
   - `HELIUS_API_KEY` (for Helius)
   - `SOLANA_NETWORK` (devnet/mainnet-beta)

**Note:** For production, use a paid RPC provider for better reliability and rate limits.

### 3. Treasury Wallet

**Service:** Solana wallet for holding escrow funds
**Setup:**
1. Generate a new wallet (see step 5 above)
2. Store private key in `.env` as `TREASURY_WALLET_PRIVATE_KEY`
3. Fund the wallet with SOL/USDC
4. **NEVER commit the private key to git**

**Security:**
- Use a dedicated wallet (not your personal wallet)
- Keep minimal funds in treasury
- Monitor balance regularly
- Consider hardware wallet for production

## Production Deployment

### Environment Variables for Production

```env
# Database (use connection pooling)
DATABASE_URL="postgresql://user:password@host:5432/vctx?schema=public&pgbouncer=true"

# Solana (use mainnet)
SOLANA_NETWORK=mainnet-beta
HELIUS_API_KEY=your_production_helius_key

# Treasury Wallet (same as dev, but use mainnet wallet)
TREASURY_WALLET_PRIVATE_KEY=[...]

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Deployment Platforms

- **Vercel** (recommended for Next.js)
  - Connect GitHub repo
  - Add environment variables
  - Deploy automatically

- **Railway**
  - Add PostgreSQL service
  - Deploy Next.js app
  - Add environment variables

- **Self-hosted**
  - Set up PostgreSQL
  - Deploy Next.js with PM2 or Docker
  - Configure reverse proxy (nginx)

### Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Treasury wallet funded
- [ ] RPC endpoint tested
- [ ] SSL certificate configured
- [ ] Domain configured
- [ ] Monitoring set up
- [ ] Backup strategy in place

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Solana RPC Issues

- Check RPC URL is correct
- Verify network (devnet vs mainnet)
- Check rate limits if using public RPC
- Try different RPC provider

### Treasury Wallet Issues

- Verify private key format (JSON array)
- Check wallet has sufficient balance
- Verify network matches (devnet/mainnet)
- Test with small amount first

### Transaction Failures

- Check wallet has sufficient balance
- Verify transaction fees
- Check network congestion
- Review transaction logs

## Support

For issues or questions:
1. Check error logs in console
2. Review API documentation
3. Check Solana transaction on Solscan
4. Verify environment variables


