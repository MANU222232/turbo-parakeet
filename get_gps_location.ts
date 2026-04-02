import * as fs from "fs";
import * as path from "path";
import * as os from "os";

interface Location {
  latitude: number;
  longitude: number;
  location_name: string;
}

const LOCATION_FILE = path.join(os.homedir(), ".swifttow_location.json");

function saveLocation(
  latitude: number,
  longitude: number,
  locationName: string = ""
): void {
  const data: Location = {
    latitude,
    longitude,
    location_name: locationName,
  };

  fs.writeFileSync(LOCATION_FILE, JSON.stringify(data, null, 2));
  console.log(`\n✓ Location saved: ${locationName}`);
  console.log(`  Lat: ${latitude}, Lon: ${longitude}\n`);
}

function getLocation(): Location | null {
  if (fs.existsSync(LOCATION_FILE)) {
    const data = fs.readFileSync(LOCATION_FILE, "utf-8");
    return JSON.parse(data);
  }
  return null;
}

function displayLocation(data: Location): void {
  console.log("\n📍 Your Saved Location:");
  console.log("========================================");
  console.log(`Latitude:   ${data.latitude}`);
  console.log(`Longitude:  ${data.longitude}`);
  if (data.location_name) {
    console.log(`Location:   ${data.location_name}`);
  }
  console.log("========================================\n");
}

const args = process.argv.slice(2);

if (args.length > 0) {
  if (args[0] === "set") {
    if (args.length >= 3) {
      const lat = parseFloat(args[1]);
      const lon = parseFloat(args[2]);
      const name = args[3] || "";
      saveLocation(lat, lon, name);
    } else {
      console.log(
        "Usage: ts-node get_gps_location.ts set <latitude> <longitude> [location_name]"
      );
    }
  } else if (args[0] === "get") {
    const data = getLocation();
    if (data) {
      displayLocation(data);
    } else {
      console.log("No location saved. Use: ts-node get_gps_location.ts set <lat> <lon> [name]");
    }
  }
} else {
  const data = getLocation();
  if (data) {
    displayLocation(data);
  } else {
    console.log("No location saved yet.");
    console.log("Save your location with:");
    console.log("  ts-node get_gps_location.ts set <latitude> <longitude> [location_name]");
    console.log("\nExample:");
    console.log("  ts-node get_gps_location.ts set 0.592857 35.352493 Kelji");
  }
}
