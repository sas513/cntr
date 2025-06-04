import { useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

export function useVisitorTracking() {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        await apiRequest('/api/analytics/visitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        // Silently handle tracking errors
        console.log('Visitor tracking initialized');
      }
    };

    // Track visitor on page load
    trackVisitor();
  }, []);
}