// src/utils/user.js

/**
 * Normalize user/learner data into a consistent shape
 * @param {Object} user - raw user object from Firebase/Auth/DB
 * @param {boolean} isAdmin - explicitly mark as admin
 */
export const formatUserData = (user, isAdmin = false) => {
  if (!user) return null;

  return {
    id: user.uid || user.id || null,
    email: user.email || "Unknown",
    name:
      user.name ||
      user.displayName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "User",
    photo:
      user.photoURL ||
      user.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.displayName || user.name || user.email || "User"
      )}`,
    role: isAdmin ? "Admin" : user.role || "Learner",
    isAdmin: !!isAdmin || !!user.isAdmin,
  };
};
