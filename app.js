const STORAGE_KEY = "todo-list-items";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const countEl = document.querySelector(".count");
const clearBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter");

let todos = loadTodos();
let filter = "all";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    done: false,
  });
  input.value = "";
  persistAndRender();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    render();
  });
});

clearBtn.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.done);
  persistAndRender();
});

list.addEventListener("change", (event) => {
  const checkbox = event.target.closest('input[type="checkbox"]');
  if (!checkbox) return;
  const todo = todos.find((item) => item.id === checkbox.dataset.id);
  if (!todo) return;
  todo.done = checkbox.checked;
  persistAndRender();
});

list.addEventListener("click", (event) => {
  const button = event.target.closest(".delete");
  if (!button) return;
  todos = todos.filter((item) => item.id !== button.dataset.id);
  persistAndRender();
});

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  render();
}

function visibleTodos() {
  if (filter === "active") return todos.filter((todo) => !todo.done);
  if (filter === "completed") return todos.filter((todo) => todo.done);
  return todos;
}

function render() {
  const visible = visibleTodos();
  const remaining = todos.filter((todo) => !todo.done).length;
  const completedCount = todos.length - remaining;

  countEl.textContent = `${remaining} task${remaining === 1 ? "" : "s"} left`;
  emptyState.hidden = visible.length > 0;
  emptyState.textContent =
    todos.length === 0
      ? "Nothing here yet. Add your first task above."
      : "No tasks in this view.";
  clearBtn.hidden = completedCount === 0;

  list.innerHTML = visible
    .map(
      (todo) => `
      <li class="todo-item${todo.done ? " is-done" : ""}">
        <label>
          <input type="checkbox" data-id="${todo.id}" ${todo.done ? "checked" : ""} />
          <span class="text">${escapeHtml(todo.text)}</span>
        </label>
        <button type="button" class="delete" data-id="${todo.id}" aria-label="Delete ${escapeHtml(todo.text)}">×</button>
      </li>
    `
    )
    .join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

render();
