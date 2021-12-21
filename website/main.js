let nowTime = new Date(); // global variable for current time.

// Let's display the date. Got the string from month thanks to online documentation.
document.getElementById("liveTime").innerHTML = nowTime.toString().split('G')[0];

// External APIs. First one I'm using is worldwide data.
// Credit to inshortsapi.vercel.app.
async function getNews() {
    let data = await (await fetch("https://inshortsapi.vercel.app/news?category=world")).json();
    document.getElementById("news").getElementsByTagName("p")[1].innerHTML = data.data[0].content
    + "<br></br>Written by: " + data.data[0].author + ". Date: " + data.data[0].date.split(',')[0];
}

getNews();

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

// Making click event happen once only.
form.addEventListener("submit", isValid, { once: true });

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

    let date = document.getElementById("date").value;
    console.log(date);
    console.log(nowTime.toISOString().split('T')[0]);

    console.log("this is the user time converted to " + user.time.toLocaleString('it-IT').split(',')[1]);
    console.log("This is ");
    // When are we rejecting?
    if (stationFrom == stationTo || user.time == "" || date < nowTime.toISOString().split('T')[0] || date == nowTime.toISOString().split('T')[0] && user.time.getHours() < nowTime.getHours() || date == nowTime.toISOString().split('T')[0] && user.time.getHours() == nowTime.getHours() && user.time.getMinutes() < nowTime.getMinutes())
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

    // Initialization.
    let timeString;
    let startSeconds;

    for (let i = 0; i < departSchedules.length; i++) {
        console.log(" LOL " + departSchedules[i].split(':'));
        if (departSchedules[i].split(':')[0] + departSchedules[i].split(':')[1] === goalTime)
            theTime = departSchedules[i];

        else if (departSchedules[i].split(':')[0] === goalTime.split(':')[0] && Number(departSchedules[i].split(':')[1]) >= Number(goalTime.split(':')[1])) {

            console.log("second if.");
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
        else {
            console.log("This is " + Number(departSchedules[i].split(':')[0]) + " second split " +Number(departSchedules[i].split(':')[1]) + " and " + Number(goalTime.split(':')[0]));
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

        if (start == end)
            continue;

        document.getElementById("timeStops").appendChild(document.createElement("li"))
            .appendChild(document.createTextNode(end + " at " + new Date(counter * 1000).toISOString().substring(11, 19)));

        if (user.segmentId != segmentPathJSON[i].SegmentId) {
            console.log("hey! change segments bro");
            break;
        }
    }

    // Appending text elements to display to user on screen. => Stations + Times.
    document.getElementById("starting").innerHTML = "Starting at " + theTime.toLocaleString('it-IT').split(',')[1] + " " + user.stationFrom;

    for (let i = 1; i < segmentPathJSON.length; i++) {
        if (segmentPathJSON[i].Name == segmentPathJSON[i - 1].Name) {
            continue;
        }

        document.getElementById("stops").appendChild(document.createElement("li"))
            .appendChild(document.createTextNode(segmentPathJSON[i].Name + ": Segment Id " + segmentPathJSON[i].SegmentId));

        // Making elements clickable - the list ones. Took this from my SpaceX assignment.
        document.getElementById("stops").addEventListener("click", function (e) {
            console.log(e.target.innerHTML.split(':')[0]);
            if (e.target.innerHTML.split(':')[0] == segmentPathJSON[i].Name) {
                // name of function that we're calling.
                getInfo(segmentPathJSON[i].StationId);
            }
        });
    }
}
async function getInfo(id) {
    // We are getting station information AND notifications (if there are any).
    // Fetching station information.
    let information = await (await fetch("http://10.101.0.12:8080/stations/" + id)).json();

    // Fetching station notification.
    let notification = await (await fetch("http://10.101.0.12:8080/notifications/" + id)).json();

    let stops = document.getElementById("stops");

    for (let i = 0; i < document.getElementById("stops").getElementsByTagName("li").length; i++) {

        console.log(information[0].Name);

        console.log(stops.getElementsByTagName("li")[0].innerHTML);

        if (stops.getElementsByTagName("li")[i].innerHTML.split(':')[0] == information[0].Name) {
            console.log("match !" + stops.getElementsByTagName("li")[i].innerHTML.split(':')[0] + " and " + information[0].Name);
            stops.getElementsByTagName("li")[i].appendChild(document.createElement("p"))
                .appendChild(document.createTextNode(information[0].BicycleAvailability ? information[0].StreetName + " street and there is bicycle availability." : information[0].StreetName + " street and there is no bicycle availability."));

            // If the array is empty, nothing is displayed.
            if (notification.length > 0) {
                stops.getElementsByTagName("li")[i].lastChild.appendChild(document.createElement("p"))
                    .appendChild(document.createTextNode(""));

                // Using w3schools online documentation to animate text.
                let j = 0;
                let text = notification[0].Name + " - " + notification[0].Description;

                // Changing color.
                text.fontcolor('red');
                function animateText() {
                    if (j < text.length) {
                        stops.getElementsByTagName("li")[i].lastElementChild.innerHTML += text.charAt(j);
                        j++;
                        setTimeout(animateText, 55);
                    }
                }

                // Calling the animate function.
                animateText();

            }

        }
    }
}

