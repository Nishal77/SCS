/**
 * Canteen Status Utility Functions
 * Handles canteen opening hours and status calculations
 */

// Canteen operating hours (6:00 AM to 7:00 PM)
export const CANTEEN_HOURS = {
  OPEN_HOUR: 6,    // 6:00 AM
  CLOSE_HOUR: 19,  // 7:00 PM
  OPEN_TIME: '6:00 AM',
  CLOSE_TIME: '7:00 PM'
};

/**
 * Check if canteen is currently open
 * @returns {boolean} True if canteen is open
 */
export const isCanteenOpen = () => {
  const now = new Date();
  const currentHour = now.getHours();
  return currentHour >= CANTEEN_HOURS.OPEN_HOUR && currentHour < CANTEEN_HOURS.CLOSE_HOUR;
};

/**
 * Get time until canteen closes (if open) or opens (if closed)
 * @returns {string} Formatted time string
 */
export const getTimeUntilStatusChange = () => {
  const now = new Date();
  const currentHour = now.getHours();
  
  if (isCanteenOpen()) {
    // Calculate time until closing
    const closeTime = new Date(now);
    closeTime.setHours(CANTEEN_HOURS.CLOSE_HOUR, 0, 0, 0);
    const timeDiff = closeTime - now;
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m until closing`;
    } else {
      return `${minutesLeft}m until closing`;
    }
  } else {
    // Calculate time until opening
    let openTime = new Date(now);
    if (currentHour < CANTEEN_HOURS.OPEN_HOUR) {
      // Same day opening
      openTime.setHours(CANTEEN_HOURS.OPEN_HOUR, 0, 0, 0);
    } else {
      // Next day opening
      openTime.setDate(openTime.getDate() + 1);
      openTime.setHours(CANTEEN_HOURS.OPEN_HOUR, 0, 0, 0);
    }
    
    const timeDiff = openTime - now;
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursLeft > 0) {
      return `Opens in ${hoursLeft}h ${minutesLeft}m`;
    } else {
      return `Opens in ${minutesLeft}m`;
    }
  }
};

/**
 * Get compact time string for header display
 * @returns {string} Short time format
 */
export const getCompactTimeUntil = () => {
  const now = new Date();
  const currentHour = now.getHours();
  
  if (isCanteenOpen()) {
    // Calculate time until closing
    const closeTime = new Date(now);
    closeTime.setHours(CANTEEN_HOURS.CLOSE_HOUR, 0, 0, 0);
    const timeDiff = closeTime - now;
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m`;
    } else {
      return `${minutesLeft}m`;
    }
  } else {
    // Calculate time until opening
    let openTime = new Date(now);
    if (currentHour < CANTEEN_HOURS.OPEN_HOUR) {
      // Same day opening
      openTime.setHours(CANTEEN_HOURS.OPEN_HOUR, 0, 0, 0);
    } else {
      // Next day opening
      openTime.setDate(openTime.getDate() + 1);
      openTime.setHours(CANTEEN_HOURS.OPEN_HOUR, 0, 0, 0);
    }
    
    const timeDiff = openTime - now;
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursLeft > 0) {
      return `${hoursLeft}h`;
    } else {
      return `${minutesLeft}m`;
    }
  }
};

/**
 * Get canteen status object with all information
 * @returns {object} Status object with isOpen, timeUntil, and compactTime
 */
export const getCanteenStatus = () => {
  return {
    isOpen: isCanteenOpen(),
    timeUntil: getTimeUntilStatusChange(),
    compactTime: getCompactTimeUntil(),
    openTime: CANTEEN_HOURS.OPEN_TIME,
    closeTime: CANTEEN_HOURS.CLOSE_TIME
  };
};
