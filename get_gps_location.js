#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const LOCATION_FILE = path.join(os.homedir(), '.swifttow_location.json');

function saveLocation(latitude, longitude, locationName = "") {
    const data = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        location_name: locationName
    };
    
    fs.writeFileSync(LOCATION_FILE, JSON.stringify(data, null, 2));
    console.log(`\nLocation saved: ${locationName}`);
    console.log(`  Lat: ${latitude}, Lon: ${longitude}\n`);
}

function getLocation() {
    if (fs.existsSync(LOCATION_FILE)) {
        const rawData = fs.readFileSync(LOCATION_FILE, 'utf8');
        return JSON.parse(rawData);
    }
    return null;
}

function displayLocation(data) {
    console.log("\n📍 Your Saved Location:");
    console.log("=".repeat(40));
    console.log(`Latitude:   ${data.latitude}`);
    console.log(`Longitude:  ${data.longitude}`);
    if (data.location_name) {
        console.log(`Location:   ${data.location_name}`);
    }
    console.log("=".repeat(40) + "\n");
}

const args = process.argv.slice(2);

if (args.length > 0) {
    if (args[0] === 'set') {
        if (args.length >= 3) {
            const lat = args[1];
            const lon = args[2];
            const name = args.slice(3).join(' ') || "";
            saveLocation(lat, lon, name);
        } else {
            console.log("Usage: node get_gps_location.js set <latitude> <longitude> [location_name]");
        }
    } else if (args[0] === 'get') {
        const data = getLocation();
        if (data) {
            displayLocation(data);
        } else {
            console.log("No location saved. Use: node get_gps_location.js set <lat> <lon> [name]");
        }
    } else {
        console.log("Unknown command. Use 'get' or 'set'.");
    }
} else {
    const data = getLocation();
    if (data) {
        displayLocation(data);
    } else {
        console.log("No location saved yet.");
        console.log("Save your location with:");
        console.log("  node get_gps_location.js set <latitude> <longitude> [location_name]");
        console.log("\nExample:");
        console.log("  node get_gps_location.js set 0.592857 35.352493 Kelji");
    }
}
