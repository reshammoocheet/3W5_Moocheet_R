let nowTime = new Date(); // global variable for current time.

// Let's display the date. Got the string from month thanks to online documentation.
document.getElementById("liveTime").innerHTML = nowTime.toLocaleDateString('default', { month: 'long' }) + " " + nowTime.getDate() + " " + nowTime.getHours() + ":" + nowTime.getMinutes();

class User {
    constructor(role, stationFrom, stationTo, time) {
        this.role = role;
        this.stationFrom = stationFrom;
        this.stationTo = stationTo;
        this.time = new Date(time);
    }
}

// This is either the Customer or Admin.
let user = new User();

const form = document.getElementById("theForm");
form.addEventListener("submit", isValid);

function isValid(e) {
    e.preventDefault();

    // First, let's get the values.
    let role = document.getElementById("role").value;
    let stationFrom = document.getElementById("stationsFrom").value;
    let stationTo = document.getElementById("stationsTo").value;

    // Converting the time string to create Date objects, making use of the class' functionalities.
    let time = new Date("1970-01-01 " + document.getElementById("time").value);

    user = {
        role,
        stationFrom,
        stationTo,
        time
    };

    console.log("this is the user time converted to " + user.time.toLocaleString('it-IT').split(',')[1]);

    // When are we rejecting?
    if (stationFrom == stationTo || user.time == "" || user.time.getHours() + user.time.getMinutes() < nowTime.getHours() + nowTime.getMinutes())
        alert("Error.");

    else {
        getPath();
        // Resetting form. => how?   
    }

}

// Let's work with train speed. 
async function getSpeed() {
    let speed = await (await fetch("http://10.101.0.12:8080/averageTrainSpeed")).json();
    console.log(speed[0].AverageSpeed + "km/h");
}

async function getPath() {

    // Get stops.
    let segmentPath = await fetch("http://10.101.0.12:8080/path/" + user.stationFrom + "/" + user.stationTo);
    let segmentPathJSON = await segmentPath.json();
    console.log(segmentPathJSON);

    // Get schedules from user startpoint. This returns an array of ALL stops.
    let schedulesObj = await (await fetch("http://10.101.0.12:8080/schedule/" + user.stationFrom)).json();

    // Get schedules that DEPART from start station only.
    let departures = schedulesObj.filter(schedule => schedule.Direction == "Depart from " + user.stationFrom);
    console.log(departures);

    // We want the time values only, no objects just raw data inside an array. 
    let schedules = departures.map(({ Time }) => new Date(Time).toLocaleString('it-IT').split(',')[1]);
    let goalTime = user.time.toLocaleString('it-IT').split(',')[1];

    console.log("this is the goal minutes " + goalTime.split(':')[1]);
    console.log("this is example of api schedules " + schedules + " which contains " + schedules.length + " elements");

    // Get closest value to user's selected time. 
    let arrayMins = [];
    let theTime;

    for (let i = 0; i < schedules.length; i++) {
        if (schedules[i] === goalTime)
            theTime = schedules[i];

        else if (schedules[i].split(':')[0] === goalTime.split(':')[0]) {
            // Convert minutes format to Number so I can compare.

            console.log(schedules[i]);

            console.log(Number(schedules[i].split(':')[1]));

            // Adding to array.
            arrayMins.push(Number(schedules[i].split(':')[1]));

            console.log(arrayMins);

            // Find closest minutes value. I'm using the reduce method, learned from class but I also looked it up on online documentation.
            let goalMinutes = Number(goalTime.split(':')[1]);
            console.log(goalMinutes);

            theTime = arrayMins.reduce(function (before, now) {
                return Math.abs(now - goalMinutes) < Math.abs(before - goalMinutes) ? now : before;
            });
            console.log(theTime);
        }
    }

    console.log("this is array " + arrayMins);
    console.log("this is the closest value : " + theTime);

    // Display station names from-to destination - so in-between locations.
    // Get distances, speed and time.
    for (let i = 0; i < segmentPathJSON.length - 1; i++) {

        // Get distance between stations.
        let start = await segmentPathJSON[i].Name;

        let end = segmentPathJSON[i + 1].Name;

        // Speed value.
        let speed = await (await fetch("http://10.101.0.12:8080/averageTrainSpeed")).json();

        // *** To solve for time, t = d/s. ***
        let distance = await (await fetch("http://10.101.0.12:8080/distance/" + start + "/" + end)).json();

        let time = distance / speed[0].AverageSpeed;
        console.log(" this is how long from " + start + " to " + end + " : " + time * 60 + " minutes.");

    }

    // Appending text elements to display to user on screen. => Stations + Times.
    for (let i = 0; i < segmentPathJSON.length - 1; i++) {
        document.getElementById("trip").appendChild(document.createElement("p"))
            .appendChild(document.createTextNode("Station " + segmentPathJSON[i].Name + " Segment Id " + segmentPathJSON[i].SegmentId));
    }
}