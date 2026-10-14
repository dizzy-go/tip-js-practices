import { demoTasks, variantTasks } from "./data.js";
import {
  findTaskById,
  setTaskCompleted,
  removeTask,
  addTask,
  updateTask,
} from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import { renderTaskList, renderSummary, renderEmptyState } from "./task-view.js";
import { validateTaskDraft } from "./form-validation.js";
import { loadTasks, saveTasks, removeSavedTasks } from "./task-storage.js";

const params = new URLSearchParams(window.location.search);
const useVariant = params.get("dataset") === "variant";

const initialTasks = useVariant ? variantTasks : demoTasks;
const storageKey = useVariant
  ? "tip-js-practice-04:variant"
  : "tip-js-practice-04:demo";

let currentTasks = [];
let currentFilter = "all";
let editingId = null;

const listElement = document.querySelector("#task-list");
const summaryElement = document.querySelector("#task-summary");
const emptyMessage = document.querySelector("#empty-message");
const filterContainer = document.querySelector("#filters");
const operationMessage = document.querySelector("#operation-message");
const statusMessage = document.querySelector("#status-message");

const form = document.querySelector("#task-form");
const idInput = form.querySelector('[name="id"]');
const titleInput = form.querySelector('[name="title"]');
const prioritySelect = form.querySelector('[name="priority"]');
const formTitle = document.querySelector("#form-title");
const submitButton = form.querySelector('button[type="submit"]');
const cancelButton = document.querySelector("#cancel-edit");
const resetButton = document.querySelector("#reset-storage");

const errorElements = {
  id: document.querySelector("#error-id"),
  title: document.querySelector("#error-title"),
  priority: document.querySelector("#error-priority"),
};

function setMessage(element, text, isError = false) {
  if (!element) return;
  element.textContent = text || "";
  element.classList.toggle("is-error", Boolean(isError));
}

function clearFormErrors() {
  for (const el of Object.values(errorElements)) {
    if (el) el.textContent = "";
  }
}

function showFormErrors(errors) {
  clearFormErrors();
  for (const [field, message] of Object.entries(errors)) {
    const el = errorElements[field];
    if (el) el.textContent = message;
  }
}

function setFormMode(id) {
  clearFormErrors();
  setMessage(operationMessage, "");

  if (id === null) {
    editingId = null;
    form.reset();
    idInput.disabled = false;
    formTitle.textContent = "Добавление задачи";
    submitButton.textContent = "Добавить задачу";
    cancelButton.hidden = true;
    idInput.focus();
    return;
  }

  const task = findTaskById(currentTasks, id);
  if (!task) {
    setMessage(operationMessage, "Задача не найдена", true);
    return;
  }

  editingId = id;
  idInput.value = String(task.id);
  idInput.disabled = true;
  titleInput.value = task.title;
  prioritySelect.value = task.priority;
  formTitle.textContent = "Редактирование задачи";
  submitButton.textContent = "Сохранить изменения";
  cancelButton.hidden = false;
  titleInput.focus();
}

function persistAndRender(successMessage) {
  const saveResult = saveTasks(localStorage, storageKey, currentTasks);
  if (!saveResult.ok) {
    setMessage(
      statusMessage,
      `Изменения сохранены в памяти, но запись недоступна: ${saveResult.error}`,
      true
    );
  } else {
    setMessage(statusMessage, successMessage || "Сохранено");
  }
  renderApp();
}

export function renderApp() {
  const visibleTasks = getVisibleTasks(currentTasks, currentFilter);
  renderTaskList(listElement, visibleTasks);
  renderSummary(summaryElement, currentTasks, visibleTasks.length);
  renderEmptyState(emptyMessage, currentTasks.length, visibleTasks.length);

  filterContainer.querySelectorAll("button[data-filter]").forEach((btn) => {
    const isActive = btn.dataset.filter === currentFilter;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function restoreTaskFocus(id, action) {
  const card = listElement.querySelector(`li[data-task-id="${id}"]`);
  if (card) {
    const button = card.querySelector(`button[data-action="${action}"]`);
    if (button) {
      button.focus();
      return;
    }
  }
  const activeFilter = filterContainer.querySelector("button.is-active");
  if (activeFilter) activeFilter.focus();
}

export function handleTaskListClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-action]");
  if (!button || !listElement.contains(button)) return;

  const action = button.dataset.action;
  if (!["toggle", "edit", "delete"].includes(action)) return;

  const card = button.closest("li[data-task-id]");
  if (!card) return;

  const id = Number(card.dataset.taskId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    setMessage(operationMessage, "Некорректный идентификатор задачи", true);
    return;
  }

  const task = findTaskById(currentTasks, id);
  if (!task) {
    setMessage(operationMessage, "Задача не найдена", true);
    return;
  }

  if (action === "edit") {
    setFormMode(id);
    return;
  }

  let result;
  if (action === "toggle") {
    result = setTaskCompleted(currentTasks, id, !task.completed);
  } else {
    result = removeTask(currentTasks, id);
  }

  if (!result.ok) {
    setMessage(operationMessage, result.error, true);
    return;
  }

  currentTasks = result.tasks;

  if (action === "delete" && editingId === id) {
    setFormMode(null);
  }

  persistAndRender(action === "toggle" ? "Статус обновлён" : "Задача удалена");
  restoreTaskFocus(id, action);
}

export function handleFilterClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-filter]");
  if (!button || !filterContainer.contains(button)) return;

  const filter = button.dataset.filter;
  if (!["all", "pending", "completed"].includes(filter)) return;

  currentFilter = filter;
  setMessage(operationMessage, "");
  renderApp();
}

export function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const draft = {
    id: formData.get("id"),
    title: formData.get("title"),
    priority: formData.get("priority"),
  };

  const validation = validateTaskDraft(draft, currentTasks, editingId);
  if (!validation.ok) {
    showFormErrors(validation.errors);
    return;
  }

  clearFormErrors();

  const { id, title, priority } = validation.value;

  let result;
  if (editingId === null) {
    result = addTask(currentTasks, id, title, priority);
  } else {
    result = updateTask(currentTasks, editingId, title, priority);
  }

  if (!result.ok) {
    setMessage(operationMessage, result.error, true);
    return;
  }

  currentTasks = result.tasks;
  const wasEditing = editingId !== null;
  setFormMode(null);
  persistAndRender(wasEditing ? "Задача обновлена" : "Задача добавлена");
}

export function handleReset() {
  const removal = removeSavedTasks(localStorage, storageKey);
  if (!removal.ok) {
    setMessage(statusMessage, `Не удалось удалить запись: ${removal.error}`, true);
  }

  currentTasks = initialTasks.map((task) => ({ ...task }));
  currentFilter = "all";
  setFormMode(null);
  setMessage(statusMessage, "Сохранённые данные сброшены");
  renderApp();
}

form.addEventListener("submit", handleFormSubmit);
form.addEventListener("input", (event) => {
  const field = event.target.name;
  if (field && errorElements[field]) {
    errorElements[field].textContent = "";
  }
});

listElement.addEventListener("click", handleTaskListClick);
filterContainer.addEventListener("click", handleFilterClick);
cancelButton.addEventListener("click", () => setFormMode(null));
resetButton.addEventListener("click", handleReset);

const loaded = loadTasks(localStorage, storageKey, initialTasks);
currentTasks = loaded.tasks;

if (!loaded.ok) {
  setMessage(statusMessage, loaded.error, true);
} else if (loaded.source === "storage") {
  setMessage(statusMessage, "Данные восстановлены из localStorage");
}

renderApp();
setFormMode(null);