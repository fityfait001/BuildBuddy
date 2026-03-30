import { db } from '../firebase/firebase.config';
import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    serverTimestamp,
    updateDoc,
    doc,
    increment 
} from 'firebase/firestore';

// Collection references
const postsCollection = collection(db, 'posts');

/**
 * Creates a new post document
 * @param {Object} postData The data for the post
 * @returns {Promise<string>} The ID of the newly created post
 */
export const createPost = async (postData) => {
    try {
        const docRef = await addDoc(postsCollection, {
            ...postData,
            reactions: { helpful: 0, interesting: 0, cool: 0 },
            commentsCount: 0,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating post: ", error);
        throw error;
    }
};

/**
 * Subscribes to posts in real-time
 * @param {Function} callback Function to handle the posts updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToPosts = (callback) => {
    try {
        const q = query(postsCollection, orderBy('createdAt', 'desc'));
        
        return onSnapshot(q, (querySnapshot) => {
            const posts = [];
            querySnapshot.forEach((doc) => {
                posts.push({ id: doc.id, ...doc.data() });
            });
            callback(posts);
        }, (error) => {
            console.error("Error subscribing to posts: ", error);
            callback([]);
        });
    } catch (error) {
        console.error("Setup error for real-time posts: ", error);
        throw error;
    }
};

/**
 * Adds a comment to a specific post's subcollection and increments its comment count
 * @param {string} postId The ID of the post
 * @param {Object} commentData The data for the comment
 * @returns {Promise<string>} The ID of the newly created comment
 */
export const addComment = async (postId, commentData) => {
    try {
        // 1. Add comment to subcollection
        const commentsRef = collection(db, 'posts', postId, 'comments');
        const docRef = await addDoc(commentsRef, {
            ...commentData,
            createdAt: serverTimestamp()
        });
        
        // 2. Increment commentsCount on main post
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            commentsCount: increment(1)
        });
        
        return docRef.id;
    } catch (error) {
        console.error("Error adding comment: ", error);
        throw error;
    }
};

/**
 * Subscribes to comments for a specific post in real-time
 * @param {string} postId The ID of the post
 * @param {Function} callback Function to handle the comments updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToComments = (postId, callback) => {
    try {
        const commentsRef = collection(db, 'posts', postId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'asc'));
        
        return onSnapshot(q, (querySnapshot) => {
            const comments = [];
            querySnapshot.forEach((doc) => {
                comments.push({ id: doc.id, ...doc.data() });
            });
            callback(comments);
        }, (error) => {
            console.error(`Error subscribing to comments for post ${postId}: `, error);
            callback([]);
        });
    } catch (error) {
        console.error("Setup error for real-time comments: ", error);
        throw error;
    }
};
