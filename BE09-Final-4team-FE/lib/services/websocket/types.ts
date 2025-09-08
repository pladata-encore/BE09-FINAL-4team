export type NotificationType =
  | "ANNOUNCEMENT"
  | "APPROVAL_REQUEST"
  | "APPROVAL_APPROVED"
  | "APPROVAL_REJECTED"
  | "APPROVAL_REFERENCE";

export interface NotificationMessage {
  notificationId: number;  // 백엔드에서 전송하는 고유 ID (PK)
  userId: number;
  type: NotificationType;
  content: string;
  referenceId: number;
  createdAt: string;
  // 클라이언트 전용 필드들
  isRead?: boolean;
  channel?: 'personal' | 'broadcast';
}

export type NotificationCallback = (message: NotificationMessage) => void;

export interface WebSocketServiceOptions {
  gatewayUrl: string;
  token: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
}

export interface WebSocketService {
  connect(options: WebSocketServiceOptions): Promise<void>;
  disconnect(): void;
  isConnected(): boolean;
  
  // 개인 알림 구독 (/user/queue/notifications)
  subscribeToPersonalNotifications(callback: NotificationCallback): () => void;
  
  // 공지 알림 구독 (/topic/notifications)
  subscribeToBroadcastNotifications(callback: NotificationCallback): () => void;
  
  // 통합 구독 (두 채널 모두)
  subscribeToAllNotifications(callback: NotificationCallback): () => void;
}