// Load state from localStorage
export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('weddingHallState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

// Save state to localStorage
export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('weddingHallState', serializedState);
  } catch (err) {
    // Ignore write errors
    console.error('Failed to save state to localStorage:', err);
  }
};

// Clear state from localStorage
export const clearState = () => {
  try {
    localStorage.removeItem('weddingHallState');
  } catch (err) {
    // Ignore errors
    console.error('Failed to clear state from localStorage:', err);
  }
};