import { demoTasks } from "../src/data.js";
import { validateTaskDraft } from "../src/form-validation.js";
import {
  isValidTaskList,
  loadTasks,
  saveTasks,
  removeSavedTasks,
} from "../src/task-storage.js";

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

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    _map: map,
  };
}

console.log("=== Проверки form-validation ===");

const ok = validateTaskDraft(
  { id: "20", title: "Новая задача", priority: "high" },
  demoTasks,
  null
);
check("валидный черновик: ok = true", ok.ok === true);
check("валидный черновик: id = 20", ok.value?.id === 20);
check("валидный черновик: title обрезано", ok.value?.title === "Новая задача");

const badId = validateTaskDraft({ id: "0", title: "x", priority: "low" }, demoTasks, null);
check("id = 0 отклонён", badId.ok === false && Boolean(badId.errors.id));

const badId2 = validateTaskDraft({ id: "4", title: "x", priority: "low" }, demoTasks, null);
check("дубликат id отклонён", badId2.ok === false && Boolean(badId2.errors.id));

const badTitle = validateTaskDraft({ id: "20", title: "   ", priority: "low" }, demoTasks, null);
check("пустое название отклонено", badTitle.ok === false && Boolean(badTitle.errors.title));

const longTitle = validateTaskDraft(
  { id: "20", title: "a".repeat(101), priority: "low" },
  demoTasks,
  null
);
check("длинное название отклонено", longTitle.ok === false && Boolean(longTitle.errors.title));

const badPriority = validateTaskDraft(
  { id: "20", title: "x", priority: "urgent" },
  demoTasks,
  null
);
check("неверный приоритет отклонён", badPriority.ok === false && Boolean(badPriority.errors.priority));

const editSame = validateTaskDraft(
  { id: "", title: "Обновлённая", priority: "high" },
  demoTasks,
  4
);
check("редактирование той же задачи не считается дубликатом", editSame.ok === true);
check("редактирование: id из editingId", editSame.value?.id === 4);

const editMissing = validateTaskDraft(
  { id: "", title: "x", priority: "low" },
  demoTasks,
  999
);
check("редактирование отсутствующей задачи отклонено", editMissing.ok === false && Boolean(editMissing.errors.id));

console.log("=== Проверки task-storage ===");

check("isValidTaskList: корректный массив", isValidTaskList(demoTasks) === true);
check("isValidTaskList: не массив", isValidTaskList({}) === false);
check("isValidTaskList: дубликат id", isValidTaskList([{ id: 1, title: "a", completed: false, priority: "low" }, { id: 1, title: "b", completed: true, priority: "high" }]) === false);
check("isValidTaskList: пустое название", isValidTaskList([{ id: 1, title: "  ", completed: false, priority: "low" }]) === false);
check("isValidTaskList: плохой приоритет", isValidTaskList([{ id: 1, title: "a", completed: false, priority: "urgent" }]) === false);
check("isValidTaskList: не boolean completed", isValidTaskList([{ id: 1, title: "a", completed: 1, priority: "low" }]) === false);

const storage1 = createMemoryStorage();
const loaded1 = loadTasks(storage1, "k", demoTasks);
check("loadTasks: пусто → source = initial", loaded1.source === "initial");
check("loadTasks: пусто → возвращает копию", loaded1.tasks !== demoTasks);

const storage2 = createMemoryStorage();
storage2.setItem("k", JSON.stringify({ version: 1, tasks: demoTasks }));
const loaded2 = loadTasks(storage2, "k", []);
check("loadTasks: корректные данные → source = storage", loaded2.source === "storage");
check("loadTasks: корректные данные → ok = true", loaded2.ok === true);

const storage3 = createMemoryStorage();
storage3.setItem("k", "{broken");
const loaded3 = loadTasks(storage3, "k", demoTasks);
check("loadTasks: повреждённый JSON → fallback", loaded3.source === "fallback");
check("loadTasks: повреждённый JSON → ok = false", loaded3.ok === false);
check("loadTasks: повреждённый JSON → возвращает fallback", loaded3.tasks.length === demoTasks.length);

const storage4 = createMemoryStorage();
const saved = saveTasks(storage4, "k", demoTasks);
check("saveTasks: ok = true", saved.ok === true);
check("saveTasks: данные записаны", storage4.getItem("k").includes('"version":1'));
check("saveTasks: некорректный список отклонён", saveTasks(storage4, "k", [{ id: 0 }]).ok === false);

const removal = removeSavedTasks(storage4, "k");
check("removeSavedTasks: ok = true", removal.ok === true);
check("removeSavedTasks: ключ отсутствует", storage4.getItem("k") === null);

console.log(`\nПройдено: ${passed}, провалено: ${failed}`);
if (failed > 0) process.exitCode = 1;