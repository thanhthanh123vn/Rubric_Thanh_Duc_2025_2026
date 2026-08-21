type StudentObeItem = {
  achievedScore?: number | null;
  totalWeight?: number | null;
};

export const clampObeProgress = (value: number) =>
  Math.round(Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0)));

export const calculateStudentObeProgress = (items?: StudentObeItem[] | null) => {
  if (!Array.isArray(items) || items.length === 0) return 0;
  const achieved = items.reduce((sum, item) => sum + Number(item.achievedScore || 0), 0);
  const totalWeight = items.reduce((sum, item) => sum + Number(item.totalWeight || 0), 0);
  return totalWeight > 0 ? clampObeProgress(achieved / totalWeight * 100) : 0;
};
