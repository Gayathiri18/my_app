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
  if (viewId === 'events-view') renderEvents(); // ADD THIS LINE
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

function addEvent() {
  const name = document.getElementById('eventName').value.trim();
  const date = document.getElementById('eventDate').value;
  const details = document.getElementById('eventDetails').value.trim(); // Capture details
  
  if (!name || !date) return;

  const events = JSON.parse(localStorage.getItem('events') || '[]');
  events.push({ name, date, details }); // Save details
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  localStorage.setItem('events', JSON.stringify(events));
  
  document.getElementById('eventName').value = '';
  document.getElementById('eventDate').value = '';
  document.getElementById('eventDetails').value = ''; // Clear details
  renderEvents();
}

function renderEvents() {
  const list = document.getElementById('eventList');
  if (!list) return;
  const events = JSON.parse(localStorage.getItem('events') || '[]');
  
  list.innerHTML = events.map((e, index) => `
    <li class="event-card">
      <div class="event-info">
        <strong>${e.name}</strong> 
        <span class="date-badge">${e.date}</span>
        <p style="margin: 5px 0 0 0; font-size: 15px; color: #555;">${e.details || ''}</p>
      </div>
      <button class="delete-btn" onclick="deleteEvent(${index})">Done</button>
    </li>
  `).join('');
}

function deleteEvent(index) {
  const events = JSON.parse(localStorage.getItem('events') || '[]');
  events.splice(index, 1);
  localStorage.setItem('events', JSON.stringify(events));
  renderEvents();
}

// System
function registerSW() { if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js'); }