import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { db, auth } from './script.js';
import { painLocations } from './pain-locations.js';

const painMapImageContainer = document.getElementById('pain-map-image-container');
const painLocationsList = document.getElementById('pain-locations-list');
const savePainMapBtn = document.getElementById('save-pain-map-btn');

let currentUserId = null;
let selectedLocations = {}; // Use an object for easier lookup

onAuthStateChanged(auth, (user) => {
    currentUserId = user ? user.uid : null;
});

const renderPainPoints = () => {
    if (!painMapImageContainer) return;
    painLocations.forEach(location => {
        const dot = document.createElement('div');
        dot.className = 'pain-point';
        dot.style.left = `${location.coords.x}%`;
        dot.style.top = `${location.coords.y}%`;
        dot.dataset.id = location.id;
        dot.setAttribute('title', location.name);

        dot.addEventListener('click', () => toggleLocationSelection(location));
        painMapImageContainer.appendChild(dot);
    });
};

const toggleLocationSelection = (location) => {
    const dot = painMapImageContainer.querySelector(`.pain-point[data-id="${location.id}"]`);
    if (selectedLocations[location.id]) {
        // Deselect
        delete selectedLocations[location.id];
        dot.classList.remove('selected');
    } else {
        // Select
        selectedLocations[location.id] = { ...location, painLevel: 5 }; // Default pain level
        dot.classList.add('selected');
    }
    renderSelectedLocationsList();
};

const renderSelectedLocationsList = () => {
    if (!painLocationsList) return;
    painLocationsList.innerHTML = '';
    const selectedIds = Object.keys(selectedLocations);

    if (selectedIds.length === 0) {
        painLocationsList.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No locations selected yet.</p>';
        return;
    }

    selectedIds.forEach(id => {
        const location = selectedLocations[id];
        const listItem = document.createElement('div');
        listItem.className = 'selected-location-item flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded-md';
        listItem.innerHTML = `
            <div class="flex-grow pr-4">
                <p class="font-semibold">${location.name}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Pain Level: <span id="level-value-${id}">${location.painLevel}</span>/10</p>
            </div>
            <div class="flex items-center">
                 <input type="range" min="0" max="10" value="${location.painLevel}" data-id="${id}" class="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer pain-level-slider">
            </div>
        `;
        painLocationsList.appendChild(listItem);
    });
};

if (painLocationsList) {
    painLocationsList.addEventListener('input', (e) => {
        if (e.target.classList.contains('pain-level-slider')) {
            const locationId = e.target.dataset.id;
            const newPainLevel = parseInt(e.target.value, 10);
            selectedLocations[locationId].painLevel = newPainLevel;
            document.getElementById(`level-value-${locationId}`).textContent = newPainLevel;
        }
    });
}


const savePainMap = async () => {
    if (!currentUserId) {
        alert("You must be logged in to save a pain map.");
        return;
    }
    if (Object.keys(selectedLocations).length === 0) {
        alert("Please select at least one pain location and set its level.");
        return;
    }

    const painMapEntry = {
        userId: currentUserId,
        timestamp: serverTimestamp(),
        locations: Object.values(selectedLocations).map(loc => ({
            id: loc.id,
            name: loc.name,
            painLevel: loc.painLevel
        })),
    };

    try {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'shoulder-pain-tracker';
        const painMapsCollectionRef = collection(db, `artifacts/${appId}/users/${currentUserId}/pain_maps`);
        await addDoc(painMapsCollectionRef, painMapEntry);
        alert("Pain map saved successfully!");
        // Reset selection
        selectedLocations = {};
        document.querySelectorAll('.pain-point.selected').forEach(dot => dot.classList.remove('selected'));
        renderSelectedLocationsList();
    } catch (error) {
        console.error("Error saving pain map: ", error);
        alert("Failed to save pain map. Please try again.");
    }
};

// --- Initialization ---
// This runs when the script is loaded.
// We need to make sure the DOM is fully loaded before we try to access elements.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        renderPainPoints();
        renderSelectedLocationsList();
        if (savePainMapBtn) {
            savePainMapBtn.addEventListener('click', savePainMap);
        }
    });
} else {
    // DOMContentLoaded has already fired
    renderPainPoints();
    renderSelectedLocationsList();
    if (savePainMapBtn) {
        savePainMapBtn.addEventListener('click', savePainMap);
    }
}
