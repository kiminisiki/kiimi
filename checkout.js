document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const historyTableBody = document.getElementById('historyTableBody');
    const searchDate = document.getElementById('searchDate');
    const searchBtn = document.getElementById('searchBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Format date for display (e.g., "November 24, 2024")
    function formatDisplayDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Format time for display (e.g., "2:30 PM")
    function formatTime(timeString) {
        if (!timeString) return '';
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    }

    // Create table row element
    function createTableRow(data) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.name || ''}</td>
            <td>${formatTime(data.timeIn)}</td>
            <td>${formatTime(data.timeOut)}</td>
            <td>${data.pax || ''}</td>
            <td>${data.contact || ''}</td>
            <td>${formatDisplayDate(data.date)}</td>
        `;
        return row;
    }

    // Show empty state message
    function showEmptyMessage() {
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    No records found
                </td>
            </tr>
        `;
    }

    // Clear all history
    function clearHistory() {
        if (confirm('Are you sure you want to clear all checkout history? This action cannot be undone.')) {
            localStorage.removeItem('checkoutHistory');
            loadCheckoutHistory();
        }
    }

    // Add clear history button to the button group
    const buttonGroup = document.querySelector('.button-group');
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear History';
    clearBtn.className = 'action-btn';
    clearBtn.addEventListener('click', clearHistory);
    buttonGroup.appendChild(clearBtn);

    // Load and display checkout history
    function loadCheckoutHistory(searchDate = null) {
        try {
            // Clear existing table content
            historyTableBody.innerHTML = '';
            
            // Get data from localStorage
            const history = JSON.parse(localStorage.getItem('checkoutHistory')) || [];
            
            // Sort by date (newest first)
            history.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Filter by date if search date is provided
            const filteredHistory = searchDate 
                ? history.filter(item => {
                    const itemDate = new Date(item.date).toLocaleDateString();
                    const searchLocalDate = new Date(searchDate).toLocaleDateString();
                    return itemDate === searchLocalDate;
                  })
                : history;
            
            // Display filtered results or empty message
            if (filteredHistory.length > 0) {
                filteredHistory.forEach(item => {
                    historyTableBody.appendChild(createTableRow(item));
                });
            } else {
                showEmptyMessage();
            }
        } catch (error) {
            console.error('Error loading checkout history:', error);
            showEmptyMessage();
        }
    }

    // Initialize table
    loadCheckoutHistory();

    // Event Listeners
    searchBtn.addEventListener('click', () => {
        loadCheckoutHistory(searchDate.value);
    });

    resetBtn.addEventListener('click', () => {
        searchDate.value = '';
        loadCheckoutHistory();
    });

    // Add keyboard support
    searchDate.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
});