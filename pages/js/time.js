
function refreshTime() {
    const timeDisplay = document.getElementById("time");
    const timeString = new Date().toLocaleTimeString();

    timeDisplay.textContent = timeString;

    const dateDisplay = document.getElementById("date");
    const dateString = new Date().toLocaleString('en-GB', { weekday: 'long' })

    dateDisplay.textContent = dateString

} setInterval(refreshTime, 1000)== time;
