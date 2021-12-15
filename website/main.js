let nowTime = new Date(); // global variable for current time.

let JSONex = [{ "SegmentId": 4, "SegmentName": "Deux-Montagnes-Bois-Franc", "Name": "Sainte-Dorothée", "StationId": 18 },
{ "SegmentId": 4, "SegmentName": "Deux-Montagnes-Bois-Franc", "Name": "Île-Bigras", "StationId": 17 },
{ "SegmentId": 4, "SegmentName": "Deux-Montagnes-Bois-Franc", "Name": "Pierrefonds-Roxboro", "StationId": 16 },
{ "SegmentId": 4, "SegmentName": "Deux-Montagnes-Bois-Franc", "Name": "Sunnybrooke", "StationId": 15 },
{ "SegmentId": 4, "SegmentName": "Deux-Montagnes-Bois-Franc", "Name": "Bois-Franc", "StationId": 14 },
{ "SegmentId": 7, "SegmentName": "Bois-Franc-YUL-Aéroport-Montréal-Trudeau", "Name": "Bois-Franc", "StationId": 14 },
{ "SegmentId": 7, "SegmentName": "Bois-Franc-YUL-Aéroport-Montréal-Trudeau", "Name": "Marie-Curie", "StationId": 25 }];


class User {
    constructor(role, stationFrom, stationTo, date) {
        this.role = role;
        this.stationFrom = stationFrom;
        this.stationTo = stationTo;
        this.date = date;
    }
}


let user1 = new User();

const form = document.getElementById("theForm");
form.addEventListener("submit", isValid);

function isValid(e) {
    e.preventDefault();

    // First, let's get the values.
    let stationFrom = document.getElementById("stationsFrom").value;
    let stationTo = document.getElementById("stationsTo").value;
    let date = document.getElementById("time").value;

    
    let chosenTime = new Date(date);

    user1.stationFrom = stationFrom;
    user1.stationTo = stationTo;
    user1.date = chosenTime;

    console.log(user1);

    console.log("u chose " + chosenTime);

    console.log(stationFrom, stationTo, "today is " + nowTime);

    // When are we rejecting?
    if (stationFrom == stationTo || date == "" || chosenTime < nowTime)
        alert("Error.");

    else {
        getPath();

        // Resetting form. => how?   
    }

}

async function getPath() {
    
    // Get stops.
    let segmentPath = await fetch("http://10.101.0.12:8080/path/" + user1.stationFrom + "/" + user1.stationTo);
    let segmentPathJSON = await segmentPath.json();
    console.log(segmentPathJSON);

    // Display station names from-to destination - so in-between locations.
    for (let i = 0; i < segmentPathJSON.length; i++) {
        document.getElementById("trip").appendChild(document.createElement("p"))
        .appendChild(document.createTextNode("Station "+ segmentPathJSON[i].Name + " Segment Id " + segmentPathJSON[i].SegmentId))
    }

    // Get times.
    console.log(nowTime.getTime(), user1.date.getTime());

    

    let schedules = "";

    for (let i = 0; i < segmentPathJSON.length; i++) {
        schedules += (await (await fetch("http://10.101.0.12:8080/schedule/" + segmentPathJSON[i].Name)).json())
    }

    // To extract the time from the JSON.
    // event.toLocaleTimeString('en-US').


    console.log(schedules);

    // Creating an array to hold all schedule objects for stations.

    


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