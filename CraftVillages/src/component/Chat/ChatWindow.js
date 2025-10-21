import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import styled from 'styled-components';
import { FaPaperPlane, FaStore, FaUser, FaBox, FaShoppingCart, FaComments, FaArrowLeft, FaImage, FaTimes } from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageHelper';
import conversationService from '../../services/conversationService';

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0; /* Fix for flex overflow */
`;

const ChatHeader = styled.div`
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e9ecef;
    background: #fff;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0; /* Prevent header from shrinking */
`;

const BackButton = styled.button`
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #6c757d;
    cursor: pointer;
    padding: 0.5rem;
    margin-right: 0.5rem;

    &:hover {
        color: #495057;
    }

    @media (max-width: 768px) {
        display: block;
    }
`;

const HeaderAvatar = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    background: #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    svg {
        font-size: 1.5rem;
        color: #999;
    }
`;

const HeaderInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const HeaderName = styled.div`
    font-weight: 600;
    font-size: 1.05rem;
    color: #2c3e50;
    margin-bottom: 0.125rem;
`;

const HeaderMeta = styled.div`
    font-size: 0.85rem;
    color: #666;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    svg {
        font-size: 0.75rem;
    }
`;

const MessagesContainer = styled.div`
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 1.5rem;
    background: #f8f9fa;
    min-height: 0; /* Fix for flex overflow */

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
`;

const MessageGroup = styled.div`
    display: flex;
    flex-direction: ${props => props.$isOwn ? 'column' : 'row'};
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    align-items: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
`;

const MessageAvatar = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    background: #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 0.25rem;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    svg {
        font-size: 1.2rem;
        color: #999;
    }
`;

const MessageContent_Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 70%;
`;

const MessageBubble = styled.div`
    padding: 0.75rem 1rem;
    border-radius: 16px;
    background: ${props => props.$isOwn ? 'linear-gradient(135deg, #b8860b, #d4af37)' : '#fff'};
    color: ${props => props.$isOwn ? '#fff' : '#2c3e50'};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    word-wrap: break-word;
    position: relative;
    border: ${props => props.$isOwn ? 'none' : '1px solid #e9ecef'};

    ${props => props.$isOwn ? `
        border-bottom-right-radius: 4px;
    ` : `
        border-bottom-left-radius: 4px;
    `}
`;

const MessageContent = styled.div`
    font-size: 0.95rem;
    line-height: 1.4;
    white-space: pre-wrap;
`;

const MessageImages = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.5rem;
    margin-top: ${props => props.$hasText ? '0.5rem' : '0'};
    max-width: 400px;
`;

const MessageImage = styled.img`
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
        transform: scale(1.05);
    }
`;

const MessageTime = styled.div`
    font-size: 0.7rem;
    margin-top: 0.25rem;
    opacity: 0.8;
    text-align: ${props => props.$isOwn ? 'right' : 'left'};
`;

const MessageSenderName = styled.div`
    font-size: 0.75rem;
    color: #666;
    margin-bottom: 0.25rem;
    font-weight: 500;
`;

const DateDivider = styled.div`
    text-align: center;
    margin: 1.5rem 0;
    position: relative;
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 1px;
        background: #dee2e6;
    }
    
    span {
        background: #f8f9fa;
        padding: 0.25rem 1rem;
        font-size: 0.8rem;
        color: #666;
        position: relative;
        z-index: 1;
    }
`;

const InputContainer = styled.div`
    padding: 1.25rem 1.5rem;
    border-top: 1px solid #e9ecef;
    background: #fff;
    flex-shrink: 0; /* Prevent input from shrinking */
`;

const InputForm = styled(Form)`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const InputWrapper = styled.div`
    width: 100%;
    position: relative;
`;

const MessageInput = styled(Form.Control)`
    border-radius: 24px;
    border: 2px solid #e9ecef;
    padding: 0.75rem 5rem 0.75rem 1.25rem; /* More padding on right for buttons */
    resize: none;
    max-height: 120px;
    min-height: 52px;
    width: 100%;

    &:focus {
        border-color: #b8860b;
        box-shadow: 0 0 0 0.2rem rgba(184, 134, 11, 0.15);
    }
`;

const InputActions = styled.div`
    position: absolute;
    right: 0.5rem;
    bottom: 0.5rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
`;

