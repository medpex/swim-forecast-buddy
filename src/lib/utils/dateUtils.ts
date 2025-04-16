
/**
 * Checks if a given date falls within the winter break period (September 15th - April 30th)
 */
export const isWinterBreak = (date: Date): boolean => {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // Winter break: September 15th - April 30th
  if (month < 4) { // January (0) to April (3)
    return true;
  } else if (month === 4) { // April
    return day <= 30;
  } else if (month === 8) { // September
    return day >= 15;
  } else if (month > 8) { // October to December
    return true;
  }
  return false;
};

/**
 * Format date with German locale
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
