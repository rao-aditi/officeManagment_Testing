export const hasPermission = (userPermissions = [], required) => {
  if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
    return false;
  }
  if (Array.isArray(required)) {
    return required.some((key) => userPermissions.includes(key));
  }
  return userPermissions.includes(required);
};

export const hasAllPermissions = (userPermissions = [], required = []) => {
  if (!Array.isArray(required) || required.length === 0) return true;
  return required.every((key) => userPermissions.includes(key));
};
