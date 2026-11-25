<<<<<<< HEAD
// ======================================
// API CONFIGURATION (MATCHES SCRIPT.JS)
// ======================================

const API_BASE_URL = "http://127.0.0.1:5000/api";
const USE_BACKEND = false; // Set to true when your teammate's Flask server is live
=======
const API_BASE_URL = "http://127.0.0.1:5000/api";
const USE_BACKEND = true; // Load and manage orders through the Flask API
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)

const ORDERS_STORAGE_KEY = "biterush_orders";
const MENU_STORAGE_KEY = "biterush_admin_menu";


<<<<<<< HEAD
// ======================================
// DEFAULT MENU DATA
// ======================================

=======
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
const defaultMenu = [
    { id: 1, name: "Veg Sandwich", category: "Snacks", price: 60, description: "Toasted sandwich with fresh vegetables and cheese.", image: "assets/Veg Sandwich.jpg", available: true },
    { id: 2, name: "Cheese Sandwich", category: "Snacks", price: 70, description: "Grilled sandwich filled with delicious melted cheese.", image: "assets/Cheese Sandwich.jpg", available: true },
    { id: 3, name: "Veg Burger", category: "Fast Food", price: 80, description: "Crispy vegetable patty with fresh lettuce.", image: "assets/Veg Burger.jpg", available: true },
    { id: 4, name: "French Fries", category: "Snacks", price: 70, description: "Golden crispy fries with delicious seasoning.", image: "assets/French Fries.jpg", available: true },
    { id: 5, name: "Masala Dosa", category: "South Indian", price: 90, description: "Crispy dosa with potato masala and chutney.", image: "assets/Masala Dosa.jpg", available: true },
    { id: 6, name: "Cold Coffee", category: "Drinks", price: 50, description: "Refreshing chilled coffee for your break.", image: "assets/Cold Coffee.jpg", available: true },
    { id: 7, name: "Veg Pizza", category: "Fast Food", price: 120, description: "Loaded with cheese and fresh vegetables.", image: "assets/Veg Pizza.jpg", available: true },
    { id: 8, name: "Gujarati Thali", category: "Meals", price: 110, description: "A delicious traditional Gujarati meal.", image: "assets/Gujarati Thali.jpg", available: true },
    { id: 9, name: "Chocolate Brownie", category: "Desserts", price: 65, description: "Rich chocolate brownie for your sweet cravings.", image: "assets/Chocolate Brownie.jpg", available: true },
    { id: 10, name: "Cheese Maggi", category: "Snacks", price: 50, description: "Hot Maggi noodles topped with delicious cheese.", image: "assets/Cheese Maggi.jpg", available: true },
    { id: 11, name: "Hakka Noodles", category: "Fast Food", price: 90, description: "Stir-fried noodles with vegetables and sauces.", image: "assets/Hakka Noodles.jpg", available: true },
    { id: 12, name: "Manchurian", category: "Fast Food", price: 100, description: "Spicy vegetable Manchurian tossed in flavorful sauce.", image: "assets/Manchurian.jpg", available: true },
    { id: 13, name: "Paneer Wrap", category: "Snacks", price: 80, description: "Paneer and vegetables wrapped in a soft tortilla.", image: "assets/Paneer Wrap.jpg", available: true },
    { id: 14, name: "Pav Bhaji", category: "Meals", price: 100, description: "Mumbai-style bhaji served with buttery pav.", image: "assets/Pav Bhaji.jpg", available: true }
];

const ORDER_STATUSES = [
    "Order Placed",
    "Accepted",
    "Preparing",
    "Ready for Pickup",
    "Completed"
];


<<<<<<< HEAD
// ======================================
// STATE
// ======================================

=======
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
let orders = [];
let menuItems = JSON.parse(localStorage.getItem(MENU_STORAGE_KEY)) || [...defaultMenu];
let selectedStatusFilter = "All";
let pendingDeleteId = null;

