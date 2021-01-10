var tasks = {};




$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
   
  },
  deactivate: function(event) {
  
  },
  over: function(event) {
 
  },
  out: function(event) {    
  },
  update: function(event) {

    //array to store the task data i
  var tempArr = [];

    //loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
      .find("p")
      .text()
      .trim();

      var date = $(this)
      .find("span")
      .text()
      .trim();

    //add task data to temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });

      console.log(tempArr);

// trim down lists ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

// update array on tasks object and save
tasks[arrName] = tempArr;
saveTasks();  
  }
});

var auditTask = function(taskEl) {
  //get date from task element
  var date = $(taskEl).find("span").text().trim();
  
  //convert to moment object at 5:00 pm
  var time = moment(date, "L").set("hour", 17);
  
  //remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  //apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};


var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  //check due date
  auditTask(taskLi);  


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
   
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};
$("#modalDueDate").datepicker({
  minDate: 1
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });
  
    saveTasks();
  } 
});
//task text was clicked

$(".list-group").on("click", "p", function(){
  var text = $(this)
  .text()
  .trim();
  

  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text);
$(this).replaceWith(textInput);

textInput.trigger("focus");
});
//editable field was un-focused
$(".list-group").on("blur", "textarea", function(){
  //get the textareas current value
  var text = $(this)
  .val()
  //.trim();
//get the parent ul's id attribute
var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");
//get the tasks positiohn in the list of other li elements
var index = $(this)
.closest(".list-group-item")
.index();

// update task in array and re-save to localstorage
tasks[status][index].text = text;
saveTasks();


//recreat p element
var taskP = $("<p>")
.addClass("m-1")
.text(text);

//replace textarea with p element
$(this).replaceWith(taskP);

});


//due date was clicked
$(".list-group").on("click", "span", function(){
  //get current text
  var date = $(this)
  .text()
  .trim();
  //create new input element
  var dateInput = $("<input>")
  .attr("type", "text")
  .addClass("form-control")
  .val(date);

  //swap out elements
  $(this).replaceWith(dateInput);

    //enable jquery ui datepicker
    dateInput.datepicker({
      minDate: 1,
      onClose: function() {
        //when calendar is closed force a change event on the dateInput
        $(this).trigger("change");
      }
    });

  //automatically bring up calendar
  dateInput.trigger("focus");
});
//value of due date was changed
$(".list-group").on("change", "input[type='text']", function(){
  //get current text
  var date = $(this).val();
  

  //get the parent ul's id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  //get the tasks position in hw list of other li elem
  var index = $(this)
  .closest(".list-group-item")
  .index();

  //update task in array
  tasks[status][index].date = date;
  saveTasks();

  //recreate span element wtih bootstrap
  var taskSpan = $("<span>")
  .addClass("badge badge-primary badge-pill")
  .text(date);

  //replace input with span element
  $(this).replaceWith(taskSpan);

  //pass tasks li element into the auditTask to check due date
  auditTask($(taskSpan).closest(".list-group-item"));
});
// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
  
});

// load tasks for the first time
loadTasks();

$("#trash").droppable ({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
    console.log("drop");
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});
