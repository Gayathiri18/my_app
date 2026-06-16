// =============================================
// INITIALIZATION
// =============================================
window.onload = function () {
  registerSW();
  showView('home-view');
};

// =============================================
// VIEW NAVIGATION
// =============================================
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  const target = document.getElementById(viewId);
  if (target) target.style.display = 'block';
  window.scrollTo(0, 0);

  if (viewId === 'todo-view')        renderTasks();
  if (viewId === 'events-view')      renderEvents();
  if (viewId === 'study-view')       renderExams();
  if (viewId === 'habit-view')       { renderHabitsToday(); renderHabitsWeekly(); renderHabitsMonthly(); }
  if (viewId === 'travel-view') renderTravel();
  if (viewId === 'career-view') renderCareer();
}

// =============================================
// COLLAPSIBLE SECTIONS (Home)
// =============================================
function toggleSection(element) {
  const content = element.nextElementSibling;
  const isHidden = content.style.display === 'none' || content.style.display === '';
  document.querySelectorAll('.content').forEach(c => c.style.display = 'none');
  document.querySelectorAll('.collapsible').forEach(h => {
    h.innerHTML = h.innerHTML.replace('▲', '▼');
  });
  if (isHidden) {
    content.style.display = 'block';
    element.innerHTML = element.innerHTML.replace('▼', '▲');
  }
}

// =============================================
// TO-DO LIST
// =============================================
function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) return;
  const tasks = getTasks();
  tasks.push({ text, done: false });
  saveTasks(tasks);
  input.value = '';
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('taskList');
  if (!list) return;
  const tasks = getTasks();
  if (tasks.length === 0) {
    list.innerHTML = '<p class="empty-msg">No tasks yet. Add one above! 🎯</p>';
    return;
  }
  list.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    if (task.done) li.classList.add('done');
    li.innerHTML = `
      <span class="task-text" onclick="toggleTask(${index})">${task.text}</span>
      <div class="task-actions">
        <button class="done-btn" onclick="toggleTask(${index})">${task.done ? 'Undo' : 'Done'}</button>
        <button class="delete-btn" onclick="deleteTask(${index})">Del</button>
      </div>`;
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
  if (!confirm('Delete this task permanently?')) return;
  const tasks = getTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks();
}

function getTasks() { return JSON.parse(localStorage.getItem('tasks') || '[]'); }
function saveTasks(t) { localStorage.setItem('tasks', JSON.stringify(t)); }

// =============================================
// IMPORTANT EVENTS
// =============================================
function addEvent() {
  const name    = document.getElementById('eventName').value.trim();
  const date    = document.getElementById('eventDate').value;
  const details = document.getElementById('eventDetails').value.trim();
  if (!name || !date) { alert('Please enter both event name and date!'); return; }
  const events = getEvents();
  events.push({ name, date, details, done: false });
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  saveEvents(events);
  document.getElementById('eventName').value    = '';
  document.getElementById('eventDate').value    = '';
  document.getElementById('eventDetails').value = '';
  renderEvents();
}

function renderEvents() {
  const list = document.getElementById('eventList');
  if (!list) return;
  const events = getEvents();
  if (events.length === 0) {
    list.innerHTML = '<p class="empty-msg">No events yet. Add one above! 🗓️</p>';
    return;
  }
  list.innerHTML = events.map((e, index) => `
    <li class="event-card ${e.done ? 'done' : ''}">
      <div class="event-info">
        <div class="event-name">${e.name}</div>
        <span class="date-badge">${formatDate(e.date)}</span>
        ${e.details ? `<p class="event-details">${e.details}</p>` : ''}
      </div>
      <div class="event-actions">
        <button class="done-btn" onclick="toggleEvent(${index})">${e.done ? 'Undo' : 'Done'}</button>
        <button class="delete-btn" onclick="deleteEvent(${index})">Del</button>
      </div>
    </li>`).join('');
}

function toggleEvent(index) {
  const events = getEvents();
  events[index].done = !events[index].done;
  saveEvents(events);
  renderEvents();
}

function deleteEvent(index) {
  if (!confirm('Delete this event permanently?')) return;
  const events = getEvents();
  events.splice(index, 1);
  saveEvents(events);
  renderEvents();
}

function getEvents() { return JSON.parse(localStorage.getItem('events') || '[]'); }
function saveEvents(e) { localStorage.setItem('events', JSON.stringify(e)); }

// =============================================
// STUDY PLANNER — EXAM LIST
// =============================================
let currentExamIndex = null;

