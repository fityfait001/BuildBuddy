import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { createNotification } from './notificationService';

// Fetches the latest open projects for the feed
export const getFeedProjects = async (projectsLimit = 20) => {
    try {
        const projectsRef = collection(db, 'projects');
        // For this exact query to work, you may need to build a composite index in the Firebase console
        const q = query(
            projectsRef,
            where('recruiting', '==', true),
            orderBy('createdAt', 'desc'),
            limit(projectsLimit)
        );

        const querySnapshot = await getDocs(q);
        const projects = [];
        querySnapshot.forEach((doc) => {
            projects.push({ id: doc.id, ...doc.data() });
        });

        return projects;
    } catch (error) {
        if (error.code === 'failed-precondition') {
            // This happens if the index is missing. We log it to the console.
            console.error("Firestore Index Missing. Click the link in the console to create it.");
        }
        // Fallback if index fails: query all and filter client side temporarily
        console.warn("Falling back to client side filtering. Create the composite index soon.");
        return await fallbackGetFeedProjects(projectsLimit);
    }
};

const fallbackGetFeedProjects = async (projectsLimit) => {
    const projectsRef = collection(db, 'projects');
    const querySnapshot = await getDocs(projectsRef);
    let projects = [];
    querySnapshot.forEach((doc) => {
        if (doc.data().recruiting === true) {
            projects.push({ id: doc.id, ...doc.data() });
        }
    });
    // Sort descending manually
    projects.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
    return projects.slice(0, projectsLimit);
}

// Create a new project
export const createProject = async (projectData) => {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const projectsRef = collection(db, 'projects');

    // Build the specific schema required by our architecture
    const newProject = {
        ownerId: projectData.ownerId,
        ownerName: projectData.ownerName,
        ownerPhoto: projectData.ownerPhoto || '',
        title: projectData.title,
        shortDescription: projectData.shortDescription || '',
        description: projectData.description,
        teamSize: parseInt(projectData.teamSize) || 4,
        members: [projectData.ownerId],
        openRoles: projectData.openRoles || [],
        recruiting: true,
        requiredSkills: projectData.requiredSkills || [],
        techStack: projectData.techStack || [],
        tags: projectData.tags || [],
        category: projectData.category || 'web',
        difficultyLevel: projectData.difficultyLevel || 'beginner',
        githubRepo: projectData.githubRepo || '',
        liveDemo: projectData.liveDemo || '',
        documentation: projectData.documentation || '',
        figma: projectData.figma || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        likes: 0
    };

    const docRef = await addDoc(projectsRef, newProject);
    return docRef.id;
};

// Fetch a single project by ID
export const getProjectById = async (projectId) => {
    const { doc, getDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        throw new Error("Project not found");
    }
};

// Fetch projects that a user owns or has joined
export const getUserProjects = async (uid) => {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const projectsRef = collection(db, 'projects');

    // We can query array-contains on members field based on how we modeled it
    const q = query(projectsRef, where('members', 'array-contains', uid));
    const querySnapshot = await getDocs(q);

    const projects = [];
    querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
    });

    // Fallback sort client side
    projects.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
    return projects;
};

// Delete a project and handle cleanup/notifications
export const deleteProject = async (projectId, currentUserId) => {
    // 1 Fetch project document
    const projectRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(projectRef);

    if (!docSnap.exists()) {
        throw new Error("Project not found");
    }

    const projectData = docSnap.data();

    // 2 Validate ownership
    if (projectData.ownerId !== currentUserId) {
        throw new Error("Only the project creator can delete this project.");
    }

    // 3 Store these values before deletion
    const projectTitle = projectData.title;
    const members = projectData.members || [];
    const ownerId = projectData.ownerId;

    // 4 Delete the project document
    await deleteDoc(projectRef);

    // 5 Clean up orphaned applications
    const appsRef = collection(db, 'applications');
    let appsToDelete = [];
    
    try {
        const q = query(appsRef, where('projectId', '==', projectId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((appDoc) => {
            appsToDelete.push(appDoc.ref);
        });
    } catch (error) {
        if (error.code === 'failed-precondition') {
            console.warn("Firestore Index Missing for deleting applications. Fallback to client filtering.");
            const querySnapshot = await getDocs(appsRef);
            querySnapshot.forEach((appDoc) => {
                if (appDoc.data().projectId === projectId) {
                    appsToDelete.push(appDoc.ref);
                }
            });
        } else {
            throw error;
        }
    }

    const deletePromises = appsToDelete.map(ref => deleteDoc(ref));
    await Promise.all(deletePromises);

    // 6 Notify members
    const notificationPromises = members.map(memberId => {
        if (memberId !== ownerId) {
            return createNotification(
                memberId,
                `The project "${projectTitle}" was deleted by its creator.`,
                "PROJECT_DELETED",
                projectId,
                projectTitle
            );
        }
        return Promise.resolve();
    });

    await Promise.all(notificationPromises);
};
