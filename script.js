let tasks = [];

function addTask() {

    const input = document.getElementById("taskInput");
    const task = input.value.trim();

    if (task === "") {
        return;
    }

    tasks.push({
        name: task,
        completed: false
    });

    input.value = "";

    displayTasks();
}

function displayTasks() {

    const list = document.getElementById("taskList");

    list.innerHTML = "";

    tasks.forEach((task, index) => {

        const li = document.createElement("li");

        li.innerHTML = `
            <span 
                class="${task.completed ? 'completed' : ''}"
                onclick="completeTask(${index})">
                ${task.name}
            </span>

            <button class="delete" onclick="deleteTask(${index})">
                Delete
            </button>
        `;

        list.appendChild(li);
    });

    updateStats();
}

function completeTask(index) {

    tasks[index].completed = !tasks[index].completed;

    displayTasks();
}

function deleteTask(index) {

    tasks.splice(index, 1);

    displayTasks();
}

function updateStats() {

    document.getElementById("total").innerText = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    document.getElementById("completed").innerText = completed;
}