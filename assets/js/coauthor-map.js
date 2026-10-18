(function () {
    "use strict";

    var container = document.getElementById("coauthor-map");
    var data = document.getElementById("coauthor-map-data");
    var status = document.getElementById("coauthor-map-status");
    if (!container || !data || !status) return;

    if (!window.L) {
        status.textContent = "The map could not load. Please refresh to try again.";
        return;
    }

    var coordinates;
    try {
        coordinates = JSON.parse(data.textContent).filter(function (point) {
            return Array.isArray(point) && point.length === 2 &&
                Number.isFinite(point[0]) && Number.isFinite(point[1]) &&
                Math.abs(point[0]) <= 90 && Math.abs(point[1]) <= 180;
        });
    } catch (error) {
        status.textContent = "The map could not load. Please refresh to try again.";
        return;
    }

    var map = L.map(container, {
        scrollWheelZoom: false,
        minZoom: 1,
        maxZoom: 8
    });
    var tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    });
    tiles.on("tileerror", function () {
        status.hidden = false;
        status.textContent = "Some map tiles could not load. Please refresh to try again.";
    });
    tiles.addTo(map);

    var icon = L.divIcon({
        className: "coauthor-location-marker",
        html: '<span class="coauthor-location-dot" aria-hidden="true"></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    // One non-interactive marker per city; no names, links, tooltips or popups.
    coordinates.forEach(function (point) {
        L.marker(point, {icon: icon, interactive: false, keyboard: false}).addTo(map);
    });

    function fitLocations() {
        if (coordinates.length) {
            map.fitBounds(coordinates, {padding: [36, 36], maxZoom: 4});
        } else {
            map.setView([20, 20], 2);
        }
    }

    status.hidden = true;
    fitLocations();
    if (window.ResizeObserver) {
        new ResizeObserver(function () {
            map.invalidateSize({pan: false});
            fitLocations();
        }).observe(container);
    }
})();
