# Required APIs and Services

This document lists all APIs and services required to run VCTX Feedback Hub.

## 1. Database API (Prisma ORM)

**Type:** Database connection via Prisma Client  
**Provider:** PostgreSQL database  
**Required:** ✅ Yes

### Setup Options:

1. **Supabase** (Recommended for quick setup)
   - Sign up at https://supabase.com
   - Create new project
   - Get connection string from Settings → Database
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

2. **Neon** (Serverless Postgres)
   - Sign up at https://neon.tech
   - Create new project
   - Get connection string from dashboard
   - Format: `postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]`

3. **Self-hosted PostgreSQL**
   - Install PostgreSQL locally or on server
   - Create database: `CREATE DATABASE vctx;`
   - Connection string: `postgresql://user:password@localhost:5432/vctx`

### Environment Variable:
```env
DATABASE_URL="postgresql://user:password@host:5432/vctx?schema=public"
```

### Prisma Commands:
- `npx prisma generate` - Generate Prisma Client
- `npx prisma db push` - Push schema to database
- `npx prisma migrate dev` - Create and run migrations
- `npx prisma studio` - Open database GUI

---

## 2. Solana RPC API

**Type:** Blockchain RPC endpoint  
**Provider:** Solana RPC service  
**Required:** ✅ Yes

### Setup Options:

1. **Public RPC** (Free, rate-limited, good for development)
   - Devnet: `https://api.devnet.solana.com`
   - Mainnet: `https://api.mainnet-beta.solana.com`
   - **Limitations:** Rate limits, may be slow during high traffic

2. **Helius** (Recommended for production)
   - Sign up at https://helius.xyz
   - Get API key from dashboard
   - RPC URL: `https://rpc.helius.xyz/?api-key=[API_KEY]`
   - **Benefits:** Higher rate limits, better reliability, analytics

3. **QuickNode**
   - Sign up at https://quicknode.com
   - Create Solana endpoint
   - Get RPC URL from dashboard

4. **Alchemy**
   - Sign up at https://alchemy.com
   - Create Solana app
   - Get RPC URL from dashboard

5. **Triton**
   - Sign up at https://triton.one
   - Get RPC endpoint

### Environment Variables:
```env
# Option 1: Direct RPC URL
SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_NETWORK="devnet"

# Option 2: Helius (recommended)
HELIUS_API_KEY="your_helius_api_key"
SOLANA_NETWORK="devnet"

# Frontend (optional, for client-side transactions)
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_HELIUS_API_KEY="your_helius_api_key"
```

### RPC Methods Used:
- `getLatestBlockhash()` - Get recent blockhash for transactions
- `sendRawTransaction()` - Send signed transactions
- `confirmTransaction()` - Confirm transaction status
- `getTransaction()` - Verify transaction
- `getBalance()` - Get SOL balance
- `getTokenAccountBalance()` - Get USDC token balance

---

## 3. Treasury Wallet

**Type:** Solana wallet (custodial)  
**Provider:** Self-managed  
**Required:** ✅ Yes

### Setup:
1. Generate a new Solana wallet (dedicated for treasury)
2. Store private key securely in environment variables
3. Fund the wallet with SOL/USDC
4. **NEVER commit private key to git**

### Generate Wallet:
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Generate new wallet
solana-keygen new --outfile treasury.json

# Get public key
solana-keygen pubkey treasury.json

# Get private key (JSON array format)
cat treasury.json
```

### Environment Variable:
```env
TREASURY_WALLET_PRIVATE_KEY="[1,2,3,...]"  # JSON array format
```

### Security Notes:
- Use a dedicated wallet (not personal wallet)
- Keep minimal funds in treasury
- Monitor balance regularly
- Consider hardware wallet for production
- Private key is server-side only (never exposed to frontend)

---

## 4. Frontend Wallet Connection

**Type:** Browser wallet extension  
**Provider:** User's wallet (Phantom, Solflare, etc.)  
**Required:** ✅ Yes (for users)

### Supported Wallets:
- **Phantom** (Most popular)
  - Install: https://phantom.app
  - Browser extension available

- **Solflare**
  - Install: https://solflare.com
  - Browser extension available

- **Backpack**
  - Install: https://backpack.app
  - Browser extension available

### Implementation:
- Uses `window.solana` object (Phantom standard)
- Wallet connection happens client-side
- Transactions are signed by user's wallet
- No API key required (user manages their own wallet)

---

## Summary Checklist

Before deploying, ensure you have:

- [ ] **Database:** PostgreSQL connection string
  - [ ] Supabase/Neon account OR self-hosted PostgreSQL
  - [ ] Database created
  - [ ] Connection string in `.env`

- [ ] **Solana RPC:** RPC endpoint configured
  - [ ] Public RPC (dev) OR Helius/QuickNode (production)
  - [ ] RPC URL or API key in `.env`
  - [ ] Network set (devnet/mainnet)

- [ ] **Treasury Wallet:** Wallet created and funded
  - [ ] New wallet generated
  - [ ] Private key in `.env` (JSON array format)
  - [ ] Wallet funded with SOL/USDC
  - [ ] Public key noted for monitoring

- [ ] **Frontend:** Wallet extension installed
  - [ ] Users need Phantom or compatible wallet
  - [ ] No additional setup needed

---

## Cost Estimates

### Development:
- **Database:** Free tier (Supabase/Neon) or local PostgreSQL
- **RPC:** Free public RPC (rate-limited)
- **Treasury:** Small amount of SOL for testing (~0.1 SOL)

### Production:
- **Database:** $0-25/month (Supabase/Neon free tier or paid)
- **RPC:** $0-50/month (Helius free tier or paid)
- **Treasury:** Variable (depends on escrow volume)

---

## Testing APIs

### Test Database Connection:
```bash
npx prisma db pull
```

### Test Solana RPC:
```bash
# Using Solana CLI
solana balance [WALLET_ADDRESS] --url [RPC_URL]
```

### Test Treasury Wallet:
```bash
# Check balance
solana balance [TREASURY_PUBLIC_KEY] --url [RPC_URL]

# Send test transaction
solana transfer [RECIPIENT] 0.01 --from treasury.json --url [RPC_URL]
```

---

## Support Resources

- **Prisma Docs:** https://www.prisma.io/docs
- **Solana Docs:** https://docs.solana.com
- **Helius Docs:** https://docs.helius.dev
- **Supabase Docs:** https://supabase.com/docs
- **Neon Docs:** https://neon.tech/docs


