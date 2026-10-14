import { demoTasks } from "./data.js";
import { findTaskById, setTaskCompleted, removeTask } from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import { renderTaskList, renderSummary, renderEmptyState } from "./task-view.js";

let currentTasks = demoTasks.map((task) => ({ ...task }));
let currentFilter = "all";

const listElement = document.querySelector("#task-list");
const summaryElement = document.querySelector("#task-summary");
const emptyMessage = document.querySelector("#empty-message");
const filterContainer = document.querySelector("#filters");
const operationMessage = document.querySelector("#operation-message");

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
  if (activeFilter) {
    activeFilter.focus();
  }
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

export function handleTaskListClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-action]");
  if (!button || !listElement.contains(button)) return;

  const action = button.dataset.action;
  if (action !== "toggle" && action !== "delete") return;

  const card = button.closest("li[data-task-id]");
  if (!card) return;

  const rawId = card.dataset.taskId;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    if (operationMessage) {
      operationMessage.textContent = "Некорректный идентификатор задачи.";
    }
    return;
  }

  const task = findTaskById(currentTasks, id);
  if (!task) {
    if (operationMessage) {
      operationMessage.textContent = "Задача не найдена.";
    }
    return;
  }

  let result;
  if (action === "toggle") {
    result = setTaskCompleted(currentTasks, id, !task.completed);
  } else {
    result = removeTask(currentTasks, id);
  }

  if (!result.ok) {
    if (operationMessage) {
      operationMessage.textContent = result.error;
    }
    return;
  }

  currentTasks = result.tasks;
  if (operationMessage) {
    operationMessage.textContent = "";
  }
  renderApp();
  restoreTaskFocus(id, action);
}

export function handleFilterClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-filter]");
  if (!button || !filterContainer.contains(button)) return;

  const filter = button.dataset.filter;
  if (filter !== "all" && filter !== "pending" && filter !== "completed") return;

  currentFilter = filter;
  if (operationMessage) {
    operationMessage.textContent = "";
  }
  renderApp();
}

listElement.addEventListener("click", handleTaskListClick);
filterContainer.addEventListener("click", handleFilterClick);

renderApp();