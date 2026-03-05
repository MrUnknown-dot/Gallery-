// Firebase Configuration - Using compat syntax (working version)
const firebaseConfig = {
    apiKey: "AIzaSyBtZDK-PFicfTaGNm3NkAUwev191cY-RJM",
    authDomain: "chatting-f6db0.firebaseapp.com",
    projectId: "chatting-f6db0",
    storageBucket: "chatting-f6db0.firebasestorage.app",
    messagingSenderId: "991102743547",
    appId: "1:991102743547:web:505a474b980ebe0d14115e",
    measurementId: "G-SGC7990D0R"
};

// Initialize Firebase
let db, messaging;

try {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    
    // Initialize services
    db = firebase.firestore();
    
    console.log('✅ Firebase initialized successfully');
    
} catch (error) {
    console.error('❌ Error initializing Firebase:', error);
}

// Make Firebase services available globally
window.db = db;
window.messagesCollection = db.collection('messages');
window.timelineCollection = db.collection('timeline');

// Predefined users (for authentication)
const ALLOWED_USERS = [
    { name: 'Loki', password: '123' },
    { name: 'Crush', password: '456' }
];

window.ALLOWED_USERS = ALLOWED_USERS;