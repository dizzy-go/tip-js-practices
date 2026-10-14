function isValidId(id) {
  return Number.isSafeInteger(id) && id > 0;
}

function validateTitle(title) {
  if (typeof title !== "string") {
    return { ok: false, error: "Название должно быть строкой" };
  }
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: "Название не должно быть пустым" };
  }
  if (trimmed.length > 100) {
    return { ok: false, error: "Название не должно превышать 100 символов" };
  }
  return { ok: true, title: trimmed };
}

function validatePriority(priority) {
  const allowed = ["low", "medium", "high"];
  if (!allowed.includes(priority)) {
    return { ok: false, error: "Приоритет должен быть low, medium или high" };
  }
  return { ok: true, priority };
}

export function createTask(id, title, priority = "medium") {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным безопасным целым числом" };
  }

  const titleCheck = validateTitle(title);
  if (!titleCheck.ok) return titleCheck;

  const priorityCheck = validatePriority(priority);
  if (!priorityCheck.ok) return priorityCheck;

  return {
    ok: true,
    task: {
      id,
      title: titleCheck.title,
      completed: false,
      priority: priorityCheck.priority,
    },
  };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;
  const pending = total - completed;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return { total, completed, pending, progress };
}

export function addTask(tasks, id, title, priority = "medium") {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным безопасным целым числом" };
  }
  if (tasks.some((task) => task.id === id)) {
    return { ok: false, error: "Задача с таким id уже существует" };
  }

  const creation = createTask(id, title, priority);
  if (!creation.ok) return creation;

  return { ok: true, tasks: [...tasks, creation.task] };
}

export function setTaskCompleted(tasks, id, completed) {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным безопасным целым числом" };
  }
  if (typeof completed !== "boolean") {
    return { ok: false, error: "completed должен быть логическим значением" };
  }

  const exists = tasks.some((task) => task.id === id);
  if (!exists) {
    return { ok: false, error: "Задача с указанным id не найдена" };
  }

  const newTasks = tasks.map((task) =>
    task.id === id ? { ...task, completed } : task
  );
  return { ok: true, tasks: newTasks };
}

export function renameTask(tasks, id, title) {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным безопасным целым числом" };
  }

  const titleCheck = validateTitle(title);
  if (!titleCheck.ok) return titleCheck;

  const exists = tasks.some((task) => task.id === id);
  if (!exists) {
    return { ok: false, error: "Задача с указанным id не найдена" };
  }

  const newTasks = tasks.map((task) =>
    task.id === id ? { ...task, title: titleCheck.title } : task
  );
  return { ok: true, tasks: newTasks };
}

export function updateTask(tasks, id, title, priority) {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным безопасным целым числом" };
  }

  const exists = tasks.some((task) => task.id === id);
  if (!exists) {
    return { ok: false, error: "Задача с указанным id не найдена" };
  }

  const titleCheck = validateTitle(title);
  if (!titleCheck.ok) return titleCheck;

  const priorityCheck = validatePriority(priority);
  if (!priorityCheck.ok) return priorityCheck;

  const newTasks = tasks.map((task) =>
    task.id === id
      ? { ...task, title: titleCheck.title, priority: priorityCheck.priority }
      : task
  );
  return { ok: true, tasks: newTasks };
}

export function removeTask(tasks, id) {
  if (!isValidId(id)) {
    return { ok: false, error: "id должен быть положительным безопасным целым числом" };
  }

  const exists = tasks.some((task) => task.id === id);
  if (!exists) {
    return { ok: false, error: "Задача с указанным id не найдена" };
  }

  return { ok: true, tasks: tasks.filter((task) => task.id !== id) };
}