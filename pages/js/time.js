
function refreshTime() {
    const timeDisplay = document.getElementById("time");
    const timeString = new Date().toLocaleTimeString();

    timeDisplay.textContent = timeString;

    const name = document.getElementById("first-name");

    name.textContent = 'Daniel'

} setInterval(refreshTime, 1000)== time;
