// Authentication Module
if (typeof AuthManager === 'undefined') {
    class AuthManager {
        constructor() {
            this.modal = null;
            this.currentForm = 'login';
            this.init();
        }

    init() {
        // Create modal if it doesn't exist
        this.createModal();
        this.setupEventListeners();
        this.updateUIBasedOnAuth();
    }

    createModal() {
        this.modal = document.getElementById('authModal');
        if (!this.modal) {
            // Create modal if it doesn't exist
            this.modal = document.createElement('div');
            this.modal.id = 'authModal';
            this.modal.className = 'modal';
            this.modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <div id="authContent"></div>
                </div>
            `;
            document.body.appendChild(this.modal);
        }
    }

    setupEventListeners() {
        // Close modal events
        const closeBtn = this.modal.querySelector('.close');
        closeBtn.addEventListener('click', () => this.closeModal());

        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
    }

    showLogin() {
        this.currentForm = 'login';
        this.renderAuthForm();
        this.openModal();
    }

    showRegister() {
        this.currentForm = 'register';
        this.renderAuthForm();
        this.openModal();
    }

    renderAuthForm() {
        const authContent = this.modal.querySelector('#authContent');
        
        if (this.currentForm === 'login') {
            authContent.innerHTML = this.getLoginFormHTML();
        } else {
            authContent.innerHTML = this.getRegisterFormHTML();
        }

        this.setupFormEventListeners();
    }

    getLoginFormHTML() {
        return `
            <div class="auth-container">
                <div class="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Sign in to your account to continue</p>
                </div>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="loginEmail">Email</label>
                        <input type="email" id="loginEmail" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <input type="password" id="loginPassword" class="form-input" required>
                    </div>
                    <div class="auth-actions">
                        <button type="submit" class="btn btn-primary btn-full">
                            <i class="fas fa-sign-in-alt"></i>
                            Sign In
                        </button>
                        <div class="auth-switch">
                            Don't have an account? 
                            <a href="#" id="switchToRegister">Create one</a>
                        </div>
                    </div>
                </form>
            </div>
        `;
    }

    getRegisterFormHTML() {
        return `
            <div class="auth-container">
                <div class="auth-header">
                    <h2>Create Account</h2>
                    <p>Join us to start booking your favorite movies</p>
                </div>
                <form id="registerForm">
                    <div class="form-group">
                        <label for="registerEmail">Email</label>
                        <input type="email" id="registerEmail" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="registerUsername">Username</label>
                        <input type="text" id="registerUsername" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="registerPassword">Password</label>
                        <input type="password" id="registerPassword" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" class="form-input" required>
                    </div>
                    <div class="auth-actions">
                        <button type="submit" class="btn btn-primary btn-full">
                            <i class="fas fa-user-plus"></i>
                            Create Account
                        </button>
                        <div class="auth-switch">
                            Already have an account? 
                            <a href="#" id="switchToLogin">Sign in</a>
                        </div>
                    </div>
                </form>
            </div>
        `;
    }

    setupFormEventListeners() {
        const switchToRegister = this.modal.querySelector('#switchToRegister');
        const switchToLogin = this.modal.querySelector('#switchToLogin');
        const loginForm = this.modal.querySelector('#loginForm');
        const registerForm = this.modal.querySelector('#registerForm');

        if (switchToRegister) {
            switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegister();
            });
        }

        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLogin();
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        
        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            submitBtn.disabled = true;

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const response = await UserAPI.login({ email, password });
            
            // Store token and user info
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));

            Utils.showNotification('Welcome back! You have been signed in successfully.', 'success');
            this.closeModal();
            this.updateUIBasedOnAuth();

        } catch (error) {
            console.error('Login failed:', error);
            Utils.showNotification('Invalid email or password. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;

        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            submitBtn.disabled = true;

            const email = document.getElementById('registerEmail').value;
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validate passwords match
            if (password !== confirmPassword) {
                Utils.showNotification('Passwords do not match. Please try again.', 'error');
                return;
            }

            // Validate password strength
            if (password.length < 6) {
                Utils.showNotification('Password must be at least 6 characters long.', 'error');
                return;
            }

            await UserAPI.register({ email, username, password });
            
            Utils.showNotification('Account created successfully! You can now sign in.', 'success');
            this.showLogin();

        } catch (error) {
            console.error('Registration failed:', error);
            if (error.message.includes('Username already exists')) {
                Utils.showNotification('Username already exists. Please choose a different one.', 'error');
            } else if (error.message.includes('Email already exists')) {
                Utils.showNotification('Email already exists. Please use a different email.', 'error');
            } else {
                Utils.showNotification('Registration failed. Please try again later.', 'error');
            }
        } finally {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }
    }

    logout() {
        UserAPI.logout();
        Utils.showNotification('You have been signed out successfully.', 'success');
        this.updateUIBasedOnAuth();
        
        // Redirect to home if on protected pages
        if (window.location.pathname.includes('dashboard') || 
            window.location.pathname.includes('booking')) {
            window.location.href = '/';
        }
    }

    updateUIBasedOnAuth() {
        const isAuthenticated = UserAPI.isAuthenticated();
        const currentUser = UserAPI.getCurrentUser();
        
        // Update navigation
        const navAuth = document.querySelector('.nav-auth');
        if (navAuth) {
            if (isAuthenticated && currentUser) {
                navAuth.innerHTML = `
                    <div class="user-menu">
                        <span class="user-greeting">Hi, ${currentUser.username}!</span>
                        <button class="btn btn-outline" onclick="window.location.href='dashboard.html'">
                            <i class="fas fa-user"></i> Dashboard
                        </button>
                        <button class="btn btn-secondary" onclick="authManager.logout()">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                `;
            } else {
                navAuth.innerHTML = `
                    <button class="btn btn-outline" onclick="authManager.showLogin()">Login</button>
                    <button class="btn btn-primary" onclick="authManager.showRegister()">Sign Up</button>
                `;
            }
        }

        // Add user menu styles
        this.addUserMenuStyles();
    }

    addUserMenuStyles() {
        const existingStyles = document.getElementById('userMenuStyles');
        if (existingStyles) return;

        const styles = document.createElement('style');
        styles.id = 'userMenuStyles';
        styles.textContent = `
            .user-menu {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .user-greeting {
                color: var(--text-dark);
                font-weight: 500;
                margin-right: 0.5rem;
            }

            @media (max-width: 768px) {
                .user-menu {
                    flex-direction: column;
                    gap: 0.5rem;
                }
                
                .user-greeting {
                    margin-right: 0;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    openModal() {
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Check if user is authenticated for protected routes
    requireAuth() {
        if (!UserAPI.isAuthenticated()) {
            Utils.showNotification('Please sign in to access this page.', 'error');
            this.showLogin();
            return false;
        }
        return true;
    }

    // Wrapper methods for UserAPI
    isAuthenticated() {
        return UserAPI.isAuthenticated();
    }

    getCurrentUser() {
        return UserAPI.getCurrentUser();
    }
    }
    window.AuthManager = AuthManager;
}

// Initialize auth manager
if (typeof authManager === 'undefined') {
    const authManager = new AuthManager();

    // Global functions for buttons
    window.showLogin = () => authManager.showLogin();
    window.showRegister = () => authManager.showRegister();
    window.authManager = authManager;
}