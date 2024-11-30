document.addEventListener('DOMContentLoaded', function() {
    // Initialize date in header
    const dateHeader = document.getElementById('current-date');
    const currentDate = new Date();
    const options = { month: 'long', day: '2-digit', year: 'numeric' };
    
    // Check if there's a date in the URL or session storage
    const urlParams = new URLSearchParams(window.location.search);
    const selectedDate = urlParams.get('date') || sessionStorage.getItem('selectedDate');

    if (selectedDate) {
        // Explicitly parse the date to avoid timezone issues
        const [year, month, day] = selectedDate.split('-').map(Number);
        
        // Create date using UTC to prevent timezone shifts
        const parsedDate = new Date(Date.UTC(year, month - 1, day));
        
        // Convert to local date string
        dateHeader.textContent = parsedDate.toLocaleDateString('en-US', options);
        
        // Persist the selected date in session storage
        sessionStorage.setItem('selectedDate', selectedDate);
    } else {
        // Use current date if no date is selected
        dateHeader.textContent = currentDate.toLocaleDateString('en-US', options);
    }

    // Initialize cashier grid
    const cashierGrid = document.getElementById('cashierGrid');
    const totalCells = 15; // 3 rows x 5 columns
    
    // Create grid cells
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'cashier-cell cashier-available';
        cell.innerHTML = `Table ${i + 1}`;
        
        cell.addEventListener('click', function() {
            if (cell.classList.contains('cashier-available')) {
                // Remove available class and add unavailable
                cell.classList.remove('cashier-available');
                cell.classList.add('cashier-unavailable');
            } else if (cell.classList.contains('cashier-unavailable')) {
                // Remove unavailable class and add available
                cell.classList.remove('cashier-unavailable');
                cell.classList.add('cashier-available');
            }
        });
        
        cashierGrid.appendChild(cell);
    }

    // Get form elements and buttons
    const formContainer = document.querySelector('.form-section');
    const addReservationBtn = document.querySelector('.action-btn:nth-child(1)');
    const editReservationBtn = document.querySelector('.action-btn:nth-child(2)');
    const checkoutReservationBtn = document.querySelector('.action-btn:nth-child(3)');
    const checkoutHistoryBtn = document.querySelector('.action-btn:nth-child(4)');
    const addBtn = document.querySelector('.add-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const tableBody = document.getElementById('reservationTableBody');
    
    let selectedRowForEdit = null;

    // Initially hide the form
    formContainer.style.display = 'none';

    // Function to clear all data
    function clearAllData() {
        // Clear localStorage for reservations and table states
        localStorage.removeItem('currentReservations');
        localStorage.removeItem('tableStates');
        
        // Clear the table body
        if (tableBody) {
            tableBody.innerHTML = '';
        }
        
        // Reset all table cells to available
        document.querySelectorAll('.cashier-cell').forEach(cell => {
            cell.classList.remove('cashier-unavailable');
            cell.classList.add('cashier-available');
        });

        // Reset form if it's open
        document.querySelectorAll('input').forEach(input => input.value = '');
        formContainer.style.display = 'none';
        
        // Reset selected row
        selectedRowForEdit = null;
        
        // Reset any selected rows
        document.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
    }

    // Function to save reservations to localStorage
    function saveReservations() {
        const reservations = [];
        document.querySelectorAll('#reservationTableBody tr').forEach(row => {
            reservations.push({
                name: row.cells[0].textContent,
                time: row.cells[1].textContent,
                pax: row.cells[2].textContent,
                contact: row.cells[3].textContent,
                tableNumber: row.dataset.tableNumber
            });
        });
        localStorage.setItem('currentReservations', JSON.stringify(reservations));
    }

    // Function to save table states
    function saveTableStates() {
        const tableStates = [];
        document.querySelectorAll('.cashier-cell').forEach(cell => {
            tableStates.push({
                number: cell.innerHTML,
                isAvailable: cell.classList.contains('cashier-available')
            });
        });
        localStorage.setItem('tableStates', JSON.stringify(tableStates));
    }

    // Function to load reservations from localStorage
    function loadReservations() {
        const savedReservations = localStorage.getItem('currentReservations');
        if (savedReservations) {
            const reservations = JSON.parse(savedReservations);
            tableBody.innerHTML = ''; // Clear existing rows
            reservations.forEach(reservation => {
                const newRow = document.createElement('tr');
                newRow.dataset.tableNumber = reservation.tableNumber;
                newRow.innerHTML = `
                    <td>${reservation.name}</td>
                    <td>${reservation.time}</td>
                    <td>${reservation.pax}</td>
                    <td>${reservation.contact}</td>
                `;
                tableBody.appendChild(newRow);
            });
        }
    }

    // Function to load table states
    function loadTableStates() {
        const savedTableStates = localStorage.getItem('tableStates');
        if (savedTableStates) {
            const tableStates = JSON.parse(savedTableStates);
            tableStates.forEach((state, index) => {
                const cell = document.querySelector(`.cashier-cell:nth-child(${index + 1})`);
                if (cell) {
                    cell.classList.remove('cashier-available', 'cashier-unavailable');
                    cell.classList.add(state.isAvailable ? 'cashier-available' : 'cashier-unavailable');
                }
            });
        }
    }

    // Load saved data when page loads
    loadReservations();
    loadTableStates();

    // Add click event to table rows for selection
    if (tableBody) {
        tableBody.addEventListener('click', function(e) {
            const row = e.target.closest('tr');
            if (row) {
                // Toggle selected class
                document.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
                row.classList.add('selected');
            }
        });
    }

function handleDateClick(date, event) {
    // Prevent any default event behavior
    if (event) event.preventDefault();

    // Remove selected class from all calendar cells
    const cells = document.querySelectorAll(".calendar-cell");
    cells.forEach(cell => cell.classList.remove("selected"));

    // Add selected class to the clicked cell
    if (event && event.target) {
        event.target.classList.add("selected");
    }

    // Parse the date
    const [year, month, day] = date.split('-').map(Number);
    
    // Create a date object using UTC to prevent timezone issues
    const selectedDate = new Date(Date.UTC(year, month - 1, day));
    
    const options = { month: 'long', day: '2-digit', year: 'numeric' };
    const dateHeader = document.getElementById('current-date');
    
    // Use toLocaleDateString to format the date, passing the local options
    if (dateHeader) {
        dateHeader.textContent = selectedDate.toLocaleDateString('en-US', options);
    }

    // Store the exact date string in session storage
    sessionStorage.setItem('selectedDate', date);

    // Redirect to reservation details page with the selected date
    window.location.href = `reservation-details.html?date=${date}`;
}

// Ensure this is available globally
window.handleDateClick = handleDateClick;
    // ADD Reservation button click handler
    addReservationBtn.addEventListener('click', function() {
        formContainer.style.display = 'flex';
        // Reset form fields
        document.querySelectorAll('input').forEach(input => input.value = '');
        // Reset button text
        addBtn.textContent = 'ADD';
        // Reset selected row
        selectedRowForEdit = null;
        // Reset table selection
        document.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
    });

    // EDIT Reservation button click handler
    editReservationBtn.addEventListener('click', function() {
        const selectedRow = document.querySelector('tr.selected');
        if (!selectedRow) {
            alert('Please select a reservation to edit');
            return;
        }

        // Show form
        formContainer.style.display = 'flex';
        selectedRowForEdit = selectedRow;

        // Fill form with selected reservation data
        const cells = selectedRow.cells;
        document.querySelector('input[placeholder="Enter time"]').value = cells[1].textContent;
        document.querySelector('input[placeholder="Enter name"]').value = cells[0].textContent;
        document.querySelector('input[placeholder="Enter number of guests"]').value = cells[2].textContent;
        document.querySelector('input[placeholder="Enter contact number"]').value = cells[3].textContent;

        // Change ADD button text to UPDATE
        addBtn.textContent = 'Update';
    });

    // Check-out button click handler
    checkoutReservationBtn.addEventListener('click', function() {
        const selectedRow = document.querySelector('tr.selected');
        if (!selectedRow) {
            alert('Please select a reservation to check out');
            return;
        }

        const checkoutTime = prompt('Enter checkout time (HH:MM):', 
            new Date().toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        );
        
        if (checkoutTime) {
            // Create checkout data object
            const checkoutData = {
                name: selectedRow.cells[0].textContent,
                timeIn: selectedRow.cells[1].textContent,
                timeOut: checkoutTime,
                pax: selectedRow.cells[2].textContent,
                contact: selectedRow.cells[3].textContent,
                date: document.getElementById('current-date').textContent,
                timestamp: new Date().getTime()
            };

            // Get existing checkout history
            let checkoutHistory = JSON.parse(localStorage.getItem('checkoutHistory')) || [];
            checkoutHistory.push(checkoutData);
            localStorage.setItem('checkoutHistory', JSON.stringify(checkoutHistory));

            // Clear all current reservation data
            clearAllData();
        }
    });

    // ADD/Update button click handler
    addBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get the selected table
        const selectedTable = document.querySelector('.cashier-unavailable');
        if (!selectedTable) {
            alert('Please select a table first');
            return;
        }
        
        // Get form values
        const name = document.querySelector('input[placeholder="Enter name"]').value;
        const time = document.querySelector('input[placeholder="Enter time"]').value;
        const pax = document.querySelector('input[placeholder="Enter number of guests"]').value;
        const contact = document.querySelector('input[placeholder="Enter contact number"]').value;
        
        // Validate inputs
        if (!name || !time || !pax || !contact) {
            alert('Please fill in all fields');
            return;
        }

        if (selectedRowForEdit) {
            // Update existing row
            selectedRowForEdit.innerHTML = `
                <td>${name}</td>
                <td>${time}</td>
                <td>${pax}</td>
                <td>${contact}</td>
            `;
            selectedRowForEdit.classList.remove('selected');
            selectedRowForEdit = null;
            addBtn.textContent = 'ADD';
        } else {
            // Add new row
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${name}</td>
                <td>${time}</td>
                <td>${pax}</td>
                <td>${contact}</td>
            `;
            // Store the table number in the row's dataset
            const tableNumber = selectedTable.innerHTML.replace('Table ', '');
            newRow.dataset.tableNumber = tableNumber;
            
            tableBody.appendChild(newRow);
        }
        
        // Save to localStorage
        saveReservations();
        saveTableStates();
        
        // Clear form and hide it
        document.querySelectorAll('input').forEach(input => input.value = '');
        formContainer.style.display = 'none';
    });

    // Cancel button click handler
    cancelBtn.addEventListener('click', function() {
        // Clear form
        document.querySelectorAll('input').forEach(input => input.value = '');
        formContainer.style.display = 'none';
        // Reset button text
        addBtn.textContent = 'ADD';
        // Clear selected row reference
        selectedRowForEdit = null;
        // Reset any selected rows
        document.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
    });

    // Checkout History button click handler
    checkoutHistoryBtn.addEventListener('click', function() {
        // Get the current selected date from sessionStorage
        const selectedDate = sessionStorage.getItem('selectedDate');
        
        // Redirect to checkout.html with the selected date if available
        if (selectedDate) {
            window.location.href = `checkout.html?date=${selectedDate}`;
        } else {
            window.location.href = 'checkout.html';
        }
    });
});