const IconButton = styled.button`
    border: none;
    background: none;
    color: #6c757d;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
        background: #f8f9fa;
        color: #b8860b;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        font-size: 1.1rem;
    }
`;

const SendButton = styled(IconButton)`
    background: linear-gradient(135deg, #b8860b, #d4af37);
    color: white;

    &:hover {
        background: linear-gradient(135deg, #9a7209, #b8960b);
        color: white;
    }

    &:disabled {
        background: #e9ecef;
        color: #999;
    }
`;

const HiddenFileInput = styled.input`
    display: none;
`;

const ImagePreviewContainer = styled.div`
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem 0;
    flex-wrap: wrap;
`;

const ImagePreview = styled.div`
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #e9ecef;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const RemoveImageButton = styled.button`
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;

    &:hover {
        background: rgba(0, 0, 0, 0.8);
    }

    svg {
        font-size: 0.75rem;
    }
`;

const TypingIndicator = styled.div`
    padding: 0.5rem 1rem;
    color: #666;
    font-size: 0.85rem;
    font-style: italic;
`;

const ContextInfo = styled.div`
    padding: 0.75rem 1rem;
    background: #fff3cd;
    border-left: 4px solid #ffc107;
    margin-bottom: 1rem;
    border-radius: 4px;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
        color: #856404;
    }

    strong {
        color: #856404;
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
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

function ChatWindow({ conversation, onSendMessage, currentUser, socket, conversations, onNavigateHome, onBack }) {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [conversation?.messages]);

    // Listen for typing indicators
    useEffect(() => {
        if (!socket) return;

        socket.on('user-typing', (data) => {
            if (data.conversationId === conversation._id) {
                setIsTyping(true);
            }
        });

        socket.on('user-stopped-typing', (data) => {
            if (data.conversationId === conversation._id) {
                setIsTyping(false);
            }
        });

        return () => {
            socket.off('user-typing');
            socket.off('user-stopped-typing');
        };
    }, [socket, conversation]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleInputChange = (e) => {
        setMessage(e.target.value);

        // Emit typing indicator
        if (socket && e.target.value.trim()) {
            socket.emit('typing-start', {
                conversationId: conversation._id,
                userInfo: {
                    name: currentUser.fullName || currentUser.shopName,
                    type: currentUser.role === 'seller' ? 'SHOP_STAFF' : 'USER'
                }
            });

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Stop typing after 2 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing-stop', {
                    conversationId: conversation._id
                });
            }, 2000);
        }
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        // Limit to 5 images
        if (selectedImages.length + imageFiles.length > 5) {
            alert('Bạn chỉ có thể gửi tối đa 5 ảnh');
            return;
        }

        // Create preview URLs
        const newImages = imageFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setSelectedImages([...selectedImages, ...newImages]);
    };

    const handleRemoveImage = (index) => {
        const newImages = [...selectedImages];
        URL.revokeObjectURL(newImages[index].preview);
        newImages.splice(index, 1);
        setSelectedImages(newImages);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if ((!message.trim() && selectedImages.length === 0) || sending) return;

        setSending(true);
        try {
            let imageUrls = [];

            // Upload images first if any
            if (selectedImages.length > 0) {
                console.log('📤 Uploading images...');
                const imageFiles = selectedImages.map(img => img.file);
                imageUrls = await conversationService.uploadImages(conversation._id, imageFiles);
                console.log('✅ Images uploaded:', imageUrls);
            }

            // Send message with text and/or images
            if (message.trim() || imageUrls.length > 0) {
                const attachments = imageUrls.map((url, index) => ({
                    fileUrl: url,
                    fileName: `image-${index + 1}.jpg`,
                    fileType: 'image/jpeg'
                }));

                console.log('📎 Attachments to send:', attachments);
                await onSendMessage(message.trim() || '', attachments);
            }

            // Clean up
            selectedImages.forEach(img => URL.revokeObjectURL(img.preview));
            setMessage('');
            setSelectedImages([]);

            // Stop typing indicator
            if (socket) {
                socket.emit('typing-stop', {
                    conversationId: conversation._id
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (date) => {
        const messageDate = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) {
            return 'Hôm nay';
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Hôm qua';
        } else {
            return messageDate.toLocaleDateString('vi-VN');
        }
    };

    const groupMessagesByDate = (messages) => {
        const groups = [];
        let currentDate = null;

        messages.forEach(msg => {
            const msgDate = new Date(msg.deliveredAt).toDateString();
            if (msgDate !== currentDate) {
                groups.push({ type: 'date', date: msg.deliveredAt });
                currentDate = msgDate;
            }
            groups.push({ type: 'message', data: msg });
        });

        return groups;
    };

    const isOwnMessage = (message) => {
        const sender = message.senderInfo || message.sender;
        if (!sender) return false;

        const currentUserId = currentUser?._id || currentUser?.id;

        if (currentUser.role === 'seller') {
            // Nếu là seller, tin nhắn của mình là SHOP_STAFF và shopId phải khớp
            const currentShopId = currentUser?.shopId || currentUser?._id;
            const senderShopId = sender.shopId?._id || sender.shopId;

            return sender.type === 'SHOP_STAFF' &&
                   senderShopId?.toString() === currentShopId?.toString();
        } else {
            // Nếu là buyer, tin nhắn của mình là USER và userId phải khớp
            const senderUserId = sender.userId?._id || sender.userId;

            return sender.type === 'USER' &&
                   senderUserId?.toString() === currentUserId?.toString();
        }
    };

    // If no conversation selected, show empty state
    if (!conversation) {
        return (
            <ChatContainer>
                <MessagesContainer>
                    <EmptyState>
                        <FaComments />
                        <h5>
                            {conversations?.length === 0
                                ? 'Chưa có cuộc trò chuyện nào'
                                : 'Chọn một cuộc trò chuyện'}
                        </h5>
                        <p>
                            {conversations?.length === 0
                                ? 'Hãy bắt đầu trò chuyện với shop bằng cách vào trang sản phẩm và click "Chat với shop"'
                                : 'Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin'}
                        </p>
                        {conversations?.length === 0 && onNavigateHome && (
                            <EmptyStateButton onClick={onNavigateHome}>
                                <FaStore />
                                Khám phá sản phẩm
                            </EmptyStateButton>
                        )}
                    </EmptyState>
                </MessagesContainer>

                <InputContainer>
                    <InputForm onSubmit={(e) => e.preventDefault()}>
                        <InputWrapper>
                            <MessageInput
                                as="textarea"
                                rows={1}
                                placeholder="Chọn một cuộc trò chuyện để bắt đầu nhắn tin..."
                                disabled
                                style={{ cursor: 'not-allowed', opacity: 0.6 }}
                            />
                        </InputWrapper>
                        <SendButton type="button" disabled>
                            <FaPaperPlane />
                        </SendButton>
                    </InputForm>
                </InputContainer>
            </ChatContainer>
        );
    }

    const getDisplayInfo = () => {
        if (currentUser.role === 'seller') {
            return {
                name: conversation.buyerId?.fullName || 'Khách hàng',
                avatar: conversation.buyerId?.avatar,
                icon: <FaUser />
            };
        } else {
            return {
                name: conversation.shopId?.shopName || 'Shop',
                avatar: conversation.shopId?.avatar,
                icon: <FaStore />
            };
        }
    };

    const displayInfo = getDisplayInfo();
    const messageGroups = groupMessagesByDate(conversation.messages || []);

    return (
        <ChatContainer>
            <ChatHeader>
                {onBack && (
                    <BackButton onClick={onBack}>
                        <FaArrowLeft />
                    </BackButton>
                )}
                <HeaderAvatar>
                    {displayInfo.avatar ? (
                        <img src={getImageUrl(displayInfo.avatar)} alt={displayInfo.name} />
                    ) : (
                        displayInfo.icon
                    )}
                </HeaderAvatar>
                <HeaderInfo>
                    <HeaderName>{displayInfo.name}</HeaderName>
                    <HeaderMeta>
                        {conversation.productId && (
                            <>
                                <FaBox />
                                <span>{conversation.productId.productName}</span>
                            </>
                        )}
                        {conversation.orderId && (
                            <>
                                <FaShoppingCart />
                                <span>Đơn hàng #{conversation.orderId._id?.slice(-6)}</span>
                            </>
                        )}
                    </HeaderMeta>
                </HeaderInfo>
            </ChatHeader>

            <MessagesContainer>
                {conversation.productId && (
                    <ContextInfo>
                        <FaBox />
                        <div>
                            <strong>Sản phẩm:</strong> {conversation.productId.productName}
                        </div>
                    </ContextInfo>
                )}

                {messageGroups.map((group, index) => {
                    if (group.type === 'date') {
                        return (
                            <DateDivider key={`date-${index}`}>
                                <span>{formatDate(group.date)}</span>
                            </DateDivider>
                        );
                    }

                    const msg = group.data;
                    const isOwn = isOwnMessage(msg);
                    const sender = msg.senderInfo || msg.sender || {};

                    // Lấy avatar của người gửi
                    const getAvatar = () => {
                        if (isOwn) return null; // Tin nhắn của mình không cần avatar

                        // Nếu là tin nhắn từ shop
                        if (sender.type === 'SHOP_STAFF') {
                            return conversation.shopId?.avatarUrl || null;
                        }
                        // Nếu là tin nhắn từ buyer
                        return conversation.buyerId?.avatarUrl || null;
                    };

                    const avatarUrl = getAvatar();

                    return (
                        <MessageGroup key={msg.messageId} $isOwn={isOwn}>
                            {/* Avatar chỉ hiển thị cho tin nhắn của người kia (bên trái) */}
                            {!isOwn && (
                                <MessageAvatar>
                                    {avatarUrl ? (
                                        <img src={getImageUrl(avatarUrl)} alt={sender.name} />
                                    ) : (
                                        sender.type === 'SHOP_STAFF' ? <FaStore /> : <FaUser />
                                    )}
                                </MessageAvatar>
                            )}

                            <MessageContent_Wrapper>
                                {/* Tên người gửi chỉ hiển thị cho tin nhắn của người kia */}
                                {!isOwn && (
                                    <MessageSenderName>
                                        {sender.name || 'Unknown'}
                                    </MessageSenderName>
                                )}

                                <MessageBubble $isOwn={isOwn}>
                                    {msg.content && <MessageContent>{msg.content}</MessageContent>}

                                    {(() => {
                                        console.log('🖼️ Message attachments:', msg.attachments);
                                        return msg.attachments && msg.attachments.length > 0 && (
                                            <MessageImages $hasText={!!msg.content}>
                                                {msg.attachments.map((attachment, idx) => {
                                                    console.log(`  Attachment ${idx}:`, attachment);
                                                    return attachment.fileUrl && (
                                                        <MessageImage
                                                            key={idx}
                                                            src={getImageUrl(attachment.fileUrl)}
                                                            alt={attachment.fileName || `Attachment ${idx + 1}`}
                                                            onClick={() => window.open(getImageUrl(attachment.fileUrl), '_blank')}
                                                        />
                                                    );
                                                })}
                                            </MessageImages>
                                        );
                                    })()}

                                    <MessageTime $isOwn={isOwn}>
                                        {formatTime(msg.deliveredAt)}
                                    </MessageTime>
                                </MessageBubble>
                            </MessageContent_Wrapper>
                        </MessageGroup>
                    );
                })}

                {isTyping && (
                    <TypingIndicator>
                        {displayInfo.name} đang nhập...
                    </TypingIndicator>
                )}

                <div ref={messagesEndRef} />
            </MessagesContainer>

            <InputContainer>
                {selectedImages.length > 0 && (
                    <ImagePreviewContainer>
                        {selectedImages.map((img, index) => (
                            <ImagePreview key={index}>
                                <img src={img.preview} alt={`Preview ${index + 1}`} />
                                <RemoveImageButton onClick={() => handleRemoveImage(index)}>
                                    <FaTimes />
                                </RemoveImageButton>
                            </ImagePreview>
                        ))}
                    </ImagePreviewContainer>
                )}

                <InputForm onSubmit={handleSubmit}>
                    <InputWrapper>
                        <MessageInput
                            as="textarea"
                            rows={1}
                            placeholder="Nhập tin nhắn..."
                            value={message}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            disabled={sending}
                        />
                        <InputActions>
                            <IconButton
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={sending}
                            >
                                <FaImage />
                            </IconButton>
                            <SendButton
                                type="submit"
                                disabled={(!message.trim() && selectedImages.length === 0) || sending}
                            >
                                {sending ? <Spinner animation="border" size="sm" /> : <FaPaperPlane />}
                            </SendButton>
                        </InputActions>
                        <HiddenFileInput
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                        />
                    </InputWrapper>
                </InputForm>
            </InputContainer>
        </ChatContainer>
    );
}

export default ChatWindow;

