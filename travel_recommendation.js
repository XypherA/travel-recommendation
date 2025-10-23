// Global variable to store fetched travel data
        let travelData = null;

        // Fetch data from JSON file when page loads
        async function fetchTravelData() {
            try {
                const response = await fetch('travel_recommendation_api.json');
                if (!response.ok) {
                    throw new Error('Failed to fetch travel data');
                }
                travelData = await response.json();
                console.log('Travel data loaded successfully:', travelData);
            } catch (error) {
                console.error('Error fetching travel data:', error);
                alert('Error loading travel data. Please make sure travel_recommendation_api.json is in the same directory.');
            }
        }

        // Load data when page loads
        window.addEventListener('DOMContentLoaded', fetchTravelData);

        // Page navigation
        function showPage(pageName) {
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(pageName).classList.add('active');
            
            // Hide search container on about and contact pages
            const searchContainer = document.getElementById('searchContainer');
            if (pageName === 'about' || pageName === 'contact') {
                searchContainer.style.display = 'none';
            } else {
                searchContainer.style.display = 'flex';
            }
            
            // Clear results when navigating away from home
            if (pageName !== 'home') {
                clearResults();
            }
        }

        // Search functionality
        function searchDestinations() {
            const searchInput = document.getElementById('searchInput').value.toLowerCase().trim();
            const resultsDiv = document.getElementById('results');
            
            if (!searchInput) {
                alert('Please enter a search term');
                return;
            }
            
            let results = [];
            
            // Check for beach keywords
            if (searchInput.includes('beach')) {
                results = travelData.beaches;
            }
            // Check for temple keywords
            else if (searchInput.includes('temple')) {
                results = travelData.temples;
            }
            // Check for country keywords
            else if (searchInput.includes('country') || searchInput.includes('countries')) {
                results = travelData.countries.flatMap(country => 
                    country.cities.map(city => ({
                        ...city,
                        countryName: country.name
                    }))
                );
            }
            
            displayResults(results);
        }

        // Display results
        function displayResults(results) {
            const resultsDiv = document.getElementById('results');
            
            if (results.length === 0) {
                resultsDiv.innerHTML = '<h2>No results found. Try searching for "beach", "temple", or "country".</h2>';
                resultsDiv.classList.remove('hidden');
                return;
            }
            
            let html = '<h2>Recommended Destinations</h2><div class="results-grid">';
            
            results.forEach(item => {
                const displayName = item.countryName ? `${item.name}, ${item.countryName}` : item.name;
                const timeZone = item.timeZone;
                
                html += `
                    <div class="result-card">
                        <img src="${item.imageUrl}" alt="${displayName}">
                        <div class="result-card-content">
                            <h3>${displayName}</h3>
                            <p>${item.description}</p>
                            ${timeZone ? `<div class="time-display" id="time-${item.name.replace(/[^a-zA-Z0-9]/g, '')}">Loading time...</div>` : ''}
                            <a href="#" class="visit-btn">Visit Now</a>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            resultsDiv.innerHTML = html;
            resultsDiv.classList.remove('hidden');
            
            // Update times for each destination
            results.forEach(item => {
                if (item.timeZone) {
                    updateTime(item.name, item.timeZone);
                }
            });
        }

        // Update time display for a destination
        function updateTime(name, timeZone) {
            const elementId = `time-${name.replace(/[^a-zA-Z0-9]/g, '')}`;
            const element = document.getElementById(elementId);
            
            if (element) {
                const options = { 
                    timeZone: timeZone, 
                    hour12: true, 
                    hour: 'numeric', 
                    minute: 'numeric', 
                    second: 'numeric' 
                };
                const localTime = new Date().toLocaleTimeString('en-US', options);
                element.textContent = `Local time: ${localTime}`;
                
                // Update every second
                setInterval(() => {
                    const updatedTime = new Date().toLocaleTimeString('en-US', options);
                    if (element) {
                        element.textContent = `Local time: ${updatedTime}`;
                    }
                }, 1000);
            }
        }

        // Clear results
        function clearResults() {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '';
            resultsDiv.classList.add('hidden');
            document.getElementById('searchInput').value = '';
        }

        // Handle form submission
        function handleSubmit(event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            alert(`Thank you ${name}! We've received your message and will contact you at ${email} soon.`);
            event.target.reset();
        }

        // Allow Enter key to trigger search
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchDestinations();
            }
        });