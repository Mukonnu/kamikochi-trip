document.addEventListener('DOMContentLoaded', (event) => {
    // スムーズスクロール機能
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
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