function addExam() {
  const input = document.getElementById('examInput');
  const name = input.value.trim();
  if (!name) return;
  const exams = getExams();
  exams.push({ name, checklist: [], notes: [] });
  saveExams(exams);
  input.value = '';
  renderExams();
}

function renderExams() {
  const container = document.getElementById('examList');
  if (!container) return;
  const exams = getExams();
  if (exams.length === 0) {
    container.innerHTML = '<p class="empty-msg">No exams added yet.<br>Add your first exam above! 📚</p>';
    return;
  }
  container.innerHTML = exams.map((exam, index) => {
    const total    = exam.checklist.length;
    const done     = exam.checklist.filter(i => i.done).length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    return `
    <div class="exam-card" onclick="openExam(${index})">
      <div class="exam-header">
        <span class="exam-name">${exam.name}</span>
        <button class="delete-btn small" onclick="event.stopPropagation(); deleteExam(${index})">Del</button>
      </div>
      <div class="exam-meta">
        ${total > 0
          ? `<span>${done}/${total} topics done</span>
             <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>`
          : `<span class="muted-text">No checklist items yet</span>`}
        <span class="note-count">${exam.notes.length} note${exam.notes.length !== 1 ? 's' : ''}</span>
      </div>
    </div>`;
  }).join('');
}

function openExam(index) {
  currentExamIndex = index;
  const exams = getExams();
  document.getElementById('examDetailTitle').textContent = exams[index].name;
  switchTab('checklist');
  showView('exam-detail-view');
}

function deleteExam(index) {
  if (!confirm('Delete this exam and all its data?')) return;
  const exams = getExams();
  exams.splice(index, 1);
  saveExams(exams);
  renderExams();
}

function getExams() { return JSON.parse(localStorage.getItem('exams') || '[]'); }
function saveExams(e) { localStorage.setItem('exams', JSON.stringify(e)); }

// =============================================
// STUDY PLANNER — TABS
// =============================================
function switchTab(tab) {
  document.getElementById('panel-checklist').style.display = tab === 'checklist' ? 'block' : 'none';
  document.getElementById('panel-notes').style.display     = tab === 'notes'     ? 'block' : 'none';
  document.getElementById('tab-checklist').classList.toggle('active', tab === 'checklist');
  document.getElementById('tab-notes').classList.toggle('active',     tab === 'notes');
  if (tab === 'checklist') renderChecklist();
  if (tab === 'notes')     renderNotes();
}

// =============================================
// STUDY PLANNER — CHECKLIST
// =============================================
function addChecklistItem() {
  const input = document.getElementById('checklistInput');
  const text = input.value.trim();
  if (!text || currentExamIndex === null) return;
  const exams = getExams();
  exams[currentExamIndex].checklist.push({ text, done: false });
  saveExams(exams);
  input.value = '';
  renderChecklist();
}

function renderChecklist() {
  const list = document.getElementById('checklistItems');
  if (!list || currentExamIndex === null) return;
  const exams = getExams();
  const items = exams[currentExamIndex].checklist;
  if (items.length === 0) {
    list.innerHTML = '<p class="empty-msg">No topics yet. Add your first topic! ✅</p>';
    return;
  }
  list.innerHTML = '';
  items.forEach((item, index) => {
    const li = document.createElement('li');
    if (item.done) li.classList.add('done');
    li.innerHTML = `
      <span class="task-text" onclick="toggleChecklistItem(${index})">${item.text}</span>
      <div class="task-actions">
        <button class="done-btn" onclick="toggleChecklistItem(${index})">${item.done ? 'Undo' : 'Done'}</button>
        <button class="delete-btn" onclick="deleteChecklistItem(${index})">Del</button>
      </div>`;
    list.appendChild(li);
  });
}

function toggleChecklistItem(index) {
  const exams = getExams();
  exams[currentExamIndex].checklist[index].done = !exams[currentExamIndex].checklist[index].done;
  saveExams(exams);
  renderChecklist();
}

function deleteChecklistItem(index) {
  if (!confirm('Delete this topic?')) return;
  const exams = getExams();
  exams[currentExamIndex].checklist.splice(index, 1);
  saveExams(exams);
  renderChecklist();
}

// =============================================
// STUDY PLANNER — NOTES
// =============================================
function addNote() {
  const title   = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();
  if (!title || !content || currentExamIndex === null) return;
  const exams = getExams();
  exams[currentExamIndex].notes.push({ title, content, date: today() });
  saveExams(exams);
  document.getElementById('noteTitle').value   = '';
  document.getElementById('noteContent').value = '';
  renderNotes();
}

