import { useEffect, useRef, useCallback } from 'react';
import { wsManager } from '@/lib/websocket';

type WebSocketMessage = {
  type: string;
  [key: string]: any;
};

type WebSocketHandler = (message: WebSocketMessage) => void;

export function useWebSocket() {
  const isConnected = useRef(false);

  useEffect(() => {
    if (!isConnected.current) {
      wsManager.connect();
      isConnected.current = true;
    }

    return () => {
      wsManager.disconnect();
      isConnected.current = false;
    };
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    wsManager.send(message);
  }, []);

  const subscribe = useCallback((type: string, handler: WebSocketHandler) => {
    wsManager.subscribe(type, handler);
    
    return () => {
      wsManager.unsubscribe(type, handler);
    };
  }, []);

  return { send, subscribe };
}

export function useQuestionSubscription(questionId: string | null) {
  const { send, subscribe } = useWebSocket();

  useEffect(() => {
    if (questionId) {
      send({ type: 'subscribe', questionId });
    }
  }, [questionId, send]);

  return { subscribe };
}
