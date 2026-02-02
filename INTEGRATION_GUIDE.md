# Auto Customer Creation - Integration Guide

## What Was Implemented

When a customer places an order **without being logged in**, the system will automatically:
1. Check if a customer already exists with the provided email
2. If not, create a new Shopify customer with their name and mobile number
3. Associate the order with the customer
4. Complete the order as usual

## How It Works

The feature is **completely automatic** - no changes needed to the checkout UI. The backend handles everything:

### Guest Checkout Flow (Before)
```
Customer → Fill Address → Place Order → Order Created (no customer)
```

### Guest Checkout Flow (After)
```
Customer → Fill Address → Place Order → Auto-Create Customer → Order Created (with customer)
```

## What Data Is Captured

From the checkout form:
- **First Name**: `address.firstName`
- **Last Name**: `address.lastName`
- **Email**: `email`
- **Phone**: `address.phone`

These are automatically sent to the order API and used to create the Shopify customer.

## Modified Endpoints

### `/api/orders/create` (POST)

**New Request Fields:**
```javascript
{
  // ... existing fields ...
  
  // NEW: Customer details for auto-creation
  "firstName": "John",           // Optional but recommended
  "lastName": "Doe",             // Optional but recommended
  "phoneNumber": "+91 9876543210" // Optional but recommended
}
```

**Logic:**
1. If `customerId` provided → use existing customer
2. Else if `email` provided:
   - Check if customer exists
   - If exists → use existing customer
   - If not → create new customer
3. Proceed with order creation using the (existing or new) customer

## Testing Checklist

- [ ] New guest customer can order and appears in Shopify → Customers
- [ ] Returning guest (same email) doesn't create duplicate customer
- [ ] Logged-in customer orders work as before
- [ ] Phone number is saved correctly on customer record
- [ ] First/Last name are saved correctly on customer record
- [ ] Order shows customer association in Shopify admin
- [ ] Email validation still works (whitelisted domains)
- [ ] Order completes successfully without errors

## Verification Steps

### 1. Check Customer Was Created
```
Shopify Admin → Customers → Search by email used in checkout
```
Should find the customer with captured name and phone.

### 2. Check Order-Customer Association
```
Shopify Admin → Orders → Click the order
```
Should show customer details in the "Customer" section.

### 3. Check Phone Number
```
Shopify Admin → Customers → Click customer → Edit
```
Phone number should be in "Phone" field.

## Rollback Instructions

If you need to revert these changes:

1. **lib/shopify.js**: Remove the three new functions
   - `createCustomerFromOrder`
   - `getCustomerByEmail`

2. **app/api/orders/create/route.js**: 
   - Remove imports: `createCustomerFromOrder, getCustomerByEmail`
   - Revert the guest order handling logic
   - Change `finalCustomerId` back to `customerId`

3. **components/CartDrawer.jsx**:
   - Remove: `firstName, lastName, phoneNumber` from request

4. **app/cart/page.js**:
   - Remove: `firstName, lastName, phoneNumber` from request

5. **app/recover/[cartid]/page.js**:
   - Remove: `firstName, lastName, phoneNumber` from request

## Environment Variables Required

Ensure these are set in your `.env.local`:
```
SHOPIFY_ADMIN_TOKEN=your_token
SHOPIFY_ADMIN_API_BASE_URL=https://your-store.myshopify.com/admin/api
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
```

## Performance Impact

- **Minimal**: One additional GraphQL query per guest order to check if customer exists
- **Cached**: Shopify's customer search is fast
- **Graceful**: If customer creation fails, order still completes

## Security Notes

- No passwords are set for auto-created customers
- Customers can set password later via account recovery
- Phone numbers are optional but recommended
- Email validation prevents most invalid domains

## Support & Troubleshooting

### Symptom: Customer not created
**Check:**
1. Email validation - is the email domain whitelisted?
2. Shopify Admin API token is valid
3. Browser console for error messages
4. Server logs for "Auto-creating customer" logs

### Symptom: Duplicate customers with same email
**This shouldn't happen because:**
- We check if customer exists by email before creating
- Shopify prevents duplicate emails anyway

If it happens, check:
1. Email validation is working
2. Race condition (simultaneous orders) - add retry logic if needed

### Symptom: Phone number not saved
**Check:**
1. Phone number was included in request
2. Shopify allows phone numbers for your store's country
3. Phone number format is valid for the region

## Future Improvements

1. **Async Customer Creation**: Create customer in background if order needs to complete faster
2. **Customer Portal**: Auto-generate temporary password for newly created customers
3. **Welcome Email**: Send special welcome email to first-time customers
4. **Phone Notifications**: Use captured phone for order status updates
5. **Customer Preferences**: Allow customers to set preferences after first order
