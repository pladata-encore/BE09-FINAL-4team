import SockJS from 'sockjs-client';
import { Stomp, Frame, Client } from '@stomp/stompjs';
import {
  WebSocketService,
  WebSocketServiceOptions,
  NotificationCallback,
  NotificationMessage
} from './types';

class WebSocketServiceImpl implements WebSocketService {
  private stompClient: Client | null = null;
  private connected = false;
  private subscriptions = new Map<string, any>();
  private options: WebSocketServiceOptions | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private authToken: string | null = null;

  async connect(options: WebSocketServiceOptions): Promise<void> {
    this.options = options;
    this.authToken = options.token; // 토큰 저장
    
    return new Promise((resolve, reject) => {
      try {
        // SockJS 연결 (쿼리 파라미터 없이)
        const wsUrl = `${options.gatewayUrl}/ws`;
        console.log('🔗 WebSocket URL:', wsUrl);
        
        this.stompClient = Stomp.over(() => new SockJS(wsUrl));

        // 디버그 모드 설정 (항상 활성화)
        this.stompClient.debug = (str) => {
          console.log('STOMP Debug:', str);
        };

        // STOMP Heartbeat 설정 (30초 간격)
        this.stompClient.heartbeatOutgoing = 30000; // 클라이언트 → 서버
        this.stompClient.heartbeatIncoming = 30000; // 서버 → 클라이언트

        // 연결 시도 (STOMP 헤더에 토큰 포함)
        this.stompClient.connect(
          { 
            'Authorization': `Bearer ${options.token}`,
            'X-Auth-Token': options.token
          },
          (frame: Frame) => {
            this.connected = true;
            this.reconnectAttempts = 0;
            console.log('✅ WebSocket Connected Successfully:', frame);
            console.log('🔑 Using Token:', options.token.substring(0, 20) + '...');
            console.log('🌐 Gateway URL:', options.gatewayUrl);
            resolve();
          },
          (error: any) => {
            this.connected = false;
            console.error('❌ WebSocket Connection Error:', error);
            console.log('🔑 Failed Token:', options.token.substring(0, 20) + '...');
            console.log('🌐 Failed URL:', options.gatewayUrl);
            this.attemptReconnect();
            reject(error);
          }
        );

        // 연결 해제 이벤트 처리
        this.stompClient.onWebSocketClose = (event) => {
          this.connected = false;
          if (options.debug) {
            console.log('WebSocket Disconnected:', event);
          }
          this.attemptReconnect();
        };

      } catch (error) {
        console.error('WebSocket Setup Error:', error);
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (!this.options) return;
    
    const maxAttempts = this.options.maxReconnectAttempts || 15;
    
    if (this.reconnectAttempts < maxAttempts) {
      this.reconnectAttempts++;
      
      // Exponential Backoff + Jitter 계산
      const baseDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
      const jitter = Math.random() * 0.3 * baseDelay; // 0-30% jitter
      const delay = baseDelay + jitter;
      
      if (this.options.debug) {
        console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${maxAttempts}) - delay: ${Math.round(delay)}ms`);
      }

      this.reconnectTimer = setTimeout(() => {
        this.connect(this.options!)
          .then(() => {
            console.log(`✅ Reconnected successfully after ${this.reconnectAttempts} attempts`);
            // 재연결 성공 시 카운트 초기화
            this.reconnectAttempts = 0;
          })
          .catch((error) => {
            console.error(`❌ Reconnection attempt ${this.reconnectAttempts} failed:`, error);
          });
      }, delay);
    } else {
      console.error(`💀 Max reconnection attempts (${maxAttempts}) reached. Giving up.`);
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // 모든 구독 해제
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();

    // STOMP 클라이언트 연결 해제
    if (this.stompClient && this.connected) {
      this.stompClient.disconnect();
    }

    this.connected = false;
    this.stompClient = null;
  }

  isConnected(): boolean {
    return this.connected && this.stompClient !== null;
  }

  subscribeToPersonalNotifications(callback: NotificationCallback): () => void {
    if (!this.stompClient || !this.connected) {
      console.error('❌ Personal subscription failed: WebSocket not connected');
      throw new Error('WebSocket is not connected');
    }

    console.log('🔔 Subscribing to personal notifications: /user/queue/notifications');
    
    const subscription = this.stompClient.subscribe(
      '/user/queue/notifications',
      (message) => {
        console.log('📩 Personal notification received:', message);
        try {
          const notification: NotificationMessage = {
            ...JSON.parse(message.body),
            channel: 'personal' as const
          };
          console.log('✅ Parsed personal notification:', notification);
          callback(notification);
        } catch (error) {
          console.error('❌ Error parsing personal notification:', error);
          console.log('Raw message body:', message.body);
        }
      },
      {
        'Authorization': `Bearer ${this.authToken}`
      }
    );

    this.subscriptions.set('personal', subscription);
    console.log('✅ Personal subscription successful');

    return () => {
      console.log('🔕 Unsubscribing from personal notifications');
      subscription.unsubscribe();
      this.subscriptions.delete('personal');
    };
  }

  subscribeToBroadcastNotifications(callback: NotificationCallback): () => void {
    if (!this.stompClient || !this.connected) {
      console.error('❌ Broadcast subscription failed: WebSocket not connected');
      throw new Error('WebSocket is not connected');
    }

    console.log('📢 Subscribing to broadcast notifications: /topic/announcements');
    
    const subscription = this.stompClient.subscribe(
      '/topic/announcements',
      (message) => {
        console.log('📩 Broadcast notification received:', message);
        try {
          const notification: NotificationMessage = {
            ...JSON.parse(message.body),
            channel: 'broadcast' as const
          };
          console.log('✅ Parsed broadcast notification:', notification);
          callback(notification);
        } catch (error) {
          console.error('❌ Error parsing broadcast notification:', error);
          console.log('Raw message body:', message.body);
        }
      },
      {
        'Authorization': `Bearer ${this.authToken}`
      }
    );

    this.subscriptions.set('broadcast', subscription);
    console.log('✅ Broadcast subscription successful');

    return () => {
      console.log('🔕 Unsubscribing from broadcast notifications');
      subscription.unsubscribe();
      this.subscriptions.delete('broadcast');
    };
  }

  subscribeToAllNotifications(callback: NotificationCallback): () => void {
    console.log('🚀 Subscribing to all notification channels');
    
    const unsubscribePersonal = this.subscribeToPersonalNotifications(callback);
    const unsubscribeBroadcast = this.subscribeToBroadcastNotifications(callback);

    console.log('✅ All notification subscriptions completed');
    
    return () => {
      console.log('🛑 Unsubscribing from all notification channels');
      unsubscribePersonal();
      unsubscribeBroadcast();
    };
  }
}

// 싱글톤 인스턴스 생성
export const webSocketService: WebSocketService = new WebSocketServiceImpl();