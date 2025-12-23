/**
 * Utility functions for task management
 */

/**
 * Gets the primary assignee for a task, handling both legacy and new assignment systems
 * @param {Object} task - The task object
 * @returns {Object|null} The primary assignee object or null if not assigned
 */
export const getPrimaryAssignee = (task) => {
  // Check for new assignees array system first
  if (task.assignees && Array.isArray(task.assignees) && task.assignees.length > 0) {
    return task.assignees[0];
  }
  
  // Fall back to legacy assignee field
  if (task.assignee) {
    return task.assignee;
  }
  
  return null;
};

/**
 * Gets all assignees for a task, handling both legacy and new assignment systems
 * @param {Object} task - The task object
 * @returns {Array} Array of assignee objects
 */
export const getAllAssignees = (task) => {
  // Check for new assignees array system first
  if (task.assignees && Array.isArray(task.assignees)) {
    return task.assignees;
  }
  
  // Fall back to legacy assignee field
  if (task.assignee) {
    return [task.assignee];
  }
  
  return [];
};

/**
 * Gets the assignee display text, showing first assignee and indicating if there are more
 * @param {Object} task - The task object
 * @returns {Object} Object with displayText, hasMultiple, and primaryAssignee
 */
export const getAssigneeDisplayInfo = (task) => {
  const primaryAssignee = getPrimaryAssignee(task);
  const allAssignees = getAllAssignees(task);
  
  if (!primaryAssignee) {
    return {
      displayText: 'Sin asignar',
      hasMultiple: false,
      primaryAssignee: null,
      totalCount: 0
    };
  }
  
  const displayText = `${primaryAssignee.firstName} ${primaryAssignee.lastName}`;
  const hasMultiple = allAssignees.length > 1;
  
  return {
    displayText,
    hasMultiple,
    primaryAssignee,
    totalCount: allAssignees.length
  };
};

/**
 * Checks if a user is assigned to a task, handling both legacy and new assignment systems
 * @param {Object} task - The task object
 * @param {number} userId - The user ID to check
 * @returns {boolean} True if the user is assigned to the task
 */
export const isUserAssignedToTask = (task, userId) => {
  const allAssignees = getAllAssignees(task);
  return allAssignees.some(assignee => assignee.id === userId);
};

/**
 * Gets the assignee ID for legacy compatibility, handling both systems
 * @param {Object} task - The task object
 * @returns {number|null} The primary assignee ID or null if not assigned
 */
export const getAssigneeId = (task) => {
  const primaryAssignee = getPrimaryAssignee(task);
  return primaryAssignee ? primaryAssignee.id : null;
};