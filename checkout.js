document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const historyTableBody = document.getElementById('historyTableBody');
    const searchDate = document.getElementById('searchDate');
    const searchBtn = document.getElementById('searchBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Existing formatting functions
    function formatDisplayDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatTime(timeString) {
        if (!timeString) return '';
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    }

    // New function to print report
    function printCheckoutReport() {
        // Get the checkout history from localStorage
        const history = JSON.parse(localStorage.getItem('checkoutHistory')) || [];
        
        // If no history, show alert
        if (history.length === 0) {
            alert('No checkout history to print.');
            return;
        }

        // Create report content
        let reportContent = "LE ENCHANTÉ CAFÉ - CHECKOUT REPORT\n";
        reportContent += "=======================================\n\n";

        // Sort history by date (newest first)
        history.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Add each entry to the report
        history.forEach((item, index) => {
            reportContent += `Entry #${index + 1}\n`;
            reportContent += `Name: ${item.name || 'N/A'}\n`;
            reportContent += `Date: ${formatDisplayDate(item.date)}\n`;
            reportContent += `Time In: ${formatTime(item.timeIn)}\n`;
            reportContent += `Time Out: ${formatTime(item.timeOut)}\n`;
            reportContent += `Number of Guests: ${item.pax || 'N/A'}\n`;
            reportContent += `Contact Number: ${item.contact || 'N/A'}\n`;
            reportContent += "\n";
        });

        // Add summary at the end
        reportContent += "=======================================\n";
        reportContent += `Total Entries: ${history.length}\n`;
        reportContent += `Report Generated: ${new Date().toLocaleString()}`;

        // Create a Blob with the report content
        const blob = new Blob([reportContent], { type: 'text/plain' });
        
        // Create a link element to trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Checkout_Report_${new Date().toISOString().split('T')[0]}.txt`;
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Existing code from previous implementation...
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

    function showEmptyMessage() {
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    No records found
                </td>
            </tr>
        `;
    }

    function clearHistory() {
        if (confirm('Are you sure you want to clear all checkout history? This action cannot be undone.')) {
            localStorage.removeItem('checkoutHistory');
            loadCheckoutHistory();
        }
    }

    // Add buttons to the button group
    const buttonGroup = document.querySelector('.button-group');
    
    // Clear History Button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear History';
    clearBtn.className = 'action-btn';
    clearBtn.addEventListener('click', clearHistory);
    buttonGroup.appendChild(clearBtn);

    // Print Report Button
    const printBtn = document.createElement('button');
    printBtn.textContent = 'Print Report';
    printBtn.className = 'action-btn';
    printBtn.addEventListener('click', printCheckoutReport);
    buttonGroup.appendChild(printBtn);

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