<<<<<<< HEAD
// Seed localStorage on first run so student & admin share the exact same list
=======
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
if (!localStorage.getItem(MENU_STORAGE_KEY)) {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menuItems));
}


<<<<<<< HEAD
// ======================================
// HELPERS
// ======================================

=======
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
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

function showToast(message) {
    document.querySelector(".toast")?.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2200);
}

function getStatusBadgeClass(status) {
    switch (status) {
        case "Accepted": return "accepted";
        case "Preparing": return "preparing";
        case "Ready for Pickup": return "ready";
        case "Completed": return "completed";
        default: return "placed";
    }
}


<<<<<<< HEAD
// ======================================
// CUSTOM DROPDOWN CONTROLLER
// ======================================

=======
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
function closeAllCustomDropdowns(exceptDropdown = null) {
    document.querySelectorAll(".custom-dropdown.open").forEach(dropdown => {
        if (dropdown !== exceptDropdown) {
            dropdown.classList.remove("open");
        }
    });
}

document.addEventListener("click", event => {
    const trigger = event.target.closest(".custom-dropdown-trigger");
    if (trigger) {
        event.stopPropagation();
        const dropdown = trigger.closest(".custom-dropdown");
        const isOpen = dropdown.classList.contains("open");
        closeAllCustomDropdowns(dropdown);
        dropdown.classList.toggle("open", !isOpen);
        return;
    }

    const item = event.target.closest(".custom-dropdown-item");
    if (item) {
        event.stopPropagation();
        const dropdown = item.closest(".custom-dropdown");
        const value = item.dataset.value;

<<<<<<< HEAD
        // Category dropdown inside Add/Edit modal
=======
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
        if (dropdown.id === "categoryCustomDropdown") {
            setCategoryDropdownValue(value);
        }

<<<<<<< HEAD
        // Order status dropdown inside Order Card
=======
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
        if (dropdown.dataset.orderId) {
            updateOrderStatus(dropdown.dataset.orderId, value);
        }

        closeAllCustomDropdowns();
        return;
    }

    closeAllCustomDropdowns();
});

function setCategoryDropdownValue(value) {
    document.getElementById("foodFormCategory").value = value;
    document.getElementById("categoryDropdownLabel").textContent = value;

    document.querySelectorAll("#categoryDropdownMenu .custom-dropdown-item").forEach(btn => {
        btn.classList.toggle("selected", btn.dataset.value === value);
    });
}


<<<<<<< HEAD
// ======================================
// LOAD ORDERS & MENU
// ======================================

=======
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
async function loadOrders() {
    if (!USE_BACKEND) {
        orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY)) || [];
        renderStats();
        renderOrders();
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/orders`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        orders = data.map(o => ({
            id: o.order_id || o.id,
            items: o.items || [],
            total: o.total || 0,
            status: o.status || "Order Placed",
            time: o.created_at || o.time || "Just now"
        }));
    } catch (err) {
        console.error(err);
        showToast("Backend offline — showing local orders");
        orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY)) || [];
    }

    renderStats();
    renderOrders();
}

async function loadMenu() {
    if (!USE_BACKEND) {
        menuItems = JSON.parse(localStorage.getItem(MENU_STORAGE_KEY)) || [...defaultMenu];
        renderAdminMenu();
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/menu`);
        if (!res.ok) throw new Error("Failed to fetch menu");
        menuItems = await res.json();
    } catch (err) {
        console.error(err);
        showToast("Backend offline — showing local menu");
    }

    renderAdminMenu();
}


<<<<<<< HEAD
// ======================================
// RENDER STATS
// ======================================

=======
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
function renderStats() {
    const active = orders.filter(o => o.status !== "Completed").length;
    const preparing = orders.filter(o => o.status === "Preparing").length;
    const ready = orders.filter(o => o.status === "Ready for Pickup").length;
    const revenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    document.getElementById("statActiveOrders").textContent = active;
    document.getElementById("statPreparingOrders").textContent = preparing;
    document.getElementById("statReadyOrders").textContent = ready;
    document.getElementById("statTotalRevenue").textContent = `₹${revenue}`;
}


