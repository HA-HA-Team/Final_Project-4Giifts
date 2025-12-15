export const initialStore = () => {
  return {
    message: null,
    user: null,
    todos: [
      { id: 1, title: "Make the bed", background: null },
      { id: 2, title: "Do my homework", background: null },
    ],
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return { ...store, message: action.payload };

    case "add_task":
      return {
        ...store,
        todos: store.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...todo, background: action.payload.color }
            : todo
        ),
      };

    case "setUser":
      return { ...store, user: action.payload };

    case "updateUser":
      return { ...store, user: { ...store.user, ...action.payload } };

    case "logout":
      return { ...store, user: null };

    default:
      throw Error("Unknown action.");
  }
}
