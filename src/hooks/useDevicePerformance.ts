import { useState, useEffect } from 'react';

export const useDevicePerformance = () => {
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    const checkPerformance = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isLowEnd = navigator.hardwareConcurrency <= 4;
      const deviceMemory = (navigator as { deviceMemory?: number }).deviceMemory;
      const hasLowMemory = 'deviceMemory' in navigator && deviceMemory !== undefined && deviceMemory <= 4;

      setIsLowPerformance(isMobile || isLowEnd || hasLowMemory);
    };

    checkPerformance();
  }, []);

  return isLowPerformance;
};
