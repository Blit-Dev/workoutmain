// Data storage in localStorage
const STORAGE_KEYS = {
    WORKOUTS: 'fitness_workouts',
    WORKOUT_LOGS: 'fitness_workout_logs',
    FOOD_LOG: 'fitness_food_log'
};

// Initialize storage
if (!localStorage.getItem(STORAGE_KEYS.WORKOUTS)) {
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([]));
}
if (!localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify({}));
}
if (!localStorage.getItem(STORAGE_KEYS.FOOD_LOG)) {
    localStorage.setItem(STORAGE_KEYS.FOOD_LOG, JSON.stringify([]));
}

// Update current date displays
function updateDateDisplays() {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('current-date').textContent = today;
    document.getElementById('food-current-date').textContent = today;
}

// Check if it's a new day and clear exercise inputs
function checkAndResetDailyLogs() {
    const lastCheckDate = localStorage.getItem('lastCheckDate');
    const today = new Date().toISOString().split('T')[0];
    
    if (lastCheckDate !== today) {
        localStorage.setItem('lastCheckDate', today);
        renderWorkoutLogList();
    }
}

// Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${pageId}-page`).classList.add('active');
    
    document.querySelectorAll('nav button').forEach(button => {
        button.classList.remove('bg-blue-700');
    });
    document.getElementById(`${pageId}-tab`).classList.add('bg-blue-700');
}

// Workout tab navigation
function showWorkoutTab(tabId) {
    document.querySelectorAll('.workout-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.workout-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelector(`.workout-tab[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-workout-tab`).classList.add('active');

    if (tabId === 'history') {
        updateWorkoutDateList();
    }
}

// Food tab navigation
function showFoodTab(tabId) {
    document.querySelectorAll('.food-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.food-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelector(`.food-tab[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-food-tab`).classList.add('active');

    if (tabId === 'history') {
        updateFoodDateList();
    }
}

// Get unique dates from logs
function getUniqueDates(logs) {
    const dates = new Set();
    
    if (Array.isArray(logs)) {
        // For food logs
        logs.forEach(log => dates.add(log.date.split('T')[0]));
    } else {
        // For workout logs
        Object.values(logs).forEach(workoutLogs => {
            workoutLogs.forEach(log => dates.add(log.date));
        });
    }
    
    return Array.from(dates).sort((a, b) => b.localeCompare(a)); // Sort newest to oldest
}

// Update workout date list
function updateWorkoutDateList() {
    const workoutLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS));
    const dates = getUniqueDates(workoutLogs);
    const dateList = document.getElementById('workout-date-list');
    
    dateList.innerHTML = dates.map(date => `
        <button 
            onclick="renderWorkoutHistory('${date}')"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
        >
            ${new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })}
        </button>
    `).join('');
}

// Update food date list
function updateFoodDateList() {
    const foodLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOOD_LOG));
    const dates = getUniqueDates(foodLogs);
    const dateList = document.getElementById('food-date-list');
    
    dateList.innerHTML = dates.map(date => `
        <button 
            onclick="renderFoodHistory('${date}')"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
        >
            ${new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })}
        </button>
    `).join('');
}

// Workout functionality
document.getElementById('workout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const workoutName = document.getElementById('workout-name').value;
    const workouts = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUTS));
    workouts.push({
        id: Date.now().toString(),
        name: workoutName,
        created: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    document.getElementById('workout-name').value = '';
    renderWorkouts();
    renderWorkoutLogList();
    showToast('Workout added successfully!');
});

