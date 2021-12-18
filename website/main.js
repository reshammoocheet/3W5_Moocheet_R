let nowTime = new Date(); // global variable for current time.

// Let's display the date. Got the string from month thanks to online documentation.
document.getElementById("liveTime").innerHTML = nowTime;

class User {
    constructor(role, stationFrom, stationTo, segmentId, finalSegmentId, time) {
        this.role = role;
        this.stationFrom = stationFrom;
        this.stationTo = stationTo;
        this.segmentId = segmentId;
        this.finalSegmentId = finalSegmentId;
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

    // Get segment ID value.
    let segmentId = segmentPathJSON[0].SegmentId;   // Starting from...

    // How many segments? What are they? If there's more than one, it'll be two segments maximum (logistically).
    let finalSegment = [];
    for (let i = 0; i < segmentPathJSON.length; i++) {
        if (segmentPathJSON[0].SegmentId != segmentPathJSON[i].SegmentId)
            finalSegment.push(segmentPathJSON[i].Name, segmentPathJSON[i].SegmentId);
    }

    // Add to object.
    user.finalSegmentId = finalSegment[1];

    // Add to object.
    user.segmentId = segmentId;

    // Get schedules from user startpoint. This returns an array of ALL stops.
    let schedulesDepart = await (await fetch("http://10.101.0.12:8080/schedule/" + user.stationFrom)).json();

    // Get schedules from user connecting segment.
    if (finalSegment.length != 0) {
        console.log(finalSegment);
        let schedulesConnect = await (await fetch("http://10.101.0.12:8080/schedule/" + finalSegment[0])).json();

        // Only consider times from second segment.
        let connections = schedulesConnect.filter(schedule => schedule.SegmentId == finalSegment[1]);
        console.log(connections);

        // Same thing but with the second segment.
        let connectSchedules = connections.map(({ Time }) => new Date(Time).toLocaleString('it-IT').split(',')[1]);
        let goalTimeTwo; // calculate the time itll take after stops then loook up closest time.
    }

    console.log(user.segmentId);

    // Only consider times from first segment.
    let departures = schedulesDepart.filter(schedule => schedule.SegmentId == user.segmentId);
    console.log(departures);

    // We want the time values only, no objects just raw data inside an array. 
    let departSchedules = departures.map(({ Time }) => new Date(Time).toLocaleString('it-IT').split(',')[1]);
    let goalTime = user.time.toLocaleString('it-IT').split(',')[1];

    console.log("this is the goal minutes " + goalTime.split(':')[1]);
    console.log("this is example of api schedules " + departSchedules + " which contains " + departSchedules.length + " elements");

    // Get closest time to user's selected time. 
    let arrayMins = [];
    let theTime;

    // Array for estimated times (calculated thanks to speed and such).
    let arraySecs = [];

    // Initialization.
    let timeString;
    let startSeconds;

    for (let i = 0; i < departSchedules.length; i++) {
        if (departSchedules[i] === goalTime)
            theTime = departSchedules[i];

        else if (departSchedules[i].split(':')[0] === goalTime.split(':')[0] && Number(departSchedules[i].split(':')[1]) >= Number(goalTime.split(':')[1])) {

            // Convert minutes format to Number so I can compare.
            console.log(Number(departSchedules[i].split(':')[1]));

            // Adding to array.
            arrayMins.push(Number(departSchedules[i].split(':')[1]));

            console.log(arrayMins);

            // Find closest minutes value. I'm using the reduce method, learned from class but I also looked it up on online documentation.
            let goalMinutes = Number(goalTime.split(':')[1]);
            console.log(goalMinutes);

            theTime = new Date("1970-01-01 " + user.time.getHours() + ":" + arrayMins.reduce(function (before, now) {
                return Math.abs(now - goalMinutes) < Math.abs(before - goalMinutes) ? now : before;
            }));

            // Convert start point time to seconds.
            timeString = theTime.toLocaleString('it-IT').split(',')[1].split(':');
            startSeconds = Number(timeString[0] * 60 * 60) + Number(timeString[1] * 60) + Number(timeString[2]);
        }
    }
    console.log("this is the closest value : " + theTime);
    console.log(startSeconds);
    console.log(timeString);

    // Display station names from-to destination - so in-between locations.
    // Get distances, speed and time.
    let counter = startSeconds;
    for (let i = 0; i < segmentPathJSON.length - 1; i++) {

        // Get distance between stations.
        let start = await segmentPathJSON[i].Name;

        let end = segmentPathJSON[i + 1].Name;

        // Speed value.
        let speed = await (await fetch("http://10.101.0.12:8080/averageTrainSpeed")).json();

        // *** To solve for time, t = d/s. ***
        let distance = await (await fetch("http://10.101.0.12:8080/distance/" + start + "/" + end)).json();

        let time = (distance / speed[0].AverageSpeed) * 60 * 60;
        console.log(" this is how long from " + start + " to " + end + " : " + time + " seconds.");
        counter += time;
        console.log("counter is " + Math.round(counter));


        document.getElementById("times").appendChild(document.createElement("p"))
            .appendChild(document.createTextNode(end + " at " + new Date(counter * 1000).toISOString().substr(11, 8)));

        if (user.segmentId != segmentPathJSON[i].SegmentId) {
            console.log("hey! change segments bro");
            break;
        }
    }

    // Appending text elements to display to user on screen. => Stations + Times.
    document.getElementById("trip").appendChild(document.createElement("p")).appendChild(document.createTextNode("Starting at " + theTime.toLocaleString('it-IT') + " " + user.stationFrom));

    for (let i = 1; i < segmentPathJSON.length; i++) {
        document.getElementById("trip").appendChild(document.createElement("p"))
            .appendChild(document.createTextNode("Station " + segmentPathJSON[i].Name + " Segment Id " + segmentPathJSON[i].SegmentId));
    }


}