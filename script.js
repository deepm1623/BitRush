// ======================================
// BITERUSH FOOD DATA
// ======================================

const foods = [
    {
        id: 1,
        name: "Veg Sandwich",
        category: "Snacks",
        price: 60,
        description: "Toasted sandwich with fresh vegetables and cheese.",
        image: "assets/Veg Sandwich.jpg"
    },
    {
        id: 2,
        name: "Cheese Sandwich",
        category: "Snacks",
        price: 70,
        description: "Grilled sandwich filled with delicious melted cheese.",
        image: "assets/Cheese Sandwich.jpg"
    },
    {
        id: 3,
        name: "Veg Burger",
        category: "Fast Food",
        price: 80,
        description: "Crispy vegetable patty with fresh lettuce.",
        image: "assets/Veg Burger.jpg"
    },
    {
        id: 4,
        name: "French Fries",
        category: "Snacks",
        price: 70,
        description: "Golden crispy fries with delicious seasoning.",
        image: "assets/French Fries.jpg"
    },
    {
        id: 5,
        name: "Masala Dosa",
        category: "South Indian",
        price: 90,
        description: "Crispy dosa with potato masala and chutney.",
        image: "assets/Masala Dosa.jpg"
    },
    {
        id: 6,
        name: "Cold Coffee",
        category: "Drinks",
        price: 50,
        description: "Refreshing chilled coffee for your break.",
        image: "assets/Cold Coffee.jpg"
    },
    {
        id: 7,
        name: "Veg Pizza",
        category: "Fast Food",
        price: 120,
        description: "Loaded with cheese and fresh vegetables.",
        image: "assets/Veg Pizza.jpg"
    },
    {
        id: 8,
        name: "Gujarati Thali",
        category: "Meals",
        price: 110,
        description: "A delicious traditional Gujarati meal.",
        image: "assets/Gujarati Thali.jpg"
    },
    {
        id: 9,
        name: "Chocolate Brownie",
        category: "Desserts",
        price: 65,
        description: "Rich chocolate brownie for your sweet cravings.",
        image: "assets/Chocolate Brownie.jpg"
    },
    {
        id: 10,
        name: "Cheese Maggi",
        category: "Snacks",
        price: 50,
        description: "Hot Maggi noodles topped with delicious cheese.",
        image: "assets/Cheese Maggi.jpg"
    },
    {
        id: 11,
        name: "Hakka Noodles",
        category: "Fast Food",
        price: 90,
        description: "Stir-fried noodles with vegetables and sauces.",
        image: "assets/Hakka Noodles.jpg"
    },
    {
        id: 12,
        name: "Manchurian",
        category: "Fast Food",
        price: 100,
        description: "Spicy vegetable Manchurian tossed in flavorful sauce.",
        image: "assets/Manchurian.jpg"
    },
    {
        id: 13,
        name: "Paneer Wrap",
        category: "Snacks",
        price: 80,
        description: "Paneer and vegetables wrapped in a soft tortilla.",
        image: "assets/Paneer Wrap.jpg"
    },
    {
        id: 14,
        name: "Pav Bhaji",
        category: "Meals",
        price: 100,
        description: "Mumbai-style bhaji served with buttery pav.",
        image: "assets/Pav Bhaji.jpg"
    }
];


// ======================================
// APP STATE
// ======================================

const ORDERS_STORAGE_KEY = "biterush_orders";

let cart = [];
let savedOrders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY)) || [];
let selectedCategory = "All";
let searchText = "";

let selectedFood = null;
let modalQuantity = 1;


// ======================================
// ELEMENTS
// ======================================

const foodGrid = document.getElementById("foodGrid");
const popularGrid = document.getElementById("popularGrid");

const cartCount = document.getElementById("cartCount");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

const orderModalOverlay = document.getElementById("orderModalOverlay");
const myOrdersModalOverlay = document.getElementById("myOrdersModalOverlay");
const activeOrdersCount = document.getElementById("activeOrdersCount");
const floatingOrderBar = document.getElementById("floatingOrderBar");
const floatingOrderNumber = document.getElementById("floatingOrderNumber");


// ======================================
// ICON REFRESH
// ======================================

function refreshIcons() {
    if (window.lucide) {
        lucide.createIcons();
    }
}


