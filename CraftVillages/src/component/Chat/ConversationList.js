import React from 'react';
import { Spinner, Badge, Button } from 'react-bootstrap';
import styled from 'styled-components';
import { FaStore, FaUser, FaCircle, FaComments, FaPlus } from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageHelper';

const ListContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const ListHeader = styled.div`
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(184,134,11,0.95), rgba(212,175,55,0.95));
    color: white;
    
    h4 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
    }
    
    p {
        margin: 0.25rem 0 0 0;
        font-size: 0.85rem;
        opacity: 0.9;
    }
`;

const ConversationItem = styled.div`
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e9ecef;
    cursor: pointer;
    transition: all 0.2s;
    background: ${props => props.$active ? '#fff' : 'transparent'};
    position: relative;
    
    &:hover {
        background: #fff;
    }
    
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: #b8860b;
        opacity: ${props => props.$active ? 1 : 0};
        transition: opacity 0.2s;
    }
`;

const ConversationContent = styled.div`
    display: flex;
    gap: 1rem;
    align-items: flex-start;
`;

const Avatar = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    background: #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
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

const OnlineIndicator = styled(FaCircle)`
    position: absolute;
    bottom: 2px;
    right: 2px;
    font-size: 0.75rem;
    color: #28a745;
    background: white;
    border-radius: 50%;
`;

const ConversationInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const ConversationHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
`;

const ConversationName = styled.div`
    font-weight: 600;
    font-size: 0.95rem;
    color: #2c3e50;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ConversationTime = styled.div`
    font-size: 0.75rem;
    color: #999;
    white-space: nowrap;
`;

const ConversationPreview = styled.div`
    font-size: 0.85rem;
    color: ${props => props.$unread ? '#2c3e50' : '#666'};
    font-weight: ${props => props.$unread ? 600 : 400};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.25rem;
`;

const ConversationMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const TypeBadge = styled(Badge)`
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
    background: ${props => {
        switch (props.$type) {
            case 'ORDER_INQUIRY': return '#17a2b8';
            case 'PRODUCT_QUESTION': return '#ffc107';
            case 'COMPLAINT': return '#dc3545';
            case 'RETURN_REFUND': return '#fd7e14';
            default: return '#6c757d';
        }
    }};
`;

const UnreadBadge = styled(Badge)`
    background: #dc3545;
    border-radius: 12px;
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
`;

const EmptyState = styled.div`
    padding: 4rem 2rem;
    text-align: center;
    color: #999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    svg {
        font-size: 4rem;
        margin-bottom: 1.5rem;
        color: #b8860b;
        opacity: 0.15;
    }

    p {
        margin: 0;
        font-size: 0.95rem;
        color: #666;
        line-height: 1.5;
    }
`;

const LoadingState = styled.div`
    padding: 3rem 1.5rem;
    text-align: center;
    color: #999;
`;

const typeLabels = {
    'ORDER_INQUIRY': 'Đơn hàng',
    'PRODUCT_QUESTION': 'Sản phẩm',
    'COMPLAINT': 'Khiếu nại',
    'RETURN_REFUND': 'Đổi trả',
    'GENERAL': 'Chung'
};

const NewChatButton = styled(Button)`
    width: 100%;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #b8860b, #d4af37);
    border: none;
    color: #fff;
    font-weight: 600;
    padding: 0.75rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(184, 134, 11, 0.3);

    &:hover {
        background: linear-gradient(135deg, #9a7209, #b8960b);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(184, 134, 11, 0.4);
    }

    &:active {
        transform: translateY(0);
    }
`;

function ConversationList({ conversations, selectedConversation, onSelectConversation, loading, userType, onNewChat }) {
    const formatTime = (date) => {
        const now = new Date();
        const messageDate = new Date(date);
        const diffMs = now - messageDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút`;
        if (diffHours < 24) return `${diffHours} giờ`;
        if (diffDays < 7) return `${diffDays} ngày`;
        return messageDate.toLocaleDateString('vi-VN');
    };

    const getUnreadCount = (conversation) => {
        return userType === 'SHOP' 
            ? conversation.unreadCount?.shop || 0
            : conversation.unreadCount?.buyer || 0;
    };

    const getDisplayInfo = (conversation) => {
        if (userType === 'SHOP') {
            return {
                name: conversation.buyerId?.fullName || 'Khách hàng',
                avatar: conversation.buyerId?.avatarUrl,
                icon: <FaUser />
            };
        } else {
            return {
                name: conversation.shopId?.shopName || 'Shop',
                avatar: conversation.shopId?.avatarUrl,
                icon: <FaStore />
            };
        }
    };

    if (loading) {
        return (
            <ListContainer>
                <ListHeader>
                    <h4>Tin nhắn</h4>
                    <p>Đang tải...</p>
                </ListHeader>
                <LoadingState>
                    <Spinner animation="border" variant="primary" />
                </LoadingState>
            </ListContainer>
        );
    }

    return (
        <ListContainer>
            <ListHeader>
                <h4>Tin nhắn</h4>
                <p>{conversations.length} cuộc trò chuyện</p>
            </ListHeader>

            {conversations.length === 0 ? (
                <EmptyState>
                    <FaComments />
                    <p>Chưa có cuộc trò chuyện nào</p>
                    {userType === 'BUYER' && (
                        <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                            Nhấn "Chat với shop" ở trang sản phẩm để bắt đầu trò chuyện
                        </p>
                    )}
                </EmptyState>
            ) : (
                conversations.map(conversation => {
                    const displayInfo = getDisplayInfo(conversation);
                    const unreadCount = getUnreadCount(conversation);
                    const isActive = selectedConversation?._id === conversation._id;

                    return (
                        <ConversationItem
                            key={conversation._id}
                            $active={isActive}
                            onClick={() => onSelectConversation(conversation)}
                        >
                            <ConversationContent>
                                <Avatar>
                                    {displayInfo.avatar ? (
                                        <img src={getImageUrl(displayInfo.avatar)} alt={displayInfo.name} />
                                    ) : (
                                        displayInfo.icon
                                    )}
                                    {/* <OnlineIndicator /> */}
                                </Avatar>
                                
                                <ConversationInfo>
                                    <ConversationHeader>
                                        <ConversationName>{displayInfo.name}</ConversationName>
                                        <ConversationTime>
                                            {formatTime(conversation.lastMessageAt)}
                                        </ConversationTime>
                                    </ConversationHeader>
                                    
                                    <ConversationPreview $unread={unreadCount > 0}>
                                        {conversation.lastMessagePreview || 'Chưa có tin nhắn'}
                                    </ConversationPreview>
                                    
                                    <ConversationMeta>
                                        <TypeBadge $type={conversation.conversationType}>
                                            {typeLabels[conversation.conversationType] || 'Chung'}
                                        </TypeBadge>
                                        {unreadCount > 0 && (
                                            <UnreadBadge>{unreadCount}</UnreadBadge>
                                        )}
                                    </ConversationMeta>
                                </ConversationInfo>
                            </ConversationContent>
                        </ConversationItem>
                    );
                })
            )}
        </ListContainer>
    );
}

export default ConversationList;

