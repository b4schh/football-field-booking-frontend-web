/**
 * Token Monitor Service
 * Automatically monitors token expiration and refreshes token before it expires
 * Prevents SSE disconnection due to expired tokens
 */

class TokenMonitor {
  constructor() {
    this.intervalId = null;
    this.checkInterval = 60000; // Check every 1 minute
    this.refreshBeforeExpiry = 5 * 60 * 1000; // Refresh 5 minutes before expiry
  }

  /**
   * Start monitoring token expiration
   * @param {Function} getAuthState - Function to get auth state
   * @param {Function} refreshToken - Function to refresh token
   */
  start(getAuthState, refreshToken) {
    // Stop any existing monitor
    this.stop();

    console.log('🔍 Token monitor started');

    // Check immediately
    this.checkAndRefresh(getAuthState, refreshToken);

    // Then check periodically
    this.intervalId = setInterval(() => {
      this.checkAndRefresh(getAuthState, refreshToken);
    }, this.checkInterval);
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🔍 Token monitor stopped');
    }
  }

  /**
   * Check token expiry and refresh if needed
   */
  async checkAndRefresh(getAuthState, refreshToken) {
    try {
      const state = getAuthState();
      
      if (!state.isAuthenticated || !state.token || !state.tokenExpiresAt) {
        return;
      }

      const now = Date.now();
      const timeUntilExpiry = state.tokenExpiresAt - now;

      // If token will expire in less than 5 minutes, refresh it
      if (timeUntilExpiry < this.refreshBeforeExpiry && timeUntilExpiry > 0) {
        console.log(`⚠️ Token expiring in ${Math.floor(timeUntilExpiry / 1000 / 60)} minutes, refreshing...`);
        await refreshToken();
      } else if (timeUntilExpiry <= 0) {
        console.log('⚠️ Token already expired, refreshing...');
        await refreshToken();
      }
    } catch (error) {
      console.error('❌ Token monitor error:', error);
    }
  }
}

// Export singleton instance
export const tokenMonitor = new TokenMonitor();

// Make it available globally for API interceptor
if (typeof window !== 'undefined') {
  window.tokenMonitor = tokenMonitor;
}

export default tokenMonitor;
