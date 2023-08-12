// Get references to HTML elements
const mapContainer = document.getElementById('map');
const markerButton = document.getElementById('add-layer-button');
const addPointButton = document.getElementById('delete-layer-button');
const addPolygonButton = document.getElementById('download-button');

// Initialize the map
const map = L.map(mapContainer).setView([19.7515, 75.7139], 7); // Maharashtra coordinates

// Add a tile layer (demographic map of Maharashtra)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Initialize a feature group for drawn items (polygons)
const drawnItems = new L.FeatureGroup().addTo(map);

// Add draw control to the map for drawing polygons
const drawControl = new L.Control.Draw({
    edit: { featureGroup: drawnItems },
    draw: { polygon: true }
});
map.addControl(drawControl);

let markerClickEnabled = false;


/* removed functionality

// Handle marker button click
markerButton.addEventListener('click', () => {
    // marker functionality here
    markerClickEnabled = !markerClickEnabled;
    if (markerClickEnabled) {
        map.on('click', onMapClick);
        markerButton.classList.add('active');
    } else {
        map.off('click', onMapClick);
        markerButton.classList.remove('active');
    }
});

// Handle add point button click
addPointButton.addEventListener('click', () => {
    // Implement add point functionality here
    alert('Add Point button clicked');
});

// Handle add polygon button click
addPolygonButton.addEventListener('click', () => {
    // Implement add polygon functionality here
    alert('Add Polygon button clicked');
});
*/

// Event listener for drawn items
map.on(L.Draw.Event.CREATED, (event) => {
    const layer = event.layer;
    drawnItems.addLayer(layer);
});

//        removed functionality

// // Event handler for map click
// function onMapClick(event) {
//     const latLng = event.latlng;
//     L.marker(latLng).addTo(map)
//         .bindPopup(`Marker added at ${latLng.lat}, ${latLng.lng}`)
//         .openPopup();
// }

// // Function to draw a polygon
// function drawPolygon() {
//     const polygon = L.polygon([
//         [19.7515, 75.7139],
//         [20.5270, 78.9679],
//         [18.5204, 73.8567]
//     ]).addTo(map);
//     polygon.bindPopup('Polygon added!');
// }