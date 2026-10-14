import { demoTasks } from "./data.js";
import {
  createTask,
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";

console.log("=== Демонстрация работы с задачами ===\n");

console.log("Исходный набор:");
console.log(demoTasks);

const found = findTaskById(demoTasks, 4);
console.log("\nПоиск id = 4:", found ? found.title : "не найдено");

const pending = getPendingTasks(demoTasks);
console.log("Невыполненные id:", pending.map((t) => t.id));

const titles = getTaskTitles(demoTasks);
console.log("Названия:", titles);

const { total, completed, pending: pendingCount, progress } = getTaskStats(demoTasks);
console.log("\nСводка:");
console.log(`  Всего: ${total}`);
console.log(`  Выполнено: ${completed}`);
console.log(`  Осталось: ${pendingCount}`);
console.log(`  Прогресс: ${total > 0 ? progress.toFixed(1) + "%" : "Задач пока нет"}`);

const created = createTask(20, "Подготовить демонстрацию", "high");
if (created.ok) {
  console.log("\nСоздана задача:", created.task);
} else {
  console.error("Ошибка создания:", created.error);
}

const added = addTask(demoTasks, 20, "Подготовить демонстрацию", "high");
if (added.ok) {
  console.log("\nПосле добавления (длина):", added.tasks.length);
  console.log("Исходный массив не изменён (длина):", demoTasks.length);
} else {
  console.error("Ошибка добавления:", added.error);
}

const toggled = setTaskCompleted(demoTasks, 4, true);
if (toggled.ok) {
  const updated = toggled.tasks.find((t) => t.id === 4);
  console.log("\nСтатус id = 4 изменён на:", updated.completed);
} else {
  console.error("Ошибка изменения статуса:", toggled.error);
}

const renamed = renameTask(demoTasks, 10, "  Обновлённое README  ");
if (renamed.ok) {
  const updated = renamed.tasks.find((t) => t.id === 10);
  console.log("Переименовано id = 10:", updated.title);
} else {
  console.error("Ошибка переименования:", renamed.error);
}

const removed = removeTask(demoTasks, 7);
if (removed.ok) {
  console.log("\nПосле удаления id = 7:", removed.tasks.map((t) => t.id));
  console.log("Исходный массив сохранён:", demoTasks.map((t) => t.id));
} else {
  console.error("Ошибка удаления:", removed.error);
}