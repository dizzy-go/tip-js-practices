import { demoTasks } from "../src/data.js";
import { getVisibleTasks } from "../src/task-selectors.js";
import { createTaskElement, renderTaskList, renderSummary, renderEmptyState } from "../src/task-view.js";

let passed = 0;
let failed = 0;

function check(name, condition, details = "") {
  if (condition) {
    passed += 1;
    console.log(`✔ ${name}`);
  } else {
    failed += 1;
    console.error(`✘ ${name}${details ? ` — ${details}` : ""}`);
  }
}

console.log("=== Браузерные проверки ===");

const card = createTaskElement(demoTasks[1]);
check("createTaskElement: тег li", card.tagName === "LI");
check("createTaskElement: data-task-id", card.dataset.taskId === "4");
check("createTaskElement: не completed", !card.classList.contains("is-completed"));
check("createTaskElement: содержит title", card.querySelector(".task-title")?.textContent === "Подготовить модель задач");
check("createTaskElement: две кнопки", card.querySelectorAll("button[data-action]").length === 2);
check("createTaskElement: aria-pressed = false", card.querySelector('[data-action="toggle"]').getAttribute("aria-pressed") === "false");

const listElement = document.querySelector("#task-list");
renderTaskList(listElement, demoTasks);
check("renderTaskList: 4 карточки", listElement.children.length === 4);
renderTaskList(listElement, demoTasks);
check("renderTaskList: повторный рендер не дублирует", listElement.children.length === 4);
renderTaskList(listElement, []);
check("renderTaskList: пустой массив очищает список", listElement.children.length === 0);

const summaryElement = document.querySelector("#task-summary");
renderSummary(summaryElement, demoTasks, 2);
check("renderSummary: total = 4", summaryElement.querySelector('[data-stat="total"]').textContent === "4");
check("renderSummary: completed = 2", summaryElement.querySelector('[data-stat="completed"]').textContent === "2");
check("renderSummary: pending = 2", summaryElement.querySelector('[data-stat="pending"]').textContent === "2");
check("renderSummary: progress = 50.0%", summaryElement.querySelector('[data-stat="progress"]').textContent === "50.0%");
check("renderSummary: visible = 2", summaryElement.querySelector('[data-stat="visible"]').textContent === "2");

const emptyEl = document.querySelector("#empty-message");
renderEmptyState(emptyEl, 0, 0);
check("renderEmptyState: пустой список", emptyEl.hidden === false && emptyEl.textContent === "Список задач пуст.");
renderEmptyState(emptyEl, 4, 0);
check("renderEmptyState: нет совпадений", emptyEl.hidden === false && emptyEl.textContent === "Нет задач по выбранному фильтру.");
renderEmptyState(emptyEl, 4, 4);
check("renderEmptyState: скрыто при наличии задач", emptyEl.hidden === true);

check("getVisibleTasks: all", getVisibleTasks(demoTasks, "all").length === 4);
check("getVisibleTasks: pending", getVisibleTasks(demoTasks, "pending").length === 2);
check("getVisibleTasks: completed", getVisibleTasks(demoTasks, "completed").length === 2);
check("getVisibleTasks: неизвестный фильтр = all", getVisibleTasks(demoTasks, "unknown").length === 4);

console.log(`\nПройдено: ${passed}, провалено: ${failed}`);