document.addEventListener('DOMContentLoaded', (event) => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const checklistItems = document.querySelectorAll('#checklist input[type="checkbox"]');

    // ダークモードの切り替え
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
    });

    // ページ読み込み時にダークモードの状態を復元
    if (localStorage.getItem('darkMode') === 'true') {
        body.classList.add('dark-mode');
    }

    // 日程の展開/折りたたみ
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const content = document.getElementById(button.getAttribute('aria-controls'));
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', !isExpanded);
            content.style.display = isExpanded ? 'none' : 'block';
        });
    });

    // チェックリストの状態保存
    checklistItems.forEach(item => {
        const savedState = localStorage.getItem(item.id);
        if (savedState === 'true') {
            item.checked = true;
        }

        item.addEventListener('change', () => {
            localStorage.setItem(item.id, item.checked);
        });
    });

    // プログレスバーの更新
    function updateProgress() {
        const startDate = new Date('2024-07-12T14:00:00');
        const endDate = new Date('2024-07-13T23:45:00');
        const now = new Date();

        if (now < startDate) {
            setProgress(0, '旅行はまだ始まっていません');
        } else if (now > endDate) {
            setProgress(100, '旅行は終了しました');
        } else {
            const total = endDate - startDate;
            const elapsed = now - startDate;
            const percentage = (elapsed / total) * 100;
            setProgress(percentage, `旅行の${percentage.toFixed(1)}%が経過しました`);
        }
    }

    function setProgress(percentage, text) {
        const progressBar = document.getElementById('trip-progress');
        const progressText = document.getElementById('progress-text');
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = text;
    }

    // 天気予報の取得と表示
    async function fetchWeatherForecast() {
        const weatherContainer = document.getElementById('weather-forecast');
        try {
            const response = await fetch('weather.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // 中部地域の天気予報データを取得
            const chubuArea = data.timeSeries[0].areas.find(area => area.area.name === "中部");

            // 3日間の天気予報を取得
            const timeDefines = data.timeSeries[0].timeDefines;
            const weatherCodes = chubuArea.weatherCodes;

            // 3日分の天気予報を表示
            weatherContainer.innerHTML = timeDefines.map((time, index) => {
                const date = new Date(time);
                return `
                    <div class="weather-day">
                        <div class="weather-date">${date.toLocaleDateString('ja-JP', {month: 'short', day: 'numeric'})}</div>
                        <div class="weather-icon">${getWeatherIcon(weatherCodes[index])}</div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('天気データの取得に失敗しました:', error);
            weatherContainer.innerHTML = '<p>天気情報を取得できませんでした。</p>';
        }
    }

    function getWeatherIcon(code) {
        const icons = {
            '100': '☀️', '101': '🌤️', '102': '🌤️', '103': '🌤️', '104': '🌤️', '105': '🌤️', '106': '🌤️', '107': '🌤️', '108': '🌤️', '110': '🌤️', '111': '🌤️', '112': '🌤️', '113': '🌤️', '114': '🌤️', '115': '🌤️',
            '200': '☁️', '201': '🌥️', '202': '🌥️', '203': '🌥️', '204': '🌥️', '205': '🌥️', '206': '🌥️', '207': '🌥️', '208': '🌥️', '209': '🌥️', '210': '🌥️', '211': '🌥️', '212': '🌥️', '213': '🌥️', '214': '🌥️', '215': '🌥️',
            '300': '🌧️', '301': '🌧️', '302': '🌧️', '303': '🌧️', '304': '🌧️', '306': '🌧️', '307': '🌧️', '308': '🌧️', '309': '🌧️', '311': '🌧️', '313': '🌧️', '314': '🌧️', '315': '🌧️',
            '400': '🌨️', '401': '🌨️', '402': '🌨️', '403': '🌨️', '405': '🌨️', '406': '🌨️', '407': '🌨️', '409': '🌨️', '411': '🌨️', '413': '🌨️', '414': '🌨️', '415': '🌨️',
            '500': '🌧️', '501': '🌧️', '502': '🌧️', '503': '🌧️', '504': '🌧️', '505': '🌧️', '506': '🌧️', '507': '🌧️', '508': '🌧️', '509': '🌧️',
        };
        return icons[code] || '🌈';
    }

    // 現在の日付に基づいて該当する日をハイライト
    function highlightCurrentDay() {
        const today = new Date();
        const day1Date = new Date('2024-07-12');
        const day2Date = new Date('2024-07-13');

    if (today.toDateString() === day1Date.toDateString()) {
            document.getElementById('day1').classList.add('highlight');
        } else if (today.toDateString() === day2Date.toDateString()) {
            document.getElementById('day2').classList.add('highlight');
        }
    }

    // 初期化と定期更新
    updateProgress();
    fetchWeatherForecast();
    highlightCurrentDay();
    setInterval(updateProgress, 60000); // 1分ごとに更新
    setInterval(fetchWeatherForecast, 3600000); // 1時間ごとに更新
});

// Service Workerの登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
