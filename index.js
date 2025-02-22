// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, putTask, deleteTask} from "./utils/taskFunctions.js";

import { initialData } from "./initialData.js";

// TASK: import initialData


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  boardsNavLinksDiv: document.getElementById('boards-nav-links-div'),
  columnDivs: document.querySelectorAll('.column-div'),
  filterDiv: document.getElementById('filterDiv'),
  modalWindow: document.getElementById('new-task-modal-window'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  themeSwitch: document.getElementById('switch'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  sidebar: document.getElementById('side-bar'),
  saveChanges: document.getElementById('save-task-changes-btn'),
  deleteButton: document.getElementById('delete-task-btn'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn')

}

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

    // activeBoard = JSON.parse(localStorage.getItem("activeBoard")) || boards[0];
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];  
    
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    filterAndDisplayTasksByBoard(activeBoard);
    displayBoards(boards);
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



// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
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

     const filteredTasks = tasks.filter(task => task.board === boardName);

     filteredTasks.forEach(task => {
      console.log("Adding task to UI:", task); // Debugging

    // filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Add click event to each task to open the edit modal
      taskElement.addEventListener('click', () => 
        openEditTaskModal(task));
      

      tasksContainer.appendChild(taskElement);
    });
  });
}



// function refreshTasksUI() {
//   filterAndDisplayTasksByBoard(activeBoard);
// }

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


function addDeleteTaskEventListener(taskElement) {
//   // const deleteButton = document.createElement("button");
// //   //deleteButton.textContent = "Delete";
// deleteButton.classList.add("delete-task-btn");

deleteButton.addEventListener("click", (event) => {
      // event.stopPropagation(); // Prevent triggering other events
      const taskId = taskElement.getAttribute("data-task-id");
      deleteTask(taskId); // Call deleteTask function
      refreshTasksUI(); // Refresh the UI after deletion
  });

  taskElement.appendChild(deleteButton);
}


function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]'

  ); 
  if (!column) { 
   // console.error('Column not found for status:'' ${task.status}); 
    return; //exits function
  }

  let tasksContainer = column.querySelector(".tasks-container"); //finds tasks container within the selected column
  if (!tasksContainer) {
    // console.warn(Tasks container not found for status: ${task.status}, creating one.);
    tasksContainer = document.createElement("div"); //creates new div that serves as tasks container
    tasksContainer.className = "tasks-container"; //assigns name to newly created div
    column.appendChild(tasksContainer); //add new tasks container to selected column
  }

  const taskElement = document.createElement("div"); //creates new div element for the individual task
  taskElement.className = "task-div"; //assigns class name to the task element
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id); //add data attribute to the task element to store tasks ID
  tasksContainer.appendChild(taskElement);  //add task element to tasks container making it visible to user interface
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.addEventListener('click',() =>{
    toggleModal(false, elements.editTaskModal);
    elements.filterDiv.style.display = 'none';
  });
  

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.displa = "none";
     // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false, elements.modalWindow);
    toggleModal(false, elements.editTaskModal);
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

  // Add new task form submission event listener
  elements.modalWindow.addEventListener("submit",(event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal= elements.modalWindow) {
  modal.style.display = show ? "block": "none";
  
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  // Add a new task to the list
  event.preventDefault();

  //Assign user input to the task object
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
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}



   

function toggleSidebar(show) {
  document.body.classList.toggle('sidebar-visible', show);
  localStorage.setItem('showSideBar', show ? 'true' : 'false'); // Store sidebar state in localStorage
}

// Theme toggle function
function toggleTheme() {
  const isLightTheme = document.body.classList.contains('light-theme');
  const newThemeState = !isLightTheme;
  document.body.classList.toggle('light-theme', newThemeState);
  localStorage.setItem('light-theme', newThemeState ? 'enabled' : 'disabled');
}




function openEditTaskModal(task) {
  if (!elements.editTaskModal) return;

  const titleInput = elements.editTaskModal.querySelector('#edit-task-title-input');
  const descriptionInput = elements.editTaskModal.querySelector('#edit-task-desc-input');
  const statusSelect = elements.editTaskModal.querySelector('#edit-task-status');
  const deleteButton = elements.editTaskModal.querySelector('#delete-task-btn');
  
  if (titleInput && descriptionInput && statusSelect) {
    titleInput.value = task.title;
    descriptionInput.value = task.description;
    statusSelect.value = task.status;
  } else{
    console.error("One or more input elements not found in the modal.");
  }

  elements.editTaskModal.setAttribute('data-task-id', task.id);

  if (deleteButton) {
    deleteButton.addEventListener('click', (event) => {
      deleteTaskFromModal(task.id); // Call function to delete the task
      toggleModal(false, elements.editTaskModal); // Close the modal after deletion
    });
  }

  toggleModal(true, elements.editTaskModal);
}

function deleteTaskFromModal(taskId) {
  deleteTask(taskId);
  refreshTasksUI();

}


function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTask = {
    title: document.getElementById('edit-task-title-input').value,
    description: document.getElementById('edit-task-desc-input').value,
    status: document.getElementById('edit-select-status').value,
  };

  // Update task using a helper function
  patchTask(taskId, updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}


/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  initializeData()
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}