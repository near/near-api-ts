export const createCircularQueue = <T>(arr: T[]) => {
  const state = {
    items: [...arr],
    current: 0,
  };

  const next = (): T | undefined => {
    if (state.items.length === 0) return undefined;
    const value = state.items[state.current];
    state.current = (state.current + 1) % state.items.length;
    return value;
  };

  const remove = (value: T) => {
    const idx = state.items.indexOf(value);
    if (idx === -1) return false;

    if (
      idx < state.current ||
      (idx === state.current && state.current === state.items.length - 1)
    ) {
      state.current =
        (state.current - 1 + state.items.length) % state.items.length;
    }

    state.items.splice(idx, 1);

    if (state.current >= state.items.length) state.current = 0;
    return true;
  };

  const getAll = (): T[] => [...state.items];

  return {
    next,
    remove,
    getAll,
    size: () => state.items.length,
  };
};
