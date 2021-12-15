

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

    let nowTime = new Date();
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

    else
    {
        document.getElementById("trip").innerHTML = getPath();
        
    }
        
}

async function getPath() {
    let segmentPathJSON = await fetch("http://10.101.0.12:8080/path/" + user1.stationFrom + "/" + user1.stationTo);
    console.log(segmentPathJSON);
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