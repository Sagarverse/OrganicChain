# Supply Chain Workflow Synchronization Guide

## Overview

The workflow is now synchronized with all major components implemented. This document explains how products flow through the entire supply chain and how each role participates.

---

## Complete Workflow Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FARMER REGISTRATION PHASE                            │
└─────────────────────────────────────────────────────────────────────────────┘

1. Farmer connects wallet and goes to /farmer page
2. Farmer clicks "Register Product" button
3. Farmer fills form:
   - Product Name: "Organic Tomatoes"
   - Crop Type: Vegetables
   - Latitude/Longitude: Farm location
   - Planted Date: When crop was planted
   - Expected Harvest: When crop will be ready
   - Certification Hash: IPFS hash of organic cert
4. Farmer submits form → Smart Contract registerProduct() called
5. Product created with status = PLANTED (0)
6. Product ID assigned (e.g., #42)
7. Product appears in Farmer's dashboard

┌─────────────────────────────────────────────────────────────────────────────┐
│                         FARMER HARVEST PHASE                                 │
└─────────────────────────────────────────────────────────────────────────────┘

8. Farmer checks product when ready
9. Farmer clicks "Harvest Product" button
10. Farmer fills:
    - Estimated Quantity: "50 kg"
    - Harvest Notes: "Picked Aug 15, quality excellent"
11. Smart Contract harvestProduct() called
12. Product status changes to HARVESTED (1)
13. ✅ Product now appears in "Products Available for Processing"

┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROCESSOR DISCOVERY & PROCESSING PHASE                    │
└─────────────────────────────────────────────────────────────────────────────┘

14. Processor connects wallet and goes to /processor page
15. Processor sees "Products Available for Processing" section with stats badge
    - Shows: "Alice Smith - Organic Tomatoes (50 kg) - Harvested Aug 15"
    - Authenticity Score: 100/100
    - Status: Harvested
16. Processor clicks "Process Batch" button on the product card
17. Modal opens showing:
    - Product Name: Organic Tomatoes
    - Product ID: #42
    - Authenticity Score: 100/100
    - Available Quantity: 50 kg
18. Processor fills:
    - Quantity to Process: "50 kg"
    - Processing Location: "Central Facility, City"
    - Processing Notes: "Washed, sorted, packaged"
    - Temperature: "2500" (25.00°C)
    - Humidity: "6500" (65.00%)
    - Certificate: (optional PDF/image)
19. Smart Contract processBatch() called
20. Batch created with ID (e.g., batch #1)
21. Product status changes to PROCESSED (3)
22. Product moves to "Processed Batches Ready to Transfer" section
23. Batch data stored:
    - Batch ID, Product ID, Quantity, Location
    - Sensor readings (temperature, humidity)
    - Processing certificate hash (if uploaded)

┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROCESSOR TO RETAILER TRANSFER PHASE                      │
└─────────────────────────────────────────────────────────────────────────────┘

24. In "Processed Batches Ready to Transfer" section, processor sees their product
25. Processor clicks "Transfer to Retailer" button
26. Modal opens showing:
    - Product Name, ID, Status
    - Processed batch details
27. Processor fills:
    - Retailer Address: "0x1234..." (retailer's wallet address)
    - Transfer Notes: "Standard packaging, fragile handling"
28. Smart Contract transferCustody() called
29. Product status changes to IN_TRANSIT (5)
30. Product currentCustodian changes to retailer address
31. ✅ Product now ready for retailer to receive

┌─────────────────────────────────────────────────────────────────────────────┐
│                         RETAILER RECEIVE PHASE                               │
└─────────────────────────────────────────────────────────────────────────────┘

32. Retailer connects wallet and goes to /retailer page
33. Retailer sees "Incoming Transfers - Action Required" section
    - Shows: "Organic Tomatoes (50 kg) from Processor XYZ"
    - Status: In Transit
    - Product ID: #42
34. Retailer clicks "Accept Delivery" button
35. Modal opens showing:
    - Product details (name, ID, type, score)
    - Harvest date, authenticity score
36. Retailer fills:
    - Retail Price: "9.99" (dollars)
    - Expiry Date: Unix timestamp (default: 30 days from now)
    - Receiving Notes: "Received in good condition"
37. Smart Contract receiveProduct() called
38. Product status changes to DELIVERED (6)
39. Product moves to "Products In Stock" section
40. Retail price and expiry date stored on blockchain
41. ✅ Product now available for consumers to verify

┌─────────────────────────────────────────────────────────────────────────────┐
│                      CONSUMER VERIFICATION PHASE                             │
└─────────────────────────────────────────────────────────────────────────────┘

42. Consumer scans QR code on product at retail store
    (Retailer downloaded QR from dashboard)
43. QR code links to: /consumer/42
44. Consumer page loads and shows:
    - Product Name: "Organic Tomatoes"
    - Farmer: Alice Smith (address)
    - Production Journey:
      * Planted: [date] at [farm location]
      * Harvested: [date], 50 kg, [notes]
      * Processed: [batch details], temperature, humidity
      * Received at Retail: [date], price $9.99, expiry [date]
45. Full trace sections visible:
    - ✅ Verification Badge: Authenticity score 100/100
    - ✅ Product Trace: Complete journey from farmer to consumer
    - ✅ Carbon Footprint: Emissions data
    - ✅ Freshness Score: Based on harvest and expiry dates
    - ✅ Sustainability Score: Based on processing methods
    - ✅ Comparison Analytics: Compare with similar products
    - ✅ Sensor Data: Temperature/humidity readings during processing
    - ✅ Product Journey Map: GPS visualization of product route
46. Consumer can:
    - Generate and download verification report
    - Copy product verification URL
    - Share on social media (Twitter/Facebook)
    - View batch details modal
    - View certificate details modal
    - View complete supply chain history

```

---

## Key Improvements Implemented

### 1. Processor Product Discovery ✅
**Before**: Processor dashboard called `getAvailableBatches()` but showed no UI
**After**: 
- Clearly displays "Products Available for Processing" section
- Shows farmer name, product name, quantity, harvest date
- Click "Process Batch" to open modal pre-filled with product data
- Quantity field auto-populates with harvest amount
- Product details box shows ID, farmer, authenticity score

### 2. Enhanced Batch Processing Modal ✅
**Before**: Minimal form with no product context
**After**:
- Detailed product information card at top
- Shows farmer address, authenticity score, available quantity
- Quantity field has max validation against harvest amount
- Better labeling: "Quantity to Process (kg)"
- Clearer explanations for temperature/humidity format

### 3. Retailer Dashboard Complete Overhaul ✅
**Before**: Showed all products without filtering
**After**:
- **Incoming Transfers Section**: Shows only products in IN_TRANSIT status sent to this retailer
  - Blue card styling to indicate action required
  - Shows processor address, harvest date, product type, score
  - "Accept Delivery" button with validation
  
- **In Stock Section**: Shows only products in DELIVERED status
  - Color coding: Green for healthy, Yellow for expiring soon, Red for expired
  - Shows retail price, expiry date prominently
  - "Download QR Code" button for consumer verification
  - Badges showing expiration status
  
- **Statistics Dashboard**: Shows counts of:
  - Incoming transfers waiting for action
  - In stock products
  - Expiring soon alerts

### 4. Retailer Acceptance Modal Enhanced ✅
**Before**: Date inputs were confusing
**After**:
- Product details box showing full context
- Retail Price field in dollars (not smallest units)
- Expiry date as Unix timestamp with conversion helper
- Shows current timestamp for reference
- 30-day default expiry calculation
- Clear receiving notes for condition documentation

### 5. Status Tracking ✅
**Before**: Product statuses manually managed
**After**:
- Automatic status progression through workflow
- Public constants enumerating all statuses
- Visual badges showing current status
- Status changes reflected immediately in UI

### 6. Data Flow Synchronization ✅
**Before**: Each dashboard isolated, no inter-dashboard communication
**After**:
- Products flow smoothly from farmer → processor → retailer → consumer
- Each role sees only what they need to act on
- Completed products automatically move to next section
- Consumer page receives complete data if all prior stages completed

---

## Testing the Complete Workflow

### Prerequisites
- MetaMask installed with test accounts
- All roles assigned (FARMER_ROLE, PROCESSOR_ROLE, RETAILER_ROLE)
- Frontend running: `npm run dev` at /frontend
  
### Test Scenario: Complete Product Journey

#### Step 1: Farmer Registration (Account 1)
1. Connect Account 1 (farmer) wallet
2. Navigate to `/farmer`
3. Click "Register Product"
4. Fill form:
   - Name: "Test Tomatoes"
   - Type: Vegetables
   - Location: 40.7128, -74.0060 (NYC)
   - Expected Harvest: Date 30 days from now
5. Submit form
6. ✅ See "Product registered successfully"
7. ✅ Product appears in "My Products" with status "Planted"

#### Step 2: Farmer Harvest
1. Still on Account 1
2. Click "Harvest" button on the Test Tomatoes product
3. Fill:
   - Quantity: "50"
   - Notes: "Premium harvest, Grade A"
4. Submit
5. ✅ Product status changes to "Harvested"
6. ✅ Product disappears from "My Products" (farmer is done with it)

#### Step 3: Processor Claims Product
1. Switch to Account 2 (processor account)
2. Navigate to `/processor`
3. ✅ In stats: "Ready to Process" shows 1
4. ✅ In "Products Available for Processing" section, see "Test Tomatoes" card
5. Click "Process Batch"
6. ✅ Modal shows:
   - Product name, ID, farmer address
   - Authenticity score: 100/100
   - Quantity field pre-populated with "50"
7. Fill form:
   - Quantity: 50 (already filled)
   - Location: "Main Processing Plant"
   - Notes: "Washed and sorted"
   - Temp: "2200" (22.00°C)
   - Humidity: "6000" (60.00%)
8. Submit
9. ✅ See "Batch processed successfully"
10. ✅ Product moves to "Processed Batches Ready to Transfer" section

#### Step 4: Processor Transfers to Retailer
1. Still on Account 2
2. In "Processed Batches Ready to Transfer", click "Transfer to Retailer"
3. Enter retailer address (Account 3's address)
4. Add notes: "Standard 2-day shipping"
5. Submit
6. ✅ See "Custody transferred to retailer"
7. ✅ Product disappears from processor dashboard

#### Step 5: Retailer Accepts Delivery
1. Switch to Account 3 (retailer account)
2. Navigate to `/retailer`
3. ✅ In stats: "Incoming Transfers" shows 1
4. ✅ In "Incoming Transfers" section (blue cards), see "Test Tomatoes"
5. Click "Accept Delivery"
6. ✅ Modal shows product details, currently in transit
7. Fill form:
   - Retail Price: "12.99"
   - Expiry Date: (default 30 days) or enter custom timestamp
   - Notes: "Shelf space B5"
8. Submit
9. ✅ See "Product received successfully"
10. ✅ Product moves to "Products In Stock" section with green border
11. ✅ Price shows as "$12.99"

#### Step 6: Consumer Verification
1. Open URL: `/consumer/1` (replace 1 with actual product ID)
2. OR: Account 3 (retailer) downloads QR code from in-stock product
3. ✅ Consumer page loads with complete data:
   - Product name: "Test Tomatoes"
   - Verification badge: 100% authenticity
   - Product trace showing complete journey:
     * Farmer: (Account 1 address)
     * Harvest date with notes
     * Batch details with sensor readings
     * Processor location and certificate
     * Retail information with price and expiry
   - All advanced features visible:
     * Carbon footprint chart
     * Freshness score: Green (recently harvested)
     * Sustainability metrics
     * Sensor readings: 22°C, 60% humidity
     * Product journey map showing locations
4. Consumer can:
   - ✅ Download report (button visible)
   - ✅ Copy verification URL (button visible)
   - ✅ Share on social (options visible)
   - ✅ Click batch details modal
   - ✅ View certificate information
   - ✅ Compare with other products

### Expected UI Changes During Test

| Phase | Farmer View | Processor View | Retailer View | Consumer |
|-------|-------------|---------------|---------------|----------|
| **After Register** | Product in "My Products" (PLANTED) | - | - | - |
| **After Harvest** | Product removed from "My Products" | Shows in "Available for Processing" | - | - |
| **After Process** | - | Shows in "Ready to Transfer" | - | - |
| **After Transfer** | - | Removed from processor | Shows in "Incoming Transfers" (blue) | - |
| **After Accept** | - | - | Moved to "In Stock" (green) | Complete data visible |

---

## Troubleshooting

### Issue: Processor doesn't see available products
**Cause**: Product not marked as Harvested by farmer
**Solution**: Ensure farmer clicked "Harvest" button and it shows status "Harvested"

### Issue: Retailer "Incoming Transfers" empty
**Cause**: Processor hasn't transferred the product yet
**Solution**: Verify processor is on Account 2, and clicked "Transfer to Retailer" with Account 3's address

### Issue: Consumer page shows "No data"
**Cause**: Earlier stages not completed
**Solution**: Check all statuses are correctly transitioned through the workflow

### Issue: "AccessControl" error when submitting
**Cause**: Current account doesn't have required role
**Solution**: Verify role assignment in admin dashboard (/admin/roles)

### Issue: Retailer modal shows wrong product
**Cause**: Multiple products in transit
**Solution**: Check product ID in URL matches the modal

---

## Database/Blockchain State After Complete Flow

After running the full test, the blockchain will contain:

```
Product #1 (Test Tomatoes):
├─ Status: Delivered (6)
├─ Farmer: 0x[Account1]
├─ CurrentCustodian: 0x[Account3] (Retailer)
├─ PlantedDate: [timestamp]
├─ HarvestDate: [timestamp]
├─ HarvestQuantity: 50 kg
├─ AuthenticityScore: 95-100 (may decrease if anomalies detected)
├─ ReceivedDate: [timestamp]
├─ ExpiryDate: [timestamp+30days]
├─ RetailPrice: 1299 (cents)
└─ Batches:
   └─ Batch #1:
      ├─ ProductId: 1
      ├─ Processor: 0x[Account2]
      ├─ Status: Processed (3)
      ├─ Quantity: 50 kg
      ├─ ProcessingLocation: "Main Processing Plant"
      ├─ ProcessingDate: [timestamp]
      └─ SensorLogs:
         └─ Temperature: 2200°C (22.00°)
         └─ Humidity: 6000 (60.00%)

```

---

## Next Steps (Optional Enhancements)

1. **Batch Selection in Processor**:
   - If farmer has multiple products, add dropdown selector before opening modal
   - Currently pre-selects from clicked card (already implemented)

2. **Notifications**:
   - Add badge counts showing pending actions
   - Browser notifications when status changes
   - Email notifications for retailers about expiring products

3. **Real-time Updates**:
   - WebSocket/polling to update dashboard when other roles complete actions
   - Currently requires manual page refresh

4. **Batch Details**:
   - Show actual batch IDs in retailer "In Stock" section
   - Link to view all batches for a product

5. **Analytics**:
   - Processor dashboard: processing time analytics
   - Retailer dashboard: bestselling products, shelf-life statistics
   - Consumer page: add comparison scoring

---

## Summary

The workflow is now **fully synchronized** with:
- ✅ Farmer registration and harvesting
- ✅ Processor product discovery and batch processing
- ✅ Retailer delivery acceptance with expiry tracking
- ✅ Consumer verification with complete supply chain history
- ✅ Automatic status transitions through all phases
- ✅ Data flow between all dashboards
- ✅ QR code generation and verification

Products can now successfully flow from farmer → processor → retailer → consumer with complete traceability at each step.
