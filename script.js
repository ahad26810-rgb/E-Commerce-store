// ==========================================
// SHOPPING CART FUNCTIONALITY
// ==========================================

// Initialize cart from localStorage
function initializeCart() {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    updateCartCount();
}

// Add to cart
function addToCart(productName, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show success message
    showNotification(productName + ' added to cart!');
}

// Remove from cart
function removeFromCart(productName) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.name !== productName);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

// Update quantity
function updateQuantity(productName, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.name === productName);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productName);
        } else {
            item.quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCart();
        }
    }
}

// Update cart count badge
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(el => el.textContent = totalItems);
}

// Calculate totals
function calculateTotals() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let subtotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    const shipping = subtotal > 50 ? 0 : 5;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;
    
    return { subtotal, shipping, tax, total };
}

// Display cart items
function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsList = document.getElementById('cart-items-list');
    const emptyCart = document.getElementById('empty-cart');
    
    if (!cartItemsList) return;
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = '';
        if (emptyCart) emptyCart.style.display = 'block';
        updateSummary();
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    
    let html = '';
    cart.forEach(item => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        html += `
            <tr>
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <input type="number" value="${item.quantity}" min="1" 
                        onchange="updateQuantity('${item.name}', this.value)" 
                        style="width: 50px; padding: 5px;">
                </td>
                <td>$${itemTotal}</td>
                <td>
                    <button onclick="removeFromCart('${item.name}')" class="btn-remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    cartItemsList.innerHTML = html;
    updateSummary();
    
    // Add CSS for remove button
    if (!document.getElementById('btn-remove-style')) {
        const style = document.createElement('style');
        style.id = 'btn-remove-style';
        style.innerHTML = `
            .btn-remove {
                background: #ff6b6b;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s;
            }
            .btn-remove:hover {
                background: #ff5252;
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(style);
    }
}

// Update cart summary
function updateSummary() {
    const { subtotal, shipping, tax, total } = calculateTotals();
    
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (shippingEl) shippingEl.textContent = '$' + shipping.toFixed(2);
    if (taxEl) taxEl.textContent = '$' + tax.toFixed(2);
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
}

// Apply promo code
function applyPromo() {
    const promoInput = document.getElementById('promo-input');
    const promoMessage = document.getElementById('promo-message');
    
    if (!promoInput) return;
    
    const code = promoInput.value.toUpperCase().trim();
    const validCodes = {
        'SAVE10': 0.10,
        'SAVE20': 0.20,
        'WELCOME20': 0.20,
        'WELCOME10': 0.10
    };
    
    if (validCodes[code]) {
        const discount = validCodes[code];
        const { subtotal, shipping, tax } = calculateTotals();
        const discountAmount = subtotal * discount;
        const total = (subtotal - discountAmount + shipping + tax).toFixed(2);
        
        promoMessage.style.color = '#2ecc71';
        promoMessage.textContent = `✓ Promo applied! You saved $${discountAmount.toFixed(2)}`;
        
        const totalEl = document.getElementById('total');
        if (totalEl) totalEl.textContent = '$' + total;
    } else {
        promoMessage.style.color = '#ff6b6b';
        promoMessage.textContent = '✗ Invalid promo code';
    }
    
    promoInput.value = '';
}

// Display checkout
function displayCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutList = document.getElementById('checkout-items-list');
    
    if (!checkoutList) return;
    
    let html = '';
    cart.forEach(item => {
        html += `
            <div class="order-item-line">
                <span>${item.name} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
    });
    
    checkoutList.innerHTML = html;
    updateCheckoutSummary();
}

// Update checkout summary
function updateCheckoutSummary() {
    const { subtotal, shipping, tax, total } = calculateTotals();
    
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutShipping = document.getElementById('checkout-shipping');
    const checkoutTax = document.getElementById('checkout-tax');
    const checkoutTotal = document.getElementById('checkout-total');
    
    if (checkoutSubtotal) checkoutSubtotal.textContent = '$' + subtotal.toFixed(2);
    if (checkoutShipping) checkoutShipping.textContent = '$' + shipping.toFixed(2);
    if (checkoutTax) checkoutTax.textContent = '$' + tax.toFixed(2);
    if (checkoutTotal) checkoutTotal.textContent = '$' + total.toFixed(2);
}

// Update checkout total based on shipping selection
function updateCheckoutTotal() {
    updateCheckoutSummary();
}

// Checkout function
function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    window.location.href = 'checkout.html';
}

// Complete order
function completeOrder() {
    const firstName = document.getElementById('firstName').value;
    const email = document.getElementById('email').value;
    const cardNumber = document.getElementById('cardNumber').value;
    
    if (!firstName || !email || !cardNumber) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Validate card number (simple check)
    if (cardNumber.replace(/\s/g, '').length < 13) {
        alert('Please enter a valid card number');
        return;
    }
    
    // Clear cart and show success
    localStorage.setItem('cart', JSON.stringify([]));
    updateCartCount();
    
    alert('✓ Order placed successfully!\n\nThank you for your purchase, ' + firstName + '!\n\nA confirmation email will be sent to ' + email);
    
    window.location.href = 'index.html';
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==========================================
// MENU TOGGLE (Mobile)
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
    }
    
    // Initialize cart on page load
    initializeCart();
});

// ==========================================
// PRICE SLIDER
// ==========================================

const priceSlider = document.querySelector('.price-slider');
if (priceSlider) {
    priceSlider.addEventListener('input', function() {
        const priceRange = document.querySelector('.price-range');
        if (priceRange) {
            priceRange.textContent = '$0 - $' + this.value;
        }
    });
}

// ==========================================
// NEWSLETTER FORM
// ==========================================

const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        alert('Thank you for subscribing! Check your email at ' + email);
        this.reset();
    });
}

// ==========================================
// SMOOTH SCROLL
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// ==========================================
// LAZY LOADING IMAGES
// ==========================================

if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '1';
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s';
        imageObserver.observe(img);
    });
}
