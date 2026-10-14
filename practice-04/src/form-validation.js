export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  let value = null;
  let id;

  if (editingId === null) {
    const rawId = draft.id;
    if (typeof rawId !== "string" || rawId.trim() === "") {
      errors.id = "Введите идентификатор";
    } else {
      id = Number(rawId);
      if (!Number.isSafeInteger(id) || id <= 0) {
        errors.id = "Идентификатор должен быть положительным целым числом";
      } else if (tasks.some((task) => task.id === id)) {
        errors.id = "Задача с таким идентификатором уже существует";
      }
    }
  } else {
    id = editingId;
    if (!Number.isSafeInteger(id) || id <= 0) {
      errors.id = "Некорректный идентификатор редактируемой задачи";
    } else if (!tasks.some((task) => task.id === id)) {
      errors.id = "Редактируемая задача не найдена";
    }
  }

  if (typeof draft.title !== "string") {
    errors.title = "Название должно быть строкой";
  } else {
    const trimmed = draft.title.trim();
    if (trimmed.length === 0) {
      errors.title = "Название не должно быть пустым";
    } else if (trimmed.length > 100) {
      errors.title = "Название не должно превышать 100 символов";
    } else if (!errors.title) {
      value = value || {};
      value.title = trimmed;
    }
  }

  if (!["low", "medium", "high"].includes(draft.priority)) {
    errors.priority = "Приоритет должен быть low, medium или high";
  } else {
    value = value || {};
    value.priority = draft.priority;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  value.id = id;
  return { ok: true, value };
}