<<<<<<< HEAD
// ======================================
// RENDER INCOMING ORDERS (WITH CUSTOM DROPDOWN)
// ======================================

=======
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
function renderOrders() {
    const grid = document.getElementById("adminOrdersGrid");

    const filtered = orders.filter(order => {
        const currentStatus = order.status || "Order Placed";
        return selectedStatusFilter === "All" || currentStatus === selectedStatusFilter;
    });

    if (!filtered.length) {
        grid.innerHTML = `
            <div class="no-results">
                <h3>No orders in this queue</h3>
                <p>Orders placed by students on the main site will appear here automatically.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(order => {
        const currentStatus = order.status || "Order Placed";
        const badgeClass = getStatusBadgeClass(currentStatus);

        return `
            <article class="admin-order-card">
                <div>
                    <div class="admin-order-header">
                        <span class="admin-order-id">#${order.id}</span>
                        <span class="status-badge ${badgeClass}">${currentStatus}</span>
                    </div>

                    <div class="admin-order-meta">
                        <i data-lucide="clock"></i>
                        <span>Placed at ${order.time || "Just now"}</span>
                    </div>

                    <div class="admin-order-items">
                        ${order.items.map(item => `
                            <div class="admin-order-item-row">
                                <span>${item.quantity} × ${item.name}</span>
                                <span>₹${item.price * item.quantity}</span>
                            </div>
                        `).join("")}
                    </div>
                </div>

                <div class="admin-order-footer">
                    <span class="admin-order-total">₹${order.total}</span>

                    <div class="custom-dropdown compact" data-order-id="${order.id}">
                        <button type="button" class="custom-dropdown-trigger" aria-label="Change order status">
                            <span>${currentStatus}</span>
                            <i data-lucide="chevron-down"></i>
                        </button>
                        <div class="custom-dropdown-menu">
                            ${ORDER_STATUSES.map(status => `
                                <button
                                    type="button"
                                    class="custom-dropdown-item ${status === currentStatus ? "selected" : ""}"
                                    data-value="${status}"
                                >
                                    ${status}
                                </button>
                            `).join("")}
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    refreshIcons();
}

async function updateOrderStatus(orderId, newStatus) {
    if (USE_BACKEND) {
        try {
            const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error("Failed to update status");
        } catch (err) {
            console.error(err);
            showToast("Failed to update status on server");
            return;
        }
    }

    orders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
    );
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    renderStats();
    renderOrders();
    showToast(`Order #${orderId} updated to "${newStatus}"`);
}


<<<<<<< HEAD
// ======================================
// RENDER MENU MANAGEMENT
// ======================================

=======
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
function saveMenuToLocal() {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menuItems));
}

function renderAdminMenu() {
    const grid = document.getElementById("adminMenuGrid");

    grid.innerHTML = menuItems.map(food => {
        const isAvailable = food.available !== false;

        return `
            <article class="admin-food-card ${!isAvailable ? "sold-out" : ""}">
                <div>
                    <div class="admin-food-img">
                        <img src="${food.image}" alt="${food.name}" onerror="imageFallback(this)">
                        <span class="admin-cat-badge">${food.category}</span>
                    </div>

                    <div class="admin-food-body">
                        <div class="admin-food-top">
                            <h3>${food.name}</h3>
                            <span class="admin-food-price">₹${food.price}</span>
                        </div>
                        <p class="admin-food-desc">${food.description}</p>
                    </div>
                </div>

                <div class="admin-food-body" style="padding-top: 0;">
                    <div class="admin-food-actions">
                        <button
                            class="avail-toggle-btn ${isAvailable ? "in-stock" : "out-stock"}"
                            onclick="toggleFoodAvailability(${food.id})"
                        >
                            ${isAvailable ? "Available" : "Sold Out"}
                        </button>

                        <div class="admin-icon-actions">
                            <button class="icon-action-btn" onclick="openEditFoodModal(${food.id})" title="Edit item">
                                <i data-lucide="pencil"></i>
                            </button>
                            <button class="icon-action-btn delete" onclick="openDeleteModal(${food.id})" title="Delete item">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    refreshIcons();
}

async function toggleFoodAvailability(foodId) {
    const food = menuItems.find(item => item.id === foodId);
    if (!food) return;

    const updatedAvail = food.available === false ? true : false;

    if (USE_BACKEND) {
        try {
            const res = await fetch(`${API_BASE_URL}/menu/${foodId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ available: updatedAvail })
            });
            if (!res.ok) throw new Error("Failed to update availability");
        } catch (err) {
            console.error(err);
            showToast("Server error updating item");
            return;
        }
    }

    food.available = updatedAvail;
    saveMenuToLocal();
    renderAdminMenu();
    showToast(`${food.name} marked as ${updatedAvail ? "Available" : "Sold Out"}`);
}


