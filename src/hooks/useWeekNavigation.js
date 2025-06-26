import { useState, useCallback } from 'react';
import { navigateWeek as navigateWeekUtil } from '../utils/dateUtils';

export const useWeekNavigation = (initialWeek = new Date()) => {
  const [currentWeek, setCurrentWeek] = useState(initialWeek);

  const navigateWeek = useCallback((direction) => {
    setCurrentWeek(prevWeek => navigateWeekUtil(prevWeek, direction));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeek(new Date());
  }, []);

  const goToSpecificWeek = useCallback((date) => {
    setCurrentWeek(date);
  }, []);

  return {
    currentWeek,
    navigateWeek,
    goToCurrentWeek,
    goToSpecificWeek,
  };
};
