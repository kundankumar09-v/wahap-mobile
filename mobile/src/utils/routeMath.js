export const STALL_TYPES = {
  stall: { emoji: '🛍️', color: '#ffffff', label: 'Stall' },
  stage: { emoji: '🎤', color: '#ffea79', label: 'Stage' },
  restroom: { emoji: '🚻', color: '#55efc4', label: 'Restroom' },
  food: { emoji: '🍔', color: '#fab1a0', label: 'Food Court' },
  entry: { emoji: '🚪', color: '#e056fd', label: 'Entry Gate' },
  exit: { emoji: '🏁', color: '#c8d6e5', label: 'Exit' },
  help: { emoji: '🧭', color: '#ffeaa7', label: 'Help Desk' },
};

export const CORRIDOR_SNAPS = [12.5, 37.5, 62.5, 87.5];

export const snapToCorridor = (val) => {
  return CORRIDOR_SNAPS.reduce((prev, curr) =>
    Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
  );
};

export const buildRoutes = (from, to) => {
  if (!from || !to) return [];

  const fromX = Number(from.x);
  const fromY = Number(from.y);
  const toX = Number(to.x);
  const toY = Number(to.y);

  const midX = snapToCorridor((fromX + toX) / 2);
  const midY = snapToCorridor((fromY + toY) / 2);

  // Path 1: horizontal then vertical
  const path1 = [
    { x: fromX, y: fromY },
    { x: midX, y: fromY },
    { x: midX, y: toY },
    { x: toX, y: toY },
  ];

  // Path 2: vertical then horizontal
  const path2 = [
    { x: fromX, y: fromY },
    { x: fromX, y: midY },
    { x: toX, y: midY },
    { x: toX, y: toY },
  ];

  const dx = Math.abs(fromX - toX);
  const dy = Math.abs(fromY - toY);

  return dx > 1 && dy > 1 ? [path1, path2] : [path1];
};
