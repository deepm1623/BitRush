const API_BASE_URL = "http://127.0.0.1:5000/api";
const USE_BACKEND = true;


const sampleFoods = [
    {
        id: 1,
        name: "Veg Sandwich",
        category: "Snacks",
        price: 60,
        description: "Toasted sandwich with fresh vegetables and cheese.",
        image: "assets/Veg Sandwich.jpg",
        available: true
    },
    {
        id: 2,
        name: "Cheese Sandwich",
        category: "Snacks",
        price: 70,
        description: "Grilled sandwich filled with delicious melted cheese.",
        image: "assets/Cheese Sandwich.jpg",
        available: true
    },
    {
        id: 3,
        name: "Veg Burger",
        category: "Fast Food",
        price: 80,
        description: "Crispy vegetable patty with fresh lettuce.",
        image: "assets/Veg Burger.jpg",
        available: true
    },
    {
        id: 4,
        name: "French Fries",
        category: "Snacks",
        price: 70,
        description: "Golden crispy fries with delicious seasoning.",
        image: "assets/French Fries.jpg",
        available: true
    },
    {
        id: 5,
        name: "Masala Dosa",
        category: "South Indian",
        price: 90,
        description: "Crispy dosa with potato masala and chutney.",
        image: "assets/Masala Dosa.jpg",
        available: true
    },
    {
        id: 6,
        name: "Cold Coffee",
        category: "Drinks",
        price: 50,
        description: "Refreshing chilled coffee for your break.",
        image: "assets/Cold Coffee.jpg",
        available: true
    },
    {
        id: 7,
        name: "Veg Pizza",
        category: "Fast Food",
        price: 120,
        description: "Loaded with cheese and fresh vegetables.",
        image: "assets/Veg Pizza.jpg",
        available: true
    },
    {
        id: 8,
        name: "Gujarati Thali",
        category: "Meals",
        price: 110,
        description: "A delicious traditional Gujarati meal.",
        image: "assets/Gujarati Thali.jpg",
        available: true
    },
    {
        id: 9,
        name: "Chocolate Brownie",
        category: "Desserts",
        price: 65,
        description: "Rich chocolate brownie for your sweet cravings.",
        image: "assets/Chocolate Brownie.jpg",
        available: true
    },
    {
        id: 10,
        name: "Cheese Maggi",
        category: "Snacks",
        price: 50,
        description: "Hot Maggi noodles topped with delicious cheese.",
        image: "assets/Cheese Maggi.jpg",
        available: true
    },
    {
        id: 11,
        name: "Hakka Noodles",
        category: "Fast Food",
        price: 90,
        description: "Stir-fried noodles with vegetables and sauces.",
        image: "assets/Hakka Noodles.jpg",
        available: true
    },
    {
        id: 12,
        name: "Manchurian",
        category: "Fast Food",
        price: 100,
        description: "Spicy vegetable Manchurian tossed in flavorful sauce.",
        image: "assets/Manchurian.jpg",
        available: true
    },
    {
        id: 13,
        name: "Paneer Wrap",
        category: "Snacks",
        price: 80,
        description: "Paneer and vegetables wrapped in a soft tortilla.",
        image: "assets/Paneer Wrap.jpg",
        available: true
    },
    {
        id: 14,
        name: "Pav Bhaji",
        category: "Meals",
        price: 100,
        description: "Mumbai-style bhaji served with buttery pav.",
        image: "assets/Pav Bhaji.jpg",
        available: true
    }
];


const ORDERS_STORAGE_KEY = "biterush_orders";
const MENU_STORAGE_KEY = "biterush_admin_menu";

function getInitialMenu() {
    try {
        const raw = localStorage.getItem(MENU_STORAGE_KEY);
        if (raw !== null) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (e) {
        console.error("Error reading menu from localStorage:", e);
    }
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(sampleFoods));
    return [...sampleFoods];
}

let foods = getInitialMenu();
let cart = [];
let savedOrders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY)) || [];
let selectedCategory = "All";
let searchText = "";

let selectedFood = null;
let modalQuantity = 1;
let lastMenuSnapshot = localStorage.getItem(MENU_STORAGE_KEY) || "";
let lastOrdersSnapshot = localStorage.getItem(ORDERS_STORAGE_KEY) || "";


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


function refreshIcons() {
    if (window.lucide) {
        lucide.createIcons();
    }
}


function imageFallback(image) {
    image.onerror = function () {
        this.onerror = null;
        this.src = "assets/Veg Sandwich.jpg";
    };
}


