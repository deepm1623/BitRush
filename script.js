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
        price: 90,
        description: "Spicy vegetable Manchurian tossed in flavorful sauce.",
        image: "assets/Manchurian.jpg"
    },
    {
        id: 13,
        name: "Paneer Wrap",
        category: "Fast Food",
        price: 90,
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

let cart = [];
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

function createFoodModal() {
    if (document.getElementById("foodModalOverlay")) return;

    const modal = document.createElement("div");

    modal.id = "foodModalOverlay";
    modal.className = "food-modal-overlay";

    modal.innerHTML = `
        <div class="food-modal glass">

            <button class="food-modal-close" id="foodModalClose">
                <i data-lucide="x"></i>
            </button>

            <div class="food-modal-image-wrap">
                <img id="modalFoodImage" src="" alt="">

                <span class="food-badge modal-veg-badge">
                    <span class="veg-dot"></span>
                    Vegetarian
                </span>
            </div>

            <div class="food-modal-content">

                <span class="food-modal-category" id="modalFoodCategory"></span>

                <h2 id="modalFoodName"></h2>

                <p id="modalFoodDescription"></p>

                <div class="food-modal-bottom">

                    <span class="food-modal-price" id="modalFoodPrice"></span>

                    <div class="modal-quantity-controls">
                        <button id="modalQuantityMinus" aria-label="Decrease quantity">−</button>
                        <span id="modalQuantity">1</span>
                        <button id="modalQuantityPlus" aria-label="Increase quantity">+</button>
                    </div>

                </div>

                <button class="primary-button modal-add-button" id="modalAddToCart">
                    <i data-lucide="shopping-cart"></i>
                    Add to Cart
                </button>

            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("foodModalClose").addEventListener("click", closeFoodModal);

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
}


// ======================================
// OPEN FOOD MODAL
// ======================================

function openFoodModal(foodId) {
    const food = foods.find(item => item.id === foodId);

    if (!food) return;

    createFoodModal();

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

    document.getElementById("foodModalOverlay").classList.add("show");
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
// OPEN CART
// ======================================

document.getElementById("cartButton").addEventListener("click", () => {
    cartOverlay.classList.add("show");
    renderCart();
});


// ======================================
// CLOSE CART
// ======================================

document.getElementById("closeCart").addEventListener("click", () => {
    cartOverlay.classList.remove("show");
});


// CLOSE CART OUTSIDE
cartOverlay.addEventListener("click", event => {
    if (event.target === cartOverlay) {
        cartOverlay.classList.remove("show");
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

    alert(
        "Order placed successfully!\n\n" +
        "Order ID: " + orderId + "\n" +
        "Total: ₹" + total + "\n\n" +
        "Please collect your order at the canteen.\n\n" +
        "Demo version — backend integration will be added later."
    );

    cart = [];

    updateCart();

    cartOverlay.classList.remove("show");
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
        cartOverlay.classList.remove("show");
    }
});


// ======================================
// INITIALIZE
// ======================================

renderFoods();
renderPopular();
updateCart();
refreshIcons();