// Timeline Module - Unified version with Firebase
class TimelineManager {
    constructor() {
        this.currentUser = window.auth.getCurrentUser();
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }

        this.memories = [];
        this.currentDeleteId = null;
        this.currentEditId = null;
        this.unsubscribe = null;
        
        this.init();
    }

    async init() {
        console.log('Initializing Timeline Manager for user:', this.currentUser.name);
        this.setupEventListeners();
        await this.loadMemories();
        this.setupRealtimeListener();
        this.setupScrollAnimation();
    }

    setupEventListeners() {
        // Add memory button
        document.getElementById('addMemoryBtn')?.addEventListener('click', () => {
            this.openAddModal();
        });

        // Modal close buttons
        document.querySelector('.close-modal')?.addEventListener('click', () => {
            this.closeModal('memoryModal');
        });

        document.querySelector('.close-edit-modal')?.addEventListener('click', () => {
            this.closeModal('editMemoryModal');
        });

        // Cancel buttons
        document.getElementById('cancelMemoryBtn')?.addEventListener('click', () => {
            this.closeModal('memoryModal');
        });

        document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
            this.closeModal('editMemoryModal');
        });

        document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => {
            this.closeModal('deleteModal');
        });

        // Form submissions
        document.getElementById('addMemoryForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMemory();
        });

        document.getElementById('editMemoryForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateMemory();
        });

        // Character counter
        document.getElementById('memoryDescription')?.addEventListener('input', (e) => {
            document.getElementById('charCount').textContent = e.target.value.length;
        });

        // Confirm delete
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
            this.deleteMemory(this.currentDeleteId);
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Event delegation for timeline buttons (edit and delete)
        document.getElementById('timeline')?.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-btn');
            const deleteBtn = e.target.closest('.delete-btn');
            
            if (editBtn) {
                e.preventDefault();
                const memoryId = editBtn.dataset.id;
                if (memoryId) {
                    this.openEditModal(memoryId);
                }
            }
            
            if (deleteBtn) {
                e.preventDefault();
                const memoryId = deleteBtn.dataset.id;
                if (memoryId) {
                    this.openDeleteModal(memoryId);
                }
            }
        });
    }

    setupRealtimeListener() {
        // Listen for real-time updates from Firebase
        if (window.FirebaseServices && window.FirebaseServices.timeline) {
            this.unsubscribe = window.FirebaseServices.timeline.onSnapshot((memories) => {
                console.log('Real-time update received:', memories.length, 'memories');
                this.memories = memories;
                this.displayMemories();
            });
        }
    }

    async loadMemories() {
        try {
            if (window.FirebaseServices && window.FirebaseServices.timeline) {
                this.memories = await window.FirebaseServices.timeline.getAll();
                this.displayMemories();
            } else {
                console.error('Timeline service not initialized');
                this.showError('Timeline service not available');
            }
        } catch (error) {
            console.error('Error loading memories:', error);
            this.showError('Failed to load memories');
        }
    }

    displayMemories() {
        const container = document.getElementById('timeline');
        if (!container) return;

        if (!this.memories || this.memories.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-light);">
                    <i class="fas fa-heart fa-3x" style="color: var(--soft-pink); margin-bottom: 1rem;"></i>
                    <p>No memories yet. Click "Add New Memory" to start your timeline!</p>
                </div>
            `;
            return;
        }

        // Sort memories by date (newest first)
        const sortedMemories = [...this.memories].sort((a, b) => 
            new Date(b.eventDate) - new Date(a.eventDate)
        );

        container.innerHTML = sortedMemories.map((memory, index) => {
            const isOwn = memory.addedBy === this.currentUser.name;
            return `
            <div class="timeline-item ${memory.isSpecial ? 'special' : ''}" data-id="${memory.id}" style="animation-delay: ${index * 0.1}s">
                <div class="timeline-content ${isOwn ? 'own-memory' : ''}">
                    <div class="timeline-header">
                        <div class="timeline-date">
                            <i class="fas fa-calendar-alt"></i> 
                            ${this.formatDate(memory.eventDate)}
                        </div>
                        <div class="timeline-actions">
                            ${isOwn ? `
                                <button class="timeline-btn edit-btn" data-id="${memory.id}" title="Edit memory">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="timeline-btn delete-btn" data-id="${memory.id}" title="Delete memory">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <h3 class="timeline-title">
                        ${memory.isSpecial ? '<i class="fas fa-star" style="color: gold;"></i>' : '❤️'} 
                        ${this.escapeHtml(memory.title)}
                    </h3>
                    
                    <p class="timeline-description">${this.escapeHtml(memory.description)}</p>
                    
                    <div class="timeline-footer">
                        <span class="added-by">
                            <i class="fas fa-user"></i> Added by ${memory.addedBy}
                        </span>
                        <span class="added-time">
                            <i class="fas fa-clock"></i> ${this.formatTimestamp(memory.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
        `}).join('');
    }

    formatDate(dateString) {
        if (!dateString) return 'Unknown date';
        try {
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
            };
            return new Date(dateString).toLocaleDateString('en-US', options);
        } catch (e) {
            return dateString;
        }
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return 'Just now';
        
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            return date.toLocaleDateString();
        } catch (e) {
            return 'Recently';
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    openAddModal() {
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('memoryDate').value = today;
        
        // Clear form
        document.getElementById('memoryTitle').value = '';
        document.getElementById('memoryDescription').value = '';
        document.getElementById('isSpecial').checked = false;
        document.getElementById('charCount').textContent = '0';
        
        this.openModal('memoryModal');
    }

    openEditModal(memoryId) {
        console.log('Opening edit modal for memory:', memoryId);
        const memory = this.memories.find(m => m.id === memoryId);
        if (!memory) {
            console.error('Memory not found:', memoryId);
            this.showNotification('Memory not found', 'error');
            return;
        }
        
        if (memory.addedBy !== this.currentUser.name) {
            console.error('User not authorized to edit this memory');
            this.showNotification('You can only edit your own memories', 'error');
            return;
        }

        this.currentEditId = memoryId;
        
        // Populate edit form
        document.getElementById('editMemoryId').value = memory.id;
        document.getElementById('editMemoryDate').value = memory.eventDate ? memory.eventDate.split('T')[0] : '';
        document.getElementById('editMemoryTitle').value = memory.title || '';
        document.getElementById('editMemoryDescription').value = memory.description || '';
        document.getElementById('editIsSpecial').checked = memory.isSpecial || false;
        
        this.openModal('editMemoryModal');
    }

    openDeleteModal(memoryId) {
        console.log('Opening delete modal for memory:', memoryId);
        const memory = this.memories.find(m => m.id === memoryId);
        if (!memory) {
            console.error('Memory not found:', memoryId);
            this.showNotification('Memory not found', 'error');
            return;
        }
        
        if (memory.addedBy !== this.currentUser.name) {
            console.error('User not authorized to delete this memory');
            this.showNotification('You can only delete your own memories', 'error');
            return;
        }

        this.currentDeleteId = memoryId;
        this.openModal('deleteModal');
    }

    async saveMemory() {
        const date = document.getElementById('memoryDate').value;
        const title = document.getElementById('memoryTitle').value.trim();
        const description = document.getElementById('memoryDescription').value.trim();
        const isSpecial = document.getElementById('isSpecial').checked;

        if (!date || !title || !description) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const memoryData = {
                eventDate: new Date(date).toISOString(),
                title: title,
                description: description,
                isSpecial: isSpecial,
                addedBy: this.currentUser.name,
                createdAt: new Date().toISOString()
            };

            await window.FirebaseServices.timeline.add(memoryData);
            
            this.closeModal('memoryModal');
            this.showNotification('Memory added successfully! ❤️');
            
        } catch (error) {
            console.error('Error saving memory:', error);
            alert('Failed to save memory: ' + error.message);
        }
    }

    async updateMemory() {
        const memoryId = document.getElementById('editMemoryId').value;
        const date = document.getElementById('editMemoryDate').value;
        const title = document.getElementById('editMemoryTitle').value.trim();
        const description = document.getElementById('editMemoryDescription').value.trim();
        const isSpecial = document.getElementById('editIsSpecial').checked;

        if (!date || !title || !description) {
            alert('Please fill in all fields');
            return;
        }

        try {
            await window.FirebaseServices.timeline.update(memoryId, {
                eventDate: new Date(date).toISOString(),
                title: title,
                description: description,
                isSpecial: isSpecial
            });

            this.closeModal('editMemoryModal');
            this.showNotification('Memory updated successfully! ✨');
            
        } catch (error) {
            console.error('Error updating memory:', error);
            alert('Failed to update memory: ' + error.message);
        }
    }

    async deleteMemory(memoryId) {
        if (!memoryId) return;

        try {
            await window.FirebaseServices.timeline.delete(memoryId);
            
            this.closeModal('deleteModal');
            this.currentDeleteId = null;
            this.showNotification('Memory deleted', 'info');
            
        } catch (error) {
            console.error('Error deleting memory:', error);
            alert('Failed to delete memory: ' + error.message);
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.classList.add('modal-open');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }

    closeAllModals() {
        this.closeModal('memoryModal');
        this.closeModal('editMemoryModal');
        this.closeModal('deleteModal');
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
        const container = document.getElementById('timeline');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <p style="margin-top: 1rem;">${message}</p>
                    <p style="font-size: 0.9rem; color: var(--text-light);">Check console for details</p>
                </div>
            `;
        }
    }

    setupScrollAnimation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.timeline-item').forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'all 0.5s ease-out';
            observer.observe(item);
        });
    }

    // Clean up listener when leaving page
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

// Initialize timeline
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('timeline')) {
        // Make sure auth is initialized first
        if (window.auth && window.auth.getCurrentUser()) {
            window.timeline = new TimelineManager();
        } else {
            // Wait for auth to be ready
            const checkAuth = setInterval(() => {
                if (window.auth && window.auth.getCurrentUser()) {
                    clearInterval(checkAuth);
                    window.timeline = new TimelineManager();
                }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => clearInterval(checkAuth), 5000);
        }
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.timeline) {
        window.timeline.destroy();
    }
});