async function fetchMenuFromBackend() {
    if (!USE_BACKEND) {
        foods = getInitialMenu();
        lastMenuSnapshot = localStorage.getItem(MENU_STORAGE_KEY) || "";
        renderFoods();
        renderPopular();
        return;
    }

    foodGrid.innerHTML = `
        <div class="no-results">
            <h3>Loading menu...</h3>
            <p>Fetching fresh items from the canteen.</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE_URL}/menu`);
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
            foods = data;
        }
    } catch (error) {
        console.error("Failed to fetch menu from Flask backend:", error);
        showToast("Backend offline — showing local menu");
        foods = getInitialMenu();
    }

    renderFoods();
    renderPopular();
}

async function submitOrderToBackend(orderPayload) {
    if (!USE_BACKEND) {
        const now = new Date();
        return {
            id: "BR-" + Math.floor(1000 + Math.random() * 9000),
            items: orderPayload.items,
            total: orderPayload.total,
            status: "Order Placed",
            time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
    }

    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            items: orderPayload.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            total: orderPayload.total
        })
    });

    if (!response.ok) {
        throw new Error("Could not place order. Please try again.");
    }

    const data = await response.json();
    const now = new Date();

    return {
        id: data.order_id || data.id,
        items: orderPayload.items,
        total: data.total ?? orderPayload.total,
        status: data.status || "Order Placed",
        time: data.created_at || now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
}

async function syncOrderStatusesFromBackend() {
    if (!USE_BACKEND) {
        savedOrders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY)) || [];
        lastOrdersSnapshot = localStorage.getItem(ORDERS_STORAGE_KEY) || "";
        updateOrdersUI();
        return;
    }

    if (!savedOrders.length) return;

    try {
        const updatedOrders = await Promise.all(
            savedOrders.map(async order => {
                try {
                    const res = await fetch(`${API_BASE_URL}/orders/${order.id}`);
                    if (!res.ok) return order;
                    const data = await res.json();
                    return {
                        ...order,
                        status: data.status || order.status || "Order Placed"
                    };
                } catch {
                    return order;
                }
            })
        );

        savedOrders = updatedOrders;
        saveOrdersToStorage();
    } catch (error) {
        console.error("Could not refresh order statuses:", error);
    }
}

function createFoodCard(food) {
    const isAvailable = food.available !== false;

    return `
        <article class="food-card ${!isAvailable ? "unavailable" : ""}" data-food-id="${food.id}">

            <div class="food-image">
                <img
                    src="${food.image}"
                    alt="${food.name}"
                    loading="lazy"
                    onerror="imageFallback(this)"
                >

                <span class="food-badge ${!isAvailable ? "sold-out-badge" : ""}">
                    <span class="veg-dot ${!isAvailable ? "out-dot" : ""}"></span>
                    ${isAvailable ? "Vegetarian" : "Sold Out"}
                </span>
            </div>

            <div class="food-details">

                <h3>${food.name}</h3>

                <p>${food.description}</p>

                <div class="food-bottom">

                    <span class="food-price">₹${food.price}</span>

                    <button
                        class="add-button"
                        ${!isAvailable ? "disabled" : ""}
                        onclick="event.stopPropagation(); addToCart(${food.id})"
                        aria-label="${isAvailable ? `Add ${food.name} to cart` : `${food.name} is sold out`}"
                    >
                        <i data-lucide="${isAvailable ? "plus" : "ban"}"></i>
                    </button>

                </div>
            </div>

        </article>
    `;
}

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

function openFoodModal(foodId) {
    const food = foods.find(item => item.id === foodId);

    if (!food) return;

    if (food.available === false) {
        showToast(`${food.name} is currently Sold Out`);
        return;
    }

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

function closeFoodModal() {
    const modal = document.getElementById("foodModalOverlay");

    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    selectedFood = null;
}

function updateModalQuantity() {
    const quantityElement = document.getElementById("modalQuantity");

    if (quantityElement) {
        quantityElement.textContent = modalQuantity;
    }
}

document.addEventListener("click", event => {
    const card = event.target.closest(".food-card");

    if (!card) return;

    const foodId = Number(card.dataset.foodId);

    openFoodModal(foodId);
});

function addToCart(foodId, quantity = 1) {
    const food = foods.find(item => item.id === foodId);

    if (!food) return;

    if (food.available === false) {
        showToast(`${food.name} is currently Sold Out`);
        return;
    }

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

function updateCart() {
    const totalQuantity = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    cartCount.textContent = totalQuantity;

    renderCart();
}

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

function changeQuantity(foodId, change) {
    const item = cart.find(item => item.id === foodId);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== foodId);
    }

    updateCart();
}

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

document.getElementById("searchInput").addEventListener("input", event => {
    searchText = event.target.value.trim();

    renderFoods();
});

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

function copyOrderId(orderId) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(orderId).then(() => {
            showToast(`Copied Order Number: ${orderId}`);
        });
    } else {
        showToast(`Order Number: ${orderId}`);
    }
}

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

