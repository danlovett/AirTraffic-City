
function refreshTime() {
    const timeDisplay = document.getElementById("time");
    const timeString = new Date().toLocaleTimeString();

    timeDisplay.textContent = timeString;

} setInterval(refreshTime, 1000)== time;
