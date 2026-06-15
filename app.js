// Initialization
window.onload = function () {
  registerSW();
  showView('home-view');
};

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  const target = document.getElementById(viewId);
  if (target) target.style.display = 'block';
  if (viewId === 'todo-view') renderTasks();
  if (viewId === 'schedule-view') renderSchedule(); // ADD THIS LINE
}

function toggleSection(element) {
  const content = element.nextElementSibling;
  const isHidden = content.style.display === "none" || content.style.display === "";

  // 1. Close ALL sections first
  document.querySelectorAll('.content').forEach(c => c.style.display = "none");
  document.querySelectorAll('.collapsible').forEach(h => {
    h.innerHTML = h.innerHTML.replace("▲", "▼");
  });

  // 2. Open clicked section if it was hidden
  if (isHidden) {
    content.style.display = "block";
    element.innerHTML = element.innerHTML.replace("▼", "▲");
  }
}

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
  if (!list) return;
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

function getTasks() { return JSON.parse(localStorage.getItem('tasks') || '[]'); }
function saveTasks(tasks) { localStorage.setItem('tasks', JSON.stringify(tasks)); }

function registerSW() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
}

document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('taskInput');
  if (input) input.addEventListener('keypress', function (e) { if (e.key === 'Enter') addTask(); });
});

function addSchedule() {
  const time = document.getElementById('timeInput').value;
  const task = document.getElementById('taskInputSchedule').value.trim();
  if (!time || !task) return;

  const schedule = JSON.parse(localStorage.getItem('schedule') || '[]');
  schedule.push({ time, task });
  schedule.sort((a, b) => a.time.localeCompare(b.time)); // Keep sorted by time
  localStorage.setItem('schedule', JSON.stringify(schedule));
  
  renderSchedule();
}

function renderSchedule() {
  const list = document.getElementById('scheduleList');
  const schedule = JSON.parse(localStorage.getItem('schedule') || '[]');
  list.innerHTML = schedule.map((item, index) => `
    <li class="timeline-item">
      <span class="time-tag">${item.time}</span>
      <span class="task-text">${item.task}</span>
      <button onclick="deleteSchedule(${index})">×</button>
    </li>
  `).join('');
}

function deleteSchedule(index) {
  const schedule = JSON.parse(localStorage.getItem('schedule') || '[]');
  schedule.splice(index, 1);
  localStorage.setItem('schedule', JSON.stringify(schedule));
  renderSchedule();
}