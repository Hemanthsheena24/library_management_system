document.addEventListener('DOMContentLoaded', fetchCatalog);

function fetchCatalog() {
    fetch("http://localhost:5000/api/books")
        .then(res => res.json())
        .then(renderCatalog)
        .catch(err => console.error(err));
}

function renderCatalog(books) {
    const grid = document.getElementById('catalogGrid');
    grid.innerHTML = '';

    books.forEach(book => {
        const card = `
            <div class="book-card">
                <div class="book-icon"><i class="fa-solid fa-book"></i></div>
                <div class="book-info">
                    <h4>${book.title}</h4>
                    <p>${book.author}</p>
                    <span class="badge">${book.category}</span>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}
