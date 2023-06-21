// Creating the map object
let myMap = L.map("map", {
  center: [40.7128, -74.0059],
  zoom: 3
});

// Adding base map layers to choose from
let baseMaps = {
  "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }),
  "Satellite": L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a> contributors'
  })
};

// Adding the default base map to the map
baseMaps["OpenStreetMap"].addTo(myMap);

// Use this link to get the GeoJSON earthquake data
let earthquakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to determine the marker size based on earthquake magnitude
function getMarkerSize(magnitude) {
  return magnitude * 2;
}

// Function to determine the marker color based on earthquake depth
function getMarkerColor(depth) {
  if (depth > 90) return "darkred";
  else if (depth > 70) return "red";
  else if (depth > 50) return "orange";
  else if (depth > 30) return "yellow";
  else if (depth > 10) return "lightgreen";
  else return "green";
}

// Getting the GeoJSON earthquake data
d3.json(earthquakeLink).then(function(earthquakeData) {
  // Creating a GeoJSON layer for earthquakes
  let earthquakes = L.geoJson(earthquakeData, {
    pointToLayer: function(feature, latlng) {
      // Create a circle marker for each earthquake
      return L.circleMarker(latlng, {
        radius: getMarkerSize(feature.properties.mag),
        fillColor: getMarkerColor(feature.geometry.coordinates[2]),
        color: "gray",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature: function(feature, layer) {
      // Add a popup with information about the earthquake when clicked
      layer.bindPopup("<h3>Magnitude: " + feature.properties.mag + "</h3><h3>Location: " + feature.properties.place + "</h3><h3>Depth: " + feature.geometry.coordinates[2] + "</h3>");
    }
  });

  // Use this link to get the GeoJSON tectonic plates data
  let tectonicPlatesLink = "static/data/PB2002_plates.json";

  // Getting the GeoJSON tectonic plates data
  d3.json(tectonicPlatesLink).then(function(tectonicPlatesData) {
    // Creating a GeoJSON layer for tectonic plates
    let tectonicPlates = L.geoJson(tectonicPlatesData, {
      style: function(feature) {
        return {
          color: "orange",
          weight: 2
        };
      }
    });

    // Creating overlays for earthquake and tectonic plates layers
    let overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
    };

    // Adding layer controls to the map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // Adding the earthquake layer to the map by default
    earthquakes.addTo(myMap);
  });
});

// Create a legend
let legend = L.control({ position: "bottomright" });

legend.onAdd = function(map) {
  let div = L.DomUtil.create("div", "info legend");

  // Define the legend labels and corresponding colors
  let depthLabels = ["<10", "10-30", "30-50", "50-70", "70-90", ">90"];
  let colors = ["green", "lightgreen", "yellow", "orange", "red", "darkred"];

  // Add legend title
  div.innerHTML += "<h4>Depth</h4>";

  // Add legend labels with colors
  for (let i = 0; i < depthLabels.length; i++) {
    div.innerHTML +=
      '<i style="background:' + colors[i] + '"></i> ' +
      depthLabels[i] + (depthLabels[i + 1] ? '&ndash;' + depthLabels[i + 1] + '<br>' : '+');
  }
  return div;
};

legend.addTo(myMap);
