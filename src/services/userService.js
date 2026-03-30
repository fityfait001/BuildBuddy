import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';

export const getUserById = async (uid) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { uid: docSnap.id, ...docSnap.data() };
    } else {
        throw new Error('User not found');
    }
};

export const submitUserProfile = async (uid, profileData) => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const payload = {
            ...profileData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            profileCompleted: true
        };

        await setDoc(userDocRef, payload);
        return true;
    } catch (error) {
        console.error("Error creating profile:", error);
        throw error;
    }
};

export const updateUserProfile = async (uid, updatedFields) => {
    try {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
            ...updatedFields,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};
