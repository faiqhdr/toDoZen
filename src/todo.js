const { ipcRenderer } = require("electron");

ipcRenderer.on("set-username", (event, username) => {
  const greetingElement = document.getElementById("greeting");
  if (greetingElement) {
    greetingElement.innerText = `Hi, ${username}!`;
  }
});

function addTask() {
  const newTaskInput = document.getElementById("new-task");
  const taskText = newTaskInput.value.trim();

  if (taskText !== "") {
    const todoList = document.getElementById("todo-list");

    const listItem = document.createElement("li");
    listItem.textContent = taskText;

    const editButton = document.createElement("button");
    editButton.textContent = "EDIT";
    editButton.onclick = () => editTask(listItem);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "DELETE";
    deleteButton.onclick = () => deleteTask(listItem);

    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);

    todoList.appendChild(listItem);
    newTaskInput.value = "";
  }
}

async function editTask(taskElement) {
  const oldText = taskElement.textContent;

  const newText = await ipcRenderer.invoke("show-prompt", {
    title: "Edit Task",
    label: "New Task Text:",
    value: oldText,
    inputAttrs: {
      type: "text",
    },
    type: "input",
  });

  if (newText !== null && newText !== oldText) {
    taskElement.textContent = newText;
  }
}

function deleteTask(taskElement) {
  const todoList = document.getElementById("todo-list");
  todoList.removeChild(taskElement);
}

function reload() {
  location.reload();
}

function logout() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

function selectTask(event) {
  const todoList = document.getElementById("todo-list");
  const selectedTask = event.target;
  todoList
    .querySelectorAll("li")
    .forEach((task) => task.classList.remove("selected"));
  selectedTask.classList.add("selected");
}
