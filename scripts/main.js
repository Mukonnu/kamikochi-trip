// 松本市の地域コード
const MATSUMOTO_AREA_CODE = '200020';

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
            const response = await fetch(`https://www.jma.go.jp/bosai/forecast/data/forecast/${MATSUMOTO_AREA_CODE}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // データの構造を確認
            if (!data || !data[0] || !data[0].timeSeries || !data[0].timeSeries[0]) {
                throw new Error('Unexpected data structure');
            }

            // 3日間の天気予報を取得
            const forecast = data[0].timeSeries[0];
            const timeDefines = forecast.timeDefines.slice(0, 3);
            const weatherCodes = forecast.areas[0].weatherCodes.slice(0, 3);

            // 気温データの取得（存在する場合）
            let temps = [];
            if (data[0].timeSeries[2] && data[0].timeSeries[2].areas[0].temps) {
                temps = data[0].timeSeries[2].areas[0].temps.slice(0, 6);
            }

            // 3日分の天気予報を表示
            weatherContainer.innerHTML = timeDefines.map((time, index) => `
                <div class="weather-day">
                    <div class="weather-icon">${getWeatherIcon(weatherCodes[index])}</div>
                    <div>${new Date(time).toLocaleDateString('ja-JP', {month: 'short', day: 'numeric'})}</div>
                    ${temps.length ? `<div>${temps[index * 2] || '--'}°C / ${temps[index * 2 + 1] || '--'}°C</div>` : ''}
                    <div>${getWeatherText(weatherCodes[index])}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('天気データの取得に失敗しました:', error);
            weatherContainer.innerHTML = '<p>天気情報を取得できませんでした。しばらくしてから再度お試しください。</p>';
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

    function getWeatherText(code) {
        const weatherTexts = {
            '100': '晴れ', '101': '晴れ時々曇り', '102': '晴れ一時雨', '103': '晴れ時々雨', '104': '晴れ一時雪', '105': '晴れ時々雪', '106': '晴れ一時雨か雪', '107': '晴れ時々雨か雪', '108': '晴れ一時雨か雷雨', '110': '晴れ後時々曇り', '111': '晴れ後曇り', '112': '晴れ後一時雨', '113': '晴れ後時々雨', '114': '晴れ後雨', '115': '晴れ後一時雪',
            '200': '曇り', '201': '曇り時々晴れ', '202': '曇り一時雨', '203': '曇り時々雨', '204': '曇り一時雪', '205': '曇り時々雪', '206': '曇り一時雨か雪', '207': '曇り時々雨か雪', '208': '曇り一時雨か雷雨', '209': '霧', '210': '曇り後時々晴れ', '211': '曇り後晴れ', '212': '曇り後一時雨', '213': '曇り後時々雨', '214': '曇り後雨', '215': '曇り後一時雪',
            '300': '雨', '301': '雨時々晴れ', '302': '雨時々止む', '303': '雨時々雪', '304': '雨か雪', '306': '大雨', '307': '風雨共に強い', '308': '雨で暴風を伴う', '309': '雨一時雪', '311': '雨後晴れ', '313': '雨後曇り', '314': '雨後時々雪', '315': '雨後雪',
            '400': '雪', '401': '雪時々晴れ', '402': '雪時々止む', '403': '雪時々雨', '405': '大雪', '406': '風雪強い', '407': '暴風雪', '409': '雪一時雨', '411': '雪後晴れ', '413': '雪後曇り', '414': '雪後雨', '415': '雪後みぞれ',
            '500': '雨か雪', '501': 'まじりの雨', '502': 'みぞれ', '503': '雨か雪後晴れ', '504': '雨か雪後曇り', '505': '雨か雪後雨', '506': '雨か雪後雪', '507': '霧雨', '508': '雨と雷', '509': '雪と雷',
        };
        return weatherTexts[code] || '不明';
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