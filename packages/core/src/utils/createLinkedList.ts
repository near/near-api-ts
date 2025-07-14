// All nodes should have the same type
type Node<T> = {
  value: T;
  next: Node<T> | null;
};

const createNode = <T>(value: T): Node<T> => ({
  value,
  next: null,
});

export const createLinkedList = <T>() => {
  const state = {
    head: null,
    tail: null,
    length: 0,
  };

  const append = (value: T) => {
    const node = createNode(value);

    if (state.head) {
      state.tail.next = node;
      state.tail = node;
    } else {
      state.head = state.tail = node;
    }
    state.length += 1;
  }
};