function renderWorkouts() {
    const workouts = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUTS));
    const workoutList = document.getElementById('workout-list');
    workoutList.innerHTML = '<h3 class="text-lg font-semibold mb-2">Available Workouts</h3>';

    workouts.forEach(workout => {
        const workoutItem = document.createElement('div');
        workoutItem.className = 'bg-white rounded-lg shadow p-4 mb-2 transform transition-transform hover:scale-102';
        workoutItem.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-medium">${workout.name}</span>
                <button onclick="deleteWorkout('${workout.id}')" class="text-red-600 hover:text-red-800 transition-colors duration-200">Delete</button>
            </div>
        `;
        workoutList.appendChild(workoutItem);
    });
}

function deleteWorkout(workoutId) {
    const workouts = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUTS));
    const updatedWorkouts = workouts.filter(w => w.id !== workoutId);
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(updatedWorkouts));
    renderWorkouts();
    renderWorkoutLogList();
}

function renderWorkoutLogList() {
    const workouts = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUTS));
    const workoutLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS));
    const workoutLogList = document.getElementById('workout-log-list');
    workoutLogList.innerHTML = '';

    workouts.forEach(workout => {
        const workoutCard = document.createElement('div');
        workoutCard.className = 'workout-card mb-6';
        
        const today = new Date().toISOString().split('T')[0];
        const todayLog = workoutLogs[workout.id]?.find(log => log.date === today);
        const sets = todayLog?.sets || [];

        workoutCard.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="text-xl font-semibold mb-4">${workout.name}</h3>
                <div id="sets-container-${workout.id}" class="space-y-4 mb-4">
                    ${sets.length > 0 ? sets.map((set, index) => `
                        <div class="set-entry flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700">Set ${index + 1}</label>
                                <input type="number" name="reps" value="${set.reps}" class="mt-1 w-full" required min="1">
                            </div>
                            ${index > 0 ? `
                                <button type="button" onclick="removeSet('${workout.id}', ${index})" 
                                    class="text-red-500 hover:text-red-700">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            ` : ''}
                        </div>
                    `).join('') : `
                        <div class="set-entry flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700">Set 1</label>
                                <input type="number" name="reps" class="mt-1 w-full" required min="1">
                            </div>
                        </div>
                    `}
                </div>
                <div class="flex gap-2">
                    <button onclick="addSet('${workout.id}')" 
                        class="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md border border-blue-600 hover:border-blue-800 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Set
                    </button>
                    <button onclick="saveWorkoutLog('${workout.id}')" 
                        class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transform transition-all active:scale-95">
                        ${todayLog ? 'Update' : 'Save'} Workout
                    </button>
                </div>
            </div>
        `;
        workoutLogList.appendChild(workoutCard);
    });
}

function addSet(workoutId) {
    const container = document.getElementById(`sets-container-${workoutId}`);
    const setCount = container.children.length + 1;
    
    const newSet = document.createElement('div');
    newSet.className = 'set-entry flex items-center gap-4 bg-gray-50 p-3 rounded-lg';
    newSet.innerHTML = `
        <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700">Set ${setCount}</label>
            <input type="number" name="reps" class="mt-1 w-full" required min="1">
        </div>
        <button type="button" onclick="removeSet('${workoutId}', ${setCount - 1})" 
            class="text-red-500 hover:text-red-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    `;
    container.appendChild(newSet);
}

function removeSet(workoutId, setIndex) {
    const container = document.getElementById(`sets-container-${workoutId}`);
    container.children[setIndex].remove();
    
    // Update set numbers
    Array.from(container.children).forEach((set, idx) => {
        const label = set.querySelector('label');
        label.textContent = `Set ${idx + 1}`;
    });
}

function saveWorkoutLog(workoutId) {
    const container = document.getElementById(`sets-container-${workoutId}`);
    const setEntries = container.querySelectorAll('.set-entry');
    const sets = Array.from(setEntries).map(entry => ({
        reps: parseInt(entry.querySelector('input[name="reps"]').value)
    }));

    const workoutLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS));
    if (!workoutLogs[workoutId]) {
        workoutLogs[workoutId] = [];
    }

    const date = new Date().toISOString().split('T')[0];
    const existingLogIndex = workoutLogs[workoutId].findIndex(log => log.date === date);
    const logEntry = { date, sets };

    if (existingLogIndex >= 0) {
        workoutLogs[workoutId][existingLogIndex] = logEntry;
    } else {
        workoutLogs[workoutId].unshift(logEntry);
    }

    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(workoutLogs));
    renderWorkoutLogList();
    updateWorkoutDateList();
    showToast('Workout logged successfully!');
}

// Workout history functionality
document.getElementById('workout-date-picker').addEventListener('change', (e) => {
    const selectedDate = e.target.value;
    renderWorkoutHistory(selectedDate);
});

function renderWorkoutHistory(selectedDate) {
    const workouts = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUTS));
    const workoutLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS));
    const historyList = document.getElementById('workout-history-list');
    historyList.innerHTML = '';

    if (!selectedDate) {
        historyList.innerHTML = '<p class="text-gray-500">Please select a date to view workout history.</p>';
        return;
    }

    const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    historyList.innerHTML = `<h3 class="text-lg font-semibold mb-4">${formattedDate}</h3>`;

    let hasLogs = false;
    workouts.forEach(workout => {
        const log = workoutLogs[workout.id]?.find(log => log.date === selectedDate);
        if (log && Array.isArray(log.sets)) {
            hasLogs = true;
            const historyItem = document.createElement('div');
            historyItem.className = 'bg-white rounded-lg shadow-md p-4 mb-4';
            historyItem.innerHTML = `
                <h3 class="text-lg font-semibold mb-2">${workout.name}</h3>
                <div class="space-y-2">
                    ${log.sets.map((set, index) => `
                        <div class="flex items-center gap-2 text-gray-700">
                            <span class="font-medium">Set ${index + 1}:</span>
                            <span>${set.reps} reps</span>
                        </div>
                    `).join('')}
                </div>
            `;
            historyList.appendChild(historyItem);
        }
    });

    if (!hasLogs) {
        historyList.innerHTML += '<p class="text-gray-500">No workouts logged for this date.</p>';
    }
}

