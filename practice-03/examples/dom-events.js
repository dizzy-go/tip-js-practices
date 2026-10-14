const logElement = document.querySelector("#log");

function log(message) {
  if (!logElement) return;
  logElement.textContent += `${message}\n`;
  console.log(message);
}

log("=== Эксперимент 1: отсутствующий элемент ===");
const missing = document.querySelector("#does-not-exist");
const emptyCollection = document.querySelectorAll(".does-not-exist");
log(`missing = ${missing}`);
log(`emptyCollection.length = ${emptyCollection.length}`);

log("=== Эксперимент 2: dataset.taskId ===");
const records = document.querySelector("#records");
const addButton = document.querySelector("#add-record");

let counter = 0;
function createRecord() {
  counter += 1;
  const li = document.createElement("li");
  li.dataset.taskId = String(counter);
  li.textContent = `Запись № ${counter}`;
  return li;
}

addButton?.addEventListener("click", () => {
  const record = createRecord();
  records?.append(record);
  const firstId = records?.firstElementChild?.dataset.taskId;
  log(`Первая запись: dataset.taskId = "${firstId}" (тип: ${typeof firstId})`);
});

log("=== Эксперимент 3: нажатие на «Добавить запись» ===");
log("Нажмите кнопку «Добавить запись» дважды и проследите за журналом.");

log("=== Эксперимент 4 и 5: всплытие события ===");
const wrapper = document.querySelector("#wrapper");
const editButton = document.querySelector("#edit");

wrapper?.addEventListener(
  "click",
  (event) => {
    log(
      `[capture] target=${event.target.tagName}.${event.target.className} ` +
        `currentTarget=${event.currentTarget.id} phase=${event.eventPhase}`
    );
  },
  true
);

editButton?.addEventListener("click", (event) => {
  log(
    `[button] target=${event.target.tagName}.${event.target.className} ` +
      `currentTarget=${event.currentTarget.id} phase=${event.eventPhase}`
  );
});

wrapper?.addEventListener("click", (event) => {
  log(
    `[bubble] target=${event.target.tagName}.${event.target.className} ` +
      `currentTarget=${event.currentTarget.id} phase=${event.eventPhase}`
  );
});

log("Нажмите на текст «Изменить заголовок» и изучите журнал.");
log("eventPhase: 1 — захват, 2 — цель, 3 — всплытие.");