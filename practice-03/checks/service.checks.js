import { demoTasks } from "../src/data.js";
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
} from "../src/task-service.js";

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

console.log("=== Проверки task-service ===");

const created = createTask(20, "Новая задача", "high");
check("createTask: успешное создание", created.ok === true);
check("createTask: приоритет по умолчанию", createTask(1, "x").task.priority === "medium");
check("createTask: нормализация названия", createTask(1, "  x  ").task.title === "x");
check("createTask: пустая строка отклонена", createTask(1, "").ok === false);
check("createTask: пробелы отклонены", createTask(1, "   ").ok === false);
check("createTask: длинное название отклонено", createTask(1, "a".repeat(101)).ok === false);
check("createTask: id = 0 отклонён", createTask(0, "x").ok === false);
check("createTask: id = -1 отклонён", createTask(-1, "x").ok === false);
check("createTask: id = 1.5 отклонён", createTask(1.5, "x").ok === false);
check("createTask: id = \"4\" отклонён", createTask("4", "x").ok === false);
check("createTask: priority = \"urgent\" отклонён", createTask(1, "x", "urgent").ok === false);

check("findTaskById: находит id = 4", findTaskById(demoTasks, 4)?.title === "Подготовить модель задач");
check("findTaskById: возвращает undefined для чужого id", findTaskById(demoTasks, 777) === undefined);

const pending = getPendingTasks(demoTasks);
check("getPendingTasks: длина = 2", pending.length === 2);
check("getPendingTasks: содержит id = 4 и 7", pending.map((t) => t.id).join(",") === "4,7");

check("getTaskTitles: длина = 4", getTaskTitles(demoTasks).length === 4);

const stats = getTaskStats(demoTasks);
check("getTaskStats: total = 4", stats.total === 4);
check("getTaskStats: completed = 2", stats.completed === 2);
check("getTaskStats: pending = 2", stats.pending === 2);
check("getTaskStats: progress = 50", stats.progress === 50);

const emptyStats = getTaskStats([]);
check("getTaskStats([]): progress = 0", emptyStats.progress === 0);

const added = addTask(demoTasks, 20, "Подготовить демонстрацию", "high");
check("addTask: ok = true", added.ok === true);
check("addTask: длина = 5", added.tasks.length === 5);
check("addTask: исходный массив не изменён", demoTasks.length === 4);
check("addTask: дубликат id отклонён", addTask(demoTasks, 4, "Дубликат").ok === false);

const toggled = setTaskCompleted(demoTasks, 4, true);
check("setTaskCompleted: ok = true", toggled.ok === true);
check("setTaskCompleted: статус id = 4 изменён", toggled.tasks.find((t) => t.id === 4).completed === true);
check("setTaskCompleted: исходный id = 4 не изменён", demoTasks.find((t) => t.id === 4).completed === false);
check("setTaskCompleted: неизвестный id", setTaskCompleted(demoTasks, 999, true).ok === false);
check("setTaskCompleted: невалидный completed", setTaskCompleted(demoTasks, 4, "yes").ok === false);

const renamed = renameTask(demoTasks, 10, "  Обновлённое README  ");
check("renameTask: ok = true", renamed.ok === true);
check("renameTask: обрезаны пробелы", renamed.tasks.find((t) => t.id === 10).title === "Обновлённое README");
check("renameTask: длинное название отклонено", renameTask(demoTasks, 10, "a".repeat(101)).ok === false);

const removed = removeTask(demoTasks, 7);
check("removeTask: ok = true", removed.ok === true);
check("removeTask: длина = 3", removed.tasks.length === 3);
check("removeTask: id 7 отсутствует", removed.tasks.every((t) => t.id !== 7));
check("removeTask: неизвестный id", removeTask(demoTasks, 999).ok === false);

console.log(`\nПройдено: ${passed}, провалено: ${failed}`);
if (failed > 0) process.exitCode = 1;