export const getImageURL = function(imagePath) {
  if (!imagePath) return '/placeholder.png';
  if (imagePath.startsWith('http')) return imagePath;
  return (process.env.REACT_APP_API_URL || 'http://localhost:8000') + imagePath;
};