// Food log functionality
document.getElementById('food-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const foodName = document.getElementById('food-name').value;
    const portion = document.getElementById('food-portion').value;
    const foodLog = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOOD_LOG));
    
    foodLog.unshift({
        id: Date.now().toString(),
        name: foodName,
        portion: portion,
        date: new Date().toISOString()
    });
    
    localStorage.setItem(STORAGE_KEYS.FOOD_LOG, JSON.stringify(foodLog));
    document.getElementById('food-name').value = '';
    document.getElementById('food-portion').value = '';
    renderTodayFoodLog();
    updateFoodDateList();
});

function renderTodayFoodLog() {
    const foodLog = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOOD_LOG));
    const todayFoodLog = document.getElementById('today-food-log');
    const today = new Date().toISOString().split('T')[0];
    
    const todayEntries = foodLog.filter(entry => 
        entry.date.split('T')[0] === today
    );

    todayFoodLog.innerHTML = '<h3 class="text-lg font-semibold mb-2">Today\'s Food Log</h3>';

    if (todayEntries.length === 0) {
        todayFoodLog.innerHTML += '<p class="text-gray-500">No food logged today.</p>';
        return;
    }

    const foodList = document.createElement('div');
    foodList.className = 'bg-white rounded-lg shadow-md p-4';
    foodList.innerHTML = `
        <ul class="space-y-2">
            ${todayEntries.map(entry => `
                <li class="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors duration-200">
                    <span>${entry.name}</span>
                    <span class="text-gray-600">${entry.portion}</span>
                </li>
            `).join('')}
        </ul>
    `;
    todayFoodLog.appendChild(foodList);
}

// Food history functionality
document.getElementById('food-date-picker').addEventListener('change', (e) => {
    const selectedDate = e.target.value;
    renderFoodHistory(selectedDate);
});

function renderFoodHistory(selectedDate) {
    const foodLog = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOOD_LOG));
    const historyList = document.getElementById('food-history-list');
    historyList.innerHTML = '';

    if (!selectedDate) {
        historyList.innerHTML = '<p class="text-gray-500">Please select a date to view food history.</p>';
        return;
    }

    const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    historyList.innerHTML = `<h3 class="text-lg font-semibold mb-4">${formattedDate}</h3>`;

    const dateEntries = foodLog.filter(entry => 
        entry.date.split('T')[0] === selectedDate
    );

    if (dateEntries.length === 0) {
        historyList.innerHTML += '<p class="text-gray-500">No food logged for this date.</p>';
        return;
    }

    const foodList = document.createElement('div');
    foodList.className = 'bg-white rounded-lg shadow-md p-4';
    foodList.innerHTML = `
        <ul class="space-y-2">
            ${dateEntries.map(entry => `
                <li class="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors duration-200">
                    <span>${entry.name}</span>
                    <span class="text-gray-600">${entry.portion}</span>
                </li>
            `).join('')}
        </ul>
    `;
    historyList.appendChild(foodList);
}

// Toast notification
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    
    // Show toast
    toast.classList.remove('translate-x-full', 'opacity-0');
    toast.classList.add('translate-x-0', 'opacity-100');
    
    // Hide after duration
    setTimeout(hideToast, duration);
}

function hideToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('translate-x-0', 'opacity-100');
    toast.classList.add('translate-x-full', 'opacity-0');
}

// Search functionality
document.getElementById('workout-search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const workoutCards = document.querySelectorAll('#workout-log-list .workout-card');
    
    workoutCards.forEach(card => {
        const workoutName = card.querySelector('h3').textContent.toLowerCase();
        if (workoutName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

document.getElementById('history-search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const historyItems = document.querySelectorAll('#workout-history-list > div');
    
    historyItems.forEach(item => {
        const workoutName = item.querySelector('h3')?.textContent.toLowerCase();
        if (workoutName && workoutName.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
});

// Initialize
updateDateDisplays();
checkAndResetDailyLogs();
renderWorkouts();
renderWorkoutLogList();
renderTodayFoodLog();
showPage('workouts');

// Check for new day every minute
setInterval(checkAndResetDailyLogs, 60000);