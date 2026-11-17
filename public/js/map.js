// console.log("coordinates:", coordinates);

// mapboxgl.accessToken = mapToken;
//     const map = new mapboxgl.Map({
//         container: 'map', // container ID
//         center: [ 77.2089,28.6139], // starting position [lng, lat]. Note that lat must be set between -90 and 90
//         zoom: 9 // starting zoom
//     });
//     const marker = new mapboxgl.Marker()
//     .setLngLat(coordinates)
//     .addTo(map);

console.log("MAP.JS IS RUNNING!");

const mapElement = document.getElementById("map");
const mapToken = mapElement.dataset.mapToken;
const coordinates = JSON.parse(mapElement.dataset.coordinates);

if (!window.mapboxgl) {
    mapElement.textContent = "Map failed to load. Check your internet connection.";
} else if (!mapToken) {
    mapElement.textContent = "Map configuration is missing.";
} else if (!Array.isArray(coordinates) || coordinates.length !== 2 || !coordinates.every(Number.isFinite)) {
    mapElement.textContent = "Map location is unavailable for this listing.";
} else {
    mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
        container: mapElement,
        center: coordinates,
        zoom: 9
    });

    const popupContent = document.createElement("div");
    const popupTitle = document.createElement("h4");
    popupTitle.textContent = mapElement.dataset.title;
    const popupDescription = document.createElement("p");
    popupDescription.textContent = "Exact Location will be provided after booking";
    popupContent.append(popupTitle, popupDescription);

    new mapboxgl.Marker({color: "red"})
        .setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup({offset: 25})
        .setDOMContent(popupContent))
        .addTo(map);

    console.log("Map object:", map);
    console.log("Coordinates:", coordinates);
}