// Selecting necessary DOM elements for user input, buttons, and weather display sections
const cityInput = document.querySelector(".city-input");   // Input field for entering the city name
const searchButton = document.querySelector(".search-btn"); // Button for searching weather by city name
const locationButton = document.querySelector(".location-btn"); // Button for getting weather based on user location
const currentWeatherDiv = document.querySelector(".current-weather"); // Div to display current weather
const weatherCardsDiv = document.querySelector(".weather-cards"); // Div to display 5-day forecast cards

// API key for OpenWeatherMap API
const API_KEY = "6f3558f26efb1713c9458499d17504bb"; 

// Function to create and return HTML for the weather card
const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) { // If it's the first forecast (current weather)
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else { // If it's for the other days (5-day forecast)
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}

// Function to fetch and display weather details based on city coordinates
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
    
    // Fetch weather forecast from the OpenWeatherMap API
    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        
        // Filtering to get one forecast per day (unique days)
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        // Clear previous weather data from input and weather divs
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Create weather cards for current weather and 5-day forecast
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                // Insert current weather into main weather div
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                // Insert 5-day forecast into weather cards div
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });        
    }).catch(() => {
        // Show alert if there was an error fetching the weather
        alert("An error occurred while fetching the weather forecast!");
    });
}

// Function to get coordinates of the entered city using OpenWeatherMap Geocoding API
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); // Get city name entered by user
    if (cityName === "") return; // If no city name is entered, return early
    
    // API URL to get city coordinates (latitude, longitude)
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    // Fetch coordinates for the entered city
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`); // Show alert if no coordinates are found
        const { lat, lon, name } = data[0]; // Destructure latitude, longitude, and name from the API response
        
        // Call getWeatherDetails to fetch weather for the city
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        // Show alert if there was an error fetching the coordinates
        alert("An error occurred while fetching the coordinates!");
    });
}

// Function to get the user's current location using the Geolocation API
const getUserCoordinates = () => {
    // Get user's location coordinates (latitude, longitude) from the browser
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; // Destructure latitude and longitude from the position object
            
            // Reverse Geocoding API URL to get city name from latitude and longitude
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            
            // Fetch city name for the user's current location
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name } = data[0]; // Get city name from the API response
                
                // Call getWeatherDetails to fetch weather for the user's location
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                // Show alert if there was an error fetching the city name
                alert("An error occurred while fetching the city name!");
            });
        },
        error => { // Handle geolocation errors (e.g., permission denied)
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}

// Adding event listeners for buttons and input actions
locationButton.addEventListener("click", getUserCoordinates); // On location button click, get user coordinates
searchButton.addEventListener("click", getCityCoordinates);   // On search button click, get city coordinates
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates()); // On Enter key, trigger city search
