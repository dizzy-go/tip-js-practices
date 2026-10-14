export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;

  const seen = new Set();

  for (const task of value) {
    if (typeof task !== "object" || task === null) return false;
    if (!Number.isSafeInteger(task.id) || task.id <= 0) return false;
    if (seen.has(task.id)) return false;
    seen.add(task.id);

    if (typeof task.title !== "string") return false;
    const trimmed = task.title.trim();
    if (trimmed.length === 0 || trimmed.length > 100) return false;
    if (trimmed !== task.title) return false;

    if (typeof task.completed !== "boolean") return false;
    if (!["low", "medium", "high"].includes(task.priority)) return false;
  }

  return true;
}

function cloneTasks(tasks) {
  return tasks.map((task) => ({ ...task }));
}

export function loadTasks(storage, key, fallbackTasks) {
  const fallbackCopy = cloneTasks(fallbackTasks);

  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return { ok: true, source: "initial", tasks: fallbackCopy };
    }

    const parsed = JSON.parse(raw);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      parsed.version !== 1 ||
      !isValidTaskList(parsed.tasks)
    ) {
      return {
        ok: false,
        source: "fallback",
        tasks: fallbackCopy,
        error: "Сохранённые данные повреждены или имеют неверный формат",
      };
    }

    return { ok: true, source: "storage", tasks: cloneTasks(parsed.tasks) };
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallbackCopy,
      error: `Ошибка чтения хранилища: ${error.message}`,
    };
  }
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Список задач не соответствует схеме" };
  }

  try {
    const payload = { version: 1, tasks: cloneTasks(tasks) };
    storage.setItem(key, JSON.stringify(payload));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Ошибка записи: ${error.message}` };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Ошибка удаления: ${error.message}` };
  }
}