// ======================================
// IMAGE FALLBACK
// ======================================

function imageFallback(image) {
    image.onerror = function () {
        this.onerror = null;
        this.src = "assets/Veg Sandwich.jpg";
    };
}


// ======================================
// FOOD CARD
// ======================================

function createFoodCard(food) {
    return `
        <article class="food-card" data-food-id="${food.id}">

            <div class="food-image">
                <img
                    src="${food.image}"
                    alt="${food.name}"
                    loading="lazy"
                    onerror="imageFallback(this)"
                >

                <span class="food-badge">
                    <span class="veg-dot"></span>
                    Vegetarian
                </span>
            </div>

            <div class="food-details">

                <h3>${food.name}</h3>

                <p>${food.description}</p>

                <div class="food-bottom">

                    <span class="food-price">₹${food.price}</span>

                    <button
                        class="add-button"
                        onclick="event.stopPropagation(); addToCart(${food.id})"
                        aria-label="Add ${food.name} to cart"
                    >
                        <i data-lucide="plus"></i>
                    </button>

                </div>
            </div>

        </article>
    `;
}


// ======================================
// RENDER FOOD
// ======================================

function renderFoods() {
    const filteredFoods = foods.filter(food => {

        const categoryMatch =
            selectedCategory === "All" ||
            food.category === selectedCategory;

        const searchMatch =
            food.name.toLowerCase().includes(searchText.toLowerCase()) ||
            food.category.toLowerCase().includes(searchText.toLowerCase());

        return categoryMatch && searchMatch;
    });

    if (!filteredFoods.length) {
        foodGrid.innerHTML = `
            <div class="no-results">
                <h3>No food found</h3>
                <p>Try searching for something else.</p>
            </div>
        `;

        return;
    }

    foodGrid.innerHTML = filteredFoods.map(createFoodCard).join("");

    refreshIcons();
}


// ======================================
// RENDER POPULAR FOOD
// ======================================

function renderPopular() {
    if (!popularGrid) return;

    const popularFoods = [1, 3, 4, 5, 7, 8, 14]
        .map(id => foods.find(food => food.id === id))
        .filter(Boolean);

    popularGrid.innerHTML = popularFoods
        .map(createFoodCard)
        .join("");

    refreshIcons();
}


// ======================================
// FOOD DETAILS MODAL
// ======================================

function bindFoodModalEvents() {
    const modal = document.getElementById("foodModalOverlay");
    if (!modal || modal.dataset.bound === "true") return;

    const closeBtn = document.getElementById("closeFoodModal");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeFoodModal);
    }

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeFoodModal();
        }
    });

    document.getElementById("modalQuantityMinus").addEventListener("click", () => {
        modalQuantity = Math.max(1, modalQuantity - 1);
        updateModalQuantity();
    });

    document.getElementById("modalQuantityPlus").addEventListener("click", () => {
        modalQuantity++;
        updateModalQuantity();
    });

    document.getElementById("modalAddToCart").addEventListener("click", () => {
        if (!selectedFood) return;

        addToCart(selectedFood.id, modalQuantity);
        closeFoodModal();
    });

    modal.dataset.bound = "true";
}


// ======================================
// OPEN FOOD MODAL
// ======================================

function openFoodModal(foodId) {
    const food = foods.find(item => item.id === foodId);

    if (!food) return;

    bindFoodModalEvents();

    selectedFood = food;
    modalQuantity = 1;

    document.getElementById("modalFoodImage").src = food.image;
    document.getElementById("modalFoodImage").alt = food.name;

    document.getElementById("modalFoodCategory").textContent = food.category;
    document.getElementById("modalFoodName").textContent = food.name;
    document.getElementById("modalFoodDescription").textContent = food.description;
    document.getElementById("modalFoodPrice").textContent = `₹${food.price}`;

    imageFallback(document.getElementById("modalFoodImage"));

    updateModalQuantity();

    const modal = document.getElementById("foodModalOverlay");
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    refreshIcons();
}


// ======================================
// CLOSE FOOD MODAL
// ======================================

function closeFoodModal() {
    const modal = document.getElementById("foodModalOverlay");

    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    selectedFood = null;
}


// ======================================
// MODAL QUANTITY
// ======================================

