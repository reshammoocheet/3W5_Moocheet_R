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

    let connectSchedules;

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
        connectSchedules = connections.map(({ Time }) => new Date(Time).toLocaleString('it-IT').split(',')[1]);
        let goalTimeTwo; // calculate the time itll take after stops then loook up closest time.

        console.log(connectSchedules);
        console.log(goalTimeTwo);
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

        if (goalTime == departSchedules[i]) {
            theTime = departSchedules[i];
            // Convert start point time to seconds.
            console.log(theTime);
            timeString = departSchedules[i].split(':');
            startSeconds = Number(timeString[0] * 60 * 60) + Number(timeString[1] * 60) + Number(timeString[2]);
            break;
        }

        else if (departSchedules[i].split(':')[0] == goalTime.split(':')[0] && Number(departSchedules[i].split(':')[1]) >= Number(goalTime.split(':')[1])) {

            // Find closest minutes value. I'm using the reduce method, learned from class but I also looked it up on online documentation.
            let goalMinutes = Number(goalTime.split(':')[1]);

            // Adding to array.
            for (let i = 0; i < departSchedules.length; i++) {
                if (departSchedules[i].split(':')[1] >= goalMinutes)
                    arrayMins.push(Number(departSchedules[i].split(':')[1]));
            }

            console.log(arrayMins);


            console.log(goalMinutes);

            theTime = new Date("1970-01-01 " + user.time.getHours() + ":" + arrayMins.reduce(function (before, now) {
                return Math.abs(now - goalMinutes) < Math.abs(before - goalMinutes) ? now : before;
            }));

            // Convert start point time to seconds.
            timeString = theTime.toLocaleString('it-IT').split(',')[1].split(':');
            startSeconds = Number(timeString[0] * 60 * 60) + Number(timeString[1] * 60) + Number(timeString[2]);
            break;
        }
        else if (Number(departSchedules[i].split(':')[0]) == (Number(goalTime.split(':')[0]) + 1)) {
            // This is in case it's like 12:57, we go to the next hour and repeat the same process of finding the closest minute.
            // Adding to array.
            for (let i = 0; i < departSchedules.length; i++) {
                arrayMins.push(Number(departSchedules[i].split(':')[1]));
            }
            let goalMinutes = 0;

            console.log(goalMinutes);
            console.log(arrayMins);

            theTime = new Date("1970-01-01 " + (Number(goalTime.split(':')[0]) + 1) + ":" + arrayMins.reduce(function (before, now) {
                return Math.abs(now - goalMinutes) < Math.abs(before - goalMinutes) ? now : before;
            }));

            console.log(goalMinutes);

            console.log(theTime);

            // Convert start point time to seconds.
            timeString = theTime.toLocaleString('it-IT').split(',')[1].split(':');
            startSeconds = Number(timeString[0] * 60 * 60) + Number(timeString[1] * 60) + Number(timeString[2]);

            console.log(timeString);
            console.log(startSeconds);
            break;
        }
        else
            continue;

    }
    console.log("this is the closest value : " + theTime);
    console.log(startSeconds);
    console.log(timeString);

    // Display station names from-to destination - so in-between locations.
    // Get distances, speed and time.

    // Appending text elements to display to user on screen. => Stations + Times.
    document.getElementById("starting").innerHTML = "Starting at " + timeString[0] + ":" + timeString[1] + ":" + timeString[2] + " " + user.stationFrom;

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

        document.getElementById("timeStops").appendChild(document.createElement("li"))
            .appendChild(document.createTextNode(end + " at " + new Date(counter * 1000).toISOString().substring(11, 19)));

        if (user.segmentId != segmentPathJSON[i + 1].SegmentId) {
            console.log("hey! change segments bro");

            // Get closest value based on counter.
            let secondGoalTime = new Date(counter * 1000).toISOString().substring(11, 19);
            console.log(secondGoalTime);
            console.log(connectSchedules);

            let secondTime;

            let secondArrayMins = [];

            let secondTimeString;
            let secondStartSeconds;

            // This is the same process to retrieve times and calculations but based on segment switch.
            for (let i = 0; i < connectSchedules.length; i++) {
                
                if (secondGoalTime == connectSchedules[i]) {
                    secondTime = connectSchedules[i];
                    // Convert start point time to seconds.
                    secondTimeString = secondTime.split(':');
                    secondStartSeconds = Number(secondTimeString[0] * 60 * 60) + Number(secondTimeString[1] * 60) + Number(secondTimeString[2]);
                    break;
                }
                else if (Number(connectSchedules[i].split(':')[0]) == Number(secondGoalTime.split(':')[0])) {

                    // Find closest minutes value. I'm using the reduce method, learned from class but I also looked it up on online documentation.
                    let secondGoalMinutes = Number(secondGoalTime.split(':')[1]);

                    // Adding to array.
                    for (let i = 0; i < connectSchedules.length; i++) {
                        if (connectSchedules[i].split(':')[1] >= secondGoalMinutes)  
                            secondArrayMins.push(Number(connectSchedules[i].split(':')[1]));
                    }

                    console.log(secondArrayMins);

                    
                    console.log(secondGoalMinutes);

                    secondTime = new Date("1970-01-01 " + connectSchedules[i].split(':')[0] + ":" + secondArrayMins.reduce(function (before, now) {
                        return Math.abs(now - secondGoalMinutes) < Math.abs(before - secondGoalMinutes) ? now : before;
                    }));

                    // Convert start point time to seconds.
                    secondTimeString = secondTime.toLocaleString('it-IT').split(',')[1].split(':');
                    secondStartSeconds = Number(secondTimeString[0] * 60 * 60) + Number(secondTimeString[1] * 60) + Number(secondTimeString[2]);
                    break;
                }
                else if (Number(connectSchedules[i].split(':')[0]) == (Number(secondGoalTime.split(':')[0]) + 1)) {
                    // This is in case it's like 12:57, we go to the next hour and repeat the same process of finding the closest minute.
                    // Adding to array.
                    console.log(connectSchedules[i] + " " + secondGoalTime);
                    for (let i = 0; i < connectSchedules.length; i++) {
                        secondArrayMins.push(Number(connectSchedules[i].split(':')[1]));
                    }
                    let secondGoalMinutes = 0;

                    console.log(secondGoalMinutes);
                    console.log(secondArrayMins);

                    secondTime = new Date("1970-01-01 " + (Number(secondGoalTime.split(':')[0]) + 1) + ":" + secondArrayMins.reduce(function (before, now) {
                        return Math.abs(now - secondGoalMinutes) < Math.abs(before - secondGoalMinutes) ? now : before;
                    }));

                    console.log(secondGoalMinutes);

                    console.log(secondTime);

                    // Convert start point time to seconds.
                    secondTimeString = secondTime.toLocaleString('it-IT').split(',')[1].split(':');
                    secondStartSeconds = Number(secondTimeString[0] * 60 * 60) + Number(secondTimeString[1] * 60) + Number(secondTimeString[2]);

                    console.log(secondTimeString);
                    console.log(secondStartSeconds);
                    break;
                }
                else
                    continue;
            }

            document.getElementById("timeStops").getElementsByTagName("li")[i - 1]
                .appendChild(document.createTextNode(" Next Departure at " + new Date(secondStartSeconds * 1000).toISOString().substring(11, 19)));

            // Removing duplicate elements (segment switch) in list of stops and times.
            document.getElementById("timeStops").removeChild(document.getElementById("timeStops").getElementsByTagName("li")[i]);


            let secondCounter = secondStartSeconds;
            for (let j = i; j < segmentPathJSON.length - 1; j++) {
                // Get distance between stations.
                let start = segmentPathJSON[j].Name;

                let end = segmentPathJSON[j + 1].Name;

                if (start == end)
                    continue;

                // Speed value.
                let speed = await (await fetch("http://10.101.0.12:8080/averageTrainSpeed")).json();

                // *** To solve for time, t = d/s. ***
                let distance = await (await fetch("http://10.101.0.12:8080/distance/" + start + "/" + end)).json();

                let time = (distance / speed[0].AverageSpeed) * 60 * 60;
                console.log(" this is how long from " + start + " to " + end + " : " + time + " seconds.");
                secondCounter += time;
                console.log("counter is " + Math.round(secondCounter));

                document.getElementById("timeStops").appendChild(document.createElement("li"))
                    .appendChild(document.createTextNode(end + " at " + new Date(secondCounter * 1000).toISOString().substring(11, 19)));
            }
            break;
        }
    }



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

