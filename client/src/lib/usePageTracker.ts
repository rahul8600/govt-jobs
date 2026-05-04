import { useEffect, useRef } from 'react';

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('visitor_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    sessionStorage.setItem('visitor_session_id', sessionId);
  }
  return sessionId;
}

export function usePageTracker(page: string, postId?: number) {
  const tracked = useRef(false);
  
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    
    const sessionId = getSessionId();
    
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, postId, sessionId }),
    }).catch(() => {});
  }, [page, postId]);
}
