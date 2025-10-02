// Movies Page JavaScript
if (typeof MoviesPage === 'undefined') {
    class MoviesPage {
        constructor() {
            this.movies = [];
            this.filteredMovies = [];
            this.currentPage = 1;
            this.moviesPerPage = 12;
            this.selectedMovie = null;
            this.currentGenre = 'all';
            this.searchQuery = '';
        this.sortBy = 'title';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMovies();
        this.setupFilters();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('movieSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.filterAndDisplayMovies();
            }, 300));
        }

        // Sort functionality
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.filterAndDisplayMovies();
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreMovies();
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('movieModal');
            if (e.target === modal) {
                this.closeMovieModal();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMovieModal();
            }
        });
    }

    setupFilters() {
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Remove active class from all tabs
                filterTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                e.target.classList.add('active');
                
                // Set current genre and filter
                this.currentGenre = e.target.dataset.genre;
                this.currentPage = 1;
                this.filterAndDisplayMovies();
            });
        });
    }

    async loadMovies() {
        const moviesGrid = document.getElementById('moviesGrid');
        
        try {
            Utils.showLoading(moviesGrid);
            
            const movies = await MovieAPI.getAllMovies();
            
            if (movies && movies.length > 0) {
                this.movies = this.enhanceMoviesData(movies);
                this.filteredMovies = [...this.movies];
                this.displayMovies();
            } else {
                this.showNoMoviesMessage(moviesGrid);
            }
        } catch (error) {
            console.error('Failed to load movies:', error);
            Utils.showError(moviesGrid, 'Failed to load movies. Please try again later.');
        }
    }

    enhanceMoviesData(movies) {
        // Enhance movie data with additional properties if missing
        return movies.map(movie => ({
            ...movie,
            genre: movie.genre || this.getRandomGenre(),
            rating: movie.rating || this.getRandomRating(),
            language: movie.language || 'English',
            duration: movie.duration || this.getRandomDuration(),
            year: movie.year || new Date().getFullYear(),
            score: movie.score || (Math.random() * 3 + 7).toFixed(1),
            description: movie.description || this.getRandomDescription(movie.title),
            posterUrl: movie.posterUrl || null
        }));
    }

    getRandomGenre() {
        const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Adventure'];
        return genres[Math.floor(Math.random() * genres.length)];
    }

    getRandomRating() {
        const ratings = ['G', 'PG', 'PG-13', 'R'];
        return ratings[Math.floor(Math.random() * ratings.length)];
    }

    getRandomDuration() {
        return Math.floor(Math.random() * 60) + 90; // 90-150 minutes
    }

    getRandomDescription(title) {
        const descriptions = [
            `An epic adventure that follows the journey of unlikely heroes in ${title}.`,
            `A thrilling story that will keep you on the edge of your seat in ${title}.`,
            `Experience the magic and wonder of ${title} in this unforgettable film.`,
            `A heartwarming tale of friendship, love, and discovery in ${title}.`,
            `Join the action-packed adventure in ${title} that redefines cinema.`
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    filterAndDisplayMovies() {
        let filtered = [...this.movies];

        // Filter by genre
        if (this.currentGenre !== 'all') {
            filtered = filtered.filter(movie => 
                movie.genre.toLowerCase() === this.currentGenre.toLowerCase()
            );
        }

        // Filter by search query
        if (this.searchQuery) {
            filtered = filtered.filter(movie =>
                movie.title.toLowerCase().includes(this.searchQuery) ||
                movie.genre.toLowerCase().includes(this.searchQuery) ||
                movie.language.toLowerCase().includes(this.searchQuery)
            );
        }

        // Sort movies
        filtered.sort((a, b) => {
            switch (this.sortBy) {
                case 'rating':
                    return parseFloat(b.score) - parseFloat(a.score);
                case 'price':
                    return (a.ticketPrice || 299) - (b.ticketPrice || 299);
                case 'duration':
                    return b.duration - a.duration;
                case 'title':
                default:
                    return a.title.localeCompare(b.title);
            }
        });

        this.filteredMovies = filtered;
        this.currentPage = 1;
        this.displayMovies();
    }

    displayMovies() {
        const moviesGrid = document.getElementById('moviesGrid');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        const startIndex = 0;
        const endIndex = this.currentPage * this.moviesPerPage;
        const moviesToShow = this.filteredMovies.slice(startIndex, endIndex);

        if (moviesToShow.length === 0) {
            this.showNoMoviesMessage(moviesGrid);
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }

        moviesGrid.innerHTML = moviesToShow.map(movie => `
            <div class="movie-card" onclick="moviesPage.showMovieDetails(${movie.id})">
                <div class="movie-poster">
                    ${movie.posterUrl ? 
                        `<div class="poster-placeholder" style="background-image:url('${movie.posterUrl}');background-size:cover;background-position:center;border-radius:15px;width:100%;height:100%"></div>` :
                        '<div class="poster-placeholder"><i class="fas fa-film"></i></div>'
                    }
                    <div class="movie-overlay">
                        <button class="btn-play">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
                
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    
                    <div class="movie-badges">
                        <span class="badge badge-genre">${movie.genre}</span>
                        <span class="badge badge-rating">${movie.rating}</span>
                    </div>
                    
                    <div class="movie-meta">
                        <span class="meta-item">
                            <i class="fas fa-clock"></i>
                            ${movie.duration} min
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-star"></i>
                            ${movie.score}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-globe"></i>
                            ${movie.language}
                        </span>
                    </div>
                    
                    <div class="movie-price">
                        ${Utils.formatPrice(movie.ticketPrice || 299)}
                    </div>
                    
                    <div class="movie-actions">
                        <button class="btn btn-primary" onclick="event.stopPropagation(); moviesPage.quickBook(${movie.id})">
                            <i class="fas fa-ticket-alt"></i>
                            Book Now
                        </button>
                        <button class="btn btn-outline btn-small" onclick="event.stopPropagation(); moviesPage.showMovieDetails(${movie.id})">
                            <i class="fas fa-info-circle"></i>
                            Details
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Show/hide load more button
        if (loadMoreBtn) {
            if (endIndex < this.filteredMovies.length) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        }

        // Add movie card styles
        this.addMovieCardStyles();
    }

    addMovieCardStyles() {
        const existingStyles = document.getElementById('movieCardStyles');
        if (existingStyles) return;

        const styles = document.createElement('style');
        styles.id = 'movieCardStyles';
        styles.textContent = `
            .movies-header {
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                color: white;
                padding: 6rem 0 4rem;
                text-align: center;
            }

            .header-content h1 {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .header-content p {
                font-size: 1.2rem;
                opacity: 0.9;
                margin-bottom: 2rem;
            }

            .search-filters {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 2rem;
                margin-top: 2rem;
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: center;
                justify-content: center;
            }

            .search-box {
                position: relative;
                flex: 1;
                min-width: 300px;
                max-width: 400px;
            }

            .search-box i {
                position: absolute;
                left: 1rem;
                top: 50%;
                transform: translateY(-50%);
                color: var(--text-light);
            }

            .search-box input {
                width: 100%;
                padding: 1rem 1rem 1rem 3rem;
                border: none;
                border-radius: 10px;
                font-size: 1rem;
                background: rgba(255, 255, 255, 0.9);
            }

            .filter-tabs {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }

            .filter-tab {
                padding: 0.75rem 1.5rem;
                border: 2px solid rgba(255, 255, 255, 0.3);
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
            }

            .filter-tab:hover,
            .filter-tab.active {
                background: white;
                color: var(--primary-color);
            }

            .sort-options select {
                padding: 0.75rem 1rem;
                border: none;
                border-radius: 10px;
                background: rgba(255, 255, 255, 0.9);
                font-size: 1rem;
                cursor: pointer;
            }

            .movies-section {
                padding: 4rem 0;
                background: var(--bg-light);
            }

            .movies-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
            }

            .movie-card {
                background: white;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                cursor: pointer;
            }

            .movie-card:hover {
                transform: translateY(-10px);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            }

            .movie-poster {
                position: relative;
                height: 400px;
                background: var(--bg-light);
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }

            .poster-placeholder {
                font-size: 3rem;
                color: var(--text-light);
            }

            .movie-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .movie-card:hover .movie-overlay {
                opacity: 1;
            }

            .btn-play {
                background: var(--primary-color);
                color: white;
                border: none;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                font-size: 1.5rem;
                cursor: pointer;
                transition: transform 0.3s ease;
            }

            .btn-play:hover {
                transform: scale(1.1);
            }

            .movie-info {
                padding: 1.5rem;
            }

            .movie-title {
                font-size: 1.3rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: var(--text-dark);
            }

            .movie-badges {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
                flex-wrap: wrap;
            }

            .badge {
                padding: 0.3rem 0.8rem;
                border-radius: 15px;
                font-size: 0.8rem;
                font-weight: 500;
            }

            .badge-genre {
                background: var(--primary-light);
                color: var(--primary-color);
            }

            .badge-rating {
                background: var(--secondary-light);
                color: var(--secondary-color);
            }

            .movie-meta {
                display: flex;
                justify-content: space-between;
                margin-bottom: 1rem;
                font-size: 0.9rem;
                color: var(--text-light);
            }

            .meta-item {
                display: flex;
                align-items: center;
                gap: 0.3rem;
            }

            .meta-item i {
                font-size: 0.8rem;
            }

            .movie-price {
                font-size: 1.2rem;
                font-weight: 600;
                color: var(--primary-color);
                margin-bottom: 1rem;
            }

            .movie-actions {
                display: flex;
                gap: 0.5rem;
            }



            .load-more-section {
                text-align: center;
                padding: 2rem 0;
            }

            .movie-modal .modal-content {
                max-width: 1100px;
                width: 95%;
            }

            .movie-details-grid {
                display: grid;
                grid-template-columns: 360px 1fr; /* make poster column wider */
                gap: 2rem;
                align-items: start;
            }

            .movie-poster-large {
                height: 450px;
                background: var(--bg-light);
                border-radius: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 4rem;
                color: var(--text-light);
                overflow: hidden;
            }

            .movie-info-detailed {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }

            .movie-badges {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }

            .movie-meta-detailed {
                display: flex;
                gap: 2rem;
                flex-wrap: wrap;
            }

            .meta-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: var(--text-light);
            }

            .movie-description h4 {
                margin-bottom: 0.5rem;
                color: var(--text-dark);
            }

            .movie-description p {
                color: var(--text-light);
                line-height: 1.6;
            }

            .movie-pricing {
                background: var(--bg-light);
                padding: 1rem;
                border-radius: 10px;
            }

            .price-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .price-label {
                color: var(--text-light);
            }

            .price-value {
                font-size: 1.5rem;
                font-weight: 600;
                color: var(--primary-color);
            }

            .movie-actions {
                display: flex;
                gap: 1rem;
            }

            .btn-large {
                padding: 1rem 2rem;
                font-size: 1.1rem;
            }

            @media (max-width: 768px) {
                .search-filters {
                    flex-direction: column;
                    align-items: stretch;
                }

                .search-box {
                    min-width: auto;
                    max-width: none;
                }

                .filter-tabs {
                    justify-content: center;
                }

                .movies-grid {
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1rem;
                }

                .movie-details-grid {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }

                .movie-poster-large {
                    height: 300px;
                }

                .movie-meta-detailed {
                    gap: 1rem;
                }

                .movie-actions {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    loadMoreMovies() {
        this.currentPage++;
        this.displayMovies();
    }

    showNoMoviesMessage(container) {
        container.innerHTML = `
            <div class="no-movies-message" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                <i class="fas fa-film" style="font-size: 4rem; color: var(--text-light); margin-bottom: 2rem;"></i>
                <h3 style="color: var(--text-dark); margin-bottom: 1rem;">No Movies Found</h3>
                <p style="color: var(--text-light); margin-bottom: 2rem;">
                    ${this.searchQuery ? 
                        `No movies found for "${this.searchQuery}"` : 
                        'No movies available in this category'
                    }
                </p>
                <button class="btn btn-secondary" onclick="moviesPage.clearFilters()">
                    Clear Filters
                </button>
            </div>
        `;
    }

    clearFilters() {
        // Reset all filters
        this.currentGenre = 'all';
        this.searchQuery = '';
        this.sortBy = 'title';
        
        // Update UI
        document.getElementById('movieSearch').value = '';
        document.getElementById('sortBy').value = 'title';
        
        // Reset active filter tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.genre === 'all') {
                tab.classList.add('active');
            }
        });
        
        // Refresh display
        this.filterAndDisplayMovies();
    }

    showMovieDetails(movieId) {
        const movie = this.movies.find(m => m.id === movieId);
        if (!movie) return;

        this.selectedMovie = movie;

        // Populate modal
        document.getElementById('modalMovieTitle').textContent = movie.title;
        document.getElementById('modalMovieGenre').textContent = movie.genre;
        document.getElementById('modalMovieRating').textContent = movie.rating;
        document.getElementById('modalMovieLanguage').textContent = movie.language;
        document.getElementById('modalMovieDuration').textContent = `${movie.duration} min`;
        document.getElementById('modalMovieScore').textContent = `${movie.score}/10`;
        document.getElementById('modalMovieYear').textContent = movie.year;
        document.getElementById('modalMovieDescription').textContent = movie.description;
        document.getElementById('modalMoviePrice').textContent = Utils.formatPrice(movie.ticketPrice || 299);

        // Handle poster: use background-image fallback to avoid missing image files
        const posterElement = document.getElementById('modalMoviePoster');
        if (movie.posterUrl) {
            posterElement.innerHTML = `<div class="poster-placeholder" style="background-image:url('${movie.posterUrl}');background-size:cover;background-position:center;border-radius:15px;width:100%;height:100%"></div>`;
        } else {
            posterElement.innerHTML = '<div class="poster-placeholder"><i class="fas fa-film"></i></div>';
        }

        // Show modal
        document.getElementById('movieModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeMovieModal() {
        document.getElementById('movieModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.selectedMovie = null;
    }

    quickBook(movieId) {
        if (!authManager.requireAuth()) {
            return;
        }
        
        localStorage.setItem('selectedMovieId', movieId);
        window.location.href = 'booking.html';
    }

    bookSelectedMovie() {
        if (!this.selectedMovie) return;
        this.quickBook(this.selectedMovie.id);
    }

    addToWishlist() {
        if (!authManager.requireAuth()) {
            return;
        }
        
        if (!this.selectedMovie) return;
        
        // For now, just show a notification
        Utils.showNotification(`${this.selectedMovie.title} added to your wishlist!`, 'success');
        
        // Here you could implement actual wishlist functionality
        // For example, save to localStorage or send to an API
    }
    }
    window.MoviesPage = MoviesPage;
}

// Initialize movies page when DOM is loaded
if (typeof window.moviesPage === 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.moviesPage = new MoviesPage();
    });
}