// Authentication Module - No exports, just global object
class Auth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        const savedUser = localStorage.getItem('love_gallery_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
            } catch (e) {
                localStorage.removeItem('love_gallery_user');
            }
        }
    }

    login(name, password) {
        try {
            // Check against predefined users
            const user = window.ALLOWED_USERS.find(u => 
                u.name === name && u.password === password
            );
            
            if (!user) {
                return { success: false, error: 'Invalid credentials' };
            }

            // Store user in localStorage
            this.currentUser = { 
                name: user.name,
                loggedInAt: new Date().toISOString()
            };
            
            localStorage.setItem('love_gallery_user', JSON.stringify(this.currentUser));
            
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    logout() {
        localStorage.removeItem('love_gallery_user');
        this.currentUser = null;
        window.location.href = 'index.html';
    }

    getCurrentUser() {
        const user = localStorage.getItem('love_gallery_user');
        if (user) {
            try {
                return JSON.parse(user);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    checkAuth() {
        const user = this.getCurrentUser();
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        const publicPages = ['index.html', ''];
        
        if (!user && !publicPages.includes(currentPage)) {
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
    }
}

// Create global auth instance
const auth = new Auth();
window.auth = auth;

// For backward compatibility with module imports
window.getCurrentUser = function() {
    return auth.getCurrentUser();
};

window.logout = function() {
    auth.logout();
};

console.log('Auth initialized');