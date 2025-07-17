window.addEventListener('DOMContentLoaded', function () {
    const weatherBtn = document.getElementById('weather-toggle');
    const weatherBadge = document.getElementById('weather-badge');
    const weatherIcon = document.getElementById('weather-icon');
    const weatherPopup = document.getElementById('weather-popup');
    const weatherPopupIcon = document.getElementById('weather-popup-icon');
    const weatherPopupEntries = document.getElementById('weather-popup-entries');
    const weatherPopupTime = document.getElementById('weather-popup-time');
    const weatherPopupClose = document.getElementById('weather-popup-close');
    const geoPanel = document.getElementById('geolocation');

    function getPrecipIcon(prec, temp) {
        if (prec >= 10) return 'bi-cloud-rain-heavy-fill';
        if (prec >= 5) return 'bi-cloud-lightning-rain-fill';
        if (prec >= 2) return 'bi-cloud-hail-fill';
        if (prec >= 1) return 'bi-cloud-rain-fill';
        if (prec >= 0.2) return 'bi-cloud-drizzle-fill';
        if (prec > 0 && temp <= 2) return 'bi-cloud-snow-fill';
        return 'bi-cloud';
    }

    function getDayIcon(hour, isClear) {
        if (hour >= 5 && hour < 8) return 'bi-sunrise-fill';
        if (hour >= 8 && hour < 18) return isClear ? 'bi-sun-fill' : 'bi-cloud-sun-fill';
        if (hour >= 18 && hour < 21) return 'bi-sunset';
        if (hour >= 21 || hour < 5) return isClear ? 'bi-moon-stars-fill' : 'bi-cloud-moon-fill';
        return 'bi-cloud';
    }


    function getWindDirectionIcon(deg) {
        // 8 directions
        if (deg >= 337.5 || deg < 22.5) return 'bi-arrow-up'; // N
        if (deg >= 22.5 && deg < 67.5) return 'bi-arrow-up-right'; // NE
        if (deg >= 67.5 && deg < 112.5) return 'bi-arrow-right'; // E
        if (deg >= 112.5 && deg < 157.5) return 'bi-arrow-down-right'; // SE
        if (deg >= 157.5 && deg < 202.5) return 'bi-arrow-down'; // S
        if (deg >= 202.5 && deg < 247.5) return 'bi-arrow-down-left'; // SW
        if (deg >= 247.5 && deg < 292.5) return 'bi-arrow-left'; // W
        if (deg >= 292.5 && deg < 337.5) return 'bi-arrow-up-left'; // NW
        return 'bi-arrow-up';
    }

    function updateWeatherUI(data) {
        const times = data.hourly.time;
        const temps = data.hourly.temperature_2m;
        const precs = data.hourly.precipitation;
        const winds = data.hourly.windspeed_10m;
        const winddirs = data.hourly.winddirection_10m;
        const cloudcovers = data.hourly.cloudcover;

        const now = new Date();
        // Finde den letzten Wert, der kleiner oder gleich jetzt ist
        let lastIdx = -1;
        for (let i = 0; i < times.length; i++) {
            if (new Date(times[i]) <= now) lastIdx = i;
            else break;
        }

        if (lastIdx !== -1) {
            const temp = temps[lastIdx];
            const prec = precs[lastIdx];
            const wind = winds ? winds[lastIdx] : null;
            const winddir = winddirs ? winddirs[lastIdx] : null;
            const cloudcover = cloudcovers ? cloudcovers[lastIdx] : null;
            weatherBadge.textContent = `${Math.round(temp)}°C`;
            weatherBadge.style.display = 'inline-block';

            const hour = now.getHours();
            const isClear = prec < 0.2;

            const iconClass = prec >= 0.2 ? getPrecipIcon(prec, temp) : getDayIcon(hour, isClear);
            const iconHTML = `<i class="bi ${iconClass}" style="color:#4ea1e0;"></i>`;

            weatherIcon.innerHTML = iconHTML;
            weatherPopupIcon.innerHTML = iconHTML;

            // Wetterdaten als Tabelle
            const tempIcon = '<i class="bi bi-thermometer-half" style="color:#e57300;font-size:1.2em;"></i>';
            const precIcon = '<i class="bi bi-droplet-half" style="color:#2176ae;font-size:1.2em;"></i>';
            let windIcon = '', dirIcon = '', windVal = '', dirVal = '';
            if (wind !== null && winddir !== null) {
                windIcon = '<i class="bi bi-wind" style="color:#2176ae;font-size:1.2em;"></i>';
                dirIcon = `<i class="bi ${getWindDirectionIcon(winddir)}" style="color:#2176ae;font-size:1.2em;transform:rotate(${winddir}deg);"></i>`;
                windVal = `${wind} km/h`;
                dirVal = `${Math.round(winddir)}°`;
            } else {
                windIcon = '<i class="bi bi-wind" style="color:#bbb;font-size:1.2em;"></i>';
                dirIcon = '<i class="bi bi-arrow-up" style="color:#bbb;font-size:1.2em;"></i>';
                windVal = '--';
                dirVal = '--';
            }
            // Cloudcover
            const cloudIcon = '<i class="bi bi-cloud" style="color:#4ea1e0;font-size:1.2em;"></i>';
            let cloudVal = '--';
            if (cloudcover !== null && cloudcover !== undefined) {
                cloudVal = `${cloudcover} %`;
            }

            // Tabelle im Stil des Geolocationpanels
            const tableHTML = `
                <table id="weather-popup-table" style="width:100%;margin-top:0.2em;border-collapse:separate;border-spacing:0 0.25em;">
                  <tr>
                    <td style="font-weight:600;color:#2176ae;background:transparent;box-shadow:none;">${tempIcon} Temperatur</td>
                    <td style="text-align:right;color:#23476a;font-family:'Roboto Mono','Consolas',monospace;">${temp} °C</td>
                  </tr>
                  <tr>
                    <td style="font-weight:600;color:#2176ae;background:transparent;box-shadow:none;">${precIcon} Niederschlag</td>
                    <td style="text-align:right;color:#23476a;font-family:'Roboto Mono','Consolas',monospace;">${prec} mm</td>
                  </tr>
                  <tr>
                    <td style="font-weight:600;color:#2176ae;background:transparent;box-shadow:none;">${windIcon} Wind</td>
                    <td style="text-align:right;color:#23476a;font-family:'Roboto Mono','Consolas',monospace;">${windVal}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:600;color:#2176ae;background:transparent;box-shadow:none;">${dirIcon} Windrichtung</td>
                    <td style="text-align:right;color:#23476a;font-family:'Roboto Mono','Consolas',monospace;">${dirVal}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:600;color:#2176ae;background:transparent;box-shadow:none;">${cloudIcon} Bewölkung</td>
                    <td style="text-align:right;color:#23476a;font-family:'Roboto Mono','Consolas',monospace;">${cloudVal}</td>
                  </tr>
                </table>
            `;

            // Setze die Tabelle in das Popup
            weatherPopupEntries.innerHTML = tableHTML;

            weatherPopupTime.textContent = `Stand: ${times[lastIdx].replace('T', ' ')}`;
        } else {
            weatherBadge.textContent = '--';
            weatherBadge.style.display = 'inline-block';
            weatherIcon.innerHTML = '<i class="bi bi-cloud"></i>';
            weatherPopupEntries.textContent = 'Keine Wetterdaten für die aktuelle Stunde gefunden.';
            weatherPopupTime.textContent = '';
        }
    }

    function fetchWeather() {
        fetch("https://api.open-meteo.com/v1/forecast?latitude=49.0119&longitude=8.4153&hourly=temperature_2m,precipitation,windspeed_10m,winddirection_10m,cloudcover")
            .then(r => r.json())
            .then(data => updateWeatherUI(data))
            .catch(() => {
                weatherBadge.textContent = '--';
                weatherBadge.style.display = 'inline-block';
                weatherIcon.innerHTML = '<i class=\"bi bi-cloud\"></i>';
                weatherPopupEntries.textContent = 'Fehler beim Laden der Wetterdaten.';
                weatherPopupTime.textContent = '';
                let windDiv = document.getElementById('weather-popup-wind');
                if (windDiv) windDiv.outerHTML = '';
            });
    }

    function toggleWeatherPopup() {
        const isOpen = weatherPopup.classList.contains('open');
        if (isOpen) {
            weatherPopup.classList.remove('open');
        } else {
            if (geoPanel && geoPanel.classList.contains('open')) {
                geoPanel.classList.remove('open');
            }
            weatherPopup.classList.add('open');
        }
    }

    // Initial laden + alle 2 Minuten aktualisieren
    fetchWeather();
    setInterval(fetchWeather, 2 * 60 * 1000);
    // Event Listener
    if (weatherBtn && weatherPopup && weatherPopupClose) {
        weatherBtn.addEventListener('click', toggleWeatherPopup);
        weatherPopupClose.addEventListener('click', () => {
            weatherPopup.classList.remove('open');
            console.log('Weather popup closed');
        });
    }
});

