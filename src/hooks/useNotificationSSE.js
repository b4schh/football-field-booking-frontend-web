import { useEffect, useRef } from "react";
import { useAuthStore } from "../store";
import useNotificationStore from "../store/notificationStore";

/**
 * Custom hook để quản lý Server-Sent Events connection cho notifications
 * Tự động kết nối/ngắt khi user login/logout
 * Sử dụng fetch API với ReadableStream để support Authorization header
 * Tự động refresh token nếu token sắp hết hạn trước khi reconnect
 */
export const useNotificationSSE = () => {
  const { isAuthenticated, token, checkAuth, refreshAccessToken } = useAuthStore();
  const { addNotification, setConnected } = useNotificationStore();
  const abortControllerRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const readerRef = useRef(null);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    // Chỉ kết nối khi đã đăng nhập
    if (!isAuthenticated || !token) {
      disconnectSSE();
      return;
    }

    connectSSE();

    // Cleanup khi unmount hoặc logout
    return () => {
      disconnectSSE();
    };
  }, [isAuthenticated, token]);

  const connectSSE = async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      console.log("⏳ Already connecting to SSE, skipping...");
      return;
    }

    isConnectingRef.current = true;

    // Đóng connection cũ nếu có
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      // Check and refresh token if needed before connecting
      const isValid = await checkAuth();
      if (!isValid) {
        console.log("❌ Token validation failed, cannot connect to SSE");
        isConnectingRef.current = false;
        return;
      }

      // Get fresh token after validation/refresh
      const currentToken = useAuthStore.getState().token;
      if (!currentToken) {
        console.log("❌ No token available after validation");
        isConnectingRef.current = false;
        return;
      }

      const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost/api";
      const sseURL = `${baseURL}/sse/stream`;
      
      console.log("🔌 Connecting to SSE:", sseURL);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const response = await fetch(sseURL, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${currentToken}`,
        },
        signal: abortController.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log("🔄 SSE 401 - Token expired, refreshing and retrying...");
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            isConnectingRef.current = false;
            // Retry with new token
            setTimeout(() => connectSSE(), 1000);
            return;
          } else {
            throw new Error("Failed to refresh token");
          }
        }
        throw new Error(`SSE connection failed: ${response.status}`);
      }

      console.log("✅ SSE Connected");
      setConnected(true);
      isConnectingRef.current = false;

      // Clear reconnect timeout nếu có
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Đọc stream
      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log("📡 SSE stream ended");
          break;
        }

        // Decode chunk và thêm vào buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Xử lý các event trong buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Giữ lại dòng chưa hoàn chỉnh

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              // Ignore SSE 'connected' ping message
              if (data.msg === 'connected') {
                console.log("✅ SSE Connected (ping received)");
                continue;
              }
              
              // Only add real notifications (must have id and title)
              if (data.id && data.title) {
                addNotification(data);
                console.log("📬 New notification:", data);
              }
            } catch (error) {
              console.error("❌ Error parsing SSE data:", error);
            }
          }
        }
      }
    } catch (error) {
      isConnectingRef.current = false;

      if (error.name === 'AbortError') {
        console.log("🔌 SSE connection aborted");
        return;
      }

      console.error("❌ SSE Error:", error);
      setConnected(false);

      // Reconnect sau 5 giây nếu vẫn authenticated
      if (isAuthenticated && token) {
        console.log("🔄 Reconnecting SSE in 5s...");
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSSE();
        }, 5000);
      }
    }
  };

  const disconnectSSE = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }

    setConnected(false);
    console.log("🔌 SSE Disconnected");

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };
};

export default useNotificationSSE;
