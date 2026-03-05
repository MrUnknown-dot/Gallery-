// Chat Module - Adapted from your chat app's style
class ChatManager {
    constructor() {
        this.currentUser = window.auth.getCurrentUser();
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }
        this.unsubscribe = null;
        this.typingUnsubscribe = null;
        this.typingTimeout = null;
        this.currentRoomId = 'general'; // Default room
        this.init();
    }

    async init() {
        console.log('Initializing ChatManager for user:', this.currentUser.name);
        this.setupChatInterface();
        
        // Small delay to ensure Firebase is ready
        setTimeout(() => {
            this.setupRealtimeListener();
            this.setupTypingListener();
        }, 500);
        
        this.setupNotificationPermission();
    }

    setupChatInterface() {
        const sendBtn = document.getElementById('sendMessage');
        const chatInput = document.getElementById('chatInput');
        const reactionBtn = document.getElementById('reactionBtn');
        const reactionPicker = document.getElementById('reactionPicker');

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            chatInput.addEventListener('input', () => {
                this.updateTypingStatus();
            });
        }

        // Reaction picker
        if (reactionBtn && reactionPicker) {
            reactionBtn.addEventListener('click', () => {
                reactionPicker.style.display = reactionPicker.style.display === 'none' ? 'flex' : 'none';
            });

            document.querySelectorAll('.reaction-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const emoji = e.target.getAttribute('data-emoji');
                    this.addReaction(emoji);
                    reactionPicker.style.display = 'none';
                });
            });

            // Close reaction picker when clicking outside
            document.addEventListener('click', (e) => {
                if (reactionBtn && reactionPicker && 
                    !reactionBtn.contains(e.target) && !reactionPicker.contains(e.target)) {
                    reactionPicker.style.display = 'none';
                }
            });
        }

        // Enable input
        if (chatInput) chatInput.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        if (reactionBtn) reactionBtn.disabled = false;

        // Load welcome message
        this.showWelcomeMessage();
    }

    showWelcomeMessage() {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        
        container.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-heart fa-3x"></i>
                <h3>Welcome to Private Chat 💬</h3>
                <p>Send your first message to start chatting with your crush</p>
            </div>
        `;
    }

    setupRealtimeListener() {
        try {
            console.log('Setting up real-time listener...');
            
            // Listen for real-time updates
            this.unsubscribe = window.FirebaseServices.messages.onSnapshot(
                this.currentRoomId,
                (messages) => {
                    console.log('Received real-time update with', messages.length, 'messages');
                    if (messages.length > 0) {
                        this.displayMessages(messages);
                    }
                }
            );
            
            console.log('Real-time listener setup complete');
        } catch (error) {
            console.error('Error setting up real-time listener:', error);
            // Show error message to user
            const container = document.getElementById('chatMessages');
            if (container) {
                container.innerHTML = `
                    <div class="error-message" style="text-align: center; padding: 2rem; color: #e74c3c;">
                        <i class="fas fa-exclamation-triangle fa-3x"></i>
                        <h3>Connection Error</h3>
                        <p>Unable to connect to chat. Please refresh the page.</p>
                        <p style="font-size: 0.9rem; color: var(--text-light);">${error.message}</p>
                    </div>
                `;
            }
        }
    }

    setupTypingListener() {
        try {
            console.log('Setting up typing listener...');
            
            this.typingUnsubscribe = window.FirebaseServices.typing.onSnapshot(
                this.currentRoomId,
                (typingUsers) => {
                    this.showTypingIndicator(typingUsers);
                }
            );
            
            console.log('Typing listener setup complete');
        } catch (error) {
            console.error('Error setting up typing listener:', error);
        }
    }

    setupNotificationPermission() {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            window.requestNotificationPermission();
        }
    }

    displayMessages(messages) {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        if (!messages || messages.length === 0) {
            this.showWelcomeMessage();
            return;
        }

        // Check if we need to scroll
        const shouldScroll = container.scrollHeight - container.scrollTop < container.clientHeight + 100;
        
        container.innerHTML = messages.map(msg => this.createMessageHTML(msg)).join('');
        
        if (shouldScroll) {
            this.scrollToBottom();
        }
    }

    createMessageHTML(message) {
        const isOwn = message.sender === this.currentUser.name;
        const time = message.timestamp instanceof Date ? 
            message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
            message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';
        
        const avatarLetter = message.sender ? message.sender.charAt(0).toUpperCase() : '?';
        
        return `
            <div class="message ${isOwn ? 'own' : 'other'}" data-id="${message.$id}">
                <div class="message-avatar" style="background: ${isOwn ? 'var(--primary-pink)' : '#5436DA'}">
                    ${avatarLetter}
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-username">${isOwn ? 'You' : message.sender}</span>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-text">${this.escapeHtml(message.text)}</div>
                    <div class="message-reactions" id="reactions-${message.$id}">
                        ${this.renderReactions(message.reactions)}
                    </div>
                    <div class="message-actions">
                        ${isOwn ? `
                            <button class="delete-message-btn" onclick="chat.deleteMessage('${message.$id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderReactions(reactions) {
        if (!reactions) return '';
        return Object.entries(reactions).map(([emoji, users]) => `
            <span class="reaction" onclick="chat.toggleReaction('${emoji}')">
                ${emoji} <span class="reaction-count">${users.length}</span>
            </span>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();

        if (!text) return;

        // Disable send button temporarily
        const sendBtn = document.getElementById('sendMessage');
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }

        try {
            console.log('Sending message:', text);
            
            const message = {
                text: text,
                sender: this.currentUser.name,
                roomId: this.currentRoomId
            };

            await window.FirebaseServices.messages.add(message);
            console.log('Message sent successfully');
            input.value = '';
            
            // Clear typing status
            if (this.typingTimeout) {
                clearTimeout(this.typingTimeout);
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message: ' + error.message);
        } finally {
            // Re-enable send button
            if (sendBtn) {
                sendBtn.disabled = false;
                sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            }
        }
    }

    async deleteMessage(messageId) {
        if (!confirm('Delete this message?')) return;

        try {
            await window.FirebaseServices.messages.delete(messageId);
            console.log('Message deleted:', messageId);
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message: ' + error.message);
        }
    }

    async updateTypingStatus() {
        if (!this.currentUser) return;
        
        try {
            await window.FirebaseServices.typing.setTyping(
                this.currentRoomId,
                this.currentUser.name,
                this.currentUser.name
            );
        } catch (error) {
            console.error('Error updating typing status:', error);
        }
    }

    showTypingIndicator(typingUsers) {
        const indicator = document.getElementById('typingIndicator');
        if (!indicator) return;

        if (typingUsers && typingUsers.length > 0) {
            const filteredUsers = typingUsers.filter(user => user !== this.currentUser.name);
            if (filteredUsers.length > 0) {
                const names = filteredUsers.join(', ');
                indicator.textContent = `${names} ${filteredUsers.length === 1 ? 'is' : 'are'} typing...`;
                indicator.style.display = 'block';
            } else {
                indicator.style.display = 'none';
            }
        } else {
            indicator.style.display = 'none';
        }
    }

    addReaction(emoji) {
        console.log('Reaction added:', emoji);
        // Implement reaction functionality
    }

    toggleReaction(emoji) {
        console.log('Reaction toggled:', emoji);
    }

    scrollToBottom() {
        const container = document.getElementById('chatMessages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    // Clean up listener when leaving page
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
            console.log('Chat listener unsubscribed');
        }
        if (this.typingUnsubscribe) {
            this.typingUnsubscribe();
            console.log('Typing listener unsubscribed');
        }
    }
}

// Initialize chat
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('chatMessages')) {
        // Small delay to ensure Firebase is ready
        setTimeout(() => {
            window.chat = new ChatManager();
        }, 100);
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.chat) {
        window.chat.destroy();
    }
});