const session = sessionStorage.getItem("account");
if (session) {
    var data = JSON.parse(localStorage.getItem(session));
}

$(() => {
    if (!session) {
        notSigned();
    } else {
        signedIn();
    }

    $("#createTaskForm").submit(function (e) {
        e.preventDefault();
        var data = JSON.parse(localStorage.getItem(session));

        // Form Data
        let raw = $(this).serializeArray(),
            formData = {};
        $(raw).each((index, data) => {
            formData[data.name] = data.value;
        });
        const date = formData.taskTime.replace("T", " ");
        let caArray = [];
        $("#categories")
            .find("span#ca-text")
            .each(function () {
                const ca = $(this).text().trim();
                caArray.push(ca);
            });

        const createData = {
            title: formData.taskTitle,
            description: formData.taskDescription,
            time: date,
            categories: caArray,
            status: false,
        };

        data.taskList.push(createData);

        localStorage.setItem(session, JSON.stringify(data));

        $("#createTaskModal").modal("toggle");
        refreshTodo();
    });

    $("#createCategory").click(function (e) {
        e.preventDefault();
        let ca = "Category";
        $("#categories").prepend(`
            <div class='custom-category'>
                <span id='ca-text' contenteditable="true">
                    Category 
                </span>
                <span id='ca-cancel'>&times;</span>
            </div>
        `);

        $("#ca-cancel").click(function () {
            $(this).parent().replaceWith("");
        });

        $("#ca-text").keypress(function (e) {
            return e.which != 13;
        });
    });

    $("#signUpForm").submit(function (e) {
        e.preventDefault();

        // Form Data
        let raw = $(this).serializeArray(),
            formData = {};
        $(raw).each((index, rawData) => {
            formData[rawData.name] = rawData.value;
        });

        // Action
        const localData = JSON.parse(localStorage.getItem(formData.username));
        if (localData) {
            $("#signAlert").show("fade");
        } else {
            const today = new Date();
            const date =
                today.getFullYear() +
                "-" +
                `${today.getMonth() + 1}`.padStart(2, "0") +
                "-" +
                `${today.getDate()}`.padStart(2, "0");

            const time = today.getHours() + ":" + today.getMinutes();

            const dateTime = date + " " + time;

            data = {
                username: formData.username,
                password: formData.password,
                taskList: [
                    {
                        title: "Your first task",
                        description: "Drink water",
                        time: dateTime,
                        categories: ["new", "default"],
                        status: false,
                    },
                    {
                        title: "Your second task",
                        description: "Breathe",
                        time: dateTime,
                        categories: ["new", "default"],
                        status: true,
                    },
                ],
            };

            localStorage.setItem(formData.username, JSON.stringify(data));
            sessionStorage.setItem("account", formData.username);
            signedIn();
        }
    });

    $("#loginForm").submit(function (e) {
        e.preventDefault();

        // Form Data
        let raw = $(this).serializeArray(),
            formData = {};
        $(raw).each((index, data) => {
            formData[data.name] = data.value;
        });

        // Action
        const localData = JSON.parse(localStorage.getItem(formData.username));

        if (localData) {
            if (formData.password == localData.password) {
                sessionStorage.setItem("account", formData.username);
                signedIn();
            } else {
                $("#loginAlert").show("fade");
            }
        } else {
            $("#loginAlert").show("fade");
        }
    });
});

function refreshTodo() {
    const incomplete = $("#incomplete-tasks");
    const complete = $("#complete-tasks");
    const data = JSON.parse(localStorage.getItem(session));
    const tasks = data.taskList;
    incomplete.empty();
    complete.empty();

    tasks.map((task, index) => {
        let isComplete = task.status;
        const categories = task.categories;

        if (!isComplete) {
            incomplete.append(`
                <li class="list-group-item d-flex flex-column" id='taskContainer-${index}'>
                    <div class="d-flex mb-2" id='categories-${index}'></div>
                    <div class="d-flex">
                        <div class="custom-control custom-checkbox w-auto" >
                            <input
                                type="checkbox"
                                class="custom-control-input"
                                id="checkTask${index}"
                                onchange="taskChecked(this, ${index})"
                            />
                            <label class="custom-control-label" for="checkTask${index}" ></label>
                        </div>
                        <div class="w-100 ml-2" id='title'>${task.title}</div>
                        <span class='ml-auto' id='toggler'>&darr;</span>
                    </div>
                    <div class='mt-2 custom-details' id='task-description-${index}'> Description: ${task.description} </div>
                    <div class='mt-2 custom-details' id='task-options-${index}'>
                        <div class='d-flex'>
                            <span class='custom-category'> delete </span>
                        </div>
                    </div>
                </li>
            `);
            if (categories.length > 0) {
                categories.map((category) => {
                    $(`#categories-${index}`).append(`
                    <div class='custom-category' >${category}</div>
                `);
                });
            } else {
                $(`#categories-${index}`).removeClass("mb-2");
            }
            $(`#taskContainer-${index}`).click(function () {
                console.log("hihi");
                $(
                    `#task-description-${index}, #task-options-${index}`
                ).slideToggle("slow");
            });
        } else {
            complete.append(`
                <li class="list-group-item d-flex flex-column" id='taskContainer-${index}'>
                    <div class="d-flex mb-2" id='categories-${index}'></div>
                    <div class="d-flex">
                        <div class="custom-control custom-checkbox w-auto" >
                            <input
                                type="checkbox"
                                class="custom-control-input"
                                id="checkTask${index}"
                                onchange="taskChecked(this, ${index})"
                                checked
                            />
                            <label class="custom-control-label" for="checkTask${index}" ></label>
                        </div>
                        <div class="w-100 ml-2" id='title'>${task.title}</div>
                        <span class='ml-auto' id='toggler'>&darr;</span>
                    </div>
                    <div class='mt-2 custom-details' id='task-description-${index}'> Description: ${task.description} </div>
                    <div class='mt-2 custom-details' id='task-options-${index}'>
                        <div class='d-flex'>
                            <span class='custom-category'> delete </span>
                        </div>
                    </div>

                </li>
            `);

            if (categories.length > 0) {
                categories.map((category) => {
                    $(`#categories-${index}`).append(`
                    <div class='custom-category' >${category}</div>
                `);
                });
            } else {
                $(`#categories-${index}`).removeClass("mb-2");
            }
            $(`#taskContainer-${index}`).click(function () {
                console.log("hihi");
                $(
                    `#task-description-${index}, #task-options-${index}`
                ).slideToggle("slow");
            });
        }
    });
}

function taskChecked(checkbox, index) {
    const tasks = data.taskList;
    const curTask = tasks[index];
    if (checkbox.checked) {
        curTask.status = true;
        localStorage.setItem(session, JSON.stringify(data));
        refreshTodo();
    } else {
        curTask.status = false;
        localStorage.setItem(session, JSON.stringify(data));
        refreshTodo();
    }
}

function notSigned() {
    $("#notSignedIn").show();
    $("#signedIn, #createTaskBtn").hide();
}

function signedIn() {
    $("#notSignedIn").hide();
    $("#signedIn, #createTaskBtn").show();
    refreshTodo();
}
