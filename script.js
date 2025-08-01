import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Config and Init ---
const firebaseConfig = {
    apiKey: "AIzaSyAJCeVkuz-DwESE3az0XJg_j9vHPKrP4bQ",
    authDomain: "pain-tracker-1cd66.firebaseapp.com",
    projectId: "pain-tracker-1cd66",
    storageBucket: "pain-tracker-1cd66.firebasestorage.app",
    messagingSenderId: "316916728461",
    appId: "1:316916728461:web:6d5db09ecbb8b1fa1e18c4"
};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'shoulder-pain-tracker';
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

let userId = null;
let entriesCollectionRef = null;
let unsubscribeEntries = null;
let allEntries = [];
let painChartInstance = null;
let currentChartPeriod = 'all';

// --- DOM Elements ---
const loginContainer = document.getElementById('login-container');
const mainContent = document.getElementById('main-content');
const authContainer = document.getElementById('auth-container');
const userDisplay = document.getElementById('user-display');
const signInBtn = document.getElementById('sign-in-btn');
const signOutBtn = document.getElementById('sign-out-btn');
const addEntryBtnContainer = document.getElementById('add-entry-btn-container');
const addEntryBtn = document.getElementById('add-entry-btn');
const entryModal = document.getElementById('entry-modal');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const painLevelSlider = document.getElementById('pain-level');
const painLevelValue = document.getElementById('pain-level-value');
const entriesList = document.getElementById('entries-list');
const entriesTab = document.getElementById('entries-tab');
const chartTab = document.getElementById('chart-tab');
const definitionsTab = document.getElementById('definitions-tab');
const painMapTab = document.getElementById('pain-map-tab');
const entriesView = document.getElementById('entries-view');
const chartView = document.getElementById('chart-view');
const definitionsView = document.getElementById('definitions-view');
const painMapView = document.getElementById('pain-map-view');
const chartCanvas = document.getElementById('painChart');
const chartEmptyState = document.getElementById('chart-empty-state');
const timeFilterButtons = document.querySelectorAll('.time-filter-btn');
const entryDatetimeInput = document.getElementById('entry-datetime');
const exportCsvBtn = document.getElementById('export-csv-btn');

// --- Modal Logic ---
const showModal = () => {
    // Format current date and time for the datetime-local input
    // The value needs to be in 'YYYY-MM-DDTHH:mm' format
    const now = new Date();
    // Adjust for local timezone
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    // Convert to ISO string and take the first 16 characters
    const localDateTime = now.toISOString().slice(0, 16);
    entryDatetimeInput.value = localDateTime;

    entryModal.classList.replace('modal-hidden', 'modal-visible');
};
const hideModal = () => entryModal.classList.replace('modal-visible', 'modal-hidden');

// --- Tab Switching ---
const switchTab = (targetTab) => {
    // An array of all tab buttons and their corresponding views
    const tabs = [
        { button: entriesTab, view: entriesView },
        { button: chartTab, view: chartView },
        { button: definitionsTab, view: definitionsView },
        { button: painMapTab, view: painMapView }
    ];

    // Loop through all tabs
    tabs.forEach(tab => {
        // Check if the current tab in the loop is the one we want to activate
        const isActive = tab.button.id === `${targetTab}-tab`;

        // Toggle visibility of the view
        tab.view.classList.toggle('hidden', !isActive);

        // Toggle the highlight class on the button
        tab.button.classList.toggle('tab-active', isActive);
    });

    // Special case for the chart: render it when its tab is made active
    if (targetTab === 'chart') {
        renderChart();
    }
};

// --- Authentication ---
const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error during Google sign-in:", error);
    }
};

const signOutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error during sign-out:", error);
    }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        userId = user.uid;
        loginContainer.classList.add('hidden');
        mainContent.classList.remove('hidden');
        authContainer.classList.remove('hidden');
        addEntryBtnContainer.classList.remove('hidden');
        userDisplay.textContent = `${user.displayName || 'User'}`;

        entriesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/pain_entries`);
        listenForEntries();
    } else {
        // User is signed out
        userId = null;
        loginContainer.classList.remove('hidden');
        mainContent.classList.add('hidden');
        authContainer.classList.add('hidden');
        addEntryBtnContainer.classList.add('hidden');

        if (unsubscribeEntries) {
            unsubscribeEntries();
            unsubscribeEntries = null;
        }
        allEntries = [];
        renderEntriesList([]);
        if (painChartInstance) {
            painChartInstance.destroy();
        }
    }
});

// --- Data Rendering (Entries List) ---
const renderEntriesList = (entries) => {
    entriesList.innerHTML = '';
    if (entries.length === 0) {
        entriesList.innerHTML = `<div class="text-center py-10 px-4"><svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg><h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">No entries yet</h3><p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Tap the '+' button to add your first pain level entry.</p></div>`;
        return;
    }
    const sortedEntries = [...entries].sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
    sortedEntries.forEach(entry => {
        const entryEl = document.createElement('div');
        entryEl.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center justify-between';
        const date = entry.timestamp.toDate();
        const formattedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        entryEl.innerHTML = `<div><p class="font-bold text-lg">Pain Level: <span class="text-blue-600 dark:text-blue-400">${entry.painLevel}</span></p><p class="text-sm text-gray-500 dark:text-gray-400">${formattedDate} at ${formattedTime}</p></div><button data-id="${entry.id}" class="delete-btn text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>`;
        entriesList.appendChild(entryEl);
    });
};

