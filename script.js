// Declare baseLayer variable
let baseLayer = null;
let markerClickEnabled = false;
let layerNum = 0;
// Get references to HTML elements
const mapContainer = document.getElementById('map');
const markerButton = document.getElementById('add-layer-button');
const addPointButton = document.getElementById('delete-layer-button');
const addPolygonButton = document.getElementById('download-button');
const layerPanel = document.getElementById('layer-panel');
const markers = [];

// Function to show a list of all layers
function showLayersList() {
    const layerList = mapContainer.getElementsByClassName('leaflet-control-layers-list')[0];

    if (layerList.style.display === 'none') {
        layerList.style.display = 'block';
    } else {
        layerList.style.display = 'none';
    }
}

// Initialize the map
const map = L.map(mapContainer).setView([19.7515, 75.7139], 7); // Maharashtra coordinates

// Add a tile layer (demographic map of Maharashtra)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Initialize a feature group for drawn items (polygons)
const drawnItems = new L.FeatureGroup().addTo(map);

// Create a Layer Control to handle multiple layers
const baseLayers = {
    'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
    // Add your base layers here
};
const overlayLayers = {
    // Add your overlay layers here
};

// try to update layers 
function updateLayers() {
    L.control.layers(baseLayers, overlayLayers).addTo(map);
    // if(layerNum=0){}
}
updateLayers();

// Add draw control to the map for drawing polygons and including layer control
const drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems,
        edit: true,
        remove: true,
    },
    draw: { polygon: true },
    position: 'topleft', // Set the position of the control
});
map.addControl(drawControl);

// Add an event listener to show the drawn layers
map.on('draw:created', function (e) {
    drawnItems.addLayer(e.layer);
});

// Add an event listener to remove a drawn layer
map.on('draw:deleted', function (e) {
    const layers = e.layers;
    layers.eachLayer(function (layer) {
        drawnItems.removeLayer(layer);
    });
});

// Event listener for the "Upload Map" button
const uploadMapButton = document.getElementById('upload-map-button');
const mapUploadInput = document.getElementById('map-upload-input');

uploadMapButton.addEventListener('click', () => {
    mapUploadInput.click();
});

// Event listener for the uploaded GeoTIFF file
mapUploadInput.addEventListener('change', handleMapUpload);

function handleMapUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const fileType = file.type;
        if (fileType === 'image/tiff' || fileType === 'image/tif') {
            // Handle GeoTIFF
            handleGeoTIFF(file);
        } else {
            alert('Unsupported file type. Please upload a GeoTIFF image.');
        }
    }
}

function createDataURL(raster, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(new Uint8ClampedArray(raster));
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
}

function isValidRasterData(rasterData) {
    // Check if the raster data contains valid values
    return Array.isArray(rasterData) && rasterData.every(val => typeof val === 'number' && isFinite(val));
}


async function handleGeoTIFF(file) {
    const reader = new FileReader();
    reader.onload = async function () {
        const arrayBuffer = reader.result;
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const raster = await image.readRasters();
        const { width, height } = image;

        // Check if the raster data contains valid latitude and longitude values
        if (!isValidRasterData(raster[0])) {
            alert('Invalid GeoTIFF data. Please make sure the data contains valid latitude and longitude values.');
            return;
        }

        // Convert raster data to data URL
        const imageURL = createDataURL(raster[0], width, height);

        // Create a Leaflet Image Overlay for the GeoTIFF
        if (baseLayer) {
            map.removeLayer(baseLayer);
        }
        baseLayer = L.imageOverlay(imageURL, bounds).addTo(map);

        // Fit the map to the bounds of the GeoTIFF layer
        map.fitBounds(bounds);

        // Hide PDF render canvas and show the map container
        const pdfRenderCanvas = document.getElementById('pdf-render');
        pdfRenderCanvas.style.display = 'none';
        const mapContainer = document.getElementById('map');
        mapContainer.style.display = 'block';

        // Update the layer panel with the new layer information
        updateLayerPanel();
    };
    reader.readAsArrayBuffer(file);
}


// Event listener for drawn items
map.on(L.Draw.Event.CREATED, (event) => {
    if (markerClickEnabled) {
        const latLng = event.layer.getLatLng();
        addMarkerToMap(latLng);
        markerClickEnabled = false;
    } else {
        drawnItems.addLayer(event.layer);
    }
});

// Event listener for drawn items
map.on(L.Draw.Event.CREATED, (event) => {
    const layer = event.layer;
    drawnItems.addLayer(layer);
});

// Function to add a layer to the map
function addLayerToMap() {
    const layerName = prompt('Enter the name of the layer:');
    if (!layerName) {
        return; // Cancelled or empty name, do nothing
    }

    const geoJsonLayer = L.geoJSON(sampleGeoJsonData, {
        style: {
            color: 'blue', // Customize the layer style as needed
        },
        title: layerName, // Set the layer's title for the layer panel
    });

    // Add the GeoJSON layer to the overlayLayers object
    overlayLayers[layerName] = geoJsonLayer;

    // Add the GeoJSON layer to the map and the overlay control
    geoJsonLayer.addTo(map);

    // Update the layer panel with the new layer information
    updateLayerPanel();

    updateLayers();
    console.log(overlayLayers);
}

// Example GeoJSON data for a sample layer
const sampleGeoJsonData = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [75.7139, 19.7515], // Sample coordinates (longitude, latitude)
            },
            properties: {},
        },
        // Add more features as needed
    ],
};

// Example usage of addLayerToMap() function
// addLayerButton.addEventListener('click', addLayerToMap);


// Event Listener for "Add Layer Button"
const addLayerButton = document.getElementById('add-layer-button');

addLayerButton.addEventListener('click', () => {
    addLayerToMap();
});

// Function to update Layer Panel
function updateLayerPanel() {
    // Get the layer panel element
    const layerPanel = document.getElementById('layer-panel');

    // Clear the existing content
    layerPanel.innerHTML = '';

    // Loop through the overlay layers and create entries in the panel
    for (const overlayLayerName in overlayLayers) {
        if (overlayLayers.hasOwnProperty(overlayLayerName)) {
            const overlayLayer = overlayLayers[overlayLayerName];
            if (overlayLayer instanceof L.GeoJSON) {
                const layerEntry = document.createElement('div');
                layerEntry.textContent = overlayLayer.options.title || 'Unnamed Layer';
                layerPanel.appendChild(layerEntry);
            }
        }
    }
}



// //Function to update Layer Panel
//function updateLayerPanel() {
//    // Get the layer panel element
//    const layerPanel = document.getElementById('layer-panel');
//
//    // Clear the existing content
//    layerPanel.innerHTML = '';
//
//    // Loop through the layers and create entries in the panel
//    map.eachLayer(layer => {
//        if (layer !== baseLayer && layer !== drawnItems) {
//            const layerEntry = document.createElement('div');
//            layerEntry.textContent = layer.options.title || 'Unnamed Layer';
//            layerPanel.appendChild(layerEntry);
//        }
//    });
//}