function saveOrdersToStorage() {
    const serialized = JSON.stringify(savedOrders);
    localStorage.setItem(ORDERS_STORAGE_KEY, serialized);
    lastOrdersSnapshot = serialized;
    updateOrdersUI();
}

function getStatusPillClass(status) {
    switch (status) {
        case "Accepted": return "status-accepted";
        case "Preparing": return "status-preparing";
        case "Ready for Pickup": return "status-ready";
        case "Completed": return "status-completed";
        default: return "status-placed";
    }
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
            const latestOrder = savedOrders[0];
            const currentStatus = latestOrder.status || "Order Placed";
            const smallLabel = floatingOrderBar.querySelector(".floating-order-info small");
            if (smallLabel) {
                smallLabel.textContent = `STATUS: ${currentStatus.toUpperCase()}`;
            }
            floatingOrderNumber.textContent = `#${latestOrder.id}`;
            floatingOrderBar.style.display = "flex";
        } else {
            floatingOrderBar.style.display = "none";
        }
    }
}

function renderSavedOrders() {
    const listContainer = document.getElementById("savedOrdersList");
    if (!listContainer) return;

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

    listContainer.innerHTML = savedOrders.map(order => {
        const currentStatus = order.status || "Order Placed";
        const statusClass = getStatusPillClass(currentStatus);

        return `
            <div class="saved-order-card">
                <div class="saved-order-top">
                    <button class="order-id-pill copy-order-btn" onclick="copyOrderId('${order.id}')" title="Copy Order ID">
                        <strong>#${order.id}</strong>
                        <i data-lucide="copy"></i>
                    </button>
                    <span class="student-status-pill ${statusClass}">${currentStatus}</span>
                </div>

                <div class="saved-order-items">
                    ${order.items.map(item => `<span>${item.quantity}× ${item.name}</span>`).join(", ")}
                </div>

                <div class="saved-order-bottom">
                    <div>
                        <strong>Total: ₹${order.total}</strong>
                        <small style="display:block; color: var(--muted); font-size: 11px; margin-top: 2px;">Placed at ${order.time}</small>
                    </div>
                    <button class="picked-up-btn" onclick="markOrderPickedUp('${order.id}')">
                        <i data-lucide="check"></i>
                        Mark Picked Up
                    </button>
                </div>
            </div>
        `;
    }).join("");

    refreshIcons();
}

function markOrderPickedUp(orderId) {
    savedOrders = savedOrders.filter(order => order.id !== orderId);
    saveOrdersToStorage();
    renderSavedOrders();
    showToast(`Order #${orderId} marked as picked up`);
}

async function openMyOrdersModal() {
    await syncOrderStatusesFromBackend();
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


const checkoutButton = document.getElementById("checkoutButton");

checkoutButton.addEventListener("click", async () => {

    if (!cart.length) {
        showToast("Your cart is empty");
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    checkoutButton.disabled = true;
    checkoutButton.innerHTML = `Placing Order...`;

    try {
        const newOrder = await submitOrderToBackend({
            items: [...cart],
            total
        });

        savedOrders.unshift(newOrder);
        saveOrdersToStorage();

        cart = [];
        updateCart();
        cartOverlay.classList.remove("show");

        openOrderModal(newOrder);
    } catch (error) {
        console.error("Checkout error:", error);
        showToast(error.message || "Failed to place order. Try again.");
    } finally {
        checkoutButton.disabled = false;
        checkoutButton.innerHTML = `
            Proceed to Order
            <i data-lucide="arrow-right"></i>
        `;
        refreshIcons();
    }
});

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

function checkForAdminUpdates() {
    if (USE_BACKEND) return;

    const currentMenuRaw = localStorage.getItem(MENU_STORAGE_KEY) || "";
    if (currentMenuRaw !== lastMenuSnapshot) {
        lastMenuSnapshot = currentMenuRaw;
        foods = getInitialMenu();
        renderFoods();
        renderPopular();
    }

    const currentOrdersRaw = localStorage.getItem(ORDERS_STORAGE_KEY) || "";
    if (currentOrdersRaw !== lastOrdersSnapshot) {
        lastOrdersSnapshot = currentOrdersRaw;
        savedOrders = JSON.parse(currentOrdersRaw || "[]");
        updateOrdersUI();
        if (myOrdersModalOverlay.classList.contains("show")) {
            renderSavedOrders();
        }
    }
}

window.addEventListener("storage", checkForAdminUpdates);
window.addEventListener("focus", checkForAdminUpdates);
setInterval(checkForAdminUpdates, 2000);


document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeFoodModal();
        closeOrderModal();
        closeMyOrdersModal();
        cartOverlay.classList.remove("show");
    }
});


fetchMenuFromBackend();
updateCart();
updateOrdersUI();
refreshIcons();