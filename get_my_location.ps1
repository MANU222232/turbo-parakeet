# get_my_location.ps1
# This script fetches CP coordinates using ipapi.co (IP-based geolocation)
# No special permissions or hardware required.

$apiUrl = "https://ipapi.co/json/"

try {
    $data = Invoke-RestMethod -Uri $apiUrl -ErrorAction Stop
    
    if ($null -ne $data.latitude -and $null -ne $data.longitude) {
        Write-Host ""
        Write-Host "📍 PC Location Coordinates Found:" -ForegroundColor Cyan
        Write-Host "--------------------------------"
        Write-Host "Latitude:  $($data.latitude)"
        Write-Host "Longitude: $($data.longitude)"
        Write-Host "City:      $($data.city)"
        Write-Host "Region:    $($data.region)"
        Write-Host "Country:   $($data.country_name)"
        Write-Host "--------------------------------"
        Write-Host ""
    } else {
        Write-Warning "Could not find coordinates in the service response."
    }
} catch {
    Write-Error "Error: $($_.Exception.Message)"
}
