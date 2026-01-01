
import React, { useState, useEffect, useRef } from 'react';

interface ViewportAwareProps {
  children: React.ReactNode;
  placeholderHeight?: string;
  className?: string;
}

/**
 * ViewportAware lazy-renders its children only when they enter the viewport.
 * This is crucial for heavy charts and large data lists.
 */
export const ViewportAware: React.FC<ViewportAwareProps> = ({ 
  children, 
  placeholderHeight = '100px',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ minHeight: placeholderHeight }}
    >
      {isVisible ? children : null}
    </div>
  );
};
