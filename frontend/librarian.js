document.addEventListener("DOMContentLoaded", () => {
    const auth = sessionStorage.getItem("adminAuth");

    if (!auth) {
        alert("Please login as admin");
        window.location.href = "login.html";
        return;
    }

    /* ✅ WIRE ADD BOOK BUTTON */
    const addBookBtn = document.getElementById("addBookBtn");
    if (addBookBtn) {
        addBookBtn.addEventListener("click", toggleAddForm);
    }

    fetchRequests();
    fetchBooks();
});

/* =========================
   TAB SWITCHING
========================= */
window.switchTab = function (tabName, element) {
    document.querySelectorAll(".dashboard-section").forEach(section => {
        section.style.display = "none";
    });

    document.getElementById(tabName + "-section").style.display = "block";

    document.querySelectorAll(".nav-links a").forEach(link =>
        link.classList.remove("active")
    );

    if (element) element.classList.add("active");
};

/* =========================
   FETCH REQUESTS
========================= */
function fetchRequests() {
    const auth = sessionStorage.getItem("adminAuth");

    fetch("http://localhost:5000/api/requests", {
        headers: {
            Authorization: "Basic " + auth,
        },
    })
        .then(res => res.json())
        .then(requests => {
            const requestBody = document.getElementById("requestTableBody");
            const issuedBody = document.getElementById("issuedTableBody");

            requestBody.innerHTML = "";
            issuedBody.innerHTML = "";

            if (!requests || requests.length === 0) {
                requestBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align:center;">
                            No requests found
                        </td>
                    </tr>
                `;
                return;
            }

            requests.forEach(req => {
                if (req.status === "PENDING") {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${req.student._id}</td>
                        <td>${req.book.title}</td>
                        <td>-</td>
                        <td>
                            <span class="status pending">${req.status}</span>
                        </td>
                        <td>
                            <button class="action-btn approve"
                                onclick="approveRequest('${req._id}')">
                                <i class="fa-solid fa-check"></i>
                            </button>
                            <button class="action-btn reject"
                                onclick="rejectRequest('${req._id}')">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </td>
                    `;
                    requestBody.appendChild(row);
                }

                if (req.status === "APPROVED") {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${req.student.email}</td>
                        <td>${req.student._id}</td>
                        <td>${req.book.title}</td>
                        <td>${req.book.category}</td>
                        <td>-</td>
                    `;
                    issuedBody.appendChild(row);
                }
            });
        })
        .catch(() => alert("Failed to load requests"));
}

/* =========================
   APPROVE / REJECT
========================= */
window.approveRequest = function (requestId) {
    const auth = sessionStorage.getItem("adminAuth");

    fetch(`http://localhost:5000/api/requests/approve/${requestId}`, {
        method: "POST",
        headers: {
            Authorization: "Basic " + auth,
        },
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            fetchRequests();
            fetchBooks();
        })
        .catch(() => alert("Approve failed"));
};

window.rejectRequest = function (requestId) {
    const auth = sessionStorage.getItem("adminAuth");

    fetch(`http://localhost:5000/api/requests/reject/${requestId}`, {
        method: "POST",
        headers: {
            Authorization: "Basic " + auth,
        },
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            fetchRequests();
        })
        .catch(() => alert("Reject failed"));
};

/* =========================
   FETCH BOOK CATALOG
========================= */
function fetchBooks() {
    fetch("http://localhost:5000/api/books")
        .then(res => res.json())
        .then(books => {
            const grid = document.getElementById("bookGrid");
            grid.innerHTML = "";

            books.forEach(book => {
                const card = document.createElement("div");
                card.className = "book-card";

                card.innerHTML = `
                    <div class="book-icon">
                        <i class="fa-solid fa-book"></i>
                    </div>
                    <div class="book-info">
                        <h4>${book.title}</h4>
                        <p>${book.author}</p>
                        <span class="badge">${book.category}</span>
                        <p>Qty: ${book.quantity}</p>
                    </div>
                    <button class="delete-btn"
                        onclick="deleteBook('${book._id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                `;

                grid.appendChild(card);
            });
        })
        .catch(() => alert("Failed to load books"));
}

/* =========================
   ADD NEW BOOK
========================= */
window.addNewBook = function () {
    const auth = sessionStorage.getItem("adminAuth");

    const title = document.getElementById("newBookTitle").value.trim();
    const author = document.getElementById("newBookAuthor").value.trim();
    const category = document.getElementById("newBookCategory").value.trim();
    const quantity = Number(document.getElementById("newBookQty").value);

    if (!title || !author || !category || !quantity) {
        alert("All fields are required");
        return;
    }

    const saveBtn = document.querySelector(
        "#addBookForm .btn.primary"
    );

    // ✅ Disable button while saving
    saveBtn.disabled = true;
    saveBtn.innerText = "Saving...";
    saveBtn.style.opacity = "0.7";

    fetch("http://localhost:5000/api/books", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + auth,
        },
        body: JSON.stringify({ title, author, category, quantity }),
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            toggleAddForm();
            fetchBooks();
        })
        .catch(() => alert("Failed to add book"))
        .finally(() => {
            // ✅ Re-enable button
            saveBtn.disabled = false;
            saveBtn.innerText = "Save Book";
            saveBtn.style.opacity = "1";
        });
};


/* =========================
   DELETE BOOK
========================= */
window.deleteBook = function (bookId) {
    const auth = sessionStorage.getItem("adminAuth");

    if (!confirm("Delete this book?")) return;

    fetch(`http://localhost:5000/api/books/${bookId}`, {
        method: "DELETE",
        headers: {
            Authorization: "Basic " + auth,
        },
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            fetchBooks();
        })
        .catch(() => alert("Delete failed"));
};

/* =========================
   TOGGLE ADD FORM
========================= */
window.toggleAddForm = function () {
    const form = document.getElementById("addBookForm");
    const addBtn = document.getElementById("addBookBtn");

    const isOpen = form.style.display === "block";

    if (isOpen) {
        // Hide form, show button
        form.style.display = "none";
        addBtn.style.display = "inline-flex";
    } else {
        // Show form, hide button
        form.style.display = "block";
        addBtn.style.display = "none";
    }
};


/* =========================
   LOGOUT
========================= */
window.logout = function () {
    sessionStorage.removeItem("adminAuth");
    window.location.href = "index.html";
};
