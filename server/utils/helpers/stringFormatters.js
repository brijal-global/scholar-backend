export function formatTitle(title) {
  // Remove special characters
  let formattedTitle = title.replace(/[^a-zA-Z0-9\s|-]/g, "");

  // Capitalize the first letter of each word
  formattedTitle = formattedTitle
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return formattedTitle;
}

export function slugify({ title, unique = false }) {
  // Convert the title to lowercase
  let slug = title.toLowerCase();

  // Replace spaces and special characters with hyphens
  slug = slug.replace(/[^a-z0-9]+/g, "-");

  // Remove leading and trailing hyphens
  slug = slug.replace(/^-+|-+$/g, "");

  // If unique is true, append the current timestamp
  if (unique) {
    const timestamp = Date.now();
    slug = `${slug}-${timestamp}`;
  }

  return slug;
}

export function generateRandomPassword() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";

  // Generate 10 random characters
  for (let i = 0; i < 10; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  return password;
}
