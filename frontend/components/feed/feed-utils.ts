export const storyCards = ["card_ppl2.png", "card_ppl3.png", "card_ppl4.png"];

export const formatRelative = (date: string) => {
  const diffMs = Date.now() - new Date(date).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return "just now";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "1m";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;

  const years = Math.floor(days / 365);
  return `${years}y`;
};

export const toName = (u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`.trim();

export const likedByText = (users: Array<{ firstName: string; lastName: string }>) => {
  if (!users.length) return "No likes yet";
  return users.slice(0, 5).map(toName).join(", ");
};

export const isTempEntityId = (id: string) => id.startsWith("temp-");
