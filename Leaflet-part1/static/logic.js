// Creating the map object
let myMap = L.map("map", {
  center: [40.7128, -74.0059],
  zoom: 3
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Use this link to get the GeoJSON data.
let link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to determine the marker size based on earthquake magnitude
function getMarkerSize(magnitude) {
  return magnitude * 4;
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

// Getting the GeoJSON data
d3.json(link).then(function(data) {
  // Creating a GeoJSON layer with the retrieved data
  L.geoJson(data, {
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
  }).addTo(myMap);

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
});

