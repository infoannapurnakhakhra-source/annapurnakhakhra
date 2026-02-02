# Debugging Customer Auto-Creation

## Issue: "Shopify says no customer"

If customers aren't being created automatically when placing orders, follow this debugging guide.

## Step 1: Check Environment Variables

First, verify that your `.env.local` has all required variables:

```bash
SHOPIFY_ADMIN_TOKEN=your_token_here
SHOPIFY_ADMIN_API_BASE_URL=https://your-store.myshopify.com/admin/api
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
```

**Verify:**
- [ ] SHOPIFY_ADMIN_TOKEN is not empty
- [ ] SHOPIFY_ADMIN_API_BASE_URL ends with `/admin/api` (NOT `/admin/api/2025-10`)
- [ ] NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is your actual store domain

## Step 2: Check Server Logs

When you place an order, check your server terminal for these logs:

### What to look for (Good signs ✅):

```
🧪 TESTING CUSTOMER CREATION
🔌 Admin API Request to: https://your-store.myshopify.com/admin/api/2025-10/graphql.json
📧 Creating customer with mutation: ...
📧 Customer creation response: {...}
✅ Customer created successfully: gid://shopify/Customer/123456
📋 FINAL STATE BEFORE ORDER CREATION:
   finalCustomerId: gid://shopify/Customer/123456
   email: test@gmail.com
   hasCustomer: true
📦 DRAFT ORDER PAYLOAD:
   Setting customer ID: { id: 123456 }
```

### Red flags (Problems ❌):

```
❌ Shopify Admin GraphQL errors: [...]
❌ Customer creation error: ...
⚠️  Error during customer creation: ...
🔌 Admin API Response: { errors: [...] }
```

## Step 3: Test Manually

### Option A: Test via Node Script

Run the debug test script:

```bash
node lib/test-customer-creation.js
```

This will attempt to create a customer directly and show you the exact error.

### Option B: Test via API Endpoint

Create a temporary test endpoint in `app/api/test-customer/route.js`:

```javascript
import { createCustomerFromOrder, getCustomerByEmail } from "@/lib/shopify";

export async function GET(req) {
  try {
    const email = `testuser${Date.now()}@gmail.com`;
    
    console.log("Testing customer creation with email:", email);
    
    // Test 1: Check if customer exists
    console.log("\n1. Checking if customer exists...");
    const existing = await getCustomerByEmail(email);
    console.log("Result:", existing);
    
    // Test 2: Create new customer
    console.log("\n2. Creating new customer...");
    const newCustomer = await createCustomerFromOrder({
      firstName: "Test",
      lastName: "User",
      email: email,
      phoneNumber: "+91 9876543210"
    });
    console.log("Result:", newCustomer);
    
    return Response.json({
      success: !!newCustomer,
      customer: newCustomer,
      email: email
    });
  } catch (error) {
    console.error("Test error:", error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

Then visit: `http://localhost:3000/api/test-customer`

Check the server logs and the JSON response.

## Step 4: Common Issues & Solutions

### Issue 1: "Admin API error" in logs

**Cause:** Invalid Admin API credentials

**Solution:**
1. Go to Shopify Admin → Settings → Apps and Integrations → Develop apps
2. Find your app and click it
3. Go to "Configuration" tab
4. Copy the exact access token
5. Paste into `SHOPIFY_ADMIN_TOKEN` in `.env.local`
6. Restart your dev server

### Issue 2: "GraphQL Errors"

**Cause:** Invalid GraphQL query or mutation syntax

**Check:**
1. Does the mutation have correct syntax?
2. Are the field names correct for your Shopify API version?
3. Check Shopify GraphQL Admin API documentation: https://shopify.dev/api/admin-graphql

**Solution:**
Try querying with Shopify GraphQL Admin API Explorer:
1. Go to Shopify Admin → Settings → Apps and Integrations → Develop apps
2. Click your app → Configuration → Admin API access scopes
3. Ensure you have `write_customers` permission

### Issue 3: "Customer already exists" error

**This is actually OK!** It means:
- The customer creation logic detected an existing customer
- The order is associated with that customer
- Everything worked as expected

### Issue 4: No logs showing at all

**Cause:** Auto-creation code isn't being reached

**Check:**
1. Is `email` being sent to the API?
2. Is `customerId` empty (falsy)?
3. Are you using guest checkout (not logged in)?

**Debug:**
Add this to your checkout code before sending:
```javascript
console.log("Sending to /api/orders/create:", {
  email,
  firstName,
  lastName,
  phoneNumber,
  customerId
});
```

## Step 5: Verify in Shopify

### After creating an order, check:

1. **Order has customer:**
   - Shopify Admin → Orders → Click order
   - Look for "Customer" section
   - Should show customer name/email

2. **Customer was created:**
   - Shopify Admin → Customers
   - Search by email used in checkout
   - Customer should exist with name and phone

3. **Customer details are correct:**
   - Click customer
   - Verify: First Name, Last Name, Email, Phone
   - All should match what was entered

## Step 6: Network Tab Debugging

In your browser, open DevTools → Network tab:

1. Place an order
2. Look for the `/api/orders/create` request
3. Click it → Response tab
4. Check if `success: true`

If `success: false`, read the error message carefully.

## Step 7: Database Logs

If you're logging to MongoDB:

```javascript
// Add this to your order creation
const orderLog = {
  email,
  firstName,
  lastName,
  phoneNumber,
  customerId_sent: customerId,
  customerId_final: finalCustomerId,
  timestamp: new Date(),
  success: !!finalCustomerId
};

// Save to your logs collection
```

This helps track what's happening.

## Complete Troubleshooting Checklist

- [ ] `.env.local` has SHOPIFY_ADMIN_TOKEN
- [ ] `.env.local` has SHOPIFY_ADMIN_API_BASE_URL
- [ ] `.env.local` has NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
- [ ] Dev server restarted after env changes
- [ ] Shopify app has `write_customers` permission
- [ ] Server logs show "Creating customer with mutation" when ordering
- [ ] No GraphQL errors in server logs
- [ ] Customer appears in Shopify Admin → Customers after order
- [ ] Order shows customer association
- [ ] Phone number is saved on customer record

## Getting Help

If still not working:

1. **Collect logs:**
   - Run order with test email
   - Copy server logs
   - Copy browser Network response
   - Check Shopify Admin for order and customer

2. **Test manually:**
   - Run `node lib/test-customer-creation.js`
   - Share the output

3. **Check Shopify GraphQL API:**
   - Go to Shopify Admin → Apps → Develop apps → GraphQL Admin API Explorer
   - Test the mutation directly:
   ```graphql
   mutation {
     customerCreate(input: {
       firstName: "Test"
       lastName: "User"
       email: "test@gmail.com"
       phone: "+91 9876543210"
     }) {
       customer {
         id
         email
       }
       userErrors {
         field
         message
       }
     }
   }
   ```
   - If it fails here, the issue is with Shopify API permissions/setup

4. **Verify mutations are being called:**
   - Add console logs in shopify.js functions
   - Restart dev server
   - Place order
   - Check if logs appear

## Performance Consideration

Each guest order now makes an extra GraphQL query to check for existing customer. This adds ~200-500ms to order processing. If this is a problem, we can:
- Cache customer lookups
- Use background job for customer creation
- Pre-verify email exists before checkout
