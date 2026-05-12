'use client';

import { useEffect, useState } from 'react';

interface ClientAnimationWrapperProps {
  children: React.ReactNode;
  className?: string;
  animationClass?: string;
}

export default function ClientAnimationWrapper({
  children,
  className = '',
  animationClass = '',
}: ClientAnimationWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={`${className} ${isMounted ? animationClass : ''}`}>
      {children}
    </div>
  );
}
