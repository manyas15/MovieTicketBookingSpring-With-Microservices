// Booking Page JavaScript
if (typeof BookingPage === 'undefined') {
    class BookingPage {
        constructor() {
            this.movies = [];
            this.selectedMovie = null;
            this.selectedSeats = [];
            this.bookingForm = null;
            
            this.init();
        }

    init() {
        this.setupEventListeners();
        this.loadMovies();
        this.checkPreselectedMovie();
        // Render seat map immediately (will replace loading state)
        this.renderSeatMap();
    }

    setupEventListeners() {
        const movieSelect = document.getElementById('movieSelect');
        if (movieSelect) {
            movieSelect.addEventListener('change', (e) => {
                const movieId = parseInt(e.target.value);
                if (movieId) {
                    this.loadSelectedMovie(movieId);
                } else {
                    this.clearSelectedMovie();
                }
            });
        }

        // Booking form submission
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBookingSubmission();
            });
        }

        // Back to movies button
        const backBtn = document.getElementById('backToMovies');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'movies.html';
            });
        }

        // Update total amount when seats change
        const seatsInput = document.getElementById('numberOfSeats');
        if (seatsInput) {
            seatsInput.addEventListener('input', () => {
                this.updateTotalAmount();
            });
        }

        // Proceed button click -> show payment step
        const proceedBtn = document.getElementById('proceedButton');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Move to payment step
                document.getElementById('seatSelectionStep').style.display = 'none';
                document.getElementById('paymentStep').style.display = 'block';
                // Update payment total
                this.updateTotalAmount();
            });
        }

        // Payment form submission
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // After payment form validation simulate booking
                this.proceedToPayment();
            });
        }
    }

    async checkPreselectedMovie() {
        // Check if a movie was selected from the movies page
        const selectedMovieId = localStorage.getItem('selectedMovieId');
        if (selectedMovieId) {
            const movieId = parseInt(selectedMovieId);
            await this.waitForMoviesLoad();
            // Try to set via dropdown when present, otherwise load directly
            const movieSelect = document.getElementById('movieSelect');
            if (movieSelect && movieId) {
                movieSelect.value = movieId;
                await this.loadSelectedMovie(movieId);
            } else if (movieId) {
                // Directly load the movie from the fetched list
                await this.loadSelectedMovie(movieId);
            }

            // Clear the stored movie ID
            localStorage.removeItem('selectedMovieId');
        }
    }

    async waitForMoviesLoad() {
        // Wait for movies to be loaded before trying to select one
        let attempts = 0;
        while (this.movies.length === 0 && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }

    async loadMovies() {
        try {
            console.log('Loading movies for booking...');
            const movieSelect = document.getElementById('movieSelect');
            
            // Show loading in dropdown
            if (movieSelect) {
                movieSelect.innerHTML = '<option value="">Loading movies...</option>';
            }

            const movies = await MovieAPI.getAllMovies();
            
            if (movies && movies.length > 0) {
                this.movies = movies;
                this.populateMovieDropdown(movies);
                console.log('Movies loaded successfully:', movies.length);
            } else {
                console.log('No movies found');
                if (movieSelect) {
                    movieSelect.innerHTML = '<option value="">No movies available</option>';
                }
            }
        } catch (error) {
            console.error('Failed to load movies:', error);
            const movieSelect = document.getElementById('movieSelect');
            if (movieSelect) {
                movieSelect.innerHTML = '<option value="">Error loading movies</option>';
            }
        }
    }

    populateMovieDropdown(movies) {
        const movieSelect = document.getElementById('movieSelect');
        if (!movieSelect) return;

        movieSelect.innerHTML = '<option value="">Select a movie...</option>';
        
        movies.forEach(movie => {
            const option = document.createElement('option');
            option.value = movie.id;
            option.textContent = `${movie.title} - ₹${movie.price || 299}`;
            movieSelect.appendChild(option);
        });
    }

    async loadSelectedMovie(movieId) {
        try {
            const movie = this.movies.find(m => m.id === movieId);
            if (!movie) {
                console.error('Movie not found:', movieId);
                return;
            }

            this.selectedMovie = movie;
            this.displaySelectedMovieInfo(movie);
            this.updateBookingForm(movie);
            
            console.log('Selected movie:', movie);
        } catch (error) {
            console.error('Failed to load selected movie:', error);
        }
    }

    displaySelectedMovieInfo(movie) {
        // Update header area in booking.html (the file uses headerMovie* ids)
        const headerMap = {
            headerMovieTitle: movie.title || 'Unknown Title',
            headerMovieGenre: movie.genre || '-',
            headerMovieLanguage: movie.language || '-',
            headerMovieDuration: movie.duration || '-',
            headerMovieRating: movie.rating || '-',
            headerMoviePrice: `₹${movie.price || 299}`
        };

        Object.entries(headerMap).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });

        // Also update any legacy ids (if present)
        const legacyElements = {
            selectedMovieTitle: movie.title || 'Unknown Title',
            selectedMovieGenre: movie.genre || 'Unknown',
            selectedMovieLanguage: movie.language || 'English',
            selectedMovieDuration: movie.duration || '120 min',
            selectedMovieRating: movie.rating || 'PG-13',
            selectedMoviePrice: `₹${movie.price || 299}`
        };
        Object.entries(legacyElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // Update movie description if available
        const descElement = document.getElementById('selectedMovieDescription');
        if (descElement) {
            descElement.textContent = movie.description || '';
        }

        // Ensure the booking summary shows ticket controls and correct totals
        this.ensureTicketControls();
    }

    ensureTicketControls() {
        // Replace the ticketCount span with an input control so user can pick number of tickets
        const ticketCountWrap = document.getElementById('ticketCount');
        if (ticketCountWrap) {
            // if already replaced with input, skip
            if (ticketCountWrap.tagName === 'INPUT') return;

            ticketCountWrap.innerHTML = '';
            const input = document.createElement('input');
            input.type = 'number';
            input.id = 'numberOfSeats';
            input.min = 1;
            input.value = 1;
            // Make this reflect seat selections (read-only - updated by seat clicks)
            input.readOnly = true;
            input.style.width = '4rem';
            ticketCountWrap.appendChild(input);

            input.addEventListener('input', () => {
                if (parseInt(input.value) < 1) input.value = 1;
                this.updateTotalAmount();
            });
        }

        // Update price per ticket and totals
        const pricePerTicket = document.getElementById('pricePerTicket');
        if (pricePerTicket && this.selectedMovie) {
            pricePerTicket.textContent = `₹${this.selectedMovie.price || 299}`;
        }

        this.updateTotalAmount();

        // Enable proceed button when movie selected
        const proceedBtn = document.getElementById('proceedButton');
        if (proceedBtn) proceedBtn.disabled = false;
    }

    updateBookingForm(movie) {
        // Pre-fill the movie price
        const priceInput = document.getElementById('ticketPrice');
        if (priceInput) {
            priceInput.value = movie.price || 299;
        }

        // Set minimum date to today
        const dateInput = document.getElementById('showDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            
            // Set default date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.value = tomorrow.toISOString().split('T')[0];
        }

        // Populate show times
        this.populateShowTimes();
        
        // Update total amount
        this.updateTotalAmount();
    }

    populateShowTimes() {
        const timeSelect = document.getElementById('showTime');
        if (!timeSelect) return;

        const showTimes = ['10:00', '13:30', '17:00', '20:30'];
        timeSelect.innerHTML = '<option value="">Select show time...</option>';
        
        showTimes.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeSelect.appendChild(option);
        });
    }

    updateTotalAmount() {
        if (!this.selectedMovie) return;

        const ticketPrice = parseFloat(this.selectedMovie.price || 299);
        const numberOfSeats = parseInt(document.getElementById('numberOfSeats')?.value || this.selectedSeats.length || 1);
        const subtotal = ticketPrice * numberOfSeats;
        const convenience = Math.round(subtotal * 0.02); // small convenience fee
        const totalAmount = subtotal + convenience;

        // Update UI pieces
        const subtotalEl = document.getElementById('subtotal');
        const convEl = document.getElementById('convenienceFee');
        const totalEl = document.getElementById('totalAmount');
        const summarySubtotal = document.getElementById('summarySubtotal');
        const summaryConvenience = document.getElementById('summaryConvenienceFee');
        const summaryTotal = document.getElementById('summaryTotal');
        const paymentTotal = document.getElementById('paymentTotal');

        if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
        if (convEl) convEl.textContent = `₹${convenience}`;
        if (totalEl) totalEl.textContent = `₹${totalAmount}`;

        if (summarySubtotal) summarySubtotal.textContent = `₹${subtotal}`;
        if (summaryConvenience) summaryConvenience.textContent = `₹${convenience}`;
        if (summaryTotal) summaryTotal.textContent = `₹${totalAmount}`;
        if (paymentTotal) paymentTotal.textContent = `₹${totalAmount}`;
    }

    // Render a simple seat map and wire up click handlers to select seats
    renderSeatMap(rows = 6, cols = 10) {
        const seatMap = document.getElementById('seatMap');
        if (!seatMap) return;

        // Clear loading placeholder
        seatMap.innerHTML = '';

        const seatsContainer = document.createElement('div');
        seatsContainer.className = 'seats-grid';
        // Basic grid using divs; rows labeled A.. and columns 1..cols
        for (let r = 0; r < rows; r++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'seat-row';
            for (let c = 1; c <= cols; c++) {
                const seatLabel = String.fromCharCode(65 + r) + c; // A1, A2...
                const seat = document.createElement('div');
                seat.className = 'seat-icon available seat';
                seat.dataset.seat = seatLabel;
                seat.title = seatLabel;

                // show small label inside seat for accessibility
                const inner = document.createElement('span');
                inner.className = 'seat-label';
                inner.textContent = '';
                seat.appendChild(inner);

                seat.addEventListener('click', (e) => {
                    e.preventDefault();
                    // if booked, ignore
                    if (seat.classList.contains('booked')) return;
                    // toggle selected
                    if (seat.classList.contains('selected')) {
                        seat.classList.remove('selected');
                        this.selectedSeats = this.selectedSeats.filter(s => s !== seatLabel);
                    } else {
                        seat.classList.add('selected');
                        this.selectedSeats.push(seatLabel);
                    }
                    // Keep selected seats sorted
                    this.selectedSeats.sort();
                    this.updateSelectedSeatsUI();
                });

                rowDiv.appendChild(seat);
            }
            seatsContainer.appendChild(rowDiv);
        }

        seatMap.appendChild(seatsContainer);

        // Initialize UI from any previously selected seats
        this.updateSelectedSeatsUI();
    }

    updateSelectedSeatsUI() {
        const list = document.getElementById('selectedSeatsList');
        if (!list) return;

        list.innerHTML = '';
        if (!this.selectedSeats || this.selectedSeats.length === 0) {
            const p = document.createElement('p');
            p.className = 'no-seats';
            p.textContent = 'No seats selected';
            list.appendChild(p);
        } else {
            const ul = document.createElement('div');
            ul.className = 'selected-seats';
            ul.textContent = this.selectedSeats.join(', ');
            list.appendChild(ul);
        }

        // Update ticket count input (if present)
        const seatsInput = document.getElementById('numberOfSeats');
        if (seatsInput) {
            seatsInput.value = this.selectedSeats.length || 1;
        }

        // Update summary Selected Seats
        const summarySelected = document.getElementById('summarySelectedSeats');
        if (summarySelected) {
            summarySelected.textContent = this.selectedSeats.length ? this.selectedSeats.join(', ') : '-';
        }

        // Update totals
        this.updateTotalAmount();

        // Enable proceed button only if seats selected
        const proceedBtn = document.getElementById('proceedButton');
        if (proceedBtn) proceedBtn.disabled = !(this.selectedSeats.length > 0 && this.selectedMovie);
    }

    // Called when user clicks Proceed to Payment
    async proceedToPayment() {
        if (!this.selectedMovie) {
            Utils.showNotification('Please select a movie first', 'error');
            return;
        }

        // Ensure authenticated
        if (!authManager.requireAuth()) return;

        // Collect user inputs from the minimal payment form (name + phone)
        const user = authManager.getCurrentUser();
        const nameInput = document.getElementById('customerName')?.value || user.username || user.name || user.email;
        const phoneInput = document.getElementById('customerPhone')?.value || '';

        if (!/^[0-9]{10}$/.test(phoneInput)) {
            Utils.showNotification('Please enter a valid 10-digit phone number', 'error');
            return;
        }

        const numberOfSeats = parseInt(document.getElementById('numberOfSeats')?.value || this.selectedSeats.length || 1);
        const totalAmount = this.calculateTotalAmount();

        // Backend expects simple format: {movieId, seatLabel}
        const selectedSeats = this.selectedSeats && this.selectedSeats.length > 0 
            ? this.selectedSeats 
            : [`A${Math.floor(Math.random() * 10) + 1}`]; // Generate default seat if none selected

        const payload = {
            movieId: this.selectedMovie.id.toString(),
            seatLabel: selectedSeats[0] // Backend currently handles one seat per booking
        };

        // UI feedback
        const payBtn = document.getElementById('payButton');
        if (payBtn) {
            payBtn.disabled = true;
            payBtn.textContent = 'Booking...';
        }

        try {
            console.log('Sending booking payload:', payload);
            
            // Get user info for the no-auth endpoint
            const userData = {
                ...payload,
                username: localStorage.getItem('currentUser') ? 
                    JSON.parse(localStorage.getItem('currentUser')).email : 
                    'guest@example.com'
            };
            
            // Use the no-auth endpoint for now until we fix the auth issue
            const response = await BookingAPI.createBookingNoAuth(userData);
            
            console.log('Booking response:', response);
            if (response && response.id) {
                Utils.showNotification('Booking confirmed!', 'success');

                const confId = document.getElementById('confirmationBookingId');
                const confTitle = document.getElementById('confirmationMovieTitle');
                const confSeats = document.getElementById('confirmationSeats');
                const confTotal = document.getElementById('confirmationTotal');

                if (confId) confId.textContent = response.id;
                if (confTitle) confTitle.textContent = this.selectedMovie.title;
                if (confSeats) confSeats.textContent = `${numberOfSeats}`;
                if (confTotal) confTotal.textContent = `₹${totalAmount}`;

                // Show confirmation
                document.getElementById('seatSelectionStep').style.display = 'none';
                document.getElementById('paymentStep').style.display = 'none';
                document.getElementById('confirmationStep').style.display = 'block';
            } else {
                Utils.showNotification('Booking failed. Please try again.', 'error');
            }
        } catch (err) {
            console.error('Booking API error:', err);
            console.error('Error details:', err.message);
            
            // Check if user is authenticated
            if (!authManager.isAuthenticated()) {
                Utils.showNotification('Please log in to complete your booking.', 'error');
                authManager.showLogin();
            } else {
                Utils.showNotification(`Booking failed: ${err.message}`, 'error');
            }
        } finally {
            if (payBtn) {
                payBtn.disabled = false;
                payBtn.textContent = `Book Now ${document.getElementById('paymentTotal')?.textContent || ''}`;
            }
        }
    }

    goBackToSeats() {
        // Show seat selection
        document.getElementById('paymentStep').style.display = 'none';
        document.getElementById('seatSelectionStep').style.display = 'block';
    }

    clearSelectedMovie() {
        this.selectedMovie = null;
        const movieInfo = document.getElementById('selectedMovieInfo');
        if (movieInfo) {
            movieInfo.classList.remove('show');
        }
    }

    async handleBookingSubmission() {
        if (!authManager.requireAuth()) {
            return;
        }

        if (!this.selectedMovie) {
            Utils.showNotification('Please select a movie first', 'error');
            return;
        }

        // Prepare button state variables in outer scope so finally can safely restore
        let submitBtn = document.querySelector('#bookingForm button[type="submit"]');
        let originalText = null;

        try {
            const formData = this.collectBookingData();

            if (!this.validateBookingData(formData)) {
                return;
            }

            // Show loading state
            if (submitBtn) {
                originalText = submitBtn.textContent;
                submitBtn.textContent = 'Booking...';
                submitBtn.disabled = true;
            }

            // Create booking
            const response = await BookingAPI.createBooking(formData);

            if (response && response.id) {
                Utils.showNotification('Booking confirmed successfully!', 'success');

                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                throw new Error('Booking creation failed');
            }

        } catch (error) {
            console.error('Booking error:', error);
            Utils.showNotification('Booking failed. Please try again.', 'error');
        } finally {
            // Restore button state
            submitBtn = submitBtn || document.querySelector('#bookingForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = originalText || 'Book';
                submitBtn.disabled = false;
            }
        }
    }

    collectBookingData() {
        const user = authManager.getCurrentUser();
        
        // Backend expects simple format: {movieId, seatLabel}
        const selectedSeats = this.selectedSeats && this.selectedSeats.length > 0 
            ? this.selectedSeats 
            : [`A${Math.floor(Math.random() * 10) + 1}`]; // Generate default seat if none selected
            
        return {
            movieId: this.selectedMovie.id.toString(),
            seatLabel: selectedSeats[0] // Backend currently handles one seat per booking
        };
    }

    calculateTotalAmount() {
        if (!this.selectedMovie) return 0;
        const ticketPrice = parseFloat(this.selectedMovie.price || 299);
        const numberOfSeats = this.selectedSeats && this.selectedSeats.length ? this.selectedSeats.length : parseInt(document.getElementById('numberOfSeats')?.value || 1);
        return ticketPrice * numberOfSeats;
    }

    validateBookingData(data) {
        const requiredFields = [
            { field: 'movieId', message: 'Please select a movie' },
            { field: 'showDate', message: 'Please select a show date' },
            { field: 'showTime', message: 'Please select a show time' },
            { field: 'customerName', message: 'Please enter customer name' },
            { field: 'customerPhone', message: 'Please enter phone number' }
        ];

        for (const { field, message } of requiredFields) {
            if (!data[field]) {
                Utils.showNotification(message, 'error');
                return false;
            }
        }

        // Validate phone number
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(data.customerPhone)) {
            Utils.showNotification('Please enter a valid 10-digit phone number', 'error');
            return false;
        }

        // Validate show date is not in the past
        const selectedDate = new Date(data.showDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            Utils.showNotification('Please select a future date', 'error');
            return false;
        }

        return true;
    }
    }
    window.BookingPage = BookingPage;
}

// Initialize booking page when DOM is loaded
if (typeof window.bookingPage === 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.bookingPage = new BookingPage();
    });
}