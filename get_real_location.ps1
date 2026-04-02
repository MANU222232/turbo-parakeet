# Get accurate location using Windows Location Services
# Requires Windows 10/11 with Location Services enabled

Add-Type -AssemblyName System.Device.Location

$GeoWatcher = New-Object System.Device.Location.GeoCoordinateWatcher

$GeoWatcher.Start()

# Wait for location to be acquired (max 10 seconds)
$timeout = 10
$elapsed = 0

while ($GeoWatcher.Status -eq "Initializing" -and $elapsed -lt $timeout) {
    Start-Sleep -Milliseconds 500
    $elapsed += 0.5
}

if ($GeoWatcher.Status -eq "Ready" -and $null -ne $GeoWatcher.Position) {
    $latitude = $GeoWatcher.Position.Location.Latitude
    $longitude = $GeoWatcher.Position.Location.Longitude
    $accuracy = $GeoWatcher.Position.Location.HorizontalAccuracy
    
    Write-Host ""
    Write-Host "Your Accurate Location:" -ForegroundColor Cyan
    Write-Host "================================"
    Write-Host "Latitude:   $latitude"
    Write-Host "Longitude:  $longitude"
    Write-Host "Accuracy:   $accuracy meters"
    Write-Host "================================"
    Write-Host ""
} else {
    Write-Warning "Could not get location - ensure Location Services is enabled"
}

$GeoWatcher.Stop()
$GeoWatcher.Dispose()
