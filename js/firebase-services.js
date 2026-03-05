// Firebase Services Helper - Using compat syntax
const FirebaseServices = {
    // Messages Collection
    messages: {
        async getAll(roomId = 'general') {
            try {
                const snapshot = await db.collection('messages')
                    .where('roomId', '==', roomId)
                    .orderBy('timestamp', 'asc')
                    .get();
                
                return snapshot.docs.map(doc => ({
                    $id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate() || new Date()
                }));
            } catch (error) {
                console.error('Error getting messages:', error);
                return [];
            }
        },

        async add(messageData) {
            try {
                const docRef = await db.collection('messages').add({
                    ...messageData,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    reactions: {}
                });
                
                console.log('Message added with ID:', docRef.id);
                return { $id: docRef.id, ...messageData };
            } catch (error) {
                console.error('Error adding message:', error);
                throw error;
            }
        },

        async delete(messageId) {
            try {
                await db.collection('messages').doc(messageId).delete();
                console.log('Message deleted:', messageId);
            } catch (error) {
                console.error('Error deleting message:', error);
                throw error;
            }
        },

        onSnapshot(roomId, callback) {
            try {
                return db.collection('messages')
                    .where('roomId', '==', roomId || 'general')
                    .orderBy('timestamp', 'asc')
                    .onSnapshot(
                        (snapshot) => {
                            const messages = snapshot.docs.map(doc => ({
                                $id: doc.id,
                                ...doc.data(),
                                timestamp: doc.data().timestamp?.toDate() || new Date()
                            }));
                            callback(messages);
                        },
                        (error) => {
                            console.error('Error in real-time listener:', error);
                        }
                    );
            } catch (error) {
                console.error('Error setting up snapshot listener:', error);
                throw error;
            }
        }
    },

    // Typing Status
    typing: {
        async setTyping(roomId, userId, userName) {
            try {
                await db.collection('typing').add({
                    roomId: roomId,
                    userId: userId,
                    userName: userName,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (error) {
                console.error('Error setting typing status:', error);
            }
        },

        onSnapshot(roomId, callback) {
            try {
                return db.collection('typing')
                    .where('roomId', '==', roomId)
                    .orderBy('timestamp', 'desc')
                    .onSnapshot(
                        (snapshot) => {
                            const typingUsers = [];
                            const now = new Date();
                            
                            snapshot.forEach((doc) => {
                                const data = doc.data();
                                const typingTime = data.timestamp?.toDate();
                                if (typingTime && (now - typingTime) < 3000) {
                                    if (!typingUsers.includes(data.userName)) {
                                        typingUsers.push(data.userName);
                                    }
                                }
                            });
                            callback(typingUsers);
                        },
                        (error) => {
                            console.error('Error in typing listener:', error);
                        }
                    );
            } catch (error) {
                console.error('Error in typing listener:', error);
                return () => {};
            }
        }
    },

    // Timeline Collection
    timeline: {
        async getAll() {
            try {
                const snapshot = await db.collection('timeline')
                    .orderBy('eventDate', 'desc')
                    .get();
                
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (error) {
                console.error('Error getting timeline events:', error);
                return [];
            }
        },

        async add(memoryData) {
            try {
                const docRef = await db.collection('timeline').add({
                    ...memoryData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('Timeline memory added:', docRef.id);
                return docRef.id;
            } catch (error) {
                console.error('Error adding timeline event:', error);
                throw error;
            }
        },

        async update(id, data) {
            try {
                await db.collection('timeline').doc(id).update({
                    ...data,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('Timeline memory updated:', id);
            } catch (error) {
                console.error('Error updating timeline event:', error);
                throw error;
            }
        },

        async delete(id) {
            try {
                await db.collection('timeline').doc(id).delete();
                console.log('Timeline memory deleted:', id);
            } catch (error) {
                console.error('Error deleting timeline event:', error);
                throw error;
            }
        },

        onSnapshot(callback) {
            try {
                return db.collection('timeline')
                    .orderBy('eventDate', 'desc')
                    .onSnapshot(
                        (snapshot) => {
                            const memories = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            }));
                            callback(memories);
                        },
                        (error) => {
                            console.error('Error in timeline listener:', error);
                        }
                    );
            } catch (error) {
                console.error('Error setting up timeline listener:', error);
                return () => {};
            }
        }
    }
};

window.FirebaseServices = FirebaseServices;
console.log('Firebase Services loaded with compat syntax');