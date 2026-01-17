# Pexels Proxy Edge Function

This Edge Function securely proxies requests to the Pexels API, keeping the API key server-side and preventing exposure in the frontend code.

## Security Benefits

- API key is stored in Supabase secrets (never exposed to client)
- User authentication required for all requests
- Rate limiting handled server-side
- Prevents API key theft from frontend bundle

## Setup Instructions

### 1. Add the Pexels API Key to Supabase Secrets

Run this command from your project root:

```bash
npx supabase secrets set PEXELS_API_KEY=VAV0bPM2tR8obutPU21nYePtMyVOSVw0noMc7uHmBaRwSYBeThciBYvP
```

### 2. Deploy the Edge Function

```bash
npx supabase functions deploy pexels-proxy
```

### 3. Verify Deployment

Test the function:

```bash
curl -i --location --request POST 'https://anefzgdcqveejrxnsovm.supabase.co/functions/v1/pexels-proxy' \
  --header 'Authorization: Bearer YOUR_USER_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"query":"nature wellness","orientation":"landscape"}'
```

## Usage from Frontend

The `pexelsApi.ts` service automatically uses this Edge Function:

```typescript
import { getFoodImage } from '@/lib/pexelsApi';

const result = await getFoodImage('nature wellness');
// Returns: { url: string, photographer: string } | null
```

## API Parameters

- `query` (required): Search query for images
- `per_page` (optional): Number of results (default: 1)
- `orientation` (optional): Image orientation (default: 'landscape')
- `category` (optional): Category hint for logging (default: 'background')

## Rate Limits

- Pexels Free Tier: 200 requests/hour
- The function respects Pexels rate limits
- Results are cached in localStorage for 30 days

## Troubleshooting

If images fail to load:

1. Check Supabase logs: `npx supabase functions logs pexels-proxy`
2. Verify secret is set: `npx supabase secrets list`
3. Ensure user is authenticated
4. Check browser console for errors
