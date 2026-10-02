import { API_URL } from "../config/api";

export const getImageUrl = (
  imagePath?: string | null
) => {
  if (!imagePath) {
    return null;
  }

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  return `${API_URL}${imagePath}`;
};
