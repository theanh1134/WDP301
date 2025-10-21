import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../Header';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import conversationService from '../../services/conversationService';
import { io } from 'socket.io-client';

const ChatContainer = styled(Container)`
    margin-top: 2rem;
    margin-bottom: 2rem;
`;

const ChatCard = styled(Card)`
    border: none;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    height: calc(100vh - 200px);
    min-height: 600px;
`;

const ChatRow = styled(Row)`
    height: 100%;
    margin: 0;
`;

const ConversationCol = styled(Col)`
    padding: 0;
    border-right: 1px solid #e9ecef;
    background: #f8f9fa;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: #f1f1f1;
    }

    &::-webkit-scrollbar-thumb {
        background: #b8860b;
        border-radius: 3px;
    }

    @media (max-width: 768px) {
        display: ${props => props.$hide ? 'none' : 'block'};
        position: ${props => props.$hide ? 'static' : 'absolute'};
        width: ${props => props.$hide ? 'auto' : '100%'};
        height: ${props => props.$hide ? 'auto' : '100%'};
        z-index: ${props => props.$hide ? 'auto' : '10'};
    }
`;

const ChatCol = styled(Col)`
    padding: 0;
    display: flex;
    flex-direction: column;
    background: #fff;
    height: 100%;
    max-height: 100%;
    overflow: hidden;

    @media (max-width: 768px) {
        display: ${props => props.$hide ? 'none' : 'flex'};
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 3rem 2rem;
    text-align: center;
    background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);

    svg {
        font-size: 8rem;
        margin-bottom: 2rem;
        color: #b8860b;
        opacity: 0.2;
    }

    h5 {
        color: #2c3e50;
        margin-bottom: 1rem;
        font-size: 1.5rem;
        font-weight: 600;
    }

    p {
        color: #666;
        font-size: 1rem;
        margin: 0 0 2rem 0;
        max-width: 400px;
        line-height: 1.6;
    }
`;

const EmptyStateButton = styled.button`
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #b8860b, #d4af37);
    color: #fff;
    border: none;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(184, 134, 11, 0.3);

    &:hover {
        background: linear-gradient(135deg, #9a7209, #b8960b);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(184, 134, 11, 0.4);
    }

    &:active {
        transform: translateY(0);
    }

    svg {
        margin-right: 0.5rem;
        font-size: 1rem;
        opacity: 1;
    }
`;

function ChatPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || null;
        } catch {
            return null;
        }
    }, []);

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    // Notification sound
    const playNotificationSound = () => {
        try {
            // Create a simple beep sound using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    };

    // Initialize Socket.IO
    useEffect(() => {
        const newSocket = io('http://localhost:9999', {
            transports: ['websocket'],
            reconnection: true
        });

        newSocket.on('connect', () => {
            console.log('✅ Connected to Socket.IO');
            if (user) {
                newSocket.emit('user-online', user._id || user.id);
            }
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Disconnected from Socket.IO');
        });

        // Listen for new messages
        newSocket.on('new-message', (data) => {
            console.log('📨 New message received:', data);
            console.log('📎 Message attachments from socket:', data.message?.attachments);

            // Check if this message is from current user (already added optimistically)
            const senderInfo = data.message?.senderInfo || data.message?.sender;
            const isOwnMessage = senderInfo
                ? (user?.role === 'seller'
                    ? senderInfo.type === 'SHOP_STAFF'
                    : senderInfo.type === 'USER')
                : false;

            // Update conversation list
            loadConversations();

            // Update current conversation if it's the same one and NOT own message
            setSelectedConversation(prev => {
                if (!prev || prev._id !== data.conversationId) return prev;

                // If it's own message, replace the temp message with real one
                if (isOwnMessage) {
                    const messages = [...prev.messages];
                    // Replace the last message (temp) with the real one from server
                    messages[messages.length - 1] = data.message;
                    return {
                        ...prev,
                        messages,
                        lastMessageAt: data.message.deliveredAt,
                        lastMessagePreview: data.message.content
                    };
                } else {
                    // It's from other person, add it
                    // Show notification for new message
                    const senderName = senderInfo?.name || 'Người dùng';
                    const messagePreview = data.message?.content || '[Hình ảnh]';
                    const preview = messagePreview.length > 50
                        ? messagePreview.substring(0, 50) + '...'
                        : messagePreview;

                    // Play notification sound
                    playNotificationSound();

                    toast.success(`💬 ${senderName}: ${preview}`, {
                        position: "top-right",
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true
                    });

                    return {
                        ...prev,
                        messages: [...prev.messages, data.message],
                        lastMessageAt: data.message.deliveredAt,
                        lastMessagePreview: data.message.content
                    };
                }
            });
        });

        // Listen for new message notifications
        newSocket.on('new-message-notification', (data) => {
            console.log('🔔 New message notification:', data);

            // Play notification sound
            playNotificationSound();

            // Show toast notification
            const senderName = data.sender?.name || 'Người dùng';
            const messagePreview = data.message?.content || '[Hình ảnh]';
            const preview = messagePreview.length > 50
                ? messagePreview.substring(0, 50) + '...'
                : messagePreview;

            toast.info(`💬 ${senderName}: ${preview}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                onClick: () => {
                    // Navigate to the conversation when clicking the notification
                    const conversation = conversations.find(c => c._id === data.conversationId);
                    if (conversation) {
                        setSelectedConversation(conversation);
                    }
                }
            });

            loadConversations();
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // Load conversations
    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user]);

    // Handle opening conversation from ProductDetail
    useEffect(() => {
        const openConversationFromProduct = async () => {
            if (location.state?.shopId && user && !loading) {
                try {
                    console.log('Opening conversation from product detail:', {
                        shopId: location.state.shopId,
                        productId: location.state.productId,
                        userId: user._id || user.id
                    });

                    // Get or create conversation
                    const conversation = await conversationService.getOrCreate(
                        user._id || user.id,
                        location.state.shopId,
                        location.state.productId
                    );

                    console.log('Conversation retrieved/created:', conversation);

                    // Reload conversations to include the new one
                    await loadConversations();

                    // Select the conversation
                    setSelectedConversation(conversation);

                    // Join conversation room
                    if (socket) {
                        socket.emit('join-conversation', conversation._id);
                    }

                    // Mark as read
                    const readerType = user?.role === 'seller' ? 'SHOP' : 'BUYER';
                    await conversationService.markAsRead(conversation._id, readerType);

                    // Clear the location state to prevent re-triggering
                    navigate(location.pathname, { replace: true, state: {} });

                    toast.success('Đã mở cuộc trò chuyện với shop!');
                } catch (error) {
                    console.error('Error opening conversation:', error);
                    toast.error('Không thể mở cuộc trò chuyện. Vui lòng thử lại.');
                }
            }
        };

        openConversationFromProduct();
    }, [location.state?.shopId, location.state?.productId, user, loading, socket]);

    const loadConversations = async () => {
        try {
            setLoading(true);

            const userId = user?._id || user?.id;
            console.log('📋 Loading conversations for user:', {
                fullUser: user,
                userId: userId,
                role: user?.role
            });

            if (!userId) {
                console.error('❌ No userId found!');
                setLoading(false);
                return;
            }

            console.log(`🔄 Calling conversationService.getByUserId(${userId})`);

            // Đơn giản: chỉ cần gọi getByUserId - backend sẽ tìm tất cả conversations mà userId tham gia
            const data = await conversationService.getByUserId(userId);

            console.log('✅ Loaded conversations:', data);
            console.log(`📊 Total conversations loaded: ${data?.length || 0}`);

            if (data && data.length > 0) {
                console.log('📋 Conversations details:');
                data.forEach((conv, i) => {
                    console.log(`  ${i + 1}. ID: ${conv._id}`);
                    console.log(`     Buyer: ${conv.buyerId?.fullName || conv.buyerId}`);
                    console.log(`     Shop: ${conv.shopId?.shopName || conv.shopId}`);
                    console.log(`     Messages: ${conv.messages?.length || 0}`);
                });
            }

            setConversations(data);
        } catch (error) {
            console.error('❌ Error loading conversations:', error);
            console.error('Error details:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = async (conversation) => {
        try {
            // Load full conversation details
            const fullConversation = await conversationService.getById(conversation._id);
            setSelectedConversation(fullConversation);

            // Join conversation room
            if (socket) {
                socket.emit('join-conversation', conversation._id);
            }

            // Mark as read
            const readerType = user?.role === 'seller' ? 'SHOP' : 'BUYER';
            await conversationService.markAsRead(conversation._id, readerType);
            
            // Reload conversations to update unread count
            loadConversations();
        } catch (error) {
            console.error('Error selecting conversation:', error);
        }
    };



    const handleSendMessage = async (content, attachments = []) => {
        if (!selectedConversation || (!content.trim() && attachments.length === 0)) return;

        const messageType = attachments.length > 0 ? 'IMAGE' : 'TEXT';

        const senderInfo = user?.role === 'seller'
            ? {
                type: 'SHOP_STAFF',
                shopId: user.shopId,
                name: user.shopName || user.fullName,
                avatar: user.avatar || null
            }
            : {
                type: 'USER',
                userId: user._id || user.id,
                name: user.fullName || user.username,
                avatar: user.avatar || null
            };

        // Optimistic update - add message to UI immediately
        const tempMessage = {
            messageId: new Date().getTime(), // Temporary ID
            senderInfo,
            content,
            messageType,
            attachments,
            deliveredAt: new Date().toISOString(),
            isRead: false
        };

        setSelectedConversation(prev => ({
            ...prev,
            messages: [...prev.messages, tempMessage],
            lastMessageAt: tempMessage.deliveredAt,
            lastMessagePreview: content
        }));

        // Emit via Socket.IO for real-time
        if (socket) {
            socket.emit('send-message', {
                conversationId: selectedConversation._id,
                senderInfo,
                content,
                messageType,
                attachments
            });
        }
    };

    if (!user) {
        return (
            <>
                <Header />
                <Container className="my-5 text-center">
                    <h3>Vui lòng đăng nhập để sử dụng tính năng chat</h3>
                </Container>
            </>
        );
    }

    return (
        <>
            <Header />
            <ChatContainer fluid>
                <ChatCard>
                    <ChatRow>
                        <ConversationCol md={4} $hide={selectedConversation !== null}>
                            <ConversationList
                                conversations={conversations}
                                selectedConversation={selectedConversation}
                                onSelectConversation={handleSelectConversation}
                                loading={loading}
                                userType={user?.role === 'seller' ? 'SHOP' : 'BUYER'}
                            />
                        </ConversationCol>
                        <ChatCol md={8} $hide={selectedConversation === null}>
                            <ChatWindow
                                conversation={selectedConversation}
                                onSendMessage={handleSendMessage}
                                currentUser={user}
                                socket={socket}
                                conversations={conversations}
                                onNavigateHome={() => navigate('/')}
                                onBack={() => setSelectedConversation(null)}
                            />
                        </ChatCol>
                    </ChatRow>
                </ChatCard>
            </ChatContainer>
        </>
    );
}

export default ChatPage;

