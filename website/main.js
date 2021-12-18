let nowTime = new Date(); // global variable for current time.

// Let's display the date. Got the string from month thanks to online documentation.
document.getElementById("liveTime").innerHTML = nowTime.toLocaleDateString('default', { month: 'long' }) + " " + nowTime.getDate() + " " + nowTime.getHours() + ":" + nowTime.getMinutes();

class User {
    constructor(role, stationFrom, stationTo, time) {
        this.role = role;
        this.stationFrom = stationFrom;
        this.stationTo = stationTo;
        this.time = time;
    }
}

// This is either the Customer or Admin.
let user = new User();

const form = document.getElementById("theForm");
form.addEventListener("submit", isValid);

function isValid(e) {
    e.preventDefault();

    // First, let's get the values.
    let stationFrom = document.getElementById("stationsFrom").value;
    let stationTo = document.getElementById("stationsTo").value;

    // Converting the time string to matching ones on schedules' API.
    let time = new Date("1970-01-01 " + document.getElementById("time").value);

    user = {
        role,
        stationFrom,
        stationTo,
        time
    };

    console.log("this is the user time converted to " + user.time);

    // When are we rejecting?
    if (stationFrom == stationTo || user.time == "" || user.time.getHours() + user.time.getMinutes() < nowTime.getHours() + nowTime.getMinutes())
        alert("Error.");

    else {
        getPath();
        // Resetting form. => how?   
    }

}

async function getPath() {

    // Get stops.
    let segmentPath = await fetch("http://10.101.0.12:8080/path/" + user.stationFrom + "/" + user.stationTo);
    let segmentPathJSON = await segmentPath.json();
    console.log(segmentPathJSON);

    // Display station names from-to destination - so in-between locations.
    for (let i = 0; i < segmentPathJSON.length; i++) {
        document.getElementById("trip").appendChild(document.createElement("p"))
            .appendChild(document.createTextNode("Station " + segmentPathJSON[i].Name + " Segment Id " + segmentPathJSON[i].SegmentId))
    }

    // Putting into an array multiple arrays of schedules (1 array for each station).
    let schedules = [];
    for (let i = 0; i < segmentPathJSON.length; i++) {
        schedules.push(
            await (await fetch("http://10.101.0.12:8080/schedule/" + segmentPathJSON[i].Name)).json()
        )
    }

    console.log(schedules);


    
    // Get closest time to current. => Online documentation.
    // Another schedules' array so it can only have the time values.

 
    console.log("this is the goal iso " + user.time.toISOString());
    console.log("this is example of api iso " + schedules[0][0].Time);
    let closestTimes = [];

    // schedules = [ [][][][][][][] ]

    schedules.forEach(function(station) {
        // each station is an array inside the array.
        station.forEach(function(time) {
            // time inside each station.

            if (user.time.toISOString() > time.Time)
                closestTimes.push(time.Time);           
        })
    })

    console.log(closestTimes);

    let timeSchedules = [];
    for (let i = 0; i < schedules.length; i++) {

    }
    //console.log(timeSchedules);

}


// Get values from user input.
let role = document.getElementById("role");
role.addEventListener("change", setRole);

// Setting role.
function setRole() {

}

let start = document.getElementById("stationsFrom");
start.addEventListener("change", setStart);

// Setting start location.
function setStart() {

}

let destination = document.getElementById("stationsTo");
destination.addEventListener("change", setDestination);

// Setting destination location.
function setDestination() {

}
async function tripStations() {
    console.log("yay!");
    let response = await fetch("http://10.101.0.12:8080/stations" + "/10");
    responseJSON = response.json();
    document.getElementById("trip").innerHTML = responseJSON;
}


function preventDefault() {
    console.log("u suck");
}