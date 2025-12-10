# API Documentation

## Base URL

All API endpoints are prefixed with `/api`

## Authentication

Authentication is wallet-based. Include the `walletAddress` in the request body for authenticated endpoints.

## Endpoints

### Ideas

#### `GET /api/ideas`

List all ideas (optionally filtered by status).

**Query Parameters:**
- `status` (optional): Filter by status (`OPEN`, `CLOSED`)

**Response:**
```json
{
  "ideas": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "status": "OPEN",
      "currency": "SOL",
      "totalBudget": 50,
      "rewardPerAcceptedFeedback": 5,
      "maxAcceptedFeedbacks": 10,
      "acceptedCount": 2,
      "founder": {
        "id": "uuid",
        "name": "string",
        "walletAddress": "string"
      },
      "feedbackCount": 5,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /api/ideas`

Create a new idea.

**Request Body:**
```json
{
  "walletAddress": "string (required)",
  "name": "string (optional)",
  "title": "string (required, 3-200 chars)",
  "description": "string (required, 50-5000 chars)",
  "context": "string (optional, max 10000 chars)",
  "currency": "SOL" | "USDC",
  "totalBudget": 50,
  "rewardPerAcceptedFeedback": 5
}
```

**Response:**
```json
{
  "idea": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "currency": "SOL",
    "totalBudget": 50,
    "rewardPerAcceptedFeedback": 5,
    "maxAcceptedFeedbacks": 10,
    "status": "OPEN",
    "founder": {
      "id": "uuid",
      "name": "string",
      "walletAddress": "string"
    }
  }
}
```

#### `GET /api/ideas/:id`

Get idea details with feedback.

**Response:**
```json
{
  "idea": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "context": "string",
    "status": "OPEN",
    "currency": "SOL",
    "totalBudget": 50,
    "rewardPerAcceptedFeedback": 5,
    "maxAcceptedFeedbacks": 10,
    "acceptedCount": 2,
    "escrowTxSignature": "string",
    "founder": {
      "id": "uuid",
      "name": "string",
      "walletAddress": "string"
    },
    "feedbacks": [
      {
        "id": "uuid",
        "body": "string",
        "experienceTag": "string",
        "status": "PENDING",
        "createdAt": "2024-01-01T00:00:00Z",
        "contributor": {
          "id": "uuid",
          "name": "string",
          "walletAddress": "string"
        },
        "payout": {
          "id": "uuid",
          "txSignature": "string",
          "status": "SENT",
          "amount": 5
        }
      }
    ]
  }
}
```

#### `POST /api/ideas/:id/create-payment-tx`

Create payment transaction for idea.

**Request Body:**
```json
{
  "walletAddress": "string (required)"
}
```

**Response:**
```json
{
  "transaction": "base64-encoded-transaction",
  "amount": 50,
  "currency": "SOL"
}
```

**Note:** The transaction must be signed by the founder's wallet and sent to the Solana network. Then call `/api/ideas/:id/confirm-payment` with the transaction signature.

#### `POST /api/ideas/:id/confirm-payment`

Confirm payment after transaction is confirmed on-chain.

**Request Body:**
```json
{
  "txSignature": "string (required, transaction signature)"
}
```

**Response:**
```json
{
  "idea": {
    "id": "uuid",
    "escrowTxSignature": "string",
    "status": "OPEN"
  }
}
```

#### `POST /api/ideas/:id/feedback`

Submit feedback for an idea.

**Request Body:**
```json
{
  "walletAddress": "string (required)",
  "name": "string (optional)",
  "body": "string (required, 300-10000 chars)",
  "experienceTag": "string (required, 5-100 chars)"
}
```

**Response:**
```json
{
  "feedback": {
    "id": "uuid",
    "body": "string",
    "experienceTag": "string",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00Z",
    "contributor": {
      "id": "uuid",
      "name": "string",
      "walletAddress": "string"
    }
  }
}
```

### Feedback

#### `POST /api/feedback/:id/shortlist`

Shortlist a feedback (founder only).

**Request Body:**
```json
{
  "walletAddress": "string (required)"
}
```

**Response:**
```json
{
  "feedback": {
    "id": "uuid",
    "status": "SHORTLISTED"
  }
}
```

#### `POST /api/feedback/:id/accept`

Accept a feedback and create payout (founder only).

**Request Body:**
```json
{
  "walletAddress": "string (required)"
}
```

**Response:**
```json
{
  "feedback": {
    "id": "uuid",
    "status": "ACCEPTED"
  },
  "payout": {
    "id": "uuid",
    "amount": 5,
    "currency": "SOL",
    "status": "PENDING"
  }
}
```

#### `POST /api/feedback/:id/reject`

Reject a feedback (founder only).

**Request Body:**
```json
{
  "walletAddress": "string (required)"
}
```

**Response:**
```json
{
  "feedback": {
    "id": "uuid",
    "status": "REJECTED"
  }
}
```

### Payouts

#### `POST /api/payouts/:id/send`

Send payout from treasury to contributor.

**Response:**
```json
{
  "payout": {
    "id": "uuid",
    "txSignature": "string",
    "status": "SENT",
    "amount": 5,
    "currency": "SOL"
  }
}
```

### Users

#### `GET /api/users/:wallet`

Get user profile with stats.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "walletAddress": "string",
    "name": "string",
    "role": "FOUNDER",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "stats": {
    "ideasPosted": 5,
    "feedbacksGiven": 10,
    "feedbacksAccepted": 3,
    "totalEarned": 15
  },
  "ideasPosted": [...],
  "feedbacks": [...]
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `403` - Forbidden (unauthorized action)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Basic rate limiting is implemented. For production, consider using Redis for distributed rate limiting.

## Database APIs

The application uses Prisma ORM with PostgreSQL. Database operations are handled server-side through Prisma Client.

## RPC APIs

The application uses Solana RPC for blockchain interactions:
- Default: Public Solana RPC (devnet/mainnet)
- Optional: Helius RPC (if `HELIUS_API_KEY` is set)

RPC endpoints used:
- `getLatestBlockhash()` - Get recent blockhash for transactions
- `sendRawTransaction()` - Send signed transactions
- `confirmTransaction()` - Confirm transaction status
- `getTransaction()` - Verify transaction
- `getBalance()` - Get wallet balance (SOL)
- `getTokenAccountBalance()` - Get token balance (USDC)


