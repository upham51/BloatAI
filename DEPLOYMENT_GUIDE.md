# Deployment Guide - Pexels Proxy Edge Function

This guide will help you deploy the Pexels proxy Edge Function and configure the API key securely.

## Prerequisites

- Supabase CLI installed ([Installation Guide](https://supabase.com/docs/guides/cli))
- Supabase project linked to this codebase

## Step 1: Link Your Supabase Project (if not already linked)

```bash
npx supabase link --project-ref anefzgdcqveejrxnsovm
```

## Step 2: Set the Pexels API Key as a Supabase Secret

This keeps your API key secure on the server-side:

```bash
npx supabase secrets set PEXELS_API_KEY=VAV0bPM2tR8obutPU21nYePtMyVOSVw0noMc7uHmBaRwSYBeThciBYvP
```

Verify the secret was set:

```bash
npx supabase secrets list
```

You should see `PEXELS_API_KEY` in the list.

## Step 3: Deploy the Pexels Proxy Edge Function

Deploy the function to Supabase:

```bash
npx supabase functions deploy pexels-proxy
```

The function will be deployed to:
```
https://anefzgdcqveejrxnsovm.supabase.co/functions/v1/pexels-proxy
```

## Step 4: Test the Deployment

Test the function with a curl command:

```bash
curl -i --location --request POST 'https://anefzgdcqveejrxnsovm.supabase.co/functions/v1/pexels-proxy' \
  --header 'Authorization: Bearer YOUR_USER_JWT_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "peaceful nature landscape",
    "orientation": "landscape",
    "per_page": 1
  }'
```

To get your user JWT token:
1. Open the app in a browser
2. Open DevTools > Application > Local Storage
3. Find `sb-anefzgdcqveejrxnsovm-auth-token`
4. Copy the `access_token` value

## Step 5: Verify the UI

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the dashboard
3. You should see a beautiful dynamic background image from Pexels
4. The image will be cached for 24 hours

## Troubleshooting

### Images not loading?

1. **Check browser console** for error messages
2. **Verify the secret is set**:
   ```bash
   npx supabase secrets list
   ```

3. **Check function logs**:
   ```bash
   npx supabase functions logs pexels-proxy
   ```

4. **Verify user is authenticated**:
   - The DynamicBackground component requires an active user session
   - Make sure you're logged in

### "No active session" warning?

- The Pexels API requires authentication to prevent abuse
- Make sure you're logged into the app before the dashboard loads

### Function deployment fails?

- Ensure you're linked to the correct Supabase project
- Check that you have deploy permissions
- Verify your Supabase CLI is up to date:
  ```bash
  npx supabase --version
  ```

## Security Notes

✅ **API Key is secure**: The Pexels API key is stored as a Supabase secret and never exposed to the client
✅ **User authentication required**: Only authenticated users can fetch background images
✅ **Rate limiting**: Respects Pexels free tier limit of 200 requests/hour
✅ **Caching**: Images are cached for 24 hours to minimize API calls

## Alternative: Manual Deployment via Supabase Dashboard

If you prefer to use the Supabase Dashboard:

1. Go to https://supabase.com/dashboard/project/anefzgdcqveejrxnsovm/functions
2. Click "Deploy new function"
3. Upload the contents of `supabase/functions/pexels-proxy/index.ts`
4. Go to Settings > Edge Functions > Secrets
5. Add `PEXELS_API_KEY` with value `VAV0bPM2tR8obutPU21nYePtMyVOSVw0noMc7uHmBaRwSYBeThciBYvP`

## Next Steps

Once deployed, the dashboard will:
- Load a beautiful, random wellness/nature background image
- Cache it for 24 hours (refreshes daily)
- Display glassmorphic dark cards with Sonar-inspired design
- Show metrics with percentage changes and glow effects

Enjoy your stunning new UI! 🎨✨
