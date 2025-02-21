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
  deleteButton: document.getElementById('delete-task-btn')

}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  
  if (boards.length > 0) {
    activeBoard = JSON.parse(localStorage.getItem("activeBoard")) || boards[0];
    if (elements.headerBoardName) {
      elements.headerBoardName.textContent = activeBoard;
    }

    styleActiveBoard(activeBoard);
    filterAndDisplayTasksByBoard(activeBoard);
    displayBoards(boards);
  } else {
    console.warn('No boards found!');
  }
}


// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = elements.boardsNavLinksDiv;
  boardsContainer.innerHTML = ''; // Clears the container
  
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', function() { 
      activeBoard = board; 
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      fetchAndDisplayBoardsAndTasks();
    });
    boardsContainer.appendChild(boardElement);
  });
}


// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();
  const filteredTasks = tasks.filter(task => task.board === boardName);

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Add click event to each task to open the edit modal
      taskElement.addEventListener('click', () => { 
        openEditTaskModal(task);
      });

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
  document.querySelectorAll('.board-btn').forEach(btn => {
    if (btn.innerText.trim() === boardName.trim()) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}



function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.error(`Column not found for status= ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title;
  taskElement.setAttribute('data-task-id', task.id);

  // Add event listener for clicking the task to open the edit modal
  taskElement.addEventListener('click', () => openEditTaskModal(task));

  // Add delete button to each task
  addDeleteTaskEventListener(taskElement);

  tasksContainer.appendChild(taskElement);
}

// Refresh tasks UI after adding a new task
function refreshTasksUI() {
  if (activeBoard) {
    filterAndDisplayTasksByBoard(activeBoard);
  } else {
    console.error('No active board selected');
  }
}


function setupEventListeners() {
  if (elements.cancelEditBtn) {
      elements.cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));
  }
  if (elements.cancelAddTaskBtn) {
      elements.cancelAddTaskBtn.addEventListener('click', () => toggleModal(false));
  }
  if (elements.showSideBarBtn) {
      elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));
  }
  if (elements.sidebar) {
      elements.sidebar.addEventListener('click', () => toggleSidebar(false));
  }
  if (elements.themeSwitch) {
      elements.themeSwitch.addEventListener('change', toggleTheme);
  }
  if (elements.createNewTaskBtn) {
      elements.createNewTaskBtn.addEventListener('click', () => toggleModal(true));
  }
  if (elements.modalWindow) {
      elements.modalWindow.addEventListener('submit', addTask);
  }
}

  
  // Cancel editing task event listener
   // Cancel editing task event listener
   const cancelEditBtn = document.getElementById('cancel-edit-btn');
   cancelEditBtn.addEventListener('click',() => toggleModal(false, elements.editTaskModal)); 
 
  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });


  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  if(elements.hideSideBarBtn) {
  elements.hideSideBarBtn.addEventListener('click',() => toggleSidebar(false));// fix: added an event lister
  }

  if(elements.showSideBarBtn) {
  elements.showSideBarBtn.addEventListener('click',() => toggleSidebar(true)); 
  }

  // Theme switch event listener
  if(elements.themeSwitch) {
  elements.themeSwitch.addEventListener('change', toggleTheme);
  }

  // Show Add New Task Modal event listener
  if(elements.createNewTaskBtn) {
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    if(elements.filterDiv) {
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
    }
  });
  }

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; //fix: used the correct tirnary operator
}


/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
   const titleInput = document.getElementById('title-input');
  const descInput = document.getElementById('desc-input');
  const statusSelect = document.getElementById('select-status');
  
  if (!titleInput || !descInput || !statusSelect) {
    console.error('Required form fields are missing');
    return;
  }

  const title = titleInput.value;
  const description = descInput.value;
  const status = statusSelect.value || 'todo';

  if (title.trim() || description.trim()) {
    const newTask = createNewTask({
      title,
      description,
      status,
      board: activeBoard
    });

    addTaskToUI(newTask);

    toggleModal(false);
    elements.filterDiv.style.display = 'none';

    event.target.reset();

    refreshTasksUI();
  } else {
    console.error('Title and Description cannot be empty');
    alert('Title and description cannot be empty');
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