function renderNotes() {
  const container = document.getElementById('notesList');
  if (!container || currentExamIndex === null) return;
  const exams = getExams();
  const notes = exams[currentExamIndex].notes;
  if (notes.length === 0) {
    container.innerHTML = '<p class="empty-msg">No notes yet. Write your first note! 📝</p>';
    return;
  }
  container.innerHTML = notes.map((note, index) => `
    <div class="note-card">
      <div class="note-header">
        <span class="note-title">${note.title}</span>
        <button class="delete-btn small" onclick="deleteNote(${index})">Del</button>
      </div>
      <p class="note-date">${note.date}</p>
      <p class="note-content">${note.content}</p>
    </div>`).join('');
}

function deleteNote(index) {
  if (!confirm('Delete this note?')) return;
  const exams = getExams();
  exams[currentExamIndex].notes.splice(index, 1);
  saveExams(exams);
  renderNotes();
}

// =============================================
// HABIT TRACKER
// =============================================
function addHabit() {
  const input = document.getElementById('habitInput');
  const name = input.value.trim();
  if (!name) return;
  const habits = getHabits();
  habits.push({ name, logs: {} });
  saveHabits(habits);
  input.value = '';
  renderHabitsToday();
}

// --- TODAY TAB ---
function renderHabitsToday() {
  const container = document.getElementById('habitTodayList');
  if (!container) return;
  const habits = getHabits();
  const todayKey = today();
  if (habits.length === 0) {
    container.innerHTML = '<p class="empty-msg">No habits yet. Add your first habit above! 🌿</p>';
    return;
  }
  container.innerHTML = habits.map((habit, index) => {
    const done   = habit.logs[todayKey] === true;
    const streak = calcStreak(habit.logs);
    return `
    <div class="habit-card ${done ? 'done' : ''}">
      <div class="habit-info">
        <div class="habit-name">${done ? '<s>' + habit.name + '</s>' : habit.name}</div>
        <div class="streak-badge">🔥 ${streak} day streak</div>
      </div>
      <div class="task-actions">
        <button class="done-btn" onclick="toggleHabitToday(${index})">${done ? 'Undo' : 'Done'}</button>
        <button class="delete-btn" onclick="deleteHabit(${index})">Del</button>
      </div>
    </div>`;
  }).join('');
}

function toggleHabitToday(index) {
  const habits   = getHabits();
  const todayKey = today();
  habits[index].logs[todayKey] = !habits[index].logs[todayKey];
  saveHabits(habits);
  renderHabitsToday();
  renderHabitsWeekly();
  renderHabitsMonthly();
}

function deleteHabit(index) {
  if (!confirm('Delete this habit and all its history?')) return;
  const habits = getHabits();
  habits.splice(index, 1);
  saveHabits(habits);
  renderHabitsToday();
  renderHabitsWeekly();
  renderHabitsMonthly();
}

// --- WEEKLY TAB ---
function renderHabitsWeekly() {
  const container = document.getElementById('habitWeeklyView');
  if (!container) return;
  const habits = getHabits();
  if (habits.length === 0) {
    container.innerHTML = '<p class="empty-msg">Add habits to see your weekly view! 📆</p>';
    return;
  }
  const days  = getLast7Days();
  const labels = days.map(d => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-GB', { weekday: 'short' });
  });

  container.innerHTML = `
    <div class="weekly-table-wrap">
      <table class="weekly-table">
        <thead>
          <tr>
            <th>Habit</th>
            ${labels.map(l => `<th>${l}</th>`).join('')}
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          ${habits.map(habit => {
            const cells = days.map(d => {
              const done = habit.logs[d];
              return `<td><span class="week-dot ${done ? 'filled' : ''}"></span></td>`;
            }).join('');
            const doneCount = days.filter(d => habit.logs[d]).length;
            const pct = Math.round((doneCount / 7) * 100);
            return `<tr><td class="habit-label">${habit.name}</td>${cells}<td class="pct-label">${pct}%</td></tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

// --- MONTHLY TAB ---
function renderHabitsMonthly() {
  const container = document.getElementById('habitMonthlyView');
  if (!container) return;
  const habits = getHabits();
  if (habits.length === 0) {
    container.innerHTML = '<p class="empty-msg">Add habits to see your monthly summary! 📊</p>';
    return;
  }
  const days = getDaysThisMonth();
  const now  = new Date();
  const monthName = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  container.innerHTML = habits.map(habit => {
    const doneCount = days.filter(d => habit.logs[d]).length;
    const pct = days.length > 0 ? Math.round((doneCount / days.length) * 100) : 0;
    const dots = days.map(d => {
      const done = habit.logs[d];
      const dt   = new Date(d + 'T00:00:00');
      const day  = dt.getDate();
      return `<div class="month-dot ${done ? 'filled' : ''}" title="${d}">${day}</div>`;
    }).join('');
    return `
    <div class="monthly-card">
      <div class="monthly-header">
        <span class="habit-name-lg">${habit.name}</span>
        <span class="monthly-pct">${doneCount}/${days.length} days (${pct}%)</span>
      </div>
      <div class="monthly-bar"><div class="monthly-bar-fill" style="width:${pct}%"></div></div>
      <div class="month-grid">${dots}</div>
    </div>`;
  }).join('');
}

