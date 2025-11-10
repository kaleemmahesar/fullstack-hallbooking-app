// Utility functions for authentication and role checking

export const getUserRole = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.role || 'operator'; // Default to operator if no role is specified
    } catch (e) {
      return 'operator';
    }
  }
  return 'operator';
};

export const isAdmin = () => {
  return getUserRole() === 'admin';
};

export const isOperator = () => {
  return getUserRole() === 'operator';
};

export const canEdit = () => {
  return isAdmin(); // Only admins can edit for now
};

export const canDelete = () => {
  return isAdmin(); // Only admins can delete for now
};