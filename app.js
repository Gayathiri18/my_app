// Load tasks from storage when page opens
window.onload = function () {
  loadTasks();
  registerSW();
};

function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (text === '') return;

  const tasks = getTasks();
  tasks.push({ text: text, done: false });
  saveTasks(tasks);

  input.value = '';
  renderTasks();
}

function toggleTask(index) {
  const tasks = getTasks();
  tasks[index].done = !tasks[index].done;
  saveTasks(tasks);
  renderTasks();
}

function deleteTask(index) {
  const tasks = getTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('taskList');
  const tasks = getTasks();
  list.innerHTML = '';

  tasks.forEach(function (task, index) {
    const li = document.createElement('li');
    if (task.done) li.classList.add('done');

    li.innerHTML = `
      <span onclick="toggleTask(${index})">${task.text}</span>
      <button class="delete-btn" onclick="deleteTask(${index})">Delete</button>
    `;
    list.appendChild(li);
  });
}

function loadTasks() {
  renderTasks();
}

function getTasks() {
  return JSON.parse(localStorage.getItem('tasks') || '[]');
}

function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }
}

// Allow pressing Enter to add task
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('taskInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') addTask();
  });
});