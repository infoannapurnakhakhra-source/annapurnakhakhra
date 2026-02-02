# Auto Customer Creation Feature

## Overview
This feature automatically creates a Shopify customer when an order is placed without logging in or registering. Customer details (name and mobile number) are captured during checkout and used to create the customer record.

## Implementation Details

### Files Modified

#### 1. **lib/shopify.js**
Added three new functions:

##### `createCustomerFromOrder({ firstName, lastName, email, phoneNumber })`
- Creates a new Shopify customer via the Admin API (no password required)
- Handles cases where customer already exists
- Returns the customer object with ID
- Gracefully handles errors if customer already exists

##### `getCustomerByEmail(email)`
- Helper function to check if a customer already exists with the given email
- Uses Shopify's customer search query
- Returns customer object or null if not found

#### 2. **app/api/orders/create/route.js**
Updated the POST handler with automatic customer creation logic:

- Now accepts additional fields: `firstName`, `lastName`, `phoneNumber`
- If no `customerId` provided (guest checkout):
  - First checks if customer already exists by email
  - If exists, uses that customer for the order
  - If not, creates a new customer with provided details
  - Continues without error if customer creation fails
- Uses `finalCustomerId` when creating draft orders
- Maintains backward compatibility with logged-in users

#### 3. **components/CartDrawer.jsx**
Updated the placeOrder function to send customer details:
- Now sends `firstName`, `lastName`, and `phoneNumber` in the request
- Data comes from the address form filled during checkout

#### 4. **app/cart/page.js**
Updated the placeOrder function similarly:
- Sends `firstName`, `lastName`, and `phoneNumber` to the order API

#### 5. **app/recover/[cartid]/page.js**
Updated the placeOrder function:
- Sends `firstName`, `lastName`, and `phoneNumber` to the order API

## Data Flow

```
1. Customer fills checkout form (name, email, phone, address)
   ↓
2. Clicks "Place Order"
   ↓
3. Frontend sends POST to /api/orders/create with:
   - email
   - firstName
   - lastName
   - phoneNumber
   - shippingAddress
   - lineItems
   ↓
4. Backend checks if customerId exists:
   - If yes: uses that customer
   - If no: 
     a. Checks if customer exists by email
     b. If yes: uses existing customer
     c. If no: creates new customer
   ↓
5. Creates Shopify draft order with customer
   ↓
6. Completes draft order → creates order
   ↓
7. Returns success with redirectUrl
```

## API Request Example

```json
POST /api/orders/create
{
  "email": "customer@gmail.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+91 9876543210",
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "address1": "123 Main St",
    "city": "Mumbai",
    "province": "Maharashtra",
    "zip": "400001",
    "phone": "+91 9876543210"
  },
  "lineItems": [
    {
      "variant_id": "12345",
      "quantity": 2,
      "price": "100.00"
    }
  ],
  "paymentMethod": "cod"
}
```

## Customer Creation Logic

### Scenario 1: Logged-in User
- Uses provided `customerId`
- No new customer created
- Order associated with existing customer

### Scenario 2: Guest User, First Order
- No `customerId` provided
- Email checked - doesn't exist
- New customer created with:
  - firstName (from checkout form)
  - lastName (from checkout form)
  - email (from checkout form)
  - phone (from checkout form)
- Order associated with newly created customer

### Scenario 3: Guest User, Returning (Same Email)
- No `customerId` provided
- Email checked - found existing customer
- No new customer created
- Order associated with existing customer
- Customer details (name/phone) may be updated if provided

### Scenario 4: Customer Creation Fails
- Order continues to be created
- If customer creation fails (e.g., duplicate email not caught earlier), the order is still placed
- Customer ID is not associated with order
- Order is created as guest order with email

## Testing

### Prerequisites
1. Shopify store with valid Admin API credentials
2. Environment variables configured:
   - `SHOPIFY_ADMIN_TOKEN`
   - `SHOPIFY_ADMIN_API_BASE_URL`
   - `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`

### Test Cases

#### Test 1: New Guest Customer
```
1. Load cart page
2. Fill address form (first name, last name, email, phone)
3. Click "Place Order"
4. Expected: New customer created in Shopify, order associated with customer
5. Verify: Check Shopify Admin → Customers for new customer record
```

#### Test 2: Returning Guest (Same Email)
```
1. Load cart page
2. Use previously used email in address form
3. Fill other details (name, phone can be different)
4. Click "Place Order"
5. Expected: Order associated with existing customer (no duplicate created)
6. Verify: Customer count doesn't increase, order linked to existing customer
```

#### Test 3: Logged-in User
```
1. Login to account
2. Load cart page
3. Address auto-fills with account info
4. Click "Place Order"
5. Expected: Order associated with logged-in customer, no new customer created
6. Verify: Order shows customer_id in admin
```

#### Test 4: Missing Email
```
1. Load cart page
2. Fill address form WITHOUT email
3. Click "Place Order"
4. Expected: Order created without customer (guest order)
5. Verify: Order has email field but no customer association
```

#### Test 5: Invalid Email Domain
```
1. Load cart page
2. Fill address form with non-whitelisted email (e.g., @company.com)
3. Click "Place Order"
4. Expected: Error message about email domain
5. Verify: Order not created, form stays on checkout
```

## Error Handling

### Customer Creation Failures
If customer creation fails for any reason other than "already exists":
- Error is logged to console
- Order creation continues
- Order is placed as guest order
- User is redirected to thank you page

This ensures order placement is not blocked by customer creation failures.

### Validation
- Email domain validation (whitelisted domains: gmail.com, yahoo.com, outlook.com, hotmail.com, icloud.com, proton.me)
- Required fields: email, firstName, lastName, shippingAddress, lineItems
- Phone number is optional for customer creation but required for order

## Shopify GraphQL Mutations

### Create Customer
```graphql
mutation customerCreate($input: CustomerInput!) {
  customerCreate(input: $input) {
    customer {
      id
      email
      firstName
      lastName
      phone
    }
    userErrors {
      field
      message
    }
  }
}
```

### Search Customer by Email
```graphql
query customerSearch($query: String!) {
  customers(first: 1, query: $query) {
    edges {
      node {
        id
        email
        firstName
        lastName
        phone
      }
    }
  }
}
```

## Benefits

1. **Seamless UX**: Customers don't need to create account before ordering
2. **CRM Data**: Shopify maintains customer records for repeat orders
3. **Personalization**: Future orders can be personalized using customer history
4. **Analytics**: Better customer tracking and order history
5. **Automatic**: No additional steps required from customer
6. **Backward Compatible**: Existing logged-in user flows unchanged

## Future Enhancements

1. Allow customer to set password after first order
2. Send welcome email to newly created customers
3. Auto-login customer after first order
4. Store customer preferences (oil preference, dietary restrictions)
5. Customer tier/loyalty tracking
6. SMS notifications for orders using captured phone number

## Debugging

### Check if customer was created
1. Go to Shopify Admin → Customers
2. Search by email used in checkout
3. Customer should appear with captured firstName, lastName, phone

### Check order-customer association
1. In Shopify Admin → Orders
2. Open the order
3. "Customer" section should show customer name and details
4. If blank, customer wasn't created or associated

### Logs
Frontend: Browser console will show customer creation status
Backend: Server console logs include:
- "🔄 Auto-creating customer for guest order"
- "✅ Customer already exists" 
- "✅ New customer created"
- "⚠️  Error during customer creation"
