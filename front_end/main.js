console.log("MAIN.JS LOADED");

const API_BASE = "http://localhost:8080";


// ====== UI ELEMENTS  ======
const input = document.getElementById("todo-input");
const deadlineInput = document.getElementById("todo-deadline");
const contextInput = document.getElementById("ai-context");
const addBtn = document.getElementById("add-btn");
const aiBtn = document.getElementById("ai-btn");
const todoList = document.getElementById("todo-list");
const toastBox = document.getElementById("toast-box");

// Auth UI
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const authStatus = document.getElementById("auth-status");

// ====== TOAST ======
let toastTimeout;
function showToast(message) {
  if (!toastBox) return alert(message);
  toastBox.textContent = message;
  toastBox.classList.add("show");
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toastBox.classList.remove("show"), 3000);
}

// ====== TOKEN ======
function getToken() {
  return localStorage.getItem("token");
}
function setToken(token) {
  localStorage.setItem("token", token);
}
function clearToken() {
  localStorage.removeItem("token");
}

function renderAuthState() {
  const token = getToken();
  if (token) {
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (authStatus) authStatus.textContent = "Đã đăng nhập ✅";
  } else {
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (authStatus) authStatus.textContent = "Chưa đăng nhập";
  }
}

// ====== API helper ======
async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 204) return null;

  let data = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    data = await res.json().catch(() => null);
  }

  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
}

function fmtDate(due) {
  if (!due) return "";
  if (typeof due === "string") return due.slice(0, 10);
  return "";
}

// ====== AUTH actions ======
loginBtn?.addEventListener("click", async () => {
  try {
    const email = emailEl?.value?.trim();
    const password = passwordEl?.value?.trim();
    if (!email || !password) return showToast("⚠️ Nhập email + mật khẩu");

    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setToken(data.token);
    renderAuthState();
    showToast("✅ Login thành công");
    await loadTodos();
  } catch (e) {
    showToast("❌ " + e.message);
  }
});

logoutBtn?.addEventListener("click", () => {
  clearToken();
  renderAuthState();
  if (todoList) todoList.innerHTML = "";
  showToast("👋 Đã logout");
});

