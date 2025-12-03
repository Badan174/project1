// Lấy các phần tử
const input = document.getElementById("todo-input");
const deadlineInput = document.getElementById("todo-deadline");
const contextInput = document.getElementById("ai-context");
const addBtn = document.getElementById("add-btn");
const aiBtn = document.getElementById("ai-btn");
const todoList = document.getElementById("todo-list");

// --- HÀM TẠO ITEM ---
function createTodoItem(text, deadline, context) {
  const li = document.createElement("li");
  li.className = "todo-item";

  // --- PHẦN TRÁI ---
  const left = document.createElement("div");
  left.className = "todo-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const contentDiv = document.createElement("div");
  contentDiv.className = "todo-content";

  // 1. Tên công việc
  const span = document.createElement("span");
  span.className = "todo-text";
  span.textContent = text;

  // 2. Context (Prompt gốc) - Hiển thị bên dưới
  const contextSpan = document.createElement("div");
  contextSpan.className = "todo-context-display";
  contextSpan.textContent = context;

  // 3. Deadline
  const dateSpan = document.createElement("div");
  dateSpan.className = "todo-deadline-display";
  if (deadline) dateSpan.textContent = `Hạn: ${deadline}`;

  // --- CÁC Ô INPUT ẨN ĐỂ SỬA ---
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

  // Lắp ráp ban đầu
  contentDiv.appendChild(span);
  if (context) contentDiv.appendChild(contextSpan);
  contentDiv.appendChild(dateSpan);

  left.appendChild(checkbox);
  left.appendChild(contentDiv);

  // --- PHẦN PHẢI ---
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

  // --- LOGIC SỰ KIỆN ---
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

  // --- LOGIC SỬA ---
  function toggleEdit() {
    if (isEditing) {
      // --> LƯU
      const newText = editInput.value.trim();
      const newContext = editContextInput.value.trim();
      const newDate = editDateInput.value;

      if (newText !== "") {
        // Cập nhật biến
        text = newText;
        context = newContext;
        deadline = newDate;

        // Cập nhật hiển thị
        span.textContent = text;
        contextSpan.textContent = context;
        dateSpan.textContent = deadline ? `Hạn: ${deadline}` : "";

        // Reset DOM hiển thị
        contentDiv.innerHTML = "";
        contentDiv.appendChild(span);
        if (context) contentDiv.appendChild(contextSpan);
        contentDiv.appendChild(dateSpan);

        editBtn.textContent = "Sửa";
        editBtn.classList.remove("save-btn");
        isEditing = false;
      }
    } else {
      // --> SỬA
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

// --- LOGIC THÊM TASK (ĐÃ SỬA) ---
function addTodo() {
  const text = input.value.trim();
  const deadline = deadlineInput ? deadlineInput.value : "";
  const context = contextInput ? contextInput.value.trim() : "";

  // KIỂM TRA NGHIÊM NGẶT:
  // Nếu ô tên công việc (Hàng 1) bị trống thì KHÔNG làm gì cả, 
  // kể cả khi ô Prompt (Hàng 2) đang có chữ.
  if (text === "") {
    if (context !== "") {
      // Nếu người dùng lỡ nhập vào prompt mà bấm lộn nút Thêm, nhắc nhở họ
      alert("Bạn đang nhập ở ô Prompt cho AI. Vui lòng bấm nút 'AI' hoặc nhập tên công việc vào ô phía trên để thêm thủ công.");
    } else {
      alert("Vui lòng nhập tên công việc!");
    }
    return;
  }

  // Nếu có text (tên công việc), thì thêm bình thường
  // (Context lúc này đóng vai trò là ghi chú phụ thêm cho công việc đó)
  const item = createTodoItem(text, deadline, context);
  todoList.appendChild(item);

  // Reset ô nhập
  input.value = "";
  if (deadlineInput) deadlineInput.value = "";
  if (contextInput) contextInput.value = "";
  input.focus();
}

// Gắn sự kiện cho nút Thêm
if (addBtn) addBtn.addEventListener("click", addTodo);

// Enter ở ô Tên công việc -> Thêm
if (input) input.addEventListener("keydown", (e) => { if(e.key === "Enter") addTodo(); });

// Enter ở ô Prompt AI -> KHÔNG GỌI addTodo nữa (để tránh nhầm lẫn)
// Nếu muốn Enter ở đây kích hoạt nút AI thì dùng logic bên dưới
if (contextInput) {
    contextInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
             // Logic: Enter ở đây thì kích hoạt nút AI (giả lập click nút AI)
             // Chứ không kích hoạt nút Thêm
             if (aiBtn) aiBtn.click();
        }
    });
}

// --- NÚT AI ---
if (aiBtn) {
    aiBtn.addEventListener("click", () => {
        const promptText = contextInput.value.trim();
        if (!promptText) {
            alert("Vui lòng nhập yêu cầu cho AI!");
            return;
        }
        
        console.log("Gửi Prompt lên AI:", promptText);
        alert(`[Giả lập AI]: Đang xử lý "${promptText}"...`);
        
        // Sau này khi AI trả về kết quả, bạn sẽ gọi:
        // createTodoItem("Tên việc AI tạo", "Ngày AI tạo", promptText);
    });
}