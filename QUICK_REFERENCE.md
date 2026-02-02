# Quick Reference - Auto Customer Creation

## TL;DR
When guest customers order without logging in, they're automatically added to Shopify as customers with their name and phone number. The order is linked to their customer record.

## Files Changed (5 total)

### Core Implementation
1. **lib/shopify.js** - Added 2 customer functions
2. **app/api/orders/create/route.js** - Added auto-creation logic

### Frontend Updates (send new data)
3. **components/CartDrawer.jsx** - Added firstName, lastName, phoneNumber
4. **app/cart/page.js** - Added firstName, lastName, phoneNumber  
5. **app/recover/[cartid]/page.js** - Added firstName, lastName, phoneNumber

## New Functions in shopify.js

```javascript
// Create customer without password (for guest orders)
export async function createCustomerFromOrder({ firstName, lastName, email, phoneNumber })

// Check if customer exists by email
export async function getCustomerByEmail(email)
```

## Order Creation Logic Flow

```javascript
if (customerId) {
  // Use existing customer (logged-in user)
} else if (email) {
  // Guest checkout - auto-create customer
  const existingCustomer = await getCustomerByEmail(email);
  if (existingCustomer) {
    // Use existing
    finalCustomerId = existingCustomer.id;
  } else {
    // Create new
    const newCustomer = await createCustomerFromOrder({...});
    finalCustomerId = newCustomer.id;
  }
}

// Create order with finalCustomerId
```

## Request Example

```javascript
// What frontend sends now
fetch('/api/orders/create', {
  method: 'POST',
  body: JSON.stringify({
    // New fields:
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "+91 9876543210",
    
    // Existing fields:
    email: "john@gmail.com",
    shippingAddress: {...},
    lineItems: [...],
    paymentMethod: "cod"
  })
})
```

## Error Handling

- If customer creation fails: order still completes (graceful fallback)
- If customer already exists: uses existing customer
- If email validation fails: order blocked (email domain check)

## Testing Quick Checks

1. **New customer order**: Check Shopify Customers list
2. **Repeat customer**: Should not create duplicate
3. **Phone saved**: Customer details should show phone
4. **Order linked**: Order page should show customer name

## Deployment Checklist

- [ ] Update all three checkout files with new fields
- [ ] Test with new guest order
- [ ] Test with repeat email address
- [ ] Verify in Shopify admin
- [ ] Check server logs for errors
- [ ] Test email validation still works

## Rollback (if needed)

- Remove 2 functions from `shopify.js`
- Remove auto-creation code from `orders/create/route.js`
- Remove new fields from 3 frontend files

Simple as that - feature is self-contained.

## Logs to Watch For

```
// Good signs
"🔄 Auto-creating customer for guest order:"
"✅ New customer created:"
"✅ Customer already exists:"

// Warning signs
"⚠️  Error during customer creation"
```

Check server logs during testing to confirm flow.

## Known Limitations

- Customers created without password (use forgot password to set)
- Phone optional for customer creation
- Only works with whitelisted email domains (gmail, yahoo, outlook, icloud, proton)
- One customer per email address

## Future Ideas

- Auto-login after first order
- Welcome email to new customers
- SMS notifications with phone number
- Customer tier/preferences
