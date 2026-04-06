export const storyCards = ["card_ppl2.png", "card_ppl3.png", "card_ppl4.png"];

export const formatRelative = (date: string) => {
  const diffMs = Date.now() - new Date(date).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return "just now";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour ago`;

  const days = Math.floor(hours / 24);
  return `${days} day ago`;
};

export const toName = (u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`.trim();

export const likedByText = (users: Array<{ firstName: string; lastName: string }>) => {
  if (!users.length) return "No likes yet";
  return users.slice(0, 5).map(toName).join(", ");
};

export const isTempEntityId = (id: string) => id.startsWith("temp-");
