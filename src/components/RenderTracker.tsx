'use client';

import { useRef, useEffect } from 'react';

interface RenderTrackerProps {
  componentName: string;
  children?: React.ReactNode;
}

export default function RenderTracker({ componentName, children }: RenderTrackerProps) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const rapidRenderDetection = useRef<NodeJS.Timeout>();

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    // 100ms 이내에 5번 이상 렌더링되면 경고
    if (timeSinceLastRender < 100 && renderCount.current % 5 === 0) {
      console.warn(`⚠️ [RenderTracker] ${componentName}: 빠른 렌더링 감지됨 (${renderCount.current}회, ${timeSinceLastRender}ms)`);
    }
    
    // 1초 이내에 20번 이상 렌더링되면 강력한 경고
    if (renderCount.current > 20 && timeSinceLastRender < 1000) {
      console.error(`🔥 [RenderTracker] ${componentName}: 무한 렌더링 루프 가능성! (${renderCount.current}회)`);
      
      // 무한 루프 방지를 위한 강제 지연
      if (rapidRenderDetection.current) {
        clearTimeout(rapidRenderDetection.current);
      }
      
      rapidRenderDetection.current = setTimeout(() => {
        renderCount.current = 0;
      }, 2000);
    }
    
    lastRenderTime.current = now;
    
    // 개발 모드에서만 로깅
    if (process.env.NODE_ENV === 'development' && renderCount.current % 10 === 0) {
      console.log(`📊 [RenderTracker] ${componentName}: ${renderCount.current}회 렌더링됨`);
    }
    
    return () => {
      if (rapidRenderDetection.current) {
        clearTimeout(rapidRenderDetection.current);
      }
    };
  }, [componentName]);

  return <>{children}</>;
} 