const logElement = document.querySelector("#log");
const form = document.querySelector("#demo-form");
const saveButton = document.querySelector("#save-demo");
const readButton = document.querySelector("#read-demo");
const breakButton = document.querySelector("#break-demo");
const clearButton = document.querySelector("#clear-demo");

const STORAGE_KEY = "tip-js-practice-04:example";

function log(message) {
  if (logElement) logElement.textContent += `${message}\n`;
  console.log(message);
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const draft = {
    id: formData.get("id"),
    title: formData.get("title"),
    priority: formData.get("priority"),
  };
  log(`submit event.defaultPrevented = ${event.defaultPrevented}`);
  log(`draft.id = "${draft.id}" (тип: ${typeof draft.id})`);
  log(`draft.title = "${draft.title}" (тип: ${typeof draft.title})`);
  log(`draft.priority = "${draft.priority}"`);
});

saveButton?.addEventListener("click", () => {
  const payload = { version: 1, tasks: [] };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    log(`Сохранено: ${JSON.stringify(payload)}`);
  } catch (error) {
    log(`Ошибка записи: ${error.message}`);
  }
});

readButton?.addEventListener("click", () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    log(`Сырое значение: ${raw}`);
    if (raw === null) {
      log("Ключ отсутствует");
      return;
    }
    const parsed = JSON.parse(raw);
    log(`Разобрано: ${JSON.stringify(parsed)}`);
  } catch (error) {
    log(`Ошибка чтения: ${error.message}`);
  }
});

breakButton?.addEventListener("click", () => {
  localStorage.setItem(STORAGE_KEY, "{broken-json");
  log("Записана повреждённая строка. Нажмите «Прочитать».");
});

clearButton?.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  log("Ключ удалён");
});