// --- Chart Logic ---
const renderChart = () => {
    if (painChartInstance) painChartInstance.destroy();
    let filteredEntries = allEntries;
    if (currentChartPeriod !== 'all') {
        const days = parseInt(currentChartPeriod);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        filteredEntries = allEntries.filter(entry => entry.timestamp.toDate() > cutoffDate);
    }
    if (filteredEntries.length < 2) {
        chartCanvas.classList.add('hidden');
        chartEmptyState.classList.remove('hidden');
        return;
    }
    chartCanvas.classList.remove('hidden');
    chartEmptyState.classList.add('hidden');
    const sortedEntries = [...filteredEntries].sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
    const chartData = {
        labels: sortedEntries.map(entry => entry.timestamp.toDate()),
        datasets: [{
            label: 'Pain Level',
            data: sortedEntries.map(entry => entry.painLevel),
            fill: false,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgb(59, 130, 246)',
            tension: 0.1,
            pointRadius: 5,
            pointHoverRadius: 8,
        }]
    };
    painChartInstance = new Chart(chartCanvas, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: { type: 'time', time: { unit: 'day', tooltipFormat: 'MMM d, yyyy h:mm a' }, title: { display: true, text: 'Date' } },
                y: { beginAtZero: true, max: 10, min: 0, title: { display: true, text: 'Pain Level' } }
            },
            plugins: { legend: { display: false }, tooltip: { callbacks: { title: (context) => context[0].label } } }
        }
    });
};

// --- Firestore Logic ---
const listenForEntries = () => {
    if (!entriesCollectionRef) return;
    if (unsubscribeEntries) unsubscribeEntries();
    const q = query(entriesCollectionRef);
    unsubscribeEntries = onSnapshot(q, (snapshot) => {
        allEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderEntriesList(allEntries);
        if (!chartView.classList.contains('hidden')) renderChart();
    }, (error) => console.error("Firestore listener error:", error));
};
const saveEntry = async () => {
    if (!userId || !entriesCollectionRef) return;

    // Get the timestamp from the input. Fallback to now if it's empty.
    const timestampValue = entryDatetimeInput.value ? new Date(entryDatetimeInput.value) : new Date();

    const newEntry = {
        painLevel: parseInt(painLevelSlider.value, 10),
        timestamp: timestampValue,
        userId: userId
    };

    try {
        await addDoc(entriesCollectionRef, newEntry);
        hideModal();
    } catch (error) {
        console.error("Error adding document: ", error);
    }
};
const deleteEntry = async (id) => {
    if (!userId || !entriesCollectionRef) return;
    if (confirm("Are you sure you want to delete this entry?")) {
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/pain_entries`, id));
        } catch (error) { console.error("Error deleting document: ", error); }
    }
};

// --- Data Export ---
const exportDataToCSV = () => {
    if (allEntries.length === 0) {
        alert("No data to export.");
        return;
    }

    // Sort entries chronologically
    const sortedEntries = [...allEntries].sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());

    // CSV Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,Pain Level\r\n";

    // CSV Rows
    sortedEntries.forEach(entry => {
        const date = entry.timestamp.toDate();
        // Format to ISO 8601 for universal compatibility
        const formattedTimestamp = date.toISOString();
        const row = `${formattedTimestamp},${entry.painLevel}`;
        csvContent += row + "\r\n";
    });

    // Create a link and trigger the download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pain_entries.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- Event Listeners ---
exportCsvBtn.addEventListener('click', exportDataToCSV);
signInBtn.addEventListener('click', signInWithGoogle);
signOutBtn.addEventListener('click', signOutUser);
addEntryBtn.addEventListener('click', showModal);
cancelBtn.addEventListener('click', hideModal);
saveBtn.addEventListener('click', saveEntry);
painLevelSlider.addEventListener('input', (e) => painLevelValue.textContent = e.target.value);
entriesTab.addEventListener('click', () => switchTab('entries'));
chartTab.addEventListener('click', () => switchTab('chart'));
definitionsTab.addEventListener('click', () => switchTab('definitions'));
painMapTab.addEventListener('click', () => switchTab('pain-map'));
entriesList.addEventListener('click', (e) => {
    const deleteButton = e.target.closest('.delete-btn');
    if (deleteButton) deleteEntry(deleteButton.dataset.id);
});
timeFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentChartPeriod = button.dataset.period;
        timeFilterButtons.forEach(btn => {
            btn.classList.remove('bg-blue-600', 'text-white');
            btn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
        });
        button.classList.add('bg-blue-600', 'text-white');
        button.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
        renderChart();
    });
});
