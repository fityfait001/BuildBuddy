import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import AppNavbar from '../components/layout/AppNavbar';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToChats, subscribeToMessages, sendMessage, markChatAsRead, getChatId } from '../services/messageService';
import { getUserById } from '../services/userService';
import { Send } from 'lucide-react';
import './Messages.css';

export default function Messages() {
    const { currentUser } = useAuth();
    const location = useLocation();
    
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [activeOtherUser, setActiveOtherUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [chatProfiles, setChatProfiles] = useState({});
    
    const messagesEndRef = useRef(null);

    // Initial check for a chat to start/open from navigation state
    useEffect(() => {
        if (location.state?.startChatWith && currentUser) {
            const targetId = location.state.startChatWith;
            const newChatId = getChatId(currentUser.uid, targetId);
            setActiveChatId(newChatId);
            getUserById(targetId).then(user => {
                if (user) setActiveOtherUser(user);
            });
        }
    }, [location.state, currentUser]);

    // Subscribe to Chats list
    useEffect(() => {
        if (!currentUser) return;
        const unsubscribe = subscribeToChats(currentUser.uid, async (fetchedChats) => {
            setChats(fetchedChats);
            
            // Fetch profiles for the 'other' users in these chats
            const profiles = { ...chatProfiles };
            let hasNew = false;
            
            for (const chat of fetchedChats) {
                const otherUid = chat.participants.find(id => id !== currentUser.uid);
                if (otherUid && !profiles[otherUid]) {
                    try {
                        const userProfile = await getUserById(otherUid);
                        if (userProfile) {
                            profiles[otherUid] = userProfile;
                            hasNew = true;
                        }
                    } catch (err) {
                        console.error("Failed to load user profile for chat", err);
                    }
                }
            }
            if (hasNew) setChatProfiles(profiles);
        });
        return () => unsubscribe();
    }, [currentUser]); // Note: omitted chatProfiles from deps to prevent infinite fetch loops

    // Subscribe to active chat messages
    useEffect(() => {
        if (!activeChatId) {
            setMessages([]);
            return;
        }

        const unsubscribe = subscribeToMessages(activeChatId, (msgs) => {
            setMessages(msgs);
            if (currentUser) {
                markChatAsRead(activeChatId, currentUser.uid).catch(console.error);
            }
        });
        
        const activeChatObj = chats.find(c => c.id === activeChatId);
        if (activeChatObj && currentUser) {
            const otherUid = activeChatObj.participants.find(id => id !== currentUser.uid);
            if (otherUid && chatProfiles[otherUid]) {
                setActiveOtherUser(chatProfiles[otherUid]);
            }
        }

        return () => unsubscribe();
    }, [activeChatId, currentUser, chats, chatProfiles]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !activeOtherUser || !currentUser) return;
        
        const textToSend = messageText;
        setMessageText(''); // Optimistic clear
        
        try {
            await sendMessage(currentUser.uid, activeOtherUser.uid, textToSend);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleSelectChat = (chat) => {
        setActiveChatId(chat.id);
        const otherUid = chat.participants.find(id => id !== currentUser.uid);
        if (chatProfiles[otherUid]) {
            setActiveOtherUser(chatProfiles[otherUid]);
        }
        if (currentUser) {
            markChatAsRead(chat.id, currentUser.uid).catch(console.error);
        }
    };

    return (
        <div className="page-wrapper messages-page">
            <AppNavbar />
            
            <div className="messages-layout container">
                {/* Sidebar */}
                <aside className="messages-sidebar sketch-card">
                    <h2 className="sidebar-header handwriting">Conversations</h2>
                    <div className="chats-list">
                        {chats.length === 0 && !activeOtherUser && (
                            <div className="empty-chats text-muted italic p-4 text-center">
                                No conversations yet. Explore projects to find buddies!
                            </div>
                        )}
                        
                        {chats.map(chat => {
                            const otherUid = chat.participants.find(id => id !== currentUser?.uid);
                            const otherProfile = chatProfiles[otherUid];
                            const isUnread = chat.unreadCount?.[currentUser?.uid] > 0;
                            const isActive = activeChatId === chat.id;

                            return (
                                <div 
                                    key={chat.id} 
                                    className={`chat-list-item ${isActive ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                                    onClick={() => handleSelectChat(chat)}
                                >
                                    <div className="chat-avatar">
                                        <img 
                                            src={`https://api.dicebear.com/7.x/micah/svg?seed=${otherProfile?.displayName || 'Unknown'}&backgroundColor=transparent`} 
                                            alt="avatar" 
                                        />
                                        {isUnread && <div className="unread-dot"></div>}
                                    </div>
                                    <div className="chat-summary">
                                        <div className="chat-summary-header">
                                            <h4>{otherProfile?.displayName || 'Loading...'}</h4>
                                        </div>
                                        <p className="chat-last-message">{chat.lastMessage || 'Start a conversation'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Chat Area */}
                <main className="messages-main sketch-card">
                    {!activeChatId && !activeOtherUser ? (
                        <div className="no-chat-selected">
                            <h3 className="handwriting text-2xl text-muted">Select a conversation to start chatting</h3>
                        </div>
                    ) : (
                        <div className="active-chat-container">
                            <div className="active-chat-header">
                                <div className="active-chat-avatar">
                                    <img 
                                        src={`https://api.dicebear.com/7.x/micah/svg?seed=${activeOtherUser?.displayName || 'Unknown'}&backgroundColor=transparent`} 
                                        alt="avatar" 
                                    />
                                </div>
                                <div className="active-chat-info">
                                    <h3>{activeOtherUser?.displayName || 'Loading...'}</h3>
                                    <p>{activeOtherUser?.branch || 'Builder'} at {activeOtherUser?.university || 'BuildBuddy'}</p>
                                </div>
                            </div>

                            <div className="messages-stream">
                                {messages.length === 0 ? (
                                    <div className="text-center text-muted p-6 italic">No messages here yet. Say hi! 👋</div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMine = msg.senderId === currentUser?.uid;
                                        return (
                                            <div key={msg.id || idx} className={`message-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                                                <div className="message-bubble">
                                                    {msg.text}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form className="message-input-area" onSubmit={handleSendMessage}>
                                <input 
                                    type="text" 
                                    className="sketch-input flex-grow"
                                    placeholder="Type your message..."
                                    value={messageText}
                                    onChange={e => setMessageText(e.target.value)}
                                />
                                <button type="submit" className="btn-sketch-action send-btn" disabled={!messageText.trim()}>
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
