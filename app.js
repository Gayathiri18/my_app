// Initialization
window.onload = function () {
  registerSW();
  showView('home-view'); // Default to dashboard
};

// Navigation logic (Updated to force render when switching to To-Do)
function showView(viewId) {
  document.querySelectorAll('.view').forEach(view => {
    view.style.display = 'none';
  });
  
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.style.display = 'block';
  }

  // Force update the list when opening the To-Do view
  if (viewId === 'todo-view') {
    renderTasks();
  }
}

// Collapsible Section logic
function toggleSection(element) {
  const content = element.nextElementSibling;
  // If content is hidden, show it, otherwise hide it
  if (content.style.display === "none" || content.style.display === "") {
    content.style.display = "block";
    element.innerHTML = element.innerHTML.replace("▼", "▲");
  } else {
    content.style.display = "none";
    element.innerHTML = element.innerHTML.replace("▲", "▼");
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
  if (!list) return; // Safety check
  
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

// Enter Key support
document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('taskInput');
  if (input) {
    input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') addTask();
    });
  }
});