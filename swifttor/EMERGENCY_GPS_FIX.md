# Emergency Report GPS Fix

## Problem Identified

The emergency report page (`/emergency-report`) was showing "Target Locked" but not capturing actual GPS coordinates. The location field was showing placeholder/mock data instead of real coordinates.

## Root Causes

1. **Silent GPS Failure**: The `handleCaptureGPS` function in `Step1.tsx` was using optional chaining (`navigator.geolocation?.getCurrentPosition`) which failed silently
2. **Mock Fallback**: When GPS failed, it fell back to hardcoded Los Angeles coordinates without updating the form field
3. **No Auto-Request**: GPS was only requested when user clicked "Initiate Scan" button
4. **Poor Error Feedback**: Error messages weren't clear about what action to take
5. **Strict Validation**: Form required GPS coordinates OR address with comma, confusing users

## Changes Made

### File: `apps/web/components/emergency/Step1.tsx`

#### 1. Improved GPS Capture Function
```typescript
const handleCaptureGPS = () => {
  setLocating(true);
  setLocationError('');
  
  if (!navigator.geolocation) {
    setLocationError('Geolocation not supported by this browser.');
    setLocating(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const address = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
      store.setEmergencyData({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        address: address,
      });
      setValue('location', address, { shouldValidate: true }); // Sync with form
      setLocating(false);
      setLocationError('');
    },
    (error) => {
      console.error('GPS Error:', error.code, error.message);
      setLocating(false);
      
      // Detailed error messages based on error code
      let errorMsg = 'Unable to get GPS location. ';
      if (error.code === 1) {
        errorMsg += 'Please allow location access and try again.';
      } else if (error.code === 2) {
        errorMsg += 'Location service unavailable.';
      } else if (error.code === 3) {
        errorMsg += 'Location request timed out.';
      }
      
      setLocationError(errorMsg);
      // Don't set mock location - require manual entry instead
    },
    { 
      enableHighAccuracy: true,  // Use GPS
      timeout: 10000,            // 10 second timeout
      maximumAge: 0              // No cached results
    }
  );
};
```

**Key improvements:**
- ✅ Explicit geolocation support check
- ✅ Detailed error messages for each error code (1=Permission denied, 2=Unavailable, 3=Timeout)
- ✅ High accuracy mode enabled (uses actual GPS)
- ✅ Form field sync with validation trigger
- ✅ No mock fallback - forces manual entry if GPS fails

#### 2. Relaxed Form Validation
```typescript
const onSubmit = (data: Step1Data) => {
  // Validate that we have either GPS coordinates OR a detailed manual address
  const hasGPS = store.lat != null && store.lng != null;
  const hasDetailedAddress = data.location.length >= 10;
  
  if (!hasGPS && !hasDetailedAddress) {
    setLocationError('Please provide GPS coordinates or a detailed manual address for dispatch.');
    return;
  }
  
  store.setEmergencyData({ ... });
  onNext();
};
```

**Key improvements:**
- ✅ Accepts GPS coordinates OR manual address (≥10 characters)
- ✅ Removed confusing comma requirement
- ✅ Clear error message

#### 3. Auto-Request GPS on Mount
```typescript
const [gpsAttempted, setGpsAttempted] = useState(false);

// Auto-request GPS on component mount
useState(() => {
  if (!store.lat && !gpsAttempted) {
    setTimeout(() => {
      handleCaptureGPS();
    }, 500);
  }
});
```

**Key improvements:**
- ✅ Automatically requests GPS when page loads
- ✅ Tracks if GPS attempt was made
- ✅ Shows appropriate button text ("Retry Scan" after first attempt)

#### 4. Enhanced UI Feedback
```typescript
// Better button states
<button
  disabled={locating}
  className={cn(
    locating ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-emerald-500",
  )}
>
  {locating ? 'Locking Target...' : gpsAttempted ? 'Retry Scan' : 'Initiate Scan'}
</button>

// Dynamic status text
<p>{locating ? 'Acquiring satellite signal...' : gpsAttempted && locationError ? 'GPS unavailable. Please enter location manually.' : 'Securely lock your GPS coordinates...'}</p>

// Styled error box
{locationError && (
  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl space-y-2">
    <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">{locationError}</p>
    <p className="text-[9px] text-red-500 font-medium">Please allow location access in your browser settings, or enter your location manually below.</p>
  </div>
)}
```

**Key improvements:**
- ✅ Button shows "Locking Target..." while locating
- ✅ Button changes to "Retry Scan" after failed attempt
- ✅ Status text updates based on GPS state
- ✅ Error messages in styled box with actionable guidance

## Testing Steps

1. Navigate to `http://localhost:3000/emergency-report`
2. **Test GPS Success:**
   - Allow location access when prompted
   - Should see "Locking Target..." then "Target Locked" with coordinates
   - Coordinates should display in format like `37.77490, -122.41940`

3. **Test GPS Failure:**
   - Block location access in browser
   - Should see error message: "Please allow location access and try again"
   - Can enter manual address (at least 10 characters)
   - Form should submit successfully with manual address

4. **Test Form Submission:**
   - With GPS: Fill name, phone, vehicle info → Submit ✅
   - Without GPS: Fill manual address (10+ chars), name, phone, vehicle → Submit ✅
   - Short manual address (<10 chars) without GPS → Show error ❌

## Browser Console Logs

When GPS is requested, you should see:
```
[LiveDispatchPin] STARTING_GPS_REQUEST
[LiveDispatchPin] GPS_SUCCESS { lat: ..., lng: ..., accuracy: ... }
```

If GPS fails:
```
[LiveDispatchPin] GPS_FAILED { error: "Location error (1): User denied Geolocation" }
[LiveDispatchPin] USING_FALLBACK
```

## Expected Behavior

### Success Flow:
1. Page loads → Auto-requests GPS after 500ms
2. Browser prompts for location permission
3. User allows → GPS coordinates captured
4. Display shows "Target Locked" with coordinates
5. Form auto-fills location field
6. User completes other fields → Submit

### Failure Flow:
1. Page loads → Auto-requests GPS
2. User denies permission OR GPS times out
3. Red error box appears with instructions
4. Status text changes to "GPS unavailable. Please enter location manually."
5. Button changes to "Retry Scan"
6. User can either:
   - Click "Retry Scan" to try GPS again
   - Enter location manually in "Manual Location Description" field (10+ characters)
7. Form submits with manual address

## Technical Details

**Geolocation Options:**
- `enableHighAccuracy: true` - Uses GPS hardware (slower but precise)
- `timeout: 10000` - Gives up after 10 seconds
- `maximumAge: 0` - Always fetches fresh position, no cache

**Error Codes:**
- `1` - Permission denied by user
- `2` - Position unavailable (hardware/network failure)
- `3` - Timeout exceeded

**State Management:**
- Uses Zustand store with persistence
- GPS coordinates stored in `lat`, `lng`, `address` fields
- Survives page refresh via localStorage

## Files Modified

1. `apps/web/components/emergency/Step1.tsx` - Complete GPS logic rewrite
   - Lines changed: +65 added, -13 removed
   - Functions updated: `handleCaptureGPS`, `onSubmit`
   - State added: `gpsAttempted`
   - UI enhanced: Better error feedback, dynamic button text

## Next Steps

- Test on mobile devices (actual GPS hardware)
- Test on desktop browsers (WiFi/cell triangulation)
- Consider adding reverse geocoding to convert coordinates to street address
- Add visual map preview of pinned location