function updateModalQuantity() {
    const quantityElement = document.getElementById("modalQuantity");

    if (quantityElement) {
        quantityElement.textContent = modalQuantity;
    }
}


// ======================================
// FOOD CARD CLICK
// ======================================

document.addEventListener("click", event => {
    const card = event.target.closest(".food-card");

    if (!card) return;

    const foodId = Number(card.dataset.foodId);

    openFoodModal(foodId);
});


// ======================================
// ADD TO CART
// ======================================

function addToCart(foodId, quantity = 1) {
    const food = foods.find(item => item.id === foodId);

    if (!food) return;

    const existingItem = cart.find(item => item.id === foodId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...food,
            quantity
        });
    }

    updateCart();

    showToast(`${food.name} added to cart`);

    const cartButton = document.getElementById("cartButton");

    cartButton.style.transform = "scale(1.12)";

    setTimeout(() => {
        cartButton.style.transform = "";
    }, 180);
}


// ======================================
// UPDATE CART
// ======================================

function updateCart() {
    const totalQuantity = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    cartCount.textContent = totalQuantity;

    renderCart();
}


// ======================================
// RENDER CART
// ======================================

function renderCart() {
    if (!cart.length) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i data-lucide="shopping-basket"></i>
                <h3>Your cart is empty</h3>
                <p>Add something delicious to get started.</p>
            </div>
        `;

        cartTotal.textContent = "₹0";

        refreshIcons();
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">

            <img
                src="${item.image}"
                alt="${item.name}"
                onerror="imageFallback(this)"
            >

            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>₹${item.price * item.quantity}</p>
            </div>

            <div class="quantity-controls">
                <button onclick="changeQuantity(${item.id}, -1)">−</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${item.id}, 1)">+</button>
            </div>

        </div>
    `).join("");

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    cartTotal.textContent = `₹${total}`;

    refreshIcons();
}


// ======================================
// CHANGE CART QUANTITY
// ======================================

function changeQuantity(foodId, change) {
    const item = cart.find(item => item.id === foodId);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== foodId);
    }

    updateCart();
}


// ======================================
// CATEGORY FILTER
// ======================================

document.querySelectorAll(".category-card").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".category-card").forEach(card => {
            card.classList.remove("active");
        });

        button.classList.add("active");

        selectedCategory = button.dataset.category;

        renderFoods();
    });
});


// ======================================
// SEARCH
// ======================================

document.getElementById("searchInput").addEventListener("input", event => {
    searchText = event.target.value.trim();

    renderFoods();
});


// ======================================
// OPEN / CLOSE CART
// ======================================

document.getElementById("cartButton").addEventListener("click", () => {
    cartOverlay.classList.add("show");
    renderCart();
});

document.getElementById("closeCart").addEventListener("click", () => {
    cartOverlay.classList.remove("show");
});

cartOverlay.addEventListener("click", event => {
    if (event.target === cartOverlay) {
        cartOverlay.classList.remove("show");
    }
});


// ======================================
// COPY ORDER ID HELPER
// ======================================

function copyOrderId(orderId) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(orderId).then(() => {
            showToast(`Copied Order Number: ${orderId}`);
        });
    } else {
        showToast(`Order Number: ${orderId}`);
    }
}


// ======================================
// ORDER CONFIRMATION POPUP
// ======================================

function openOrderModal(order) {
    document.getElementById("confirmOrderId").textContent = `#${order.id}`;
    document.getElementById("confirmOrderTotal").textContent = `₹${order.total}`;

    const copyBtn = document.getElementById("copyConfirmOrderId");
    copyBtn.onclick = () => copyOrderId(order.id);

    const itemsContainer = document.getElementById("confirmOrderItems");
    itemsContainer.innerHTML = order.items.map(item => `
        <div class="receipt-item-row">
            <span>${item.quantity} × ${item.name}</span>
            <span>₹${item.price * item.quantity}</span>
        </div>
    `).join("");

    orderModalOverlay.classList.add("show");
    orderModalOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    refreshIcons();
}

function closeOrderModal() {
    orderModalOverlay.classList.remove("show");
    orderModalOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

document.getElementById("closeOrderModal").addEventListener("click", closeOrderModal);
document.getElementById("orderDoneButton").addEventListener("click", closeOrderModal);

orderModalOverlay.addEventListener("click", event => {
    if (event.target === orderModalOverlay) {
        closeOrderModal();
    }
});


// ======================================
// MY ORDERS & FLOATING ORDER BAR
// ======================================

function saveOrdersToStorage() {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(savedOrders));
    updateOrdersUI();
}

