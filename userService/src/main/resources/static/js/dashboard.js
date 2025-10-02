// Clean minimal dashboard: shows only signed-in username and a list of bookings
class DashboardPage {
    constructor() {
        this.currentUser = null;
        this.userBookings = [];
        this.init();
    }

    init() {
        // Wait for authManager if not ready
        if (!window.authManager) {
            setTimeout(() => this.init(), 150);
            return;
        }

        if (!authManager.isAuthenticated()) {
            if (typeof Utils !== 'undefined') Utils.showNotification('Please login to view your dashboard', 'error');
            setTimeout(() => window.location.href = 'index.html', 800);
            return;
        }

        this.currentUser = authManager.getCurrentUser();
        this.renderHeader();
        this.loadBookings();
    }

    renderHeader() {
        const userDisplay = document.getElementById('dashboardUser');
        if (userDisplay && this.currentUser) {
            userDisplay.textContent = `Signed in as ${this.currentUser.username || this.currentUser.name || this.currentUser.email}`;
        }
    }

    async loadBookings() {
        const bookingsGrid = document.getElementById('bookingsGrid');
        const loading = document.getElementById('bookingsLoading');
        const noBookings = document.getElementById('noBookingsMessage');

        if (loading) loading.style.display = 'block';
        if (bookingsGrid) bookingsGrid.innerHTML = '';

        try {
            if (typeof BookingAPI !== 'undefined' && BookingAPI.getUserBookings) {
                const bookings = await BookingAPI.getUserBookings();
                if (Array.isArray(bookings) && bookings.length > 0) {
                    this.userBookings = bookings;
                    this.renderBookings(bookings);
                    return;
                }
            }

            // fallback sample bookings
            this.userBookings = this.getSampleBookings();
            this.renderBookings(this.userBookings);

        } catch (err) {
            console.warn('Error loading bookings:', err);
            this.userBookings = this.getSampleBookings();
            this.renderBookings(this.userBookings);
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    getSampleBookings() {
        return [
            { id: 1001, movieTitle: 'Sample Movie', showDate: new Date().toISOString(), showTime: '19:00', seats: ['A1'], totalAmount: 299, status: 'confirmed' }
        ];
    }

    renderBookings(bookings) {
        const bookingsGrid = document.getElementById('bookingsGrid');
        const noBookings = document.getElementById('noBookingsMessage');

        if (!bookings || bookings.length === 0) {
            if (bookingsGrid) bookingsGrid.innerHTML = '';
            if (noBookings) noBookings.style.display = 'block';
            return;
        }

        if (noBookings) noBookings.style.display = 'none';

        bookingsGrid.innerHTML = bookings.map(b => `
            <div class="booking-card">
                <div class="booking-header">
                    <div>
                        <strong>Movie ID: ${b.movieId || 'Unknown Movie'}</strong>
                        <div style="font-size:0.9rem;color:var(--text-light)">
                            Seat: ${b.seatLabel || 'N/A'} | 
                            Booked: ${b.bookedAt ? new Date(b.bookedAt).toLocaleString() : 'Unknown'}
                        </div>
                    </div>
                    <div style="text-align:right">
                        <div>₹299</div>
                        <div style="font-size:0.8rem;color:var(--text-light)">#${(b.id || '')}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Initialize dashboard page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardPage = new DashboardPage();
});