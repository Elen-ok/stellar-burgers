
import { Middleware } from '@reduxjs/toolkit';

export const socketMiddleware = (): Middleware => {
  return (store) => {
    let socket: WebSocket | null = null;

    return (next) => (action: any) => {
      if (action.type === 'feed/connect') {
        socket = new WebSocket(action.payload);
        
        socket.onopen = () => {
        };
        
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          store.dispatch({ type: 'feed/wsMessage', payload: data });
        };
        
        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        socket.onclose = () => {
        };
      }
      
      if (action.type === 'feed/disconnect' && socket) {
        socket.close();
        socket = null;
      }
      
      return next(action);
    };
  };
};

