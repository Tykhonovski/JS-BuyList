let items = JSON.parse(localStorage.getItem('buyList')) || [
    { id: 1, name: 'Помідори', amount: 1, isBought: false },
    { id: 2, name: 'Печиво', amount: 1, isBought: false },
    { id: 3, name: 'Сир', amount: 1, isBought: false }
];

let editingId = null;

function saveState() {
    localStorage.setItem('buyList', JSON.stringify(items));
    render(); 
}

function addItem(name) {
    if (!name.trim()) return; 
    items.push({
        id: Date.now(),
        name: name.trim(),
        amount: 1,
        isBought: false
    });
    saveState();
}

function deleteItem(id) {
    items = items.filter(item => item.id !== id);
    saveState();
}

function toggleBought(id) {
    const item = items.find(i => i.id === id);
    if (item) {
        item.isBought = !item.isBought;
        saveState();
    }
}

function updateAmount(id, delta) {
    const item = items.find(i => i.id === id);
    if (item && !item.isBought) {
        const newAmount = item.amount + delta;
        if (newAmount >= 1) {
            item.amount = newAmount;
            saveState();
        }
    }
}

function saveEdit(id, newName) {
    const item = items.find(i => i.id === id);
    if (item && newName.trim()) {
        item.name = newName.trim();
    }
    editingId = null; 
    saveState();
}

const domList = document.getElementById('product-list');
const domLeftToBuy = document.getElementById('left-to-buy');
const domAlreadyBought = document.getElementById('already-bought');
const inputAdd = document.getElementById('new-item-name');
const btnAdd = document.getElementById('btn-add');

// Додавання товару (Клік або Enter)
btnAdd.addEventListener('click', () => {
    addItem(inputAdd.value);
    inputAdd.value = '';
    inputAdd.focus();
});

inputAdd.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addItem(inputAdd.value);
        inputAdd.value = '';
        inputAdd.focus();
    }
});
domList.addEventListener('click', (e) => {
    const li = e.target.closest('.product-item');
    if (!li) return;
    const id = Number(li.dataset.id);

    if (e.target.classList.contains('btn-delete')) {
        deleteItem(id);
    } else if (e.target.classList.contains('btn-bought')) {
        toggleBought(id);
    } else if (e.target.classList.contains('btn-plus')) {
        updateAmount(id, 1);
    } else if (e.target.classList.contains('btn-minus')) {
        updateAmount(id, -1);
    } else if (e.target.classList.contains('product-name')) {
        const item = items.find(i => i.id === id);
        if (!item.isBought) {
            editingId = id;
            saveState();
        }
    }
});
domList.addEventListener('focusout', (e) => {
    if (e.target.classList.contains('edit-input')) {
        saveEdit(Number(e.target.dataset.id), e.target.value);
    }
});
domList.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('edit-input')) {
        e.target.blur();
    }
});

function render() {
    domList.innerHTML = '';
    domLeftToBuy.innerHTML = '';
    domAlreadyBought.innerHTML = '';

    items.forEach(item => {
        const li = document.createElement('li');
        li.className = `product-item ${item.isBought ? 'is-bought' : ''}`;
        li.dataset.id = item.id;

        let nameHTML = '';
        if (editingId === item.id) {
            nameHTML = `<input type="text" class="edit-input" data-id="${item.id}" value="${item.name}">`;
        } else {
            nameHTML = `<span class="product-name" data-tooltip="Редагувати">${item.name}</span>`;
        }
        li.innerHTML = `
            ${nameHTML}
            <div class="controls">
                <button class="btn-minus" data-tooltip="Зменшити" ${item.amount === 1 ? 'style="opacity: 0.3; cursor: not-allowed;" disabled' : ''}>-</button>
                <span class="amount">${item.amount}</span>
                <button class="btn-plus" data-tooltip="Збільшити">+</button>
            </div>
            <div class="actions">
                <button class="btn-bought ${item.isBought ? 'active' : ''}" data-tooltip="${item.isBought ? 'Повернути' : 'Відмітити як куплене'}">
                    ${item.isBought ? 'Не куплено' : 'Куплено'}
                </button>
                <button class="btn-delete" data-tooltip="Видалити товар">✖</button>
            </div>
        `;
        domList.appendChild(li);
        const tagHTML = `<span class="tag">${item.name} <span style="background: #e0e0e0; border-radius: 50%; padding: 2px 6px; font-weight: bold; margin-left: 5px;">${item.amount}</span></span>`;
        if (item.isBought) {
            domAlreadyBought.insertAdjacentHTML('beforeend', tagHTML);
        } else {
            domLeftToBuy.insertAdjacentHTML('beforeend', tagHTML);
        }
    });
    const activeEditInput = document.querySelector('.edit-input');
    if (activeEditInput) activeEditInput.focus();
}

render();