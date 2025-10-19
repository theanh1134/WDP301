const Conversation = require('../models/Conversation');

// Store online users
const onlineUsers = new Map(); // userId -> socketId

function setupChatSocket(io) {
    io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.id);

        // User joins (authenticate)
        socket.on('user-online', (userId) => {
            onlineUsers.set(userId, socket.id);
            socket.userId = userId;
            console.log(`✅ User ${userId} is online (socket: ${socket.id})`);

            // Notify user's conversations that they're online
            socket.broadcast.emit('user-status-change', {
                userId,
                status: 'online'
            });
        });

        // Join conversation room
        socket.on('join-conversation', (conversationId) => {
            socket.join(`conversation-${conversationId}`);
            console.log(`📨 User ${socket.userId} joined conversation ${conversationId}`);
        });

        // Leave conversation room
        socket.on('leave-conversation', (conversationId) => {
            socket.leave(`conversation-${conversationId}`);
            console.log(`👋 User ${socket.userId} left conversation ${conversationId}`);
        });

        // Send message
        socket.on('send-message', async (data) => {
            try {
                console.log('📩 Received send-message event:', data);
                const { conversationId, senderInfo, content, messageType, attachments, replyTo } = data;

                console.log('📎 Attachments received:', attachments);
                console.log('📎 Attachments length:', attachments?.length);

                // Save message to database
                const conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    console.error('❌ Conversation not found:', conversationId);
                    socket.emit('error', { message: 'Conversation not found' });
                    return;
                }

                console.log('✅ Found conversation:', conversation._id);
                console.log('📝 Adding message with senderInfo:', senderInfo);

                const message = await conversation.addMessage(
                    senderInfo,
                    content,
                    messageType || 'TEXT',
                    attachments || [],
                    replyTo || null
                );

                console.log('✅ Message added to DB:', message);
                console.log('📎 Message attachments in DB:', message.attachments);

                // Convert message to plain object to ensure all fields are sent
                const messageToSend = {
                    messageId: message._id || message.messageId,
                    senderInfo: message.sender || message.senderInfo,
                    content: message.content,
                    messageType: message.messageType,
                    attachments: message.attachments || [],
                    deliveredAt: message.deliveredAt,
                    isRead: message.isRead || false
                };

                console.log('📤 Broadcasting message:', messageToSend);

                // Broadcast to all users in conversation room
                io.to(`conversation-${conversationId}`).emit('new-message', {
                    conversationId,
                    message: messageToSend
                });

                console.log(`📤 Broadcasted to room: conversation-${conversationId}`);

                // Send notification to recipient if they're online but not in the room
                const recipientId = senderInfo.type === 'USER'
                    ? (conversation.shopId._id || conversation.shopId).toString()
                    : (conversation.buyerId._id || conversation.buyerId).toString();

                console.log(`🔍 Looking for recipient: ${recipientId}`);
                console.log(`👥 Online users:`, Array.from(onlineUsers.keys()));

                const recipientSocketId = onlineUsers.get(recipientId);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('new-message-notification', {
                        conversationId,
                        message,
                        sender: senderInfo
                    });
                    console.log(`🔔 Sent notification to recipient: ${recipientId}`);
                } else {
                    console.log(`⚠️ Recipient ${recipientId} is not online`);
                }

                console.log(`💬 Message sent in conversation ${conversationId}`);
            } catch (error) {
                console.error('❌ Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message', error: error.message });
            }
        });

        // Typing indicator
        socket.on('typing-start', (data) => {
            const { conversationId, userInfo } = data;
            socket.to(`conversation-${conversationId}`).emit('user-typing', {
                conversationId,
                userInfo
            });
        });

        socket.on('typing-stop', (data) => {
            const { conversationId } = data;
            socket.to(`conversation-${conversationId}`).emit('user-stopped-typing', {
                conversationId
            });
        });

        // Mark messages as read
        socket.on('mark-as-read', async (data) => {
            try {
                const { conversationId, readerType } = data;

                const conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    socket.emit('error', { message: 'Conversation not found' });
                    return;
                }

                await conversation.markAsRead(readerType);

                // Notify other user that messages were read
                socket.to(`conversation-${conversationId}`).emit('messages-read', {
                    conversationId,
                    readerType
                });

                console.log(`✅ Messages marked as read in conversation ${conversationId} by ${readerType}`);
            } catch (error) {
                console.error('Error marking messages as read:', error);
                socket.emit('error', { message: 'Failed to mark messages as read', error: error.message });
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                console.log(`❌ User ${socket.userId} disconnected`);

                // Notify user's conversations that they're offline
                socket.broadcast.emit('user-status-change', {
                    userId: socket.userId,
                    status: 'offline'
                });
            }
        });
    });
}

module.exports = setupChatSocket;

