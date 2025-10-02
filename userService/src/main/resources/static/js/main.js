// Main Application JavaScript
class MovieBookingApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMovies();
        this.setupScrollEffects();
        this.setupMobileMenu();
    }

    setupEventListeners() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Hero buttons
        const exploreBtn = document.querySelector('[onclick="exploreMovies()"]');
        if (exploreBtn) {
            exploreBtn.onclick = this.exploreMovies;
        }

        const trailerBtn = document.querySelector('[onclick="showTrailer()"]');
        if (trailerBtn) {
            trailerBtn.onclick = this.showTrailer;
        }

        // View all movies button
        const viewAllBtn = document.querySelector('[onclick="viewAllMovies()"]');
        if (viewAllBtn) {
            viewAllBtn.onclick = this.viewAllMovies;
        }
    }

    setupScrollEffects() {
        const navbar = document.querySelector('.navbar');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe sections for scroll animations
        document.querySelectorAll('.feature-card, .movie-card, .stat-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        }
    }

    async loadMovies() {
        const moviesGrid = document.getElementById('moviesGrid');
        if (!moviesGrid) return;

        try {
            Utils.showLoading(moviesGrid);
            
            const movies = await MovieAPI.getAllMovies();
            
            if (movies && movies.length > 0) {
                // Show only first 6 movies on homepage
                const displayMovies = movies.slice(0, 6);
                this.renderMovies(displayMovies, moviesGrid);
            } else {
                this.showNoMoviesMessage(moviesGrid);
            }
        } catch (error) {
            console.error('Failed to load movies:', error);
            Utils.showError(moviesGrid, 'Failed to load movies. Please try again later.');
        }
    }

    renderMovies(movies, container) {
        container.innerHTML = movies.map(movie => `
            <div class="movie-card" onclick="app.selectMovie(${movie.id})">
                <div class="movie-poster">
                    ${movie.posterUrl ? 
                        `<div class="poster-placeholder" style="background-image:url('${movie.posterUrl}');background-size:cover;background-position:center;border-radius:12px;width:100%;height:100%"></div>` :
                        '<div class="poster-placeholder">🎬</div>'
                    }
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-details">
                        <span class="movie-genre">${movie.genre || 'Drama'}</span>
                        <span class="movie-rating">${movie.rating || 'PG-13'}</span>
                    </div>
                    <div class="movie-meta">
                        <span class="movie-duration">
                            <i class="fas fa-clock"></i>
                            ${movie.duration || 120} min
                        </span>
                        <span class="movie-language">
                            <i class="fas fa-globe"></i>
                            ${movie.language || 'English'}
                        </span>
                    </div>
                    <div class="movie-price">
                        ${Utils.formatPrice(movie.ticketPrice || 299)}
                    </div>
                    <button class="btn btn-primary btn-full" onclick="main.quickBook(${movie.id})" style="margin-top: var(--space-4);">
                        <i class="fas fa-ticket-alt"></i>
                        Book Now
                    </button>
                </div>
            </div>
        `).join('');

        // Add movie meta styles
        this.addMovieStyles();
    }

    addMovieStyles() {
        const existingStyles = document.getElementById('movieMetaStyles');
        if (existingStyles) return;

        const styles = document.createElement('style');
        styles.id = 'movieMetaStyles';
        styles.textContent = `
            .movie-meta {
                display: flex;
                justify-content: space-between;
                margin: 0.5rem 0;
                font-size: 0.9rem;
                color: var(--text-light);
            }

            .movie-meta span {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .movie-meta i {
                font-size: 0.8rem;
                opacity: 0.7;
            }
        `;
        document.head.appendChild(styles);
    }

    showNoMoviesMessage(container) {
        container.innerHTML = `
            <div class="no-movies-message" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-film" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-dark); margin-bottom: 0.5rem;">No Movies Available</h3>
                <p style="color: var(--text-light);">Check back later for new releases!</p>
            </div>
        `;
    }

    selectMovie(movieId) {
        if (!authManager.requireAuth()) {
            return;
        }
        
        // Store selected movie ID and redirect to booking page
        localStorage.setItem('selectedMovieId', movieId);
        window.location.href = 'booking.html';
    }

    exploreMovies() {
        const moviesSection = document.getElementById('movies');
        if (moviesSection) {
            moviesSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    showTrailer() {
        // Placeholder for trailer functionality
        Utils.showNotification('Trailer feature coming soon!', 'info');
    }

    viewAllMovies() {
        window.location.href = 'movies.html';
    }

    // Utility methods for page navigation
    static navigateToMovies() {
        window.location.href = 'movies.html';
    }

    static navigateToDashboard() {
        if (!authManager.requireAuth()) {
            return;
        }
        window.location.href = 'dashboard.html';
    }

    static navigateToBooking(movieId) {
        if (!authManager.requireAuth()) {
            return;
        }
        localStorage.setItem('selectedMovieId', movieId);
        window.location.href = 'booking.html';
    }
}

// Global functions
window.exploreMovies = () => app.exploreMovies();
window.showTrailer = () => app.showTrailer();
window.viewAllMovies = () => app.viewAllMovies();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MovieBookingApp();
});

// Add mobile menu styles
const mobileMenuStyles = `
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 80px;
            right: -100%;
            width: 100%;
            height: calc(100vh - 80px);
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding-top: 2rem;
            transition: right 0.3s ease;
        }

        .nav-menu.active {
            right: 0;
        }

        .hamburger.active span:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }

        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }

        .hamburger.active span:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }

        .nav-auth {
            flex-direction: column;
            gap: 0.5rem;
            margin-top: 2rem;
        }
    }
`;

const mobileStyleSheet = document.createElement('style');
mobileStyleSheet.textContent = mobileMenuStyles;
document.head.appendChild(mobileStyleSheet);