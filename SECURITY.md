# Security Guidelines

## Environment Variables

**CRITICAL**: Never commit the following to version control:
- `TREASURY_WALLET_PRIVATE_KEY` - Treasury wallet private key
- `DATABASE_URL` - Database connection string with credentials
- `HELIUS_API_KEY` - RPC API key (if used)

## Treasury Wallet Security

1. **Private Key Storage**:
   - Stored only in `.env` file (server-side)
   - Never logged or exposed to frontend
   - Never included in client-side code

2. **Access Control**:
   - Treasury wallet functions are server-side only
   - All payout transactions are signed server-side
   - No client-side access to treasury wallet

3. **Best Practices**:
   - Use a dedicated wallet for treasury (not your personal wallet)
   - Keep minimal funds in treasury wallet
   - Monitor treasury wallet balance regularly
   - Consider using a hardware wallet for production

## API Security

1. **Input Validation**:
   - All user inputs are validated using Zod schemas
   - Wallet addresses are validated before processing
   - Transaction signatures are verified on-chain

2. **Authorization**:
   - Founders can only manage feedback for their own ideas
   - Wallet addresses are used for authentication
   - No password-based auth (wallet-based only)

3. **Rate Limiting**:
   - Basic rate limiting implemented (can be enhanced with Redis)
   - Prevents spam and abuse

## Frontend Security

1. **No Sensitive Data**:
   - Private keys never exposed to frontend
   - Treasury wallet address can be public (read-only)
   - Transaction signing happens client-side (user's wallet)

2. **XSS Prevention**:
   - User inputs are sanitized
   - React automatically escapes content
   - No `dangerouslySetInnerHTML` usage

3. **CORS**:
   - API routes have CORS headers
   - Only allowed origins can access APIs

## Database Security

1. **Connection String**:
   - Stored in environment variables
   - Use connection pooling
   - Use SSL/TLS for production

2. **SQL Injection**:
   - Prisma ORM prevents SQL injection
   - No raw SQL queries with user input

## Transaction Security

1. **Verification**:
   - All transactions are verified on-chain before confirmation
   - Transaction signatures are validated
   - Failed transactions are not confirmed

2. **Atomicity**:
   - Database transactions ensure data consistency
   - Payout creation and idea updates are atomic

## Recommendations for Production

1. **Add Rate Limiting**:
   - Use Redis for distributed rate limiting
   - Implement per-wallet and per-IP limits

2. **Add Monitoring**:
   - Log all treasury wallet transactions
   - Monitor for suspicious activity
   - Set up alerts for failed payouts

3. **Add Audit Logging**:
   - Log all sensitive operations
   - Track who accessed what and when

4. **Use Multi-Signature Wallet**:
   - For production, consider multi-sig treasury wallet
   - Requires multiple approvals for large transactions

5. **Add CAPTCHA**:
   - Prevent bot submissions
   - Add to feedback submission form

6. **Add Content Moderation**:
   - Filter inappropriate content
   - Flag spam feedback

7. **Regular Security Audits**:
   - Review code for vulnerabilities
   - Test payment flows thoroughly
   - Penetration testing


