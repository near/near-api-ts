export type CircularQueue<V> = {
  next: () => V;
  size: number;
};

export const createCircularQueue = <V>(arr: V[]): CircularQueue<V> => {
  const state = {
    items: [...arr],
    current: 0,
  };

  const next = () => {
    const value = state.items[state.current];
    state.current = (state.current + 1) % state.items.length;
    return value;
  };

  return {
    next,
    size: state.items.length,
  };
};
