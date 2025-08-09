/**
 * Avatar utilities for generating email-based profile pictures
 * Uses Dicebear API for consistent, beautiful avatars
 */

// Generate avatar URL from email using Dicebear API
export const generateAvatarFromEmail = (email, size = 200, style = 'avataaars') => {
  if (!email) return null;
  
  // Create a hash from email for consistent avatar generation
  const emailHash = btoa(email.toLowerCase().trim()).replace(/[^a-zA-Z0-9]/g, '');
  
  // Available styles: avataaars, bottts, fun-emoji, identicon, initials, pixel-art
  const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${emailHash}&size=${size}`;
  
  return avatarUrl;
};

// Generate initials from email or name
export const generateInitials = (email, name = null) => {
  if (name) {
    // Use name if available
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }
  
  if (email) {
    // Use email if no name available
    const emailName = email.split('@')[0];
    if (emailName.length >= 2) {
      return emailName.substring(0, 2).toUpperCase();
    }
    return emailName[0].toUpperCase();
  }
  
  return 'U';
};

// Get display name from user session (prioritize name over email)
export const getDisplayName = (userSession) => {
  if (!userSession) return 'User';
  
  // Priority: name > email_name > email > fallback
  if (userSession.name && userSession.name.trim()) {
    return userSession.name.trim();
  }
  
  if (userSession.email_name && userSession.email_name.trim()) {
    return userSession.email_name.trim();
  }
  
  if (userSession.email && userSession.email.trim()) {
    // Extract name part from email (before @)
    const emailName = userSession.email.split('@')[0];
    // Capitalize first letter and replace dots/underscores with spaces
    return emailName
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
  
  return 'User';
};

// Get display email from user session
export const getDisplayEmail = (userSession) => {
  if (!userSession) return 'user@example.com';
  
  // Priority: email > email_name > fallback
  if (userSession.email && userSession.email.trim()) {
    return userSession.email.trim();
  }
  
  if (userSession.email_name && userSession.email_name.trim()) {
    return userSession.email_name.trim();
  }
  
  return 'user@example.com';
};
