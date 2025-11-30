# Vercel Environment Variables Configuration

## Required Environment Variables for Production

Add these environment variables in your Vercel project settings:

### 1. Database Configuration

**Variable Name:** `DATABASE_URL`  
**Value:** Your Neon PostgreSQL connection string  
**Example:** `postgresql://user:password@host:port/database?sslmode=require`  
**Environment:** Production, Preview, Development  
**Required:** ✅ Yes

**How to get it:**
- Go to your Neon dashboard (https://neon.tech)
- Select your project
- Copy the connection string from the project settings

---

### 2. Stack Auth - Project ID

**Variable Name:** `NEXT_PUBLIC_STACK_PROJECT_ID`  
**Value:** Your Stack Auth project ID  
**Example:** `proj_xxxxxxxxxxxxx`  
**Environment:** Production, Preview, Development  
**Required:** ✅ Yes  
**Note:** `NEXT_PUBLIC_` prefix makes this available to client-side code

**How to get it:**
- Go to Stack Auth dashboard (https://stack-auth.com)
- Select your project
- Find "Project ID" in project settings
- Copy the value

---

### 3. Stack Auth - Publishable Client Key

**Variable Name:** `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`  
**Value:** Your Stack Auth publishable client key  
**Example:** `pk_live_xxxxxxxxxxxxx` or `pk_test_xxxxxxxxxxxxx`  
**Environment:** Production, Preview, Development  
**Required:** ✅ Yes  
**Note:** `NEXT_PUBLIC_` prefix makes this available to client-side code

**How to get it:**
- Go to Stack Auth dashboard
- Select your project
- Find "Publishable Client Key" in API keys section
- Copy the value

---

### 4. Stack Auth - Secret Server Key

**Variable Name:** `STACK_SECRET_SERVER_KEY`  
**Value:** Your Stack Auth secret server key  
**Example:** `sk_live_xxxxxxxxxxxxx` or `sk_test_xxxxxxxxxxxxx`  
**Environment:** Production, Preview, Development  
**Required:** ✅ Yes  
**Note:** This is server-side only (no `NEXT_PUBLIC_` prefix)

**How to get it:**
- Go to Stack Auth dashboard
- Select your project
- Find "Secret Server Key" in API keys section
- Copy the value
- ⚠️ **Keep this secret!** Never expose it in client-side code

---

## Optional Environment Variables

These are only needed if you plan to seed the database in production (not recommended):

### 5. Seed User ID (Optional)

**Variable Name:** `SEED_USER_ID`  
**Value:** Your Stack Auth user ID (only if seeding)  
**Environment:** Development only (if needed)  
**Required:** ❌ No

### 6. Use Test Users (Optional)

**Variable Name:** `USE_TEST_USERS`  
**Value:** `"true"` or `"false"` (only if seeding)  
**Environment:** Development only (if needed)  
**Required:** ❌ No

---

## Quick Setup Checklist

Copy and paste these into Vercel:

```
✅ DATABASE_URL
✅ NEXT_PUBLIC_STACK_PROJECT_ID
✅ NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
✅ STACK_SECRET_SERVER_KEY
```

---

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** tab
3. Click on **Environment Variables** in the sidebar
4. For each variable above:
   - Click **Add New**
   - Enter the **Name** (exactly as shown)
   - Enter the **Value** (from your Neon/Stack Auth dashboards)
   - Select **Environments**: Production, Preview, Development (or just Production)
   - Click **Save**
5. **Redeploy** your project after adding variables

---

## Important Notes

- **Never commit** `.env` files to git (already in `.gitignore`)
- **`NEXT_PUBLIC_`** variables are exposed to the browser - only use for public keys
- **Secret keys** (without `NEXT_PUBLIC_`) are server-side only
- After adding variables, you **must redeploy** for changes to take effect
- Use **Production** keys in production, **Test** keys in preview/development

---

## Verification

After deployment, verify your environment variables are set:

1. Go to Vercel project → Settings → Environment Variables
2. Confirm all 4 required variables are listed
3. Check that values are correct (they'll be masked for security)
4. Test your deployment - authentication and database should work

---

## Troubleshooting

**"Database connection failed"**
- Verify `DATABASE_URL` is correct
- Check that your Neon database is running
- Ensure SSL mode is enabled (`?sslmode=require`)

**"Stack Auth not working"**
- Verify all 3 Stack Auth variables are set
- Check that keys match your Stack Auth project
- Ensure redirect URLs are configured in Stack Auth dashboard

**"Environment variable not found"**
- Make sure variable names match exactly (case-sensitive)
- Redeploy after adding variables
- Check that you selected the correct environment (Production/Preview/Development)

