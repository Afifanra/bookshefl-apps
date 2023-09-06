let books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKS_SHELF';
const BOOK_ITEM = 'itemId';

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

function findBook(bookId) {
    for (const book of books) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    let index = 0;
    for (const book of books) {
        if (book.id === bookId) {
            return index;
        }
        index++;
    }
    return -1;
}

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('Your browser does not support local storage');
        return false;
    }
    return true;
}

function saveData() {
    const parse = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parse);
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem
        (STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function AddBook() {
    const titleBook = document.getElementById('inputBookTitle').value;
    const authorBook = document.getElementById('inputBookAuthor').value;
    const yearBook = document.getElementById('inputBookYear').value;
    const isCompleted = document.getElementById('inputBookisCompleted').checked;
    const generateID = generateId();

    const bookObject = generateBookObject(
        generateID,
        titleBook,
        authorBook,
        yearBook,
        isCompleted
    );
    books.unshift(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function makeBook(bookObject) {
    const bookTitle = document.createElement('h3');
    bookTitle.innerText = bookObject.title;

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = bookObject.author;

    const bookYear = document.createElement('p');
    bookYear.innerText = bookObject.year;

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');

    const bookContent = document.createElement('article');
    bookContent.setAttribute('id', bookObject.id);
    bookContent.classList.add('book_item');
    bookContent.append(bookTitle, bookAuthor, bookYear, buttonContainer);

    if (bookObject.isCompleted) {
        buttonContainer.append(createUndoButton(), createDeleteButton());
    } else {
        buttonContainer.append(createCheckButton(), createDeleteButton());
    }

    return bookContent;
}

function searchBook() {
    const titleSearch = document.getElementById('searchBookTitle').value;
    const uncompleted = document.getElementById('incompleteBookshelfList');
    const completed = document.getElementById
        ('completeBookshelfList');
    uncompleted.innerHTML = '';
    completed.innerHTML = '';

    if (titleSearch === '') {
        uncompleted.innerHTML = '';
        completed.innerHTML = '';
        books = [];
        console.log(books);
        if (isStorageExist()) {
            loadDataFromStorage();
        }
    } else {
        const filterBook = books.filter((bookObject) => {
            return bookObject.title.toLowerCase().includes(titleSearch.toLowerCase());
        });
        console.log(filterBook);
        for (const bookItem of filterBook) {
            const bookElement = makeBook(bookItem);
            bookElement[BOOK_ITEM] = bookItem.id;
            if (bookItem.isCompleted) {
                completed.append(bookElement);
            } else {
                uncompleted.append(bookElement);
            }
        }
    }
}

function createCheckButton() {
    return createButton(
        'green',
        function (e) {
            AddBookToCompleted(e.target.parentElement.parentElement);
            const searchForm = document.getElementById('searchBook');
            searchForm.reset();
        },
        'Finished'
    );
}

function createUndoButton() {
    return createButton(
        'green',
        function (e) {
            undoBookFromCompleted(e.target.parentElement.parentElement);
            const searchForm = document.getElementById('searchBook');
            searchForm.reset();
        },
        'Not finished'
    );
}

function createDeleteButton() {
    return createButton(
        'red',
        function (e) {
            removeBookFromCompleted(e.target.parentElement.parentElement);
            const searchForm = document.getElementById('searchBook');
            searchForm.reset();
        },
        'Delete'
    );
}

function createButton(buttonTypeClass, eventListener, text) {
    const buttons = document.createElement('button');
    buttons.classList.add(buttonTypeClass);
    buttons.innerText = text;
    buttons.addEventListener('click', function (e) {
        eventListener(e);
        e.stopPropagation();
    });
    return buttons;
}

function AddBookToCompleted(bookElement) {
    const bookObject = findBook(bookElement[BOOK_ITEM]);
    if (window.confirm('Is the book finished reading?')){
        bookObject.isCompleted = true;
        bookElement.remove();
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookElement) {
    const bookObject = findBook(bookElement[BOOK_ITEM]);

    if (window.confirm('Is the book not finished reading?')){
        bookObject.isCompleted = false;
        bookElement.remove();
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookFromCompleted(bookElement) {
    const bookTarget = findBookIndex(bookElement[BOOK_ITEM]);
    if (window.confirm('Do you want to delete the book?')) {
        books.splice(bookTarget, 1);
        bookElement.remove();
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');

    submitForm.addEventListener('submit', function (e) {
        e.preventDefault();
        AddBook();
        submitForm.reset();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        searchBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
        console.log(books);
    }
});

document.addEventListener(RENDER_EVENT, function () {
    const uncompleted = document.getElementById('incompleteBookshelfList');
    uncompleted.innerHTML = '';

    const completed = document.getElementById('completeBookshelfList');
    completed.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        bookElement[BOOK_ITEM] = bookItem.id;

        if (bookItem.isCompleted) {
            completed.append(bookElement);
        } else {
            uncompleted.append(bookElement);
        }
    }
});

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

