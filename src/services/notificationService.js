import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';

export const createNotification = async (userId, message, type, projectId, projectTitle) => {
    const notificationsRef = collection(db, 'notifications');
    
    const newNotification = {
        userId,
        type,
        projectId,
        projectTitle,
        message,
        createdAt: serverTimestamp(),
        read: false
    };

    const docRef = await addDoc(notificationsRef, newNotification);
    return docRef.id;
};

export const getUserNotifications = async (userId) => {
    const notificationsRef = collection(db, 'notifications');
    
    // Note: requires a composite index in Firestore for userId + createdAt
    const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    try {
        const querySnapshot = await getDocs(q);
        const notifications = [];
        querySnapshot.forEach((doc) => {
            notifications.push({ id: doc.id, ...doc.data() });
        });
        return notifications;
    } catch (error) {
        if (error.code === 'failed-precondition') {
            console.error("Firestore Index Missing for getUserNotifications. Fallback to client filtering.");
            return await fallbackGetUserNotifications(userId);
        }
        throw error;
    }
};

const fallbackGetUserNotifications = async (userId) => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const notifications = [];
    querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() });
    });
    
    // Client-side sort fallback
    notifications.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
    });
    return notifications;
};
