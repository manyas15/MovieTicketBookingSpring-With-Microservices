// API Configuration
if (typeof API_CONFIG === 'undefined') {
    const API_CONFIG = {
        USER_SERVICE: 'http://localhost:8081',
        MOVIE_SERVICE: 'http://localhost:8082',
        BOOKING_SERVICE: 'http://localhost:8083'
    };
    window.API_CONFIG = API_CONFIG;
}

// API Helper Functions
if (typeof ApiService === 'undefined') {
    class ApiService {
        static async request(url, options = {}) {
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            // Add authorization header if token exists
            const token = localStorage.getItem('authToken');
            if (token) {
                defaultOptions.headers['Authorization'] = `Bearer ${token}`;
            }

            const config = {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers,
                },
            };

            try {
                const response = await fetch(url, config);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await response.json();
                } else {
                    return await response.text();
                }
            } catch (error) {
                console.error('API request failed:', error);
                throw error;
            }
        }

        static async get(url) {
            return this.request(url, { method: 'GET' });
        }

        static async post(url, data) {
            return this.request(url, {
                method: 'POST',
                body: JSON.stringify(data),
            });
        }

        static async put(url, data) {
            return this.request(url, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        }

        static async delete(url) {
            return this.request(url, { method: 'DELETE' });
        }
    }
    window.ApiService = ApiService;
}

// User Service API
if (typeof UserAPI === 'undefined') {
    class UserAPI {
        static async register(userData) {
            return ApiService.post(`${window.API_CONFIG.USER_SERVICE}/auth/register`, userData);
        }

        static async login(credentials) {
            return ApiService.post(`${window.API_CONFIG.USER_SERVICE}/auth/login`, credentials);
        }

        static async logout() {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
        }

        static getCurrentUser() {
            const user = localStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        }

        static isAuthenticated() {
            return !!localStorage.getItem('authToken');
        }
    }
    window.UserAPI = UserAPI;
}

// Movie Service API
if (typeof MovieAPI === 'undefined') {
    class MovieAPI {
        static async getAllMovies() {
            return ApiService.get(`${window.API_CONFIG.MOVIE_SERVICE}/api/movies`);
        }

        static async getMovie(id) {
            return ApiService.get(`${window.API_CONFIG.MOVIE_SERVICE}/api/movies/${id}`);
        }
    }
    window.MovieAPI = MovieAPI;
}

// Booking Service API
if (typeof BookingAPI === 'undefined') {
    class BookingAPI {
        static async createBooking(bookingData) {
            return ApiService.post(`${window.API_CONFIG.BOOKING_SERVICE}/bookings`, bookingData);
        }
        
        static async createBookingNoAuth(bookingData) {
            return ApiService.post(`${window.API_CONFIG.BOOKING_SERVICE}/bookings/no-auth`, bookingData);
        }

        static async getUserBookings() {
            return ApiService.get(`${window.API_CONFIG.BOOKING_SERVICE}/bookings/me`);
        }

        static async cancelBooking(bookingId) {
            return ApiService.delete(`${window.API_CONFIG.BOOKING_SERVICE}/bookings/${bookingId}`);
        }
    }
    window.BookingAPI = BookingAPI;
}

// Utility Functions
if (typeof Utils === 'undefined') {
    class Utils {
        static showLoading(element) {
            element.innerHTML = `
                <div class="loading-spinner"></div>
                <p>Loading...</p>
            `;
        }

        static showError(element, message) {
            element.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                </div>
            `;
        }

        static showSuccess(message) {
            this.showNotification(message, 'success');
        }

        static showNotification(message, type = 'info') {
            const container = document.getElementById('notificationContainer');
            if (!container) {
                const newContainer = document.createElement('div');
                newContainer.id = 'notificationContainer';
                newContainer.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                `;
                document.body.appendChild(newContainer);
            }

            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.style.cssText = `
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                margin-bottom: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 300px;
            `;
            notification.textContent = message;

            const finalContainer = document.getElementById('notificationContainer');
            finalContainer.appendChild(notification);

            // Trigger animation
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 10);

            // Auto remove
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 4000);
        }

        static formatPrice(price) {
            return `₹${price}`;
        }

        static formatDate(date) {
            return new Date(date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        static formatTime(time) {
            return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
    }
    window.Utils = Utils;
}
