"use strict";

const totalTasks = 20;
const completedTasks = 11;
const dailyLimit = 6;

// Проверка totalTasks и completedTasks по правилам задания 3
if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
  console.log("Ошибка: количество задач должно быть целым числом.");
} else if (totalTasks < 0 || totalTasks > 1000) {
  console.log("Ошибка: общее количество задач должно быть в диапазоне 0…1000.");
} else if (completedTasks < 0 || completedTasks > totalTasks) {
  console.log("Ошибка: выполненных задач не может быть больше, чем всего.");
} else if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 1000) {
  console.log("Ошибка: дневная норма должна быть целым числом от 1 до 1000.");
} else {
  let remaining = totalTasks - completedTasks;

  if (remaining === 0) {
    console.log("Все задачи уже выполнены.");
    console.log("Потребуется дней: 0");
  } else {
    console.log(`Осталось задач: ${remaining}`);

    let day = 0;
    while (remaining > 0) {
      day += 1;
      const tasksToday = Math.min(dailyLimit, remaining);
      remaining -= tasksToday;
      console.log(`День ${day}: выполнено ${tasksToday}, осталось ${remaining}`);
    }

    console.log(`Потребуется дней: ${day}`);
  }
}