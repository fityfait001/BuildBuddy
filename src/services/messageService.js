import { db } from '../firebase/firebase.config';
import { 
    collection, 
    doc, 
    addDoc, 
    setDoc, 
    updateDoc, 
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    serverTimestamp, 
    getDoc
} from 'firebase/firestore';

/**
 * Helper to generate a consistent chat ID between two users
 */
export const getChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join('_');
};

/**
 * Sends a message and updates or creates the chat document.
 */
export const sendMessage = async (senderId, recipientId, text) => {
    const chatId = getChatId(senderId, recipientId);
    const chatRef = doc(db, 'chats', chatId);

    // 1. Ensure the chat document exists
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
        await setDoc(chatRef, {
            participants: [senderId, recipientId],
            lastMessage: text,
            lastMessageTimestamp: serverTimestamp(),
            unreadCount: {
                [recipientId]: 1,
                [senderId]: 0
            }
        });
    } else {
        // 2. Update existing chat document
        const currentData = chatSnap.data();
        const currentUnread = currentData.unreadCount?.[recipientId] || 0;
        await updateDoc(chatRef, {
            lastMessage: text,
            lastMessageTimestamp: serverTimestamp(),
            [`unreadCount.${recipientId}`]: currentUnread + 1
        });
    }

    // 3. Add the message to the subcollection
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
        senderId,
        text,
        timestamp: serverTimestamp(),
        isRead: false
    });
};

/**
 * Subscribes to all chats a user is part of.
 */
export const subscribeToChats = (userId, callback) => {
    const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTimestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const chats = [];
        snapshot.forEach((doc) => {
            chats.push({ id: doc.id, ...doc.data() });
        });
        callback(chats);
    });
};

/**
 * Subscribes to messages within a specific chat.
 */
export const subscribeToMessages = (chatId, callback) => {
    const q = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        callback(messages);
    });
};

/**
 * Marks a chat as read for a specific user.
 */
export const markChatAsRead = async (chatId, userId) => {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
        [`unreadCount.${userId}`]: 0
    });
};