<<<<<<< HEAD
// ======================================
// CUSTOM DELETE CONFIRMATION POPUP
// ======================================

=======
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
const adminDeleteModalOverlay = document.getElementById("adminDeleteModalOverlay");

function openDeleteModal(foodId) {
    const food = menuItems.find(item => item.id === foodId);
    if (!food) return;

    pendingDeleteId = foodId;
    document.getElementById("deleteTargetName").textContent = food.name;

    adminDeleteModalOverlay.classList.add("show");
    adminDeleteModalOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    refreshIcons();
}

function closeDeleteModal() {
    adminDeleteModalOverlay.classList.remove("show");
    adminDeleteModalOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    pendingDeleteId = null;
}

document.getElementById("closeDeleteModal").addEventListener("click", closeDeleteModal);
document.getElementById("cancelDeleteBtn").addEventListener("click", closeDeleteModal);

adminDeleteModalOverlay.addEventListener("click", event => {
    if (event.target === adminDeleteModalOverlay) closeDeleteModal();
});

document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
    if (pendingDeleteId === null) return;

    const food = menuItems.find(item => item.id === pendingDeleteId);
    if (!food) {
        closeDeleteModal();
        return;
    }

    if (USE_BACKEND) {
        try {
            const res = await fetch(`${API_BASE_URL}/menu/${pendingDeleteId}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete item");
        } catch (err) {
            console.error(err);
            showToast("Server error deleting item");
            return;
        }
    }

    menuItems = menuItems.filter(item => item.id !== pendingDeleteId);
    saveMenuToLocal();
    renderAdminMenu();
    closeDeleteModal();
    showToast(`${food.name} deleted from menu`);
});


<<<<<<< HEAD
// ======================================
// CUSTOM ADD / EDIT FOOD POPUP
// ======================================

=======
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
const adminFoodModalOverlay = document.getElementById("adminFoodModalOverlay");
const adminFoodForm = document.getElementById("adminFoodForm");

function openAddFoodModal() {
    document.getElementById("adminFoodModalSubtitle").textContent = "NEW MENU ITEM";
    document.getElementById("adminFoodModalTitle").textContent = "Add Food Item";
    document.getElementById("saveAdminFoodBtn").textContent = "Add to Menu";
    document.getElementById("foodFormId").value = "";
    adminFoodForm.reset();
    setCategoryDropdownValue("Snacks");
    document.getElementById("foodFormImage").value = "assets/Veg Sandwich.jpg";

    adminFoodModalOverlay.classList.add("show");
    adminFoodModalOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    refreshIcons();
}

function openEditFoodModal(foodId) {
    const food = menuItems.find(item => item.id === foodId);
    if (!food) return;

    document.getElementById("adminFoodModalSubtitle").textContent = "UPDATE MENU ITEM";
    document.getElementById("adminFoodModalTitle").textContent = "Edit Food Item";
    document.getElementById("saveAdminFoodBtn").textContent = "Save Changes";
    document.getElementById("foodFormId").value = food.id;
    document.getElementById("foodFormName").value = food.name;
    setCategoryDropdownValue(food.category);
    document.getElementById("foodFormPrice").value = food.price;
    document.getElementById("foodFormImage").value = food.image;
    document.getElementById("foodFormDescription").value = food.description;

    adminFoodModalOverlay.classList.add("show");
    adminFoodModalOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    refreshIcons();
}

function closeAdminFoodModal() {
    adminFoodModalOverlay.classList.remove("show");
    adminFoodModalOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    closeAllCustomDropdowns();
}

document.getElementById("openAddFoodModalBtn").addEventListener("click", openAddFoodModal);
document.getElementById("closeAdminFoodModal").addEventListener("click", closeAdminFoodModal);
document.getElementById("cancelAdminFoodModal").addEventListener("click", closeAdminFoodModal);

adminFoodModalOverlay.addEventListener("click", event => {
    if (event.target === adminFoodModalOverlay) closeAdminFoodModal();
});

adminFoodForm.addEventListener("submit", async event => {
    event.preventDefault();

    const idVal = document.getElementById("foodFormId").value;
    const payload = {
        name: document.getElementById("foodFormName").value.trim(),
        category: document.getElementById("foodFormCategory").value,
        price: Number(document.getElementById("foodFormPrice").value),
        image: document.getElementById("foodFormImage").value.trim(),
        description: document.getElementById("foodFormDescription").value.trim(),
        available: true
    };

    if (idVal) {
        const numericId = Number(idVal);
        const existing = menuItems.find(item => item.id === numericId);
        payload.available = existing ? existing.available !== false : true;

        if (USE_BACKEND) {
            try {
                await fetch(`${API_BASE_URL}/menu/${numericId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            } catch (err) {
                console.error(err);
            }
        }
        menuItems = menuItems.map(item =>
            item.id === numericId ? { ...item, ...payload } : item
        );
        showToast(`${payload.name} updated`);
    } else {
        let newId = menuItems.length ? Math.max(...menuItems.map(m => m.id)) + 1 : 1;
        if (USE_BACKEND) {
            try {
                const res = await fetch(`${API_BASE_URL}/menu`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    const created = await res.json();
                    newId = created.id || newId;
                }
            } catch (err) {
                console.error(err);
            }
        }
        menuItems.push({ id: newId, ...payload });
        showToast(`${payload.name} added to menu`);
    }

    saveMenuToLocal();
    renderAdminMenu();
    closeAdminFoodModal();
});


