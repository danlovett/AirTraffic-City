// create time function
function refreshTime() {
    // recieves which id to inject result of block code to
    const timeDisplay = document.getElementById("time");
    // assign the time (HH:MM:SS)
    const timeString = new Date().toLocaleTimeString();


    // now attach timeString variable to the selected id
    timeDisplay.textContent = timeString;

} setInterval(refreshTime, 1000)== time; // how much of a delay should be applied before being called again
