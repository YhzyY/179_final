document.write("<script language='javascript' src='https://cdn.firebase.com/libs/firebaseui/3.1.1/firebaseui.js'></script>");
document.write("<script language='javascript' src='https://www.gstatic.com/firebasejs/5.8.5/firebase.js'></script>");
document.write("<link type='text/css' rel='stylesheet' href='https://cdn.firebase.com/libs/firebaseui/3.1.1/firebaseui.css' />");
document.write("<script src='http://code.jquery.com/jquery-1.11.0.min.js'></script>")
var uid;
var chosen_date;
var cal = {
  mName: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], // Month Names
  data: null, // Events for the selected period
  sDay: 0, // Current selected day
  sMth: 0, // Current selected month
  sYear: 0, // Current selected year
  list: function () {
    // cal.list() : draw the calendar for the given month

    // BASIC CALCULATIONS
    // Note - Jan is 0 & Dec is 11 in JS.
    // Note - Sun is 0 & Sat is 6
    cal.sMth = parseInt(document.getElementById("month").value);
    cal.sYear = parseInt(document.getElementById("year").value);
    var daysInMth = new Date(cal.sYear, cal.sMth + 1, 0).getDate(),
      startDay = new Date(cal.sYear, cal.sMth, 1).getDay(),
      endDay = new Date(cal.sYear, cal.sMth, daysInMth).getDay();

    // INIT & LOAD DATA FROM LOCALSTORAGE
    cal.data = localStorage.getItem("cal-" + cal.sMth + "-" + cal.sYear);
    if (cal.data == null) {
      localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, "{}");
      cal.data = {};
    } else {
      cal.data = JSON.parse(cal.data);
    }

    // DRAWING CALCULATION
    // Determine the number of blank squares before start of month
    var squares = [];
    if (startDay != 0) {
      for (var i = 0; i < startDay; i++) {
        squares.push("b");
      }
    }

    // Populate the days of the month
    for (var i = 1; i <= daysInMth; i++) {
      squares.push(i);
    }

    // Determine the number of blank squares after end of month
    if (endDay != 6) {
      var blanks = endDay == 0 ? 6 : 6 - endDay;
      for (var i = 0; i < blanks; i++) {
        squares.push("b");
      }
    }

    // DRAW
    // Container & Table
    var container = document.getElementById("container"),
      cTable = document.createElement("table");
    cTable.id = "calendar";
    container.innerHTML = "";
    container.appendChild(cTable);

    // First row - Days
    var cRow = document.createElement("tr"),
      cCell = null,
      days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
    for (var d of days) {
      cCell = document.createElement("td");
      cCell.innerHTML = d;
      cRow.appendChild(cCell);
    }
    cRow.classList.add("day");
    cTable.appendChild(cRow);

    // Days in Month
    var total = squares.length;
    cRow = document.createElement("tr");
    for (var i = 0; i < total; i++) {
      cCell = document.createElement("td");
      if (squares[i] == "b") {
        cCell.classList.add("blank");
      } else {
        cCell.innerHTML = "<div class='dd'>" + squares[i] + "</div>";
        if (cal.data[squares[i]]) {
          cCell.innerHTML += "<div class='evt'>" + cal.data[squares[i]] + "</div>";
        }
        cCell.addEventListener("click", function () {
          cal.show(this);
        });
      }
      cRow.appendChild(cCell);
      if (i != 0 && (i + 1) % 7 == 0) {
        cTable.appendChild(cRow);
        cRow = document.createElement("tr");
      }
    }

  },

  show: function (el) {
    // cal.show() : show edit event docket for selected day
    // PARAM el : Reference back to cell clicked

    // FETCH EXISTING DATA
    cal.sDay = el.getElementsByClassName("dd")[0].innerHTML;

    // DRAW FORM
    chosen_date = cal.mName[cal.sMth] + "  " + cal.sDay + "  " + cal.sYear;
    document.getElementById("chosen_date").textContent = chosen_date;
    document.getElementById("new_event_start_date").textContent = chosen_date;
    document.getElementById("new_event_end_date").textContent = chosen_date;

    // ATTACH
    document.getElementById('event_list_table').innerHTML = "";
    firebase.firestore().collection("calendar").where("user_id", "==", uid).get().then(function (querySnapshot) {
      var eventIdList = new Array();
      var event_num = 0;
      querySnapshot.forEach(function (doc) {
        console.log(doc.id, " --> ", doc.data()); 
        eventIdList[event_num] = doc.id;
        event_num = parseInt(event_num) + 1;
        loadEvent(uid, eventIdList, event_num, chosen_date);
      });
    }).catch(function (error) {
      console.log("ERROR: " + error);
    });
  }
};

