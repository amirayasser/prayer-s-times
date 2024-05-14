const citiesList = document.getElementById('city');

const prayers = [
    { name: 'Fajr', className: 'fajrTime' },
    { name: 'Sunrise', className: 'sunriseTime' },
    { name: 'Dhuhr', className: 'dhuhrTime' },
    { name: 'Asr', className: 'asrTime' },
    { name: 'Maghrib', className: 'maghribTime' },
    { name: 'Isha', className: 'ishaTime' }
];

function getPrayerTimesPerCity(cityName) {
    fetch(`http://api.aladhan.com/v1/timingsByCity?city=${cityName}&country=Egypt&method=5`)
        .then(response => response.json())
        .then(data => {
            const pTimings = data.data.timings;
            prayers.forEach(prayer => {
                setPrayerTime(prayer.className, pTimings[prayer.name]);
            });
            updateDate(data.data.date.readable);
            calculateNextPrayer(pTimings);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function setPrayerTime(className, time) {
    const element = document.querySelector(`.${className}`);
    if (element) {
        element.textContent = time;
    }
}

function updateDate(date) {
    const dateElement = document.getElementById('date');
    dateElement.textContent = date;
}

function calculateNextPrayer(prayerTimes) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    let upcomingPrayer = null;
    let minDifference = Infinity;

    Object.keys(prayerTimes).forEach(prayerName => {
        const [prayerHour, prayerMinute] = prayerTimes[prayerName].split(':').map(Number);
        const prayerTime = prayerHour * 60 + prayerMinute; // Prayer time in minutes

        if (prayerTime > currentTime) {
            const difference = prayerTime - currentTime;
            if (difference < minDifference) {
                upcomingPrayer = { name: prayerName, time: difference };
                minDifference = difference;
            }
        }
    });

    if (upcomingPrayer) {
        const hours = Math.floor(upcomingPrayer.time / 60);
        const minutes = upcomingPrayer.time % 60;
        const remainingTimeElement = document.getElementById('remtime');
        // remainingTimeElement.textContent = `${hours} hours and ${minutes} minutes until ${upcomingPrayer.name}`;
        remainingTimeElement.textContent = `${hours} hours : ${minutes} mins`;
        document.getElementById('nextPrayer').textContent = upcomingPrayer.name;
    } else {
        const nextPrayerElement = document.getElementById('nextPrayer');
        nextPrayerElement.textContent = 'All prayers have passed for today.';
        const remainingTimeElement = document.getElementById('remtime');
        remainingTimeElement.textContent = 'Remaining Time: All prayers have passed.';
    }
}

// Initial call with default city
getPrayerTimesPerCity('Cairo');

// Event listener for city selection change
citiesList.addEventListener('change', function () {
    const cityName = this.value;
    getPrayerTimesPerCity(cityName);
});
