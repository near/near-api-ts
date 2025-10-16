type Predicate<V> = (value: V) => boolean;

// TODO fix types
export const addTo = (target: Record<PropertyKey, unknown>) => ({
  field: <V>(
    key: PropertyKey,
    value: V,
    predicate: Predicate<V> = (v) => v !== undefined,
  ) => {
    if (predicate(value)) {
      target[key] = value;
    }
    return addTo(target);
  },
  done: () => target,
});
