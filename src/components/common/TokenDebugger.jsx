import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import { getTokenTimeRemaining, formatTimeRemaining } from '../../utils/tokenHelpers';

/**
 * TokenDebugger Component
 * Hiển thị thông tin debug về token (chỉ dùng trong development)
 * Sử dụng: Thêm <TokenDebugger /> vào layout của bạn
 */
const TokenDebugger = () => {
  const { token, refreshToken, tokenExpiresAt, refreshTokenExpiresAt, isAuthenticated } = useAuthStore();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [refreshTimeRemaining, setRefreshTimeRemaining] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    const updateTimer = () => {
      if (token) {
        const remaining = getTokenTimeRemaining(token);
        setTimeRemaining(remaining);
      }

      if (refreshTokenExpiresAt) {
        const remaining = refreshTokenExpiresAt - Date.now();
        setRefreshTimeRemaining(Math.max(0, remaining));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [token, refreshTokenExpiresAt, isAuthenticated]);

  // Chỉ hiển thị trong development
  if (import.meta.env.PROD) return null;
  if (!isAuthenticated) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      padding: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '300px',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
        🔐 Token Debug Info
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        <span style={{ color: '#4ade80' }}>Access Token:</span> {' '}
        <span style={{ color: timeRemaining < 60000 ? '#ef4444' : '#4ade80' }}>
          {formatTimeRemaining(timeRemaining)}
        </span>
      </div>

      <div style={{ marginBottom: '4px' }}>
        <span style={{ color: '#60a5fa' }}>Refresh Token:</span> {' '}
        <span style={{ color: refreshTimeRemaining < 3600000 ? '#ef4444' : '#60a5fa' }}>
          {formatTimeRemaining(refreshTimeRemaining)}
        </span>
      </div>

      <div style={{ 
        marginTop: '8px', 
        paddingTop: '8px', 
        borderTop: '1px solid rgba(255,255,255,0.2)',
        fontSize: '10px',
        color: '#9ca3af'
      }}>
        Token được tự động refresh khi còn &lt; 5 phút
      </div>
    </div>
  );
};

export default TokenDebugger;
