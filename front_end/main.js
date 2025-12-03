// Lấy các phần tử
const input = document.getElementById("todo-input");
const deadlineInput = document.getElementById("todo-deadline");
const contextInput = document.getElementById("ai-context");
const addBtn = document.getElementById("add-btn");
const aiBtn = document.getElementById("ai-btn");
const todoList = document.getElementById("todo-list");
const toastBox = document.getElementById("toast-box"); // Lấy khung thông báo

// --- HÀM HIỂN THỊ THÔNG BÁO (THAY CHO ALERT) ---
let toastTimeout;
function showToast(message) {
  // Gán nội dung
  toastBox.textContent = message;
  
  // Thêm class để hiện ra
  toastBox.classList.add("show");

  // Nếu đang có đếm ngược cũ thì xóa đi để tránh lỗi
  if (toastTimeout) clearTimeout(toastTimeout);

  // Sau 3 giây thì tự ẩn đi
  toastTimeout = setTimeout(() => {
    toastBox.classList.remove("show");
  }, 3000);
}

// --- HÀM TẠO ITEM ---
function createTodoItem(text, deadline, context) {
  const li = document.createElement("li");
  li.className = "todo-item";

  // PHẦN TRÁI
  const left = document.createElement("div");
  left.className = "todo-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

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
  if (deadline) dateSpan.textContent = `Hạn: ${deadline}`;

  // CÁC Ô INPUT ẨN ĐỂ SỬA
  const editInput = document.createElement("input");
  editInput.className = "edit-input";
  editInput.type = "text";
  editInput.placeholder = "Tên công việc";

  const editContextInput = document.createElement("input");
  editContextInput.className = "edit-context-input";
  editContextInput.type = "text";
  editContextInput.placeholder = "Ghi chú / Prompt";

  const editDateInput = document.createElement("input");
  editDateInput.className = "edit-date-input";
  editDateInput.type = "date";

  contentDiv.appendChild(span);
  if (context) contentDiv.appendChild(contextSpan);
  contentDiv.appendChild(dateSpan);

  left.appendChild(checkbox);
  left.appendChild(contentDiv);

  // PHẦN PHẢI
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

  // LOGIC SỰ KIỆN
  let isEditing = false;

  function updateDone() {
    if (checkbox.checked) {
      span.classList.add("done");
      contextSpan.style.opacity = "0.5";
    } else {
      span.classList.remove("done");
      contextSpan.style.opacity = "1";
    }
    if (isEditing) toggleEdit();
  }
  checkbox.addEventListener("change", updateDone);

  left.addEventListener("click", (e) => {
    if ([checkbox, editInput, editContextInput, editDateInput].includes(e.target)) return;
    if (isEditing) return;
    checkbox.checked = !checkbox.checked;
    updateDone();
  });

  deleteBtn.addEventListener("click", () => li.remove());

  // LOGIC SỬA
  function toggleEdit() {
    if (isEditing) {
      const newText = editInput.value.trim();
      const newContext = editContextInput.value.trim();
      const newDate = editDateInput.value;

      if (newText !== "") {
        text = newText;
        context = newContext;
        deadline = newDate;

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
        
        // Thông báo cập nhật thành công
        showToast("Đã cập nhật công việc!");
      }
    } else {
      editInput.value = text;
      editContextInput.value = context;
      editDateInput.value = deadline;

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

  [editInput, editContextInput, editDateInput].forEach(el => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") toggleEdit();
    });
  });

  return li;
}

// --- LOGIC THÊM TASK ---
function addTodo() {
  const text = input.value.trim();
  const deadline = deadlineInput ? deadlineInput.value : "";
  const context = contextInput ? contextInput.value.trim() : "";

  if (text === "") {
    if (context !== "") {
      // Thay alert bằng showToast
      showToast("⚠️ Bạn đang nhập ở ô Prompt. Hãy bấm nút 'AI' hoặc nhập tên việc ở trên!");
    } else {
      // Thay alert bằng showToast
      showToast("⚠️ Vui lòng nhập tên công việc!");
    }
    return;
  }

  const item = createTodoItem(text, deadline, context);
  todoList.appendChild(item);

  input.value = "";
  if (deadlineInput) deadlineInput.value = "";
  if (contextInput) contextInput.value = "";
  input.focus();
}

if (addBtn) addBtn.addEventListener("click", addTodo);
if (input) input.addEventListener("keydown", (e) => { if(e.key === "Enter") addTodo(); });
if (contextInput) {
    contextInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
             if (aiBtn) aiBtn.click();
        }
    });
}

// --- NÚT AI ---
if (aiBtn) {
    aiBtn.addEventListener("click", () => {
        const promptText = contextInput.value.trim();
        if (!promptText) {
            showToast("⚠️ Vui lòng nhập yêu cầu cho AI!");
            return;
        }
        
        console.log("Gửi Prompt lên AI:", promptText);
        showToast(`🤖 [AI] Đang xử lý: "${promptText}"...`);
    });
}