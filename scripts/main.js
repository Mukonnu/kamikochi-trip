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

    // 現在の日付に基づいて該当する日をハイライト
    const today = new Date();
    const day1Date = new Date('2024-07-12');
    const day2Date = new Date('2024-07-13');

    if (today.toDateString() === day1Date.toDateString()) {
        document.getElementById('day1').classList.add('highlight');
    } else if (today.toDateString() === day2Date.toDateString()) {
        document.getElementById('day2').classList.add('highlight');
    }
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