// ====== RENDER ======
function createTodoItem(todo) {
  
  const id = todo.id ?? todo.todo_id;
  if (!id) console.warn("Todo thiếu id:", todo);

  let text = todo.title || "";
  let deadline = fmtDate(todo.due_date);
  let context = todo.context || "";
  let isEditing = false;

  const li = document.createElement("li");
  li.className = "todo-item";
  li.dataset.id = id || "";

  const left = document.createElement("div");
  left.className = "todo-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = !!todo.completed;

  const contentDiv = document.createElement("div");
  contentDiv.className = "todo-content";

  const span = document.createElement("span");
  span.className = "todo-text";
  span.textContent = text;

  const contextSpan = document.createElement("div");
  contextSpan.className = "todo-context-display";
  contextSpan.textContent = context;

  const dateSpan = document.createElement("div");
  dateSpan.className = "todo-deadline-display";
  dateSpan.textContent = deadline ? `Hạn: ${deadline}` : "";

  const editInput = document.createElement("input");
  editInput.className = "edit-input";
  editInput.type = "text";
  editInput.placeholder = "Tên công việc";

  const editContextInput = document.createElement("input");
  editContextInput.className = "edit-context-input";
  editContextInput.type = "text";
  editContextInput.placeholder = "Ghi chú";

  const editDateInput = document.createElement("input");
  editDateInput.className = "edit-date-input";
  editDateInput.type = "date";

  function applyDoneStyle() {
    if (checkbox.checked) {
      span.classList.add("done");
      contextSpan.style.opacity = "0.5";
    } else {
      span.classList.remove("done");
      contextSpan.style.opacity = "1";
    }
  }

  
  contentDiv.appendChild(span);
  if (context) contentDiv.appendChild(contextSpan);
  contentDiv.appendChild(dateSpan);

  left.appendChild(checkbox);
  left.appendChild(contentDiv);

  const actions = document.createElement("div");
  actions.className = "todo-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "action-btn edit-btn";
  editBtn.textContent = "Sửa";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "action-btn delete-btn";
  deleteBtn.textContent = "Xóa";

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(left);
  li.appendChild(actions);

  applyDoneStyle();

  
  async function syncComplete() {
    try {
      if (!id) return showToast("❌ Todo thiếu id");
      await apiFetch(`/api/todos/${id}/complete`, {
        method: "PATCH",
        body: JSON.stringify({ completed: checkbox.checked }),
      });
      applyDoneStyle();
    } catch (e) {
      checkbox.checked = !checkbox.checked;
      showToast("❌ " + e.message);
    }
  }

  checkbox.addEventListener("change", () => {
    applyDoneStyle();
    if (isEditing) toggleEdit();
    syncComplete();
  });

  left.addEventListener("click", (e) => {
    if ([checkbox, editInput, editContextInput, editDateInput].includes(e.target)) return;
    if (isEditing) return;
    checkbox.checked = !checkbox.checked;
    applyDoneStyle();
    syncComplete();
  });

  
  deleteBtn.addEventListener("click", async () => {
    try {
      if (!id) return showToast("❌ Todo thiếu id");
      await apiFetch(`/api/todos/${id}`, { method: "DELETE" });
      li.remove();
      showToast("🗑️ Đã xóa");
    } catch (e) {
      showToast("❌ " + e.message);
    }
  });

  async function saveEdit() {
    const newText = editInput.value.trim();
    const newContext = editContextInput.value.trim();
    const newDate = editDateInput.value;

    if (!newText) return showToast("⚠️ Tên công việc không được rỗng");

    try {
      if (!id) return showToast("❌ Todo thiếu id");

      
      const updated = await apiFetch(`/api/todos/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: newText,
          due_date: newDate || null,
          context: newContext,
        }),
      });

      text = updated.title || newText;
      context = updated.context || "";
      deadline = fmtDate(updated.due_date);

      span.textContent = text;
      contextSpan.textContent = context;
      dateSpan.textContent = deadline ? `Hạn: ${deadline}` : "";

      contentDiv.innerHTML = "";
      contentDiv.appendChild(span);
      if (context) contentDiv.appendChild(contextSpan);
      contentDiv.appendChild(dateSpan);

      editBtn.textContent = "Sửa";
      editBtn.classList.remove("save-btn");
      isEditing = false;

      showToast("✅ Đã cập nhật công việc!");
    } catch (e) {
      showToast("❌ " + e.message);
    }
  }

  function toggleEdit() {
    if (isEditing) {
      saveEdit();
    } else {
      editInput.value = text;
      editContextInput.value = context;
      editDateInput.value = deadline || "";

      contentDiv.innerHTML = "";
      contentDiv.appendChild(editInput);
      contentDiv.appendChild(editContextInput);
      contentDiv.appendChild(editDateInput);

      editBtn.textContent = "Lưu";
      editBtn.classList.add("save-btn");
      editInput.focus();
      isEditing = true;
    }
  }

  editBtn.addEventListener("click", toggleEdit);

  [editInput, editContextInput, editDateInput].forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") toggleEdit();
    });
  });

  return li;
}

function renderTodos(todos) {
  if (!todoList) return;
  todoList.innerHTML = "";
  (todos || []).forEach((t) => {
    const li = createTodoItem(t);
    if (li) todoList.appendChild(li);
  });
}

// ====== LOAD + CREATE ======
async function loadTodos() {
  try {
    if (!getToken()) return;
    const todos = await apiFetch("/api/todos");
    renderTodos(todos);
  } catch (e) {
    showToast("❌ " + e.message);
  }
}

async function addTodo() {
  const text = input?.value?.trim() || "";
  const deadline = deadlineInput ? deadlineInput.value : "";
  const context = contextInput ? contextInput.value.trim() : "";

  if (!getToken()) return showToast("⚠️ Bạn cần đăng nhập trước");

  if (!text) {
    if (context) showToast("⚠️ Bạn đang nhập ở ô Prompt. Hãy bấm nút 'AI' hoặc nhập tên việc ở trên!");
    else showToast("⚠️ Vui lòng nhập tên công việc!");
    return;
  }

  try {
    await apiFetch("/api/todos", {
      method: "POST",
      body: JSON.stringify({
        title: text,
        due_date: deadline || null,
        context,
      }),
    });

    if (input) input.value = "";
    if (deadlineInput) deadlineInput.value = "";
    if (contextInput) contextInput.value = "";
    input?.focus?.();

    showToast("✅ Đã thêm công việc!");
    await loadTodos();
  } catch (e) {
    showToast("❌ " + e.message);
  }
}

addBtn?.addEventListener("click", addTodo);
input?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});

// ====== AI BUTTON ======
contextInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") aiBtn?.click?.();
});

aiBtn?.addEventListener("click", () => {
  const promptText = contextInput?.value?.trim() || "";
  if (!promptText) return showToast("⚠️ Vui lòng nhập yêu cầu cho AI!");
  console.log("Gửi Prompt lên AI:", promptText);
  showToast(`🤖 [AI] Đang xử lý: "${promptText}"...`);
});

// ====== INIT ======
window.addEventListener("DOMContentLoaded", () => {
  renderAuthState();
  if (getToken()) loadTodos();
});
