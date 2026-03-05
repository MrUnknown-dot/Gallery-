// Moments Module - Flip Book Animation Style
class MomentsManager {
    constructor() {
        this.currentUser = window.auth.getCurrentUser();
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }
        
        // Predefined images - Add your images here
        this.images = [
            {
                id: 'img1',
                fileUrl: 'images/moments/m (1).jpeg',
                uploadedBy: 'Loki',
                uploadedAt: '2024-01-15T10:30:00Z',
                fileName: 'First Kiss',
                caption: 'Our first kiss ❤️',
                rotation: -3
            },
            {
                id: 'img2',
                fileUrl: 'images/moments/m (2).jpeg',
                uploadedBy: 'Crush',
                uploadedAt: '2024-01-20T15:45:00Z',
                fileName: 'Beautiful You',
                caption: 'You look stunning',
                rotation: 4
            },
            {
                id: 'img3',
                fileUrl: 'images/moments/m (3).jpeg',
                uploadedBy: 'Loki',
                uploadedAt: '2024-02-01T09:20:00Z',
                fileName: 'Romantic Evening',
                caption: 'Perfect evening together',
                rotation: -2
            },
            {
                id: 'img4',
                fileUrl: 'images/moments/m (4).jpeg',
                uploadedBy: 'Crush',
                uploadedAt: '2024-02-14T18:00:00Z',
                fileName: 'Valentines Day',
                caption: 'Happy Valentine\'s Day!',
                rotation: 3
            },
            {
                id: 'img5',
                fileUrl: 'images/moments/m (5).jpeg',
                uploadedBy: 'Loki',
                uploadedAt: '2024-02-20T20:15:00Z',
                fileName: 'Cozy Time',
                caption: 'Cuddling together',
                rotation: -4
            },
            {
                id: 'img6',
                fileUrl: 'images/moments/m (6).jpeg',
                uploadedBy: 'Crush',
                uploadedAt: '2024-03-01T14:30:00Z',
                fileName: 'Mountain View',
                caption: 'Beautiful view with you',
                rotation: 2
            },
            {
                id: 'img7',
                fileUrl: 'images/moments/m (7).jpeg',
                uploadedBy: 'Loki',
                uploadedAt: '2024-03-05T11:20:00Z',
                fileName: 'Sunset',
                caption: 'Chasing sunsets together',
                rotation: -3
            },
            {
                id: 'img8',
                fileUrl: 'images/moments/m (8).jpeg',
                uploadedBy: 'Crush',
                uploadedAt: '2024-03-10T16:45:00Z',
                fileName: 'Coffee Date',
                caption: 'Morning coffee with you',
                rotation: 3
            },
            {
                id: 'img9',
                fileUrl: 'images/moments/m (9).jpeg',
                uploadedBy: 'Loki',
                uploadedAt: '2024-03-05T11:20:00Z',
                fileName: 'Sunset',
                caption: 'Chasing sunsets together',
                rotation: -3
            },
            {
                id: 'img10',
                fileUrl: 'images/moments/m (10).jpeg',
                uploadedBy: 'Loki',
                uploadedAt: '2024-03-05T11:20:00Z',
                fileName: 'Sunset',
                caption: 'Chasing sunsets together',
                rotation: -3
            },
            {
                id: 'img11',
                fileUrl: 'images/moments/m (11).jpeg',
                uploadedBy: 'Loki',
                uploadedAt: '2024-03-05T11:20:00Z',
                fileName: 'Sunset',
                caption: 'Chasing sunsets together',
                rotation: -3
            },
            {
                id: 'img12',
                fileUrl: 'images/moments/m (12).jpeg',
                uploadedBy: 'Loki',
                uploadedAt: '2024-03-05T11:20:00Z',
                fileName: 'Sunset',
                caption: 'Chasing sunsets together',
                rotation: -3
            },
            {
                id: 'img13',
                fileUrl: 'images/moments/m (13).jpeg',
                uploadedBy: 'Loki',
                uploadedAt: '2024-03-05T11:20:00Z',
                fileName: 'Sunset',
                caption: 'Chasing sunsets together',
                rotation: -3
            },
            {
                id: 'img14',
                fileUrl: 'images/moments/m (14).jpeg',
                uploadedBy: 'Loki',
                uploadedAt: '2024-03-05T11:20:00Z',
                fileName: 'Sunset',
                caption: 'Chasing sunsets together',
                rotation: -3
            },
            {
                id: 'img15',
                fileUrl: 'images/moments/m (15).jpeg',
                uploadedBy: 'Loki',
                uploadedAt: '2024-03-05T11:20:00Z',
                fileName: 'Sunset',
                caption: 'Chasing sunsets together',
                rotation: -3
            },
            {
                id: 'img16',
                fileUrl: 'images/moments/m (16).jpeg',
                uploadedBy: 'Loki',
                uploadedAt: '2024-03-05T11:20:00Z',
                fileName: 'Sunset',
                caption: 'Chasing sunsets together',
                rotation: -3
            },
            {
                id: 'img17',
                fileUrl: 'images/moments/m (17).jpeg',
                uploadedBy: 'Loki',
                uploadedAt: '2024-03-05T11:20:00Z',
                fileName: 'Sunset',
                caption: 'Chasing sunsets together',
                rotation: -3
            },
            {
                id: 'img18',
                fileUrl: 'images/moments/m (18).jpeg',
                uploadedBy: 'Loki',
                uploadedAt: '2024-03-05T11:20:00Z',
                fileName: 'Sunset',
                caption: 'Chasing sunsets together',
                rotation: -3
            },
            {
                id: 'img19',
                fileUrl: 'images/moments/m (19).jpeg',
                uploadedBy: 'Loki',
                uploadedAt: '2024-03-05T11:20:00Z',
                fileName: 'Sunset',
                caption: 'Chasing sunsets together',
                rotation: -3
            },
            {
                id: 'img20',
                fileUrl: 'images/moments/m (20).jpeg',
                uploadedBy: 'Loki',
                uploadedAt: '2024-03-05T11:20:00Z',
                fileName: 'Sunset',
                caption: 'Chasing sunsets together',
                rotation: -3
            }
        ];