function updateOrdersUI() {
    if (activeOrdersCount) {
        if (savedOrders.length > 0) {
            activeOrdersCount.textContent = savedOrders.length;
            activeOrdersCount.style.display = "grid";
        } else {
            activeOrdersCount.style.display = "none";
        }
    }

    if (floatingOrderBar && floatingOrderNumber) {
        if (savedOrders.length > 0) {
            floatingOrderNumber.textContent = `#${savedOrders[0].id}`;
            floatingOrderBar.style.display = "flex";
        } else {
            floatingOrderBar.style.display = "none";
        }
    }
}

function renderSavedOrders() {
    const listContainer = document.getElementById("savedOrdersList");

    if (!savedOrders.length) {
        listContainer.innerHTML = `
            <div class="empty-orders">
                <i data-lucide="receipt-text"></i>
                <h3>No active orders</h3>
                <p>Once you place an order, your Order Number will appear here automatically.</p>
            </div>
        `;
        refreshIcons();
        return;
    }

    listContainer.innerHTML = savedOrders.map(order => `
        <div class="saved-order-card">
            <div class="saved-order-top">
                <button class="order-id-pill copy-order-btn" onclick="copyOrderId('${order.id}')" title="Copy Order ID">
                    <strong>#${order.id}</strong>
                    <i data-lucide="copy"></i>
                </button>
                <span class="saved-order-time">${order.time}</span>
            </div>

            <div class="saved-order-items">
                ${order.items.map(item => `<span>${item.quantity}× ${item.name}</span>`).join(", ")}
            </div>

            <div class="saved-order-bottom">
                <strong>Total: ₹${order.total}</strong>
                <button class="picked-up-btn" onclick="markOrderPickedUp('${order.id}')">
                    <i data-lucide="check"></i>
                    Mark Picked Up
                </button>
            </div>
        </div>
    `).join("");

    refreshIcons();
}

function markOrderPickedUp(orderId) {
    savedOrders = savedOrders.filter(order => order.id !== orderId);
    saveOrdersToStorage();
    renderSavedOrders();
    showToast(`Order #${orderId} marked as picked up`);
}

function openMyOrdersModal() {
    renderSavedOrders();
    myOrdersModalOverlay.classList.add("show");
    myOrdersModalOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

function closeMyOrdersModal() {
    myOrdersModalOverlay.classList.remove("show");
    myOrdersModalOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

document.getElementById("myOrdersButton").addEventListener("click", openMyOrdersModal);
document.getElementById("floatingOrderViewBtn").addEventListener("click", openMyOrdersModal);
document.getElementById("closeMyOrdersModal").addEventListener("click", closeMyOrdersModal);

myOrdersModalOverlay.addEventListener("click", event => {
    if (event.target === myOrdersModalOverlay) {
        closeMyOrdersModal();
    }
});


// ======================================
// CHECKOUT
// ======================================

document.getElementById("checkoutButton").addEventListener("click", () => {

    if (!cart.length) {
        showToast("Your cart is empty");
        return;
    }

    const orderId = "BR-" + Math.floor(1000 + Math.random() * 9000);
    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newOrder = {
        id: orderId,
        items: [...cart],
        total,
        time: formattedTime
    };

    savedOrders.unshift(newOrder);
    saveOrdersToStorage();

    cart = [];
    updateCart();
    cartOverlay.classList.remove("show");

    openOrderModal(newOrder);
});


// ======================================
// TOAST
// ======================================

function showToast(message) {
    document.querySelector(".toast")?.remove();

    const toast = document.createElement("div");

    toast.className = "toast";
    toast.textContent = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");

        setTimeout(() => toast.remove(), 300);
    }, 2200);
}


// ======================================
// KEYBOARD SUPPORT
// ======================================

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeFoodModal();
        closeOrderModal();
        closeMyOrdersModal();
        cartOverlay.classList.remove("show");
    }
});


// ======================================
// INITIALIZE
// ======================================

renderFoods();
renderPopular();
updateCart();
updateOrdersUI();
refreshIcons();