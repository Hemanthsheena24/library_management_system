document.addEventListener("DOMContentLoaded", () => {
    const auth = sessionStorage.getItem("studentAuth");

    if (!auth) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    fetchMyBooks();
    fetchCatalog();
});

/* =========================
   TAB SWITCHING (UNCHANGED)
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
   FETCH CATALOG (REAL)
========================= */
function fetchCatalog() {
    fetch("http://localhost:5000/api/books")
        .then(res => res.json())
        .then(books => {
            const grid = document.getElementById("catalogGrid");
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
                    </div>
                    ${
                        book.quantity > 0
                            ? `<button class="action-btn"
                                  onclick="requestBook('${book._id}')"
                                  style="color: var(--primary-color); position: absolute; top: 10px; right: 10px;">
                                  <i class="fa-solid fa-plus"></i>
                               </button>`
                            : `<span style="position:absolute;top:15px;right:15px;color:#ef4444;">Out</span>`
                    }
                `;

                grid.appendChild(card);
            });
        })
        .catch(() => alert("Failed to load catalog"));
}

/* =========================
   REQUEST BOOK
========================= */
window.requestBook = function (bookId) {
    const auth = sessionStorage.getItem("studentAuth");

    fetch("http://localhost:5000/api/requests/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + auth,
        },
        body: JSON.stringify({ bookId }),
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            fetchMyBooks();
        })
        .catch(() => alert("Request failed"));
};

/* =========================
   FETCH MY BOOKS (REQUESTS)
========================= */
function fetchMyBooks() {
    const auth = sessionStorage.getItem("studentAuth");

    fetch("http://localhost:5000/api/requests/my", {
        headers: {
            Authorization: "Basic " + auth,
        },
    })
        .then(res => res.json())
        .then(requests => {
            const tbody = document.getElementById("myBooksTableBody");
            tbody.innerHTML = "";

            if (requests.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align:center;">
                            No books issued
                        </td>
                    </tr>
                `;
                return;
            }

            requests.forEach(req => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${req.book.title}</td>
                    <td>${req.book.author}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>
                        ${
                            req.status === "APPROVED"
                                ? `<button onclick="returnBook('${req._id}')">Return</button>`
                                : `<span>${req.status}</span>`
                        }
                    </td>
                `;

                tbody.appendChild(row);
            });
        })
        .catch(() => alert("Failed to load your books"));
}

/* =========================
   RETURN BOOK
========================= */
window.returnBook = function (requestId) {
    const auth = sessionStorage.getItem("studentAuth");

    fetch(`http://localhost:5000/api/requests/return/${requestId}`, {
        method: "POST",
        headers: {
            Authorization: "Basic " + auth,
        },
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            fetchMyBooks();
            fetchCatalog();
        })
        .catch(() => alert("Return failed"));
};

/* =========================
   LOGOUT
========================= */
window.logout = function () {
    sessionStorage.removeItem("studentAuth");
    window.location.href = "index.html";
};