// INIT - DRAW MONTH & YEAR SELECTOR
function loadCalendar(user) {
  alert("reload");
  uid = user.uid;
  // DATE NOW
  var now = new Date(),
    nowDay = now.getDate(),
    nowMth = now.getMonth(),
    nowYear = parseInt(now.getFullYear());

  // APPEND MONTHS
  var mth = document.getElementById("month");
  for (var i = 0; i < 12; i++) {
    var opt = document.createElement("option");
    opt.value = i;
    opt.innerHTML = cal.mName[i];
    if (i == nowMth) {
      opt.selected = true;
    }
    month.appendChild(opt);
  }

  // APPEND YEARS
  // Set to 10 years range. Change this as you like.
  var year = document.getElementById("year");
  for (var i = nowYear - 10; i <= nowYear + 10; i++) {
    var opt = document.createElement("option");
    opt.value = i;
    opt.innerHTML = i;
    if (i == nowYear) {
      opt.selected = true;
    }
    year.appendChild(opt);
  }

  chosen_date = cal.mName[nowMth] + "  " + nowDay + "  " + nowYear;
  document.getElementById("chosen_date").textContent = chosen_date;
  document.getElementById("new_event_start_date").textContent = chosen_date;
  document.getElementById("new_event_end_date").textContent = chosen_date;

  // DRAW CALENDAR
  cal.list();

  // var user = firebase.auth().currentUser;
  uid = user.uid;
  firebase.firestore().collection("calendar").where("user_id", "==", uid).get().then(function (querySnapshot) {
    var eventIdList = new Array();
    var event_num = 0;
    querySnapshot.forEach(function (doc) {
      console.log(doc.id, " --> ", doc.data());
      eventIdList[event_num] = doc.id;
      event_num = parseInt(event_num) + 1;
      loadEvent(uid, eventIdList, event_num, chosen_date);
    });
  }).catch(function (error) {
    console.log("ERROR: " + error);
  });
}


function loadEvent(uid, eventIdList, event_num, chosen_date) {
  var user_id, event_name, start_time, end_time;
  var eventRef = firestore.doc("calendar/" + eventIdList[event_num - 1]);
  eventRef.get().then(function (doc) {
    if (doc && doc.exists) {
      var curData = doc.data();
      user_id = uid;
      event_name = curData.event_name;
      start_time = curData.start_time;
      end_time = curData.end_time;

      var date = start_time.substr(0, 13);
      console.log("start_time:" + start_time);
      console.log("Date:" + date);
      console.log("chosen_date:" + chosen_date);
      if (date == chosen_date)
        addAnEvent(eventIdList[event_num - 1], event_name, start_time, end_time);
    }
  }).catch(function (error) {
    console.log("Got an error: " + error);
  });
  // }
}

function addAnEvent(event_id, event_name, start_time, end_time) {
  try {
    var event_table = document.getElementById('event_list_table');
    var event_table_tr = document.createElement('tr');
    event_table.appendChild(event_table_tr);

    //event_table_title
    var event_table_title = document.createElement("td");
    event_table_title.id = "event_title";
    event_table_title.innerHTML = event_name;
    event_table_tr.appendChild(event_table_title);

    //event_table_start_time
    var event_table_start_date = document.createElement("td");
    event_table_tr.appendChild(event_table_start_date);
    event_table_start_date.id = "event_start_date";
    event_table_start_date.innerHTML = start_time;
    event_table_start_date.onclick = function () {
      goTutorPage(event_tutor_id);
    }

    //event_connect
    var event_connect = document.createElement("td");
    event_table_tr.appendChild(event_connect);
    event_connect.id = "event_connect";
    event_connect.innerHTML = "--";
 
    //event_table_end_time
    var event_end_date = document.createElement("td");
    event_table_tr.appendChild(event_end_date);
    event_end_date.id = "event_end_date";
    event_end_date.innerHTML = end_time;
    event_end_date.onclick = function () {
      goTutorPage(event_tutor_id);
    }

    //event_button
    var event_button = document.createElement("td");
    event_button.id = "event_button";
    event_table_tr.appendChild(event_button);

    var event_delete = document.createElement("input");
    event_delete.id = "event_delete";
    event_delete.type = "button";
    event_delete.value = "Delete";
    event_delete.onclick = function () {
      deleteEvent(event_id);
    }
    event_button.appendChild(event_delete);

  } catch (error) {
    console.log(error);
  }
}

function deleteEvent(event_id) {
  var eventRef = firestore.doc("calendar/" + event_id);
  eventRef.delete().then(function () {
    alert("Deleted successfully!");
    window.location.href = "personal.html?calendarPage=" + "true";
  }).catch(function (error) {
    console.error("Error removing document: ", error);
  });
}


function add_event() {
  var user = firebase.auth().currentUser;
  var uid = user.uid;
  // const calRef = firestore.doc("calendar/");
  var new_event_title = document.getElementById("new_event_title").value;
  var new_event_start_date = document.getElementById("new_event_start_date").textContent;
  var new_event_start_time = document.getElementById("new_event_start_time").value;
  var new_event_end_date = document.getElementById("new_event_end_date").textContent;
  var new_event_end_time = document.getElementById("new_event_end_time").value;
  var new_start = new_event_start_date + "  " + new_event_start_time;
  var new_end = new_event_end_date + "  " + new_event_end_time;

  firestore.collection("calendar").add({
      event_name: new_event_title,
      start_time: new_start,
      end_time: new_end,
      user_id: uid
  })
  .then(function(docRef) {
      document.getElementById("mask_calendar").style.display = 'none';
      alert("New event added!");
      console.log("Document written with ID: ", docRef.id);

      document.getElementById("new_event_title").value = "";
      document.getElementById("new_event_start_time").value = "";
      document.getElementById("new_event_end_time").value = "";

      firebase.firestore().collection("calendar").where("user_id", "==", uid).get().then(function (querySnapshot) {
      var eventIdList = new Array();
      var event_num = 0;
      querySnapshot.forEach(function (doc) {
          console.log(doc.id, " --> ", doc.data()); 
          eventIdList[event_num] = doc.id;
          event_num = parseInt(event_num) + 1;
          loadEvent(uid, eventIdList, event_num, chosen_date);
      });
      }).catch(function (error) {
          console.log("ERROR: " + error);
      });
  })
  .catch(function(error) {
      console.error("Error adding document: ", error);
  });

}