// Zusätzlicher Weather-Button Handler für Panel-Koordination (migriert aus leaflet_map.js)
document.getElementById('weather-toggle')?.addEventListener('click', function () {
    const geo = document.getElementById('geolocation');
    const weather = document.getElementById('weather-popup');
    // Wenn Wetterpanel geöffnet wird, Geolocation-Panel schließen
    if (weather && (!weather.classList.contains('open') && weather.style.display !== 'block')) {
        if (geo && (geo.style.display === 'block' || geo.classList.contains('open'))) {
            geo.style.display = 'none';
            geo.classList.remove('open');
        }
    }
});

// Geolocation-Panel Handler: Wetterpanel schließen, wenn geöffnet (migriert aus leaflet_map.js)
document.getElementById('geolocation-toggle')?.addEventListener('click', function () {
    const geo = document.getElementById('geolocation');
    const weather = document.getElementById('weather-popup');
    
    if (geo) {
        if (geo.style.display === 'none' || geo.style.display === '') {
            // Geolocation-Panel öffnen
            geo.style.display = 'block';
            // Weather-Panel schließen wenn offen
            if (weather && weather.classList.contains('open')) {
                weather.classList.remove('open');
            }
            if (weather && weather.style.display === 'block') {
                weather.style.display = 'none';
            }
        } else {
            // Geolocation-Panel schließen
            geo.style.display = 'none';
        }
    }
});
