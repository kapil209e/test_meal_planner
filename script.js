// Update the meals initialization to load from localStorage
let meals = JSON.parse(localStorage.getItem('meals')) || {};

// Current week's start date
let currentWeekStart = new Date();
currentWeekStart.setHours(0, 0, 0, 0);
currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');  // months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper function to format date for display
function formatDateDisplay(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Add this function to save meals to localStorage
function saveMeals() {
    localStorage.setItem('meals', JSON.stringify(meals));
}

// Function to add a meal
function addMeal() {
    const date = document.getElementById('day-select').value;
    const type = document.getElementById('meal-type').value;
    const meal = document.getElementById('meal-input').value;

    if (!meal) {
        alert('Please enter a meal!');
        return;
    }

    // Initialize date in meals object if it doesn't exist
    if (!meals[date]) {
        meals[date] = {};
    }

    // Add meal
    meals[date][type] = meal;

    // Save to localStorage
    saveMeals();

    // Update calendar
    updateCalendar();

    // Clear input
    document.getElementById('meal-input').value = '';
}

// Function to navigate to previous week
function previousWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    updateCalendar();
}

// Function to navigate to next week
function nextWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    updateCalendar();
}

// Function to update the calendar display
function updateCalendar() {
    const dayElements = document.querySelectorAll('.day');
    const dateSelect = document.getElementById('day-select');
    
    // Clear date select options
    dateSelect.innerHTML = '';
    
    // Update week display
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    document.querySelector('.navigation span').textContent = 
        `${formatDateDisplay(currentWeekStart)} - ${formatDateDisplay(weekEnd)}`;

    dayElements.forEach((dayElement, index) => {
        const currentDate = new Date(currentWeekStart);
        currentDate.setDate(currentDate.getDate() + index);
        const dateStr = formatDate(currentDate);

        // Add date to select options
        const option = document.createElement('option');
        option.value = dateStr;
        option.textContent = formatDateDisplay(currentDate);
        dateSelect.appendChild(option);

        // Get meals for this date
        const dayMeals = meals[dateStr] || {};
        
        // Update day display
        dayElement.innerHTML = `
            <div class="day-header">
                ${formatDateDisplay(currentDate)}
            </div>
            <div class="meal-slot">
                <div class="meal-label">Breakfast</div>
                <div class="meal-content ${!dayMeals.breakfast ? 'empty' : ''}">
                    ${dayMeals.breakfast || 'No meal planned'}
                </div>
            </div>
            <div class="meal-slot">
                <div class="meal-label">Lunch</div>
                <div class="meal-content ${!dayMeals.lunch ? 'empty' : ''}">
                    ${dayMeals.lunch || 'No meal planned'}
                </div>
            </div>
            <div class="meal-slot">
                <div class="meal-label">Dinner</div>
                <div class="meal-content ${!dayMeals.dinner ? 'empty' : ''}">
                    ${dayMeals.dinner || 'No meal planned'}
                </div>
            </div>
        `;
    });
}

// Initial calendar update
updateCalendar();

function handleFileUpload() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a CSV file first!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const data = parseCSV(text);
        
        if (data.length === 0) {
            alert('No valid meals found in CSV. Please check the format.');
            return;
        }
        
        // Show preview of uploaded data
        showUploadPreview(data);
        
        // Add meals to calendar
        addMealsFromCSV(data);
    };
    reader.readAsText(file);
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const data = [];
    
    // Skip header row and process each line
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const [date, meal_type, meal_name] = lines[i].split(',');
        
        // Validate the data
        if (!date || !meal_type || !meal_name) {
            console.log('Invalid line:', lines[i]);
            continue;
        }

        // Validate meal type
        const validMealTypes = ['breakfast', 'lunch', 'dinner'];
        if (!validMealTypes.includes(meal_type.trim().toLowerCase())) {
            console.log('Invalid meal type:', meal_type);
            continue;
        }

        // Fix date handling by creating a date object and formatting it
        const [year, month, day] = date.trim().split('-');
        const dateObj = new Date(year, month - 1, day);  // month is 0-based in JavaScript
        const formattedDate = formatDate(dateObj);

        data.push({
            date: formattedDate,
            meal_type: meal_type.trim().toLowerCase(),
            meal_name: meal_name.trim()
        });
    }
    
    console.log('Parsed data:', data);  // Debug log
    return data;
}

function showUploadPreview(data) {
    // Create preview message with more details
    let message = `Found ${data.length} meals in CSV:\n\n`;
    data.forEach(meal => {
        message += `Date: ${meal.date}\nMeal Type: ${meal.meal_type}\nMeal: ${meal.meal_name}\n\n`;
    });
    
    console.log('Parsed meals:', data);  // Debug log
    alert(message);
}

function addMealsFromCSV(data) {
    console.log('Current meals before upload:', meals);  // Debug log
    
    data.forEach(meal => {
        if (!meals[meal.date]) {
            meals[meal.date] = {};
        }
        meals[meal.date][meal.meal_type] = meal.meal_name;
    });
    
    console.log('Updated meals after upload:', meals);  // Debug log
    
    // Save to localStorage
    localStorage.setItem('meals', JSON.stringify(meals));
    
    // Update calendar display
    updateCalendar();
    
    // Clear file input
    document.getElementById('csvFile').value = '';
} 