        // Check if we're on the moments page
        if (document.getElementById('photoStack')) {
            this.init();
        }
    }

    init() {
        console.log('Initializing Moments Manager');
        this.loadPhotos();
        this.setupShineEffect();
    }

    loadPhotos() {
        const container = document.getElementById('photoStack');
        if (!container) return;
        
        this.displayFlipGallery(this.images, container);
    }

    displayFlipGallery(photos, container) {
        if (!photos || photos.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; grid-column: 1/-1; padding: 3rem;">
                    <i class="fas fa-heart-broken fa-3x" style="color: var(--soft-pink);"></i>
                    <p>No moments added yet. Add images to the code!</p>
                </div>
            `;
            return;
        }

        // Shuffle array for random order
        const shuffled = [...photos].sort(() => Math.random() - 0.5);
        
        container.innerHTML = shuffled.map((photo, index) => {
            // Random rotation between -5 and 5 degrees
            const rotation = photo.rotation || (Math.random() * 10 - 5);
            
            return `
                <div class="flip-item" style="animation-delay: ${index * 0.15}s; transform: rotate(${rotation}deg);">
                    <div class="flip-inner">
                        <div class="flip-front">
                            <img src="${photo.fileUrl}" alt="${photo.fileName || 'Memory'}" 
                                 onerror="this.src='https://via.placeholder.com/400x500?text=Memory+${index+1}'">
                            <div class="photo-caption">
                                <span>❤️ ${photo.uploadedBy}</span>
                                <span>${new Date(photo.uploadedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="flip-back">
                            <div class="back-content">
                                <i class="fas fa-heart" style="font-size: 2rem; color: var(--primary-pink); margin-bottom: 1rem;"></i>
                                <h3>${photo.fileName || 'Special Memory'}</h3>
                                <p>${photo.caption || 'A beautiful moment together'}</p>
                                <div class="back-footer">
                                    <span>Added with ❤️ by ${photo.uploadedBy}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers for flip effect
        this.setupFlipHandlers();
    }

    setupFlipHandlers() {
        document.querySelectorAll('.flip-item').forEach(item => {
            item.addEventListener('click', function(e) {
                // Don't flip if clicking on delete button
                if (e.target.classList.contains('delete-photo')) return;
                
                this.classList.toggle('flipped');
            });
        });
    }

    setupShineEffect() {
        const shineElement = document.getElementById('shine');
        if (shineElement) {
            // Add shine animation
            setInterval(() => {
                shineElement.style.animation = 'none';
                shineElement.offsetHeight; // Trigger reflow
                shineElement.style.animation = 'shine 3s infinite';
            }, 6000);
        }
    }
}

// Initialize moments
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('photoStack')) {
        // Clear any existing instance
        if (window.moments) {
            delete window.moments;
        }
        window.moments = new MomentsManager();
    }
});