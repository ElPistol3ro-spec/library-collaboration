
const inventory = {};
const transactions = [];

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden')
}

function showAlert(message, isSuccess = false) {
    const alertBox = document.getElementById('alert-box');
    alertBox.textContent = message;
    alertBox.className = isSuccess ? 'alert success' : 'alert';
    alertBox.classList.remove('hidden');
    setTimeout(() => alertBox.classList.add('hidden'), 4000);
}

document.getElementById('book-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('book-id').value.trim();
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const copies = parseInt(document.getElementById('book-copies').value);

    if (inventory[id]) {
        inventory[id].totalCopies += copies;
        inventory[id].availableCopies += copies;
        showAlert(`Updated existing book inventory. Total: ${inventory[id].totalCopies}`, true);
    } else {
        inventory[id] = { title, author, totalCopies: copies, availableCopies: copies };
        showAlert("Book successfully added to database!", true);
    }
    this.reset();
});

function handleSearch() {
    const query = document.getElementById('search-query').value.toLowerCase();
    const resultsList = document.getElementById('search-results');
    resultsList.innerHTML = '';

    if (!query) return;

    for (const [id, book] of Object.entries(inventory)) {
        if (book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query)) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>[${id}] ${book.title}</strong> by ${book.author} <br> 
                            Available: ${book.availableCopies} / ${book.totalCopies}`;
            resultsList.appendChild(li);
        }
    }
}

function handleBorrow() {
    const userId = document.getElementById('borrow-user').value.trim();
    const bookId = document.getElementById('borrow-id').value.trim();
    const dueDate = document.getElementById('borrow-due').value;

    if (!userId || !bookId || !dueDate) {
        showAlert("Please fill in all transaction fields.");
        return;
    }

    const book = inventory[bookId];
    if (!book) {
        showAlert("Error: Book ID does not exist.");
        return;
    }

    if (book.availableCopies > 0) {
        book.availableCopies--;
        transactions.push({
            userId,
            bookId,
            dueDate,
            borrowDate: new Date().toISOString().split('T')[0],
            status: "Borrowed"
        });
        showAlert("Book successfully checked out!", true);
        document.getElementById('borrow-user').value = '';
        document.getElementById('borrow-id').value = '';
    } else {
        showAlert("Error: All copies are currently checked out.");
    }
}

function handleReturn() {
    const userId = document.getElementById('return-user').value.trim();
    const bookId = document.getElementById('return-id').value.trim();

    const record = transactions.find(t => t.userId === userId && t.bookId === bookId && t.status === "Borrowed");

    if (!record) {
        showAlert("Error: No matching active loan record found.");
        return;
    }

    inventory[bookId].availableCopies++;
    record.status = "Returned";

    const today = new Date().toISOString().split('T')[0];
    if (today > record.dueDate) {
        showAlert("Book returned LATE! Overdue fine assessment needed.", false);
    } else {
        showAlert("Book returned successfully on time.", true);
    }
    document.getElementById('return-user').value = '';
    document.getElementById('return-id').value = '';
}

// 5. Reports Logic
function updateReports() {
    const activeList = document.getElementById('active-loans-list');
    const overdueList = document.getElementById('overdue-loans-list');
    
    activeList.innerHTML = '';
    overdueList.innerHTML = '';

    const today = new Date().toISOString().split('T')[0];

    transactions.forEach(t => {
        if (t.status === "Borrowed") {
            const book = inventory[t.bookId];
            const li = document.createElement('li');
            li.innerHTML = `<strong>User:</strong> ${t.userId} | <strong>Book:</strong> ${book ? book.title : t.bookId} <br> 
                            <strong>Due:</strong> ${t.dueDate}`;
            
            activeList.appendChild(li);

            if (today > t.dueDate) {
                const overdueLi = li.cloneNode(true);
                overdueList.appendChild(overdueLi);
            }
        }
    });
}