// --- Switch Habit Tabs ---
function switchHabitTab(tab) {
  ['today', 'weekly', 'monthly'].forEach(t => {
    document.getElementById(`hpanel-${t}`).style.display = t === tab ? 'block' : 'none';
    document.getElementById(`htab-${t}`).classList.toggle('active', t === tab);
  });
  if (tab === 'today')   renderHabitsToday();
  if (tab === 'weekly')  renderHabitsWeekly();
  if (tab === 'monthly') renderHabitsMonthly();
}

function getHabits() { return JSON.parse(localStorage.getItem('habits') || '[]'); }
function saveHabits(h) { localStorage.setItem('habits', JSON.stringify(h)); }

// =============================================
// HELPERS
// =============================================
function today() {
  const d = new Date();
  return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}

function getDaysThisMonth() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  const total = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  return Array.from({ length: today }, (_, i) => {
    const d = new Date(year, month, i + 1);
    return d.toISOString().split('T')[0];
  });
}

function calcStreak(logs) {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().split('T')[0];
    if (logs[key]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function registerSW() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
}

// =============================================
// ENTER KEY SUPPORT
// =============================================
document.addEventListener('DOMContentLoaded', function () {
  const bindings = [
    { id: 'taskInput',      fn: addTask },
    { id: 'eventName',      fn: addEvent },
    { id: 'examInput',      fn: addExam },
    { id: 'checklistInput', fn: addChecklistItem },
    { id: 'noteTitle',      fn: () => document.getElementById('noteContent').focus() },
    { id: 'habitInput',     fn: addHabit },
  ];
  bindings.forEach(({ id, fn }) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keypress', e => { if (e.key === 'Enter') fn(); });
  });
});

// --- TRAVEL ---
function addTravel() {
  const name = document.getElementById('travelName').value.trim();
  const notes = document.getElementById('travelNotes').value.trim();
  if (!name) return;
  const items = JSON.parse(localStorage.getItem('travel') || '[]');
  items.push({ name, notes, visited: false });
  localStorage.setItem('travel', JSON.stringify(items));
  renderTravel();
}

function renderTravel() {
  const list = document.getElementById('travelList');
  const items = JSON.parse(localStorage.getItem('travel') || '[]');
  list.innerHTML = items.map((i, idx) => `
    <li class="event-card ${i.visited ? 'done' : ''}">
      <div class="event-info">
        <strong style="font-size: 20px;">${i.name}</strong>
        <p>${i.notes}</p>
      </div>
      <button class="done-btn" onclick="toggleTravel(${idx})">${i.visited ? 'Undo' : 'Done'}</button>
    </li>`).join('');
}

function toggleTravel(idx) {
  const items = JSON.parse(localStorage.getItem('travel') || '[]');
  items[idx].visited = !items[idx].visited;
  localStorage.setItem('travel', JSON.stringify(items));
  renderTravel();
}

// --- CAREER ---
function addCareer() {
  const title = document.getElementById('careerTitle').value;
  const type = document.getElementById('careerType').value;
  const deadline = document.getElementById('careerDeadline').value;
  const status = document.getElementById('careerStatus').value;
  const notes = document.getElementById('careerNotes').value;
  if (!title || !deadline) return;
  const items = JSON.parse(localStorage.getItem('career') || '[]');
  items.push({ title, type, deadline, status, notes });
  localStorage.setItem('career', JSON.stringify(items));
  renderCareer();
}

function renderCareer() {
  const list = document.getElementById('careerList');
  const items = JSON.parse(localStorage.getItem('career') || '[]');
  list.innerHTML = items.map((i, idx) => `
    <li class="event-card">
      <div class="event-info">
        <div class="event-name">${i.title} (${i.type})</div>
        <div class="date-badge">${i.deadline} — ${i.status}</div>
        <p class="event-details">${i.notes}</p>
      </div>
      <button class="delete-btn" onclick="deleteCareer(${idx})">Delete</button>
    </li>`).join('');
}
