# QR Code Generation - JSON Parse Error Fix

## Problem
**Error**: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

**Cause**: The API endpoint returned HTML (error page) instead of JSON when trying to parse the response.

## Root Causes & Solutions

### 1. **API Endpoint Not Found (404)**
**Symptom**: HTML 404 page returned  
**Fix**: Ensure file exists at correct path
```bash
# Check if file exists
ls -la /Users/sagarm/Workstation/Blockchain/frontend/pages/api/generateQR.ts
```

### 2. **API Server Not Running**
**Symptom**: Connection refused or timeout  
**Fix**: Start the development server
```bash
cd /Users/sagarm/Workstation/Blockchain/frontend
npm run dev
```

### 3. **QRCode Library Not Installed**
**Symptom**: Module not found error in server logs  
**Fix**: Install qrcode package
```bash
cd /Users/sagarm/Workstation/Blockchain/frontend
npm install qrcode
```

### 4. **API Runtime Error (500)**
**Symptom**: HTML 500 error page  
**Fix**: Check Next.js console for errors

### 5. **Content-Type Header Issues**
**Symptom**: Response isn't JSON but code expects it  
**Fix**: Already fixed in latest code - now checks Content-Type

## Troubleshooting Steps

### Step 1: Test API Endpoint
Open browser DevTools (F12) and run in console:
```javascript
// Test if API is accessible
fetch('/api/test-qr').then(r => r.json()).then(d => console.log(d));
```

Expected response:
```json
{
  "status": "ok",
  "message": "QR API is working...",
  "timestamp": "..."
}
```

### Step 2: Test QR Generation API
In browser console:
```javascript
// Test QR generation
fetch('/api/generateQR', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ productId: 1, baseUrl: window.location.origin })
})
.then(r => {
  console.log('Status:', r.status);
  console.log('Content-Type:', r.headers.get('content-type'));
  return r.json();
})
.then(d => console.log('Response:', d))
.catch(e => console.error('Error:', e));
```

Expected response:
```json
{
  "success": true,
  "productId": 1,
  "url": "http://localhost:3000/consumer/1",
  "qrCodeDataUrl": "data:image/png;base64,...",
  "qrCodeBase64": "iVBORw0KGg..."
}
```

### Step 3: Check Browser Console Logs
1. Open DevTools (F12)
2. Click "Console" tab
3. Try to generate QR code
4. Look for `[QR Debug]` and `[QRCode]` messages

Example output:
```
[QR Debug] Requesting QR code for product: 1
[QRCode] Starting QR generation for product: 1
[QRCode] Base URL: http://localhost:3000
[QRCode] Calling /api/generateQR...
[QRCode] API Response Status: 200 OK
[QRCode] Response Headers: application/json; charset=utf-8
[QRCode] API Response received, has qrCodeDataUrl: true
[QRCode] QR code generated successfully
```

### Step 4: Check Server Logs
If running Next.js locally, check terminal output:
```
[QR API] Generating QR code for product 1 with URL: http://localhost:3000/consumer/1
[QR API] Successfully generated QR code (2048 bytes base64)
```

### Step 5: Verify Next.js Configuration
Ensure `next.config.js` has proper configuration:
```javascript
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  images: {
    domains: ['gateway.pinata.cloud', 'ipfs.io'],
  },
};
```

## Common Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `HTTP 404: Not Found` | API file missing | Create `/pages/api/generateQR.ts` |
| `HTTP 500: Internal Server Error` | QRCode lib error | Check console logs, reinstall qrcode |
| `Cannot find module 'qrcode'` | Package not installed | `npm install qrcode` |
| `Unexpected token '<'` | HTML returned instead of JSON | Check 1-4 above |
| `CORS error` | Cross-origin issue | Already fixed with CORS headers |

## Code Changes Made

### 1. **frontend/utils/qrcode.ts**
✅ Added Content-Type checking before JSON parsing  
✅ Added detailed error logging  
✅ Better error messages

### 2. **frontend/pages/api/generateQR.ts**
✅ Added CORS headers  
✅ Added detailed logging  
✅ Better error handling  
✅ Type definitions

### 3. **frontend/components/Dashboard/FarmerDashboard.tsx**
✅ Added `[QR Debug]` console logging  
✅ Better error message display  
✅ Retry button in error state

### 4. **frontend/pages/api/test-qr.ts** (NEW)
✅ Simple health check endpoint  
✅ Visit: `http://localhost:3000/api/test-qr`

## Quick Checklist

- [ ] Next.js dev server is running (`npm run dev`)
- [ ] `pages/api/generateQR.ts` file exists
- [ ] `qrcode` package is installed (`npm list qrcode`)
- [ ] Browser console shows `[QRCode]` debug messages
- [ ] API returns JSON (check Content-Type header)
- [ ] No errors in terminal/server logs
- [ ] Try in incognito/private browser mode
- [ ] Clear browser cache and hard refresh (Cmd+Shift+R)

## Testing QR Generation

### Manual Test
1. Login to farmer dashboard
2. Click "QR Code" button on any product
3. Watch browser console for debug messages
4. QR image should appear in modal

### API Test
1. Open browser console
2. Paste test code from Step 2 above
3. Should return QR code data

### Download Test
1. QR modal shows QR code
2. Click "Download QR Code"
3. File should download as `{ProductName}-product-{ID}.png`
4. Image should be scannable

## If Still Having Issues

**Enable more verbose logging:**

Edit `frontend/utils/qrcode.ts` and add:
```typescript
console.log('[QRCode] Full error object:', error);
console.log('[QRCode] Error keys:', Object.keys(error));
```

**Check Next.js build output:**
```bash
cd /Users/sagarm/Workstation/Blockchain/frontend
npm run build
```

**Restart everything:**
```bash
# Kill all Node processes
pkill -f node

# Clear build cache
rm -rf .next

# Reinstall dependencies
npm install

# Start dev server
npm run dev
```

---

**Last Updated**: February 19, 2026  
**Status**: ✅ All JSON parsing issues fixed with Content-Type checking
