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
  if (viewId === 'schedule-view') renderSchedule();
}

// Collapsible Logic
function toggleSection(element) {
  const content = element.nextElementSibling;
  const isHidden = content.style.display === "none" || content.style.display === "";

  document.querySelectorAll('.content').forEach(c => c.style.display = "none");
  document.querySelectorAll('.collapsible').forEach(h => {
    h.innerHTML = h.innerHTML.replace("▲", "▼");
  });

  if (isHidden) {
    content.style.display = "block";
    element.innerHTML = element.innerHTML.replace("▼", "▲");
  }
}

// To-Do Logic
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

function renderTasks() {
  const list = document.getElementById('taskList');
  if (!list) return;
  const tasks = getTasks();
  list.innerHTML = '';
  tasks.forEach(function (task, index) {
    const li = document.createElement('li');
    li.innerHTML = `<span>${task.text}</span><button class="delete-btn" onclick="deleteTask(${index})">Delete</button>`;
    list.appendChild(li);
  });
}

function deleteTask(index) {
  const tasks = getTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks();
}

function getTasks() { return JSON.parse(localStorage.getItem('tasks') || '[]'); }
function saveTasks(tasks) { localStorage.setItem('tasks', JSON.stringify(tasks)); }

// Schedule Logic
function addSchedule() {
  const timeInput = document.getElementById('timeInput');
  const taskInput = document.getElementById('taskInputSchedule');
  if (!timeInput.value || !taskInput.value.trim()) return;

  const schedule = JSON.parse(localStorage.getItem('schedule') || '[]');
  schedule.push({ time: timeInput.value, task: taskInput.value.trim() });
  schedule.sort((a, b) => a.time.localeCompare(b.time));
  localStorage.setItem('schedule', JSON.stringify(schedule));
  
  timeInput.value = '';
  taskInput.value = '';
  renderSchedule();
}

function renderSchedule() {
  const list = document.getElementById('scheduleList');
  if (!list) return;
  const schedule = JSON.parse(localStorage.getItem('schedule') || '[]');
  list.innerHTML = schedule.map((item, index) => `
    <li class="timeline-item">
      <span class="time-tag">${item.time}</span>
      <span class="task-text">${item.task}</span>
      <button onclick="deleteScheduleItem(${index})">×</button>
    </li>
  `).join('');
}

function deleteScheduleItem(index) {
  const schedule = JSON.parse(localStorage.getItem('schedule') || '[]');
  schedule.splice(index, 1);
  localStorage.setItem('schedule', JSON.stringify(schedule));
  renderSchedule();
}

// System
function registerSW() { if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js'); }