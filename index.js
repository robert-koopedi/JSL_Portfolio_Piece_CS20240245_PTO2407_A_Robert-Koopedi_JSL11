// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, putTask, deleteTask} from "./utils/taskFunctions.js";

import { initialData } from "./initialData.js";

// TASK: import initialData


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if(!localStorage.getItem('tasks')) { 
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  }
}

// TASK: Get elements from the DOM
const elements = {
   //get elements from HTML that will be used throughout our code so we can call them
  sideBar: document.getElementById("side-bar-div"),
  boardsNavLinksDiv: document.getElementById("boards-nav-links-div"),
  themeSwitch: document.getElementById("switch"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  headerBoardName: document.getElementById("header-board-name"),
  dropdownBtn: document.getElementById("dropdownBtn"),
  addNewTaskBtn: document.getElementById("add-new-task-btn"),
  editBoardBtn: document.getElementById("edit-board-btn"),
  deleteBoardBtn: document.getElementById("deleteBoardBtn"),
  tasksContainers: document.querySelectorAll(".tasks-container"),
  columnDivs: document.querySelectorAll(".column-div"),
  newTaskModalWindow: document.getElementById("new-task-modal-window"),
  editTaskModalWindow: document.querySelector(".edit-task-modal-window"),
  modalWindow: document.querySelector(".modal-window"),
  titleInput: document.getElementById("title-input"),
  descInput: document.getElementById("desc-input"),
  selectStatus: document.getElementById("select-status"),
  createTaskBtn: document.getElementById("create-task-btn"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  editTaskForm: document.getElementById("edit-task-form"),
  editTaskTitleInput: document.getElementById("edit-task-title-input"),
  editTaskDescInput: document.getElementById("edit-task-desc-input"),
  editSelectStatus: document.getElementById("edit-select-status"),
  saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),
  filterDiv: document.getElementById("filterDiv"),
  
};

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  console.log("Fetched tasks:", tasks);

  if (!tasks || tasks.length === 0) {
    console.warn("No tasks found in localStorage.");
    return;
  }

  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard")); //parses the board from JSON

    activeBoard = localStorageBoard ? localStorageBoard : boards[0];  
    
    elements.headerBoardName.textContent = activeBoard;
    displayBoards(boards);
    styleActiveBoard(activeBoard);
    filterAndDisplayTasksByBoard(activeBoard);
    refreshTasksUI();
  } else {
    console.warn('No boards found!');
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click",() => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();
  console.log("filtered tasks for board:,", boardName, tasks);
 
  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

     const filteredTasks = tasks.filter(task => task.board === boardName && task.status === status);

     filteredTasks.forEach(task => {
      console.log("Adding task to UI:", task);

      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      taskElement.addEventListener('click', () => openEditTaskModal(task));
      
      tasksContainer.appendChild(taskElement);
    });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach((btn) => { 
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }else {
      btn.classList.remove('active'); 
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`
  ); 
  if (!column) { 
   console.error(`Column not found for status: ${task.status}`); 
    return; //exits function
  }

  let tasksContainer = column.querySelector(".tasks-container"); //finds tasks container within the selected column
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement("div"); //creates new div that serves as tasks container
    tasksContainer.className = "tasks-container"; //assigns name to newly created div
    column.appendChild(tasksContainer); //add new tasks container to selected column
  }

  const taskElement = document.createElement("div"); //creates new div element for the individual task
  taskElement.className = "task-div"; //assigns class name to the task element
  taskElement.textContent = task.title;
  taskElement.setAttribute("data-task-id", task.id); //add data attribute to the task element to store tasks ID
  tasksContainer.appendChild(taskElement);  //add task element to tasks container making it visible to user interface
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  elements.cancelEditBtn.addEventListener('click',() =>{
    toggleModal(false, elements.editTaskModalWindow);
    elements.filterDiv.style.display = 'none';
  });
  

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  elements.cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false, elements.modalWindow);
    elements.filterDiv.style.display = "block";
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    if (elements.newTaskModalWindow.style.display === "block") {
      toggleModal(false, elements.newTaskModalWindow);
    }
    if (elements.editTaskModalWindow.style.display === "block") {
      toggleModal(false, elements.editTaskModalWindow);
    }
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click',() => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click',() => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.addNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });

  elements.editBoardBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "none"; // Also show the filter overlay
  });

  // Add new task form submission event listener
  if (elements.modalWindow) {
    elements.modalWindow.addEventListener('submit', (event) => {
      event.preventDefault();
      addTask(event);
    });
  }
}


// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  if (!modal) {
    console.log("Modal not found");
    return;
  }
  
  //Close modals first
  if (modal !== elements.newTaskModalWindow) {
    elements.newTaskModalWindow.style.display = "none";
  }
  if (modal !== elements.editTaskModalWindow) {
    elements.editTaskModalWindow.style.display = "none";
  }
  // shows the correct modal
  console.log(`Toggling modal: ${show ? "Show" : "Hide"}`);
  modal.style.display = show ? "block" : "none";
  elements.filterDiv.style.display = show ? "block" : "none";
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  const task = {
    status: document.getElementById("select-status").value,
    title: document.getElementById("title-input").value,
    description: document.getElementById("desc-input").value,
    board: activeBoard,
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = "none"; 
    event.target.reset();
    refreshTasksUI();
  }
}

//toggle sidebar visibility and saves the user's preference in local storage
function toggleSidebar(show) {
  const sidebar =document.querySelector(".side-bar");
  sidebar.style.display = show ?'block':'none';
  elements.showSideBarBtn.style.display = show? "none" : "block";
}


// Theme toggle function
//changes the theme and saves the user's preference in local
function toggleTheme() {
  const logo = document.getElementById("logo");
  const isLightTheme = document.body.classList.toggle('light-theme');
  logo.setAttribute("src",
    isLightTheme ? "./assets/logo-light.svg" : "./assets/logo-dark.svg");
}

function openEditTaskModal(task) {
  const title = document.getElementById("edit-task-title-input");
  const desc = document.getElementById("edit-task-desc-input");
  const status = document.getElementById("edit-select-status");
  title.value = task.title;
  desc.value = task.description;
  status.value = task.status;

  const saveTaskChangesBtn = document.getElementById("save-task-changes-btn");
  const deleteTaskBtn = document.getElementById("delete-task-btn");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");

  function cancelEdit() {
    toggleModal(false, elements.editTaskModalWindow);
  }

  saveTaskChangesBtn.removeEventListener('click', saveTaskChanges);
  deleteTaskBtn.removeEventListener('click', deleteTask);
  cancelEditBtn.removeEventListener('click', cancelEdit);

  saveTaskChangesBtn.addEventListener("click", function saveEdit() {
    saveTaskChanges(task.id);
    elements.editTaskModalWindow.style.display = "none"; // Close the modal
  });

  deleteTaskBtn.addEventListener("click", function deleteTaskHandler() {
    deleteTask(task.id);  // Call the existing deleteTask function
    elements.editTaskModalWindow.style.display = "none"; // Close the modal
    refreshTasksUI(); // Refresh the UI after deletion
  });

  cancelEditBtn.addEventListener("click", cancelEdit); // Cancel edit modal
  console.log('Opening modal for task:', task);
  console.log(elements.editTaskModalWindow);

  toggleModal(true, elements.editTaskModalWindow);
}


function saveTaskChanges(taskId) {
  // Get new user inputs
  // Create an object with the updated task details
  const updatedTask = {
    id: taskId,
    title: elements.editTaskTitleInput.value,
    description: elements.editTaskDescInput.value,
    status: elements.editSelectStatus.value,
    board: activeBoard,
  };

    putTask(taskId, updatedTask);
    refreshTasksUI();
    toggleModal(false, elements.editTaskModalWindow);
   
 }
 
/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  initializeData();
  init(); // init is called after the DOM is fully loaded
  
});

//initialize the application
function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks() //initial display of boards and tasks

}