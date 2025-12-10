# Design Preview Mode

The application is now configured to run **without APIs** for design preview. All pages use mock data so you can see the UI without setting up databases or Solana connections.

## Running in Preview Mode

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open in browser:**
   ```
   http://localhost:3000
   ```

## What Works in Preview Mode

✅ **All pages render with mock data:**
- Landing page with 3 sample ideas
- Idea detail page (visit `/ideas/preview` or click any idea)
- Create idea form (UI only, no actual submission)
- User profile page (visit `/profile/preview`)

✅ **UI Features:**
- All styling and layouts
- Interactive elements (buttons, forms)
- Responsive design
- Color schemes and status badges
- Thread-style feedback UI

❌ **What Doesn't Work:**
- Actual API calls (uses mock data instead)
- Real wallet connections (uses mock address)
- Database operations
- Solana transactions

## Preview URLs

- **Home:** http://localhost:3000
- **Idea Detail:** http://localhost:3000/ideas/preview
- **Create Idea:** http://localhost:3000/create
- **Profile:** http://localhost:3000/profile/preview

## Mock Data

Mock data is defined in `lib/mockData.ts` and includes:
- 3 sample ideas
- 1 detailed idea with 4 feedback entries
- 1 sample user profile

## Notes

- A yellow banner at the top indicates preview mode
- Wallet connection uses a mock address in development
- All API calls gracefully fall back to mock data
- No errors will occur from missing APIs

## Switching to Full Mode

To use real APIs:
1. Set up database (see `SETUP.md`)
2. Configure environment variables
3. The app will automatically use real APIs when available
4. Mock data is only used as fallback