<<<<<<< HEAD
// ======================================
// TABS, FILTERS & LIVE SYNC
// ======================================

=======
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
document.querySelectorAll(".admin-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".admin-tab-panel").forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});

document.querySelectorAll(".filter-pill").forEach(pill => {
    pill.addEventListener("click", () => {
        document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");

        selectedStatusFilter = pill.dataset.status;
        renderOrders();
    });
});

document.getElementById("refreshAdminBtn").addEventListener("click", () => {
    loadOrders();
    loadMenu();
    showToast("Dashboard refreshed");
});

window.addEventListener("storage", event => {
    if (event.key === ORDERS_STORAGE_KEY) {
        loadOrders();
    }
    if (event.key === MENU_STORAGE_KEY) {
        loadMenu();
    }
});

setInterval(() => {
    if (!USE_BACKEND) {
        const latest = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY)) || [];
        if (latest.length !== orders.length) {
            loadOrders();
        }
    }
}, 3000);

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeAdminFoodModal();
        closeDeleteModal();
        closeAllCustomDropdowns();
    }
});


<<<<<<< HEAD
// ======================================
// INITIALIZE
// ======================================

=======
>>>>>>> 36467e6 (Complete BiteRush Phase 1 frontend, live order status sync, and Admin dashboard)
loadOrders();
loadMenu();
refreshIcons();