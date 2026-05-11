// ===== SHOPPING CART FUNCTIONALITY =====
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Add to Cart
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    setupEventListeners();
    updateCartUI();
});

function setupEventListeners() {
    // Add to Cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });

    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }

    // Price range slider
    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
        priceRange.addEventListener('input', function() {
            document.getElementById('priceValue').textContent = this.value;
        });
    }

    // Sort dropdown
    const sortDropdown = document.getElementById('sort');
    if (sortDropdown) {
        sortDropdown.addEventListener('change', sortProducts);
    }

    // Shipping options
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    shippingOptions.forEach(option => {
        option.addEventListener('change', updateCheckoutSummary);
    });
}

function addToCart(e) {
    const button = e.target;
    const productId = button.getAttribute('data-id');
    const productName = button.getAttribute('data-name');
    const productPrice = parseFloat(button.getAttribute('data-price'));

    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showNotification(`${productName} added to cart!`);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
}

function updateCartUI() {
    // Update cart count in header
    const cartCount = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.forEach(count => {
        count.textContent = totalItems;
    });

    // Update cart page
    const emptyCart = document.getElementById('emptyCart');
    const cartItems = document.getElementById('cartItems');
    
    if (emptyCart && cartItems) {
        if (cart.length === 0) {
            emptyCart.style.display = 'block';
            cartItems.style.display = 'none';
        } else {
            emptyCart.style.display = 'none';
            cartItems.style.display = 'block';
            displayCartItems();
        }
    }

    updateCartTotals();
}

function displayCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="https://via.placeholder.com/100x100?text=${encodeURIComponent(item.name)}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="updateQuantityDirect('${item.id}', this.value)">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
                <div class="remove-item" onclick="removeFromCart('${item.id}')">Remove</div>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
    });
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function updateQuantityDirect(productId, value) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity = parseInt(value) || 1;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    showNotification('Item removed from cart');
}

function updateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Get shipping cost
    let shipping = 0;
    const shippingOption = document.querySelector('input[name="shipping"]:checked');
    if (shippingOption) {
        if (shippingOption.value === 'express') {
            shipping = 9.99;
        } else if (shippingOption.value === 'overnight') {
            shipping = 24.99;
        }
    }

    // Free shipping over $50
    if (subtotal >= 50) {
        shipping = 0;
    }

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;

    // Update cart page totals
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

    // Update checkout page totals
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryShipping = document.getElementById('summaryShipping');
    const summaryTax = document.getElementById('summaryTax');
    const summaryTotal = document.getElementById('summaryTotal');

    if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (summaryShipping) summaryShipping.textContent = `$${shipping.toFixed(2)}`;
    if (summaryTax) summaryTax.textContent = `$${tax.toFixed(2)}`;
    if (summaryTotal) summaryTotal.textContent = `$${total.toFixed(2)}`;
}

function updateCheckoutSummary() {
    updateCartTotals();
}

// ===== CHECKOUT FUNCTIONALITY =====
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    window.location.href = 'checkout.html';
}

function handleCheckout(e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(e.target);
    const checkoutData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip: formData.get('zip'),
        country: formData.get('country'),
        cardName: formData.get('cardName'),
        shipping: formData.get('shipping'),
        items: cart
    };

    // Save order (in real app, this would go to a server)
    localStorage.setItem('lastOrder', JSON.stringify(checkoutData));

    // Show success message
    showNotification('Order placed successfully!', 'success');

    // Clear cart
    cart = [];
    saveCart();

    // Redirect after 2 seconds
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

function applyPromo() {
    const promoCode = document.getElementById('promoCode').value;
    
    // Simple promo code validation
    const validCodes = {
        'SAVE10': 0.1,
        'SAVE20': 0.2,
        'WELCOME': 0.15
    };

    if (validCodes[promoCode]) {
        const discount = validCodes[promoCode];
        showNotification(`Promo code applied! ${(discount * 100).toFixed(0)}% discount`, 'success');
        // In a real app, apply the discount to the total
    } else {
        showNotification('Invalid promo code', 'error');
    }
}

// ===== SORTING FUNCTIONALITY =====
function sortProducts(e) {
    const sortValue = e.target.value;
    const productsGrid = document.querySelector('.products-grid');
    
    if (!productsGrid) return;

    const products = Array.from(productsGrid.querySelectorAll('.product-card'));

    products.sort((a, b) => {
        const priceA = parseFloat(a.querySelector('.price').textContent.replace('$', ''));
        const priceB = parseFloat(b.querySelector('.price').textContent.replace('$', ''));
        const ratingA = parseFloat(a.querySelector('.rating').textContent);
        const ratingB = parseFloat(b.querySelector('.rating').textContent);

        switch(sortValue) {
            case 'price-low':
                return priceA - priceB;
            case 'price-high':
                return priceB - priceA;
            case 'rating':
                return ratingB - ratingA;
            case 'newest':
                return 0; // Keep original order
            default:
                return 0;
        }
    });

    // Re-append sorted products
    products.forEach(product => {
        productsGrid.appendChild(product);
    });
}

// ===== NEWSLETTER SUBSCRIPTION =====
function handleNewsletter(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    if (email) {
        showNotification('Thank you for subscribing!', 'success');
        e.target.reset();
    }
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: ${type === 'success' ? '#27AE60' : type === 'error' ? '#E74C3C' : '#4ECDC4'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== POPULATE CHECKOUT PAGE =====
function displayCheckoutItems() {
    const cartSummary = document.getElementById('cartSummary');
    if (!cartSummary) return;

    cartSummary.innerHTML = '';

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'review-item';
        itemElement.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        cartSummary.appendChild(itemElement);
    });

    // Also populate order review
    const orderReview = document.getElementById('orderReview');
    if (orderReview) {
        orderReview.innerHTML = '';
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'review-item';
            itemElement.innerHTML = `
                <span>${item.name} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            `;
            orderReview.appendChild(itemElement);
        });
    }
}

// Display checkout items when page loads
window.addEventListener('load', function() {
    if (window.location.pathname.includes('checkout')) {
        displayCheckoutItems();
        updateCheckoutSummary();
    }
});

// ===== ANIMATIONS =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);
