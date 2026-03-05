// Gallery Management - Auto-load all images from folder
class GalleryManager {
    constructor() {
        this.currentUser = window.auth.getCurrentUser();
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }

        // Configuration
        this.config = {
            imagesPerPage: 50,
            currentPage: 1,
            viewMode: 'grid', // 'grid' or 'masonry'
            searchTerm: '',
            currentImageIndex: 0,
            slideshowInterval: null,
            totalImages: 144 // You have 144 images (from img (1).jpeg to img (144).jpeg)
        };

        // Image storage - Will be auto-loaded
        this.images = [];

        // Initialize
        this.init();
    }

    async init() {
        console.log('Initializing Gallery Manager');

        // Show loading indicator
        this.showLoading();

        // Load all images from folder
        await this.loadAllImages();

        // Setup UI
        this.setupEventListeners();
        this.renderGallery();
        this.updateStats();

        // Hide loading indicator
        this.hideLoading();
    }

    // ===========================================
    // AUTO-LOAD ALL IMAGES FROM FOLDER
    // ===========================================

    async loadAllImages() {
        try {
            console.log('Loading images from folder...');

            // Clear existing images
            this.images = [];

            // Load all 144 images
            for (let i = 1; i <= this.config.totalImages; i++) {
                const imageUrl = `images/gallery/img (${i}).jpeg`;

                // Check if image exists (optional - you can skip this for speed)
                const exists = await this.checkImageExists(imageUrl);

                if (exists) {
                    this.images.push({
                        id: i,
                        url: imageUrl,
                        caption: `Memory ${i}`,
                        date: this.generateDate(i), // Generate a date based on image number
                        tags: this.generateTags(i), // Generate tags based on image number
                        likes: Math.floor(Math.random() * 50) // Random likes for demo
                    });
                } else {
                    console.log(`Image ${i} not found, skipping...`);
                }
            }

            console.log(`Successfully loaded ${this.images.length} images`);

            // Sort by date (newest first)
            this.images.sort((a, b) => new Date(b.date) - new Date(a.date));

        } catch (error) {
            console.error('Error loading images:', error);
            this.showError('Failed to load images');
        }
    }

    // Helper function to check if image exists
    checkImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    // Generate a date based on image number (spread across last 6 months)
    generateDate(imageNumber) {
        const date = new Date();
        // Subtract days based on image number (newer images = more recent)
        date.setDate(date.getDate() - (this.config.totalImages - imageNumber));
        return date.toISOString().split('T')[0];
    }

    // Generate tags based on image number
    generateTags(imageNumber) {
        const tags = [];

        // Add some random tags
        const possibleTags = ['love', 'romantic', 'memory', 'together', 'special', 'beautiful', 'happy', 'couple'];

        // Each image gets 2-4 random tags
        const numTags = 2 + Math.floor(Math.random() * 3);

        for (let i = 0; i < numTags; i++) {
            const randomTag = possibleTags[Math.floor(Math.random() * possibleTags.length)];
            if (!tags.includes(randomTag)) {
                tags.push(randomTag);
            }
        }

        // Add milestone tags for special images
        if (imageNumber === 1) tags.push('first');
        if (imageNumber === 50) tags.push('milestone');
        if (imageNumber === 100) tags.push('century');
        if (imageNumber === 144) tags.push('latest');

        return tags;
    }

    // ===========================================
    // GALLERY RENDERING
    // ===========================================

    renderGallery() {
        const container = document.getElementById('photoGrid');
        if (!container) return;

        if (this.images.length === 0) {
            container.innerHTML = `
                <div class="no-images">
                    <i class="fas fa-images fa-3x"></i>
                    <h3>No images found</h3>
                    <p>Make sure your images are in the folder: <strong>images/gallery/</strong></p>
                    <p style="font-size: 0.9rem; color: var(--text-light); margin-top: 1rem;">
                        Expected files: img (1).jpeg through img (144).jpeg
                    </p>
                </div>
            `;
            return;
        }

        // Filter images based on search
        let filteredImages = this.images;
        if (this.config.searchTerm) {
            const term = this.config.searchTerm.toLowerCase();
            filteredImages = this.images.filter(img =>
                img.caption.toLowerCase().includes(term) ||
                img.tags?.some(tag => tag.toLowerCase().includes(term))
            );
        }

        // Pagination
        const start = (this.config.currentPage - 1) * this.config.imagesPerPage;
        const paginatedImages = filteredImages.slice(start, start + this.config.imagesPerPage);

        // Determine grid class based on view mode
        const gridClass = this.config.viewMode === 'grid' ? 'grid-gallery' : 'masonry-gallery';
        container.className = gridClass;

        // Render images
        const html = paginatedImages.map((image, index) => {
            const globalIndex = this.images.findIndex(img => img.id === image.id);
            return `
                <div class="gallery-item fade-in" style="animation-delay: ${index * 0.05}s" data-id="${image.id}">
                    <img src="${image.url}" 
                         alt="${image.caption}" 
                         loading="lazy"
                         onclick="gallery.openLightboxByIndex(${globalIndex})"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/400x300?text=Image+Not+Found';">
                    <div class="photo-details">
                        <div class="uploaded-by">
                            <i class="fas fa-heart" style="color: var(--primary-pink);"></i> 
                            ${image.caption}
                        </div>
                        <div class="upload-date">
                            <i class="fas fa-calendar-alt"></i> ${new Date(image.date).toLocaleDateString()}
                        </div>
                        <div class="image-tags">
                            ${image.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add pagination controls
        const totalPages = Math.ceil(filteredImages.length / this.config.imagesPerPage);
        const pagination = `
            <div class="pagination-container">
                <div class="pagination">
                    <button class="pagination-btn" 
                            ${this.config.currentPage === 1 ? 'disabled' : ''} 
                            onclick="gallery.changePage(${this.config.currentPage - 1})">
                        <i class="fas fa-chevron-left"></i> Previous
                    </button>
                    <span class="page-info">Page ${this.config.currentPage} of ${totalPages}</span>
                    <button class="pagination-btn"
                            ${this.config.currentPage === totalPages ? 'disabled' : ''} 
                            onclick="gallery.changePage(${this.config.currentPage + 1})">
                        Next <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="image-count">
                    Showing ${start + 1}-${Math.min(start + this.config.imagesPerPage, filteredImages.length)} of ${filteredImages.length} images
                </div>
            </div>
        `;

        container.innerHTML = html + pagination;
    }

    // ===========================================
    // LIGHTBOX
    // ===========================================

    // New method to open lightbox by index (called from onclick)
    openLightboxByIndex(index) {
        if (index < 0 || index >= this.images.length) return;
        
        this.config.currentImageIndex = index;
        const image = this.images[index];
        
        // Create or get lightbox
        this.ensureLightboxExists();
        
        // Update lightbox content
        this.updateLightboxContent(image);
    }

    // Ensure lightbox exists in DOM
    ensureLightboxExists() {
        let lightbox = document.getElementById('lightbox');
        
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'lightbox';
            lightbox.className = 'lightbox-modal';
            lightbox.innerHTML = `
                <span class="lightbox-close">&times;</span>
                <div class="lightbox-content">
                    <img id="lightbox-img" src="" alt="">
                    <div class="lightbox-info">
                        <div id="lightbox-caption" class="lightbox-caption"></div>
                        <div id="lightbox-meta" class="lightbox-meta"></div>
                    </div>
                    <button class="lightbox-nav lightbox-prev"><i class="fas fa-chevron-left"></i></button>
                    <button class="lightbox-nav lightbox-next"><i class="fas fa-chevron-right"></i></button>
                </div>
            `;
            document.body.appendChild(lightbox);

            // Add event listeners
            lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
            lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.navigateLightbox(-1));
            lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.navigateLightbox(1));

            // Click outside to close
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) this.closeLightbox();
            });
        }
    }

    // Update lightbox content with image data
    updateLightboxContent(image) {
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const lightboxMeta = document.getElementById('lightbox-meta');
        const lightbox = document.getElementById('lightbox');
        
        if (!lightboxImg || !lightbox) return;
        
        // Set image source
        lightboxImg.src = image.url;
        
        // Update caption
        if (lightboxCaption) {
            lightboxCaption.textContent = image.caption || 'Beautiful Moment';
        }
        
        // Update metadata
        if (lightboxMeta) {
            const date = new Date(image.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            lightboxMeta.innerHTML = `
                <span><i class="fas fa-calendar-alt"></i> ${date}</span>
                <span><i class="fas fa-heart"></i> ${image.likes || 0} likes</span>
                <div class="lightbox-tags" style="margin-top: 0.5rem;">
                    ${image.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}
                </div>
            `;
        }
        
        // Show lightbox
        lightbox.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        // Update navigation buttons
        this.updateNavigationButtons();
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.style.display = 'none';
            document.body.classList.remove('modal-open');
        }

        // Stop slideshow if it's running
        if (this.config.slideshowInterval) {
            this.stopSlideshow();
        }
    }

    navigateLightbox(direction) {
        if (this.config.slideshowInterval) return; // Don't allow manual navigation during slideshow
        
        let newIndex = this.config.currentImageIndex + direction;
        if (newIndex >= 0 && newIndex < this.images.length) {
            this.config.currentImageIndex = newIndex;
            const image = this.images[newIndex];
            this.updateLightboxContent(image);
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.querySelector('.lightbox-prev');
        const nextBtn = document.querySelector('.lightbox-next');
        
        if (!prevBtn || !nextBtn) return;
        
        // Disable/enable based on position
        if (this.config.currentImageIndex === 0) {
            prevBtn.style.opacity = '0.5';
            prevBtn.style.pointerEvents = 'none';
        } else {
            prevBtn.style.opacity = '1';
            prevBtn.style.pointerEvents = 'auto';
        }
        
        if (this.config.currentImageIndex === this.images.length - 1) {
            nextBtn.style.opacity = '0.5';
            nextBtn.style.pointerEvents = 'none';
        } else {
            nextBtn.style.opacity = '1';
            nextBtn.style.pointerEvents = 'auto';
        }
        
        // Handle slideshow mode
        if (this.config.slideshowInterval) {
            prevBtn.style.opacity = '0.5';
            nextBtn.style.opacity = '0.5';
            prevBtn.style.pointerEvents = 'none';
            nextBtn.style.pointerEvents = 'none';
        }
    }

    // ===========================================
    // SLIDESHOW
    // ===========================================

    startSlideshow() {
        const slideshowBtn = document.getElementById('slideshowBtn');

        if (!slideshowBtn) return;

        if (this.config.slideshowInterval) {
            this.stopSlideshow();
        } else {
            if (!this.images || this.images.length === 0) {
                this.showNotification('No images to start slideshow', 'info');
                return;
            }

            try {
                this.config.currentImageIndex = 0;
                
                // Ensure lightbox exists
                this.ensureLightboxExists();
                
                // Open lightbox with first image
                const firstImage = this.images[0];
                this.updateLightboxContent(firstImage);

                // Set up slideshow interval
                this.config.slideshowInterval = setInterval(() => {
                    this.config.currentImageIndex = (this.config.currentImageIndex + 1) % this.images.length;
                    const nextImage = this.images[this.config.currentImageIndex];
                    this.updateLightboxContent(nextImage);
                }, 3000);

                // Update button UI
                slideshowBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Slideshow';
                slideshowBtn.style.background = 'var(--primary-pink)';
                slideshowBtn.classList.add('active');

                this.showNotification('Slideshow started', 'success');

            } catch (error) {
                console.error('Error starting slideshow:', error);
                this.showNotification('Failed to start slideshow', 'error');
            }
        }
    }

    stopSlideshow() {
        const slideshowBtn = document.getElementById('slideshowBtn');

        if (this.config.slideshowInterval) {
            clearInterval(this.config.slideshowInterval);
            this.config.slideshowInterval = null;
        }

        // Update button UI
        if (slideshowBtn) {
            slideshowBtn.innerHTML = '<i class="fas fa-play"></i> Start Slideshow';
            slideshowBtn.style.background = 'var(--soft-pink)';
            slideshowBtn.classList.remove('active');
        }

        // Update navigation buttons
        this.updateNavigationButtons();

        this.showNotification('Slideshow stopped', 'info');
    }

    // ===========================================
    // EVENT LISTENERS
    // ===========================================

    setupEventListeners() {
        // Slideshow button
        document.getElementById('slideshowBtn')?.addEventListener('click', () => {
            this.startSlideshow();
        });

        // View mode buttons
        document.getElementById('gridViewBtn')?.addEventListener('click', () => {
            this.config.viewMode = 'grid';
            this.renderGallery();
        });

        // Search
        document.getElementById('searchGallery')?.addEventListener('input', (e) => {
            this.config.searchTerm = e.target.value;
            this.config.currentPage = 1;
            this.renderGallery();
        });

        // Keyboard navigation for lightbox
        document.addEventListener('keydown', (e) => {
            const lightbox = document.getElementById('lightbox');
            if (lightbox && lightbox.style.display === 'flex') {
                if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
                if (e.key === 'ArrowRight') this.navigateLightbox(1);
                if (e.key === 'Escape') this.closeLightbox();
            }
        });
    }

    // ===========================================
    // PAGINATION
    // ===========================================

    changePage(page) {
        this.config.currentPage = page;
        this.renderGallery();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ===========================================
    // STATS
    // ===========================================

    updateStats() {
        const photoCount = document.getElementById('photoCount');
        if (photoCount) {
            photoCount.innerHTML = `📸 ${this.images.length} beautiful moments captured`;
        }
    }

    // ===========================================
    // UI HELPERS
    // ===========================================

    showLoading() {
        const loading = document.getElementById('loadingIndicator');
        if (loading) loading.style.display = 'block';
    }

    hideLoading() {
        const loading = document.getElementById('loadingIndicator');
        if (loading) loading.style.display = 'none';
    }

    showNotification(message, type = 'success') {
        const container = document.getElementById('pushNotificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `push-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(message) {
        const container = document.getElementById('photoGrid');
        if (container) {
            container.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 3rem; color: #e74c3c; grid-column: 1/-1;">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <h3 style="margin: 1rem 0;">Error Loading Images</h3>
                    <p>${message}</p>
                    <p style="font-size: 0.9rem; color: var(--text-light); margin-top: 1rem;">
                        Make sure your images are in: <strong>images/gallery/</strong><br>
                        Expected format: img (1).jpeg through img (144).jpeg
                    </p>
                </div>
            `;
        }
        this.hideLoading();
    }
}

// Initialize gallery
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('photoGrid')) {
        // Make sure auth is initialized first
        if (window.auth && window.auth.getCurrentUser()) {
            window.gallery = new GalleryManager();
        } else {
            // Wait for auth to be ready
            const checkAuth = setInterval(() => {
                if (window.auth && window.auth.getCurrentUser()) {
                    clearInterval(checkAuth);
                    window.gallery = new GalleryManager();
                }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => clearInterval(checkAuth), 5000);
        }
    }
});