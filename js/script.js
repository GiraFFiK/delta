document.addEventListener('DOMContentLoaded', function() {
    const tableRows = document.querySelectorAll('#data-table tbody tr');
    let chart;
    let currentChartRow;
    let lastClickedRow = null;  // Хранит ссылку на последнюю нажатую строку

    // Функция для отображения графика
    function showChart(data, row) {
        // Проверяем, был ли клик на той же строке
        if (lastClickedRow === row) {
            // Если да, то скрываем график и очищаем переменные
            if (chart) {
                chart.destroy();
            }
            if (currentChartRow) {
                currentChartRow.remove();
            }
            lastClickedRow = null;
            return;
        }

        // Удаляем предыдущий график, если он есть
        if (chart) {
            chart.destroy();
        }
        if (currentChartRow) {
            currentChartRow.remove();
        }

        // Создаём новый элемент строки для графика
        const chartRow = document.createElement('tr');
        const chartCell = document.createElement('td');
        chartCell.colSpan = row.children.length;
        
        // Добавляем canvas с ограничением по размеру
        chartCell.innerHTML = `<canvas style="width: 300px; height: 200px;"></canvas>`;
        chartRow.appendChild(chartCell);

        // Вставляем строку с графиком под текущей строкой
        row.parentNode.insertBefore(chartRow, row.nextSibling);
        currentChartRow = chartRow;
        lastClickedRow = row;  // Устанавливаем текущую строку как последнюю нажатую

        // Рендерим график в новом canvas
        const ctx = chartCell.querySelector('canvas').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Текущий день', 'Вчера', 'Этот день недели'],
                datasets: [{
                    label: 'Значение',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Функция для расчета процента изменений
    function calculatePercentage(current, previous) {
        if (previous === 0) return 'N/A';
        const change = ((current - previous) / previous) * 100;
        return `${Math.round(change)}%`;  // Округление до целого числа
    }

    // Устанавливаем проценты в ячейке "Вчера" в таблице
    tableRows.forEach(row => {
        const currentDayText = row.cells[1].innerText.replace(/\s/g, '');
        const yesterdayText = row.cells[2].innerText.replace(/\s/g, '');

        const currentDay = parseFloat(currentDayText) || 0;
        const yesterday = parseFloat(yesterdayText) || 0;

        // Вычисляем процент и добавляем его в текст ячейки "Вчера"
        const percentage = calculatePercentage(currentDay, yesterday);
        row.cells[2].innerText = `${yesterday} (${percentage})`;

        // Устанавливаем цвет текста в зависимости от процента
        if (percentage === '0%') {
            row.cells[2].style.color = 'green';
        } else {
            row.cells[2].style.color = currentDay > yesterday ? 'green' : 'red';
        }
    });

    // Добавляем обработчик клика для каждой строки
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            const dataChart = this.getAttribute('data-chart');
            if (dataChart) {
                const data = JSON.parse(dataChart);
                showChart(data, this);
            }
        });
    });
});
