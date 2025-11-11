import React from 'react';
import styled from 'styled-components';
import { useStaffNotification } from '../../contexts/StaffNotificationContext';

const Badge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    margin-left: 8px;
    animation: ${props => props.pulse ? 'pulse 2s infinite' : 'none'};
    box-shadow: 0 2px 8px rgba(231, 76, 60, 0.4);

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            box-shadow: 0 2px 8px rgba(231, 76, 60, 0.4);
        }
        50% {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.6);
        }
    }
`;

const ConnectionIndicator = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 12px;
    background: ${props => props.connected ? 'rgba(46, 213, 115, 0.1)' : 'rgba(149, 165, 166, 0.1)'};
    font-size: 0.75rem;
    color: ${props => props.connected ? '#27ae60' : '#95a5a6'};
    margin-left: 12px;

    &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${props => props.connected ? '#27ae60' : '#95a5a6'};
        animation: ${props => props.connected ? 'blink 2s infinite' : 'none'};
    }

    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }
`;

const NotificationBadge = ({ showConnectionStatus = false }) => {
    const { pendingReturnsCount, isConnected } = useStaffNotification();

    return (
        <>
            {pendingReturnsCount > 0 && (
                <Badge pulse={pendingReturnsCount > 0}>
                    {pendingReturnsCount > 99 ? '99+' : pendingReturnsCount}
                </Badge>
            )}
            {showConnectionStatus && (
                <ConnectionIndicator connected={isConnected}>
                    {isConnected ? 'Online' : 'Offline'}
                </ConnectionIndicator>
            )}
        </>
    );
};

export default NotificationBadge;

