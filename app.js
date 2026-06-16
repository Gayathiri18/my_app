// =====================
// INITIALIZATION
// =====================
window.onload = function () {
  registerSW();
  showView('home-view');
};

// =====================
// VIEW NAVIGATION
// =====================
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  const target = document.getElementById(viewId);
  if (target) target.style.display = 'block';
  if (viewId === 'todo-view') renderTasks();
  if (viewId === 'events-view') renderEvents();
  window.scrollTo(0, 0);
}

// =====================
// COLLAPSIBLE SECTIONS
// =====================
function toggleSection(element) {
  const content = element.nextElementSibling;
  const isHidden = content.style.display === 'none' || content.style.display === '';

  // Close all sections first
  document.querySelectorAll('.content').forEach(c => c.style.display = 'none');
  document.querySelectorAll('.collapsible').forEach(h => {
    h.innerHTML = h.innerHTML.replace('▲', '▼');
  });

  // Open clicked section if it was closed
  if (isHidden) {
    content.style.display = 'block';
    element.innerHTML = element.innerHTML.replace('▼', '▲');
  }
}

// =====================
// TO-DO LIST
// =====================
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

  if (tasks.length === 0) {
    list.innerHTML = '<p class="empty-msg">No tasks yet. Add one above! 🎯</p>';
    return;
  }

  tasks.forEach(function (task, index) {
    const li = document.createElement('li');
    li.className = task.done ? 'done' : '';
    li.innerHTML = `
      <span class="task-text" onclick="toggleTask(${index})">${task.text}</span>
      <div class="task-actions">
        <button class="done-btn" onclick="toggleTask(${index})">${task.done ? 'Undo' : 'Done'}</button>
        <button class="delete-btn" onclick="deleteTask(${index})">Delete</button>
      </div>
    `;
    list.appendChild(li);
  });
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

function getTasks() {
  return JSON.parse(localStorage.getItem('tasks') || '[]');
}

function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// =====================
// IMPORTANT EVENTS
// =====================
function addEvent() {
  const name = document.getElementById('eventName').value.trim();
  const date = document.getElementById('eventDate').value;
  const details = document.getElementById('eventDetails').value.trim();

  if (!name || !date) {
    alert('Please enter both event name and date!');
    return;
  }

  const events = getEvents();
  events.push({ name, date, details });
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  saveEvents(events);

  document.getElementById('eventName').value = '';
  document.getElementById('eventDate').value = '';
  document.getElementById('eventDetails').value = '';
  renderEvents();
}

function renderEvents() {
  const list = document.getElementById('eventList');
  if (!list) return;

  const events = getEvents();

  if (events.length === 0) {
    list.innerHTML = '<p class="empty-msg">No events added yet. Plan something! 🗓️</p>';
    return;
  }

  list.innerHTML = events.map((e, index) => `
    <li class="event-card">
      <div class="event-info">
        <div class="event-name">${e.name}</div>
        <span class="date-badge">${formatDate(e.date)}</span>
        ${e.details ? `<p class="event-details">${e.details}</p>` : ''}
      </div>
      <button class="delete-btn" onclick="deleteEvent(${index})">Remove</button>
    </li>
  `).join('');
}

function deleteEvent(index) {
  const events = getEvents();
  events.splice(index, 1);
  saveEvents(events);
  renderEvents();
}

function getEvents() {
  return JSON.parse(localStorage.getItem('events') || '[]');
}

function saveEvents(events) {
  localStorage.setItem('events', JSON.stringify(events));
}

// =====================
// HELPERS
// =====================

// Converts "2025-06-20" → "20 Jun 2025"
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }
}

// =====================
// ENTER KEY SUPPORT
// =====================
document.addEventListener('DOMContentLoaded', function () {
  const taskInput = document.getElementById('taskInput');
  if (taskInput) {
    taskInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') addTask();
    });
  }

  const eventInput = document.getElementById('eventName');
  if (eventInput) {
    eventInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') addEvent();
    });
  }
});
