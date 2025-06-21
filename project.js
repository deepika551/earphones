const slider = {
    currentIndex: 0,
    images: null,
    interval: 5000,
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffcc5c'],
    timer: null,
    
    init: function() {
        // Get all hero images
        this.images = document.querySelectorAll('.hero-image');
        
        // Log image paths
        console.log('Found images:', Array.from(this.images).map(img => img.src));
        
        // Add initial active class to first image
        if (this.images.length > 0) {
            this.images[0].classList.add('active');
            console.log('Slider initialized with', this.images.length, 'images');
            
            // Start the slider
            this.start();
            
            // Add loading event listener
            this.images.forEach((img, index) => {
                console.log('Setting up load event for image:', img.src);
                img.addEventListener('load', () => {
                    console.log('Image loaded successfully:', img.src);
                });
                
                // Add error handling
                img.addEventListener('error', (event) => {
                    console.error('Image failed to load:', img.src);
                    console.error('Error:', event);
                    img.src = 'placeholder.jpg';
                });
            });
        } else {
            console.error('No hero images found!');
        }
    },
    
    start: function() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        console.log('Starting slider with interval:', this.interval);
        this.timer = setInterval(() => {
            console.log('Switching to next image');
            this.next();
        }, this.interval);
    },
    
    pause: function() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    },
    
    showImage: function(index) {
        console.log('Showing image at index:', index);
        // Remove active class from all images
        this.images.forEach(img => {
            img.classList.remove('active');
        });
        
        // Add active class to current image
        if (this.images[index]) {
            console.log('Activating image:', this.images[index].src);
            this.images[index].classList.add('active');
        }
        
        this.currentIndex = index;
    },
    
    next: function() {
        console.log('Moving to next image');
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.showImage(nextIndex);
    },
    
    prev: function() {
        console.log('Moving to previous image');
        const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.showImage(prevIndex);
    }
};

// Initialize favorites
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Function to check if a product is in favorites
function isFavorite(productId) {
    return favorites.some(fav => fav.id === productId);
}

// Function to toggle favorite status
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded, initializing slider');
    slider.init();
    
    // Add smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add click event to favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const productId = btn.closest('.product-card').dataset.productId;
        
        // Set initial state
        btn.classList.toggle('active', isFavorite(productId));
        
        btn.addEventListener('click', () => {
            const productCard = btn.closest('.product-card');
            const productId = productCard.dataset.productId;
            const productName = productCard.querySelector('.product-name').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            const productImage = productCard.querySelector('.product-image').src;

            if (isFavorite(productId)) {
                // Remove from favorites
                favorites = favorites.filter(fav => fav.id !== productId);
                btn.classList.remove('active');
            } else {
                // Add to favorites
                favorites.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage
                });
                btn.classList.add('active');
            }

            // Update localStorage
            localStorage.setItem('favorites', JSON.stringify(favorites));

            // Show notification
            const indicator = document.querySelector('.favorites-indicator');
            indicator.style.display = 'flex';
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 2000);

            // Update favorites section with animation
            updateFavoritesSection();
        });
    });

    // Update favorites section on page load
    updateFavoritesSection();
});

// Function to update favorites section with animation
function updateFavoritesSection() {
    const favoritesGrid = document.querySelector('.favorites-grid');
    const noFavorites = document.querySelector('.no-favorites');
    
    if (favorites.length === 0) {
        noFavorites.style.display = 'block';
        favoritesGrid.innerHTML = '';
        return;
    }

    noFavorites.style.display = 'none';
    favoritesGrid.innerHTML = '';

    // Add products one by one with animation
    favorites.forEach((fav, index) => {
        setTimeout(() => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-header">
                    <button class="product-btn favorite-btn active">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <img src="${fav.image}" alt="${fav.name}" class="product-image">
                <div class="product-content">
                    <h3 class="product-name">${fav.name}</h3>
                    <div class="product-details">
                        <div class="product-price">${fav.price}</div>
                        <button class="product-btn add-to-cart">Add to Cart</button>
                    </div>
                </div>
            `;
            
            // Add animation class
            productCard.style.opacity = '0';
            productCard.style.transform = 'translateY(20px)';
            
            favoritesGrid.appendChild(productCard);
            
            // Animate the product card
            setTimeout(() => {
                productCard.style.opacity = '1';
                productCard.style.transform = 'translateY(0)';
                productCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            }, 50);

            // Add click event to favorite button
            productCard.querySelector('.favorite-btn').addEventListener('click', () => {
                const productId = productCard.dataset.productId;
                favorites = favorites.filter(fav => fav.id !== productId);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateFavoritesSection();
            });
        }, index * 300); // 300ms delay between each product
    });
}

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || {};
const cartModal = document.getElementById('cartModal');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartBadge = document.querySelector('.cart-badge');

// Update cart badge
function updateCartBadge() {
    const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
}

// Update cart total
function updateCartTotal() {
    let total = 0;
    for (const [id, item] of Object.entries(cart)) {
        total += item.price * item.quantity;
    }
    cartTotal.textContent = `₹${total.toFixed(2)}`;
}

// Add to cart with animation
function addToCart(productId, productName, productPrice, productImage, productCard) {
    // Create a clone of the product image for animation
    const productImg = productCard.querySelector('img').cloneNode();
    productImg.style.position = 'fixed';
    productImg.style.zIndex = '1000';
    productImg.style.width = '50px';
    productImg.style.height = '50px';
    productImg.style.objectFit = 'contain';
    productImg.style.opacity = '0.8';
    
    // Get initial position of the product
    const rect = productCard.getBoundingClientRect();
    productImg.style.left = `${rect.left + window.scrollX}px`;
    productImg.style.top = `${rect.top + window.scrollY}px`;
    
    // Add to DOM
    document.body.appendChild(productImg);
    
    // Get cart icon position
    const cartIcon = document.querySelector('.cart-icon');
    const cartRect = cartIcon.getBoundingClientRect();
    
    // Animate the product to the cart
    productImg.animate([
        { transform: 'translate(0, 0)' },
        { 
            transform: `translate(${cartRect.left - rect.left}px, ${cartRect.top - rect.top}px)`,
            width: '20px',
            height: '20px',
            opacity: '0'
        }
    ], {
        duration: 1000,
        easing: 'ease-out'
    }).finished.then(() => {
        // Remove the animated image
        productImg.remove();
        
        // Add to actual cart
        if (!cart[productId]) {
            cart[productId] = {
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            };
        } else {
            cart[productId].quantity++;
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        updateCartTotal();
    });
}

// Remove from cart
function removeFromCart(productId) {
    if (cart[productId]) {
        if (cart[productId].quantity > 1) {
            cart[productId].quantity--;
        } else {
            delete cart[productId];
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        updateCartTotal();
        renderCart();
    }
}

// Render cart items
function renderCart() {
    cartItems.innerHTML = '';
    let total = 0;
    
    for (const [id, item] of Object.entries(cart)) {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>₹${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="removeFromCart('${id}')">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="handleQuantityChange('${id}', this.value)">
                <button class="quantity-btn" onclick="addToCart('${id}', '${item.name}', ${item.price}, '${item.image}')">+</button>
            </div>
            <div class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
        `;
        cartItems.appendChild(cartItem);
        total += item.price * item.quantity;
    }
    
    cartTotal.textContent = `₹${total.toFixed(2)}`;
}

// Handle quantity change
function handleQuantityChange(productId, value) {
    if (value < 1) return;
    cart[productId].quantity = parseInt(value);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    updateCartTotal();
    renderCart();
}

// Toggle cart modal
function toggleCart() {
    cartModal.classList.toggle('show');
    renderCart();
}

// Close cart modal when clicking outside
window.onclick = function(event) {
    if (event.target === cartModal) {
        cartModal.classList.remove('show');
    }
}

// Initialize cart
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    updateCartTotal();
    
    // Add click event to add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        const productCard = btn.closest('.product-card');
        const productId = productCard.dataset.productId;
        const productName = productCard.querySelector('.product-name').textContent;
        const productPrice = productCard.querySelector('.product-price').textContent;
        const productImage = productCard.querySelector('.product-image').src;
        
        btn.addEventListener('click', () => {
            addToCart(productId, productName, productPrice, productImage, productCard);
        });
    });
});

// Mobile Menu Functionality
const hamburgerMenu = document.querySelector('.hamburger-menu');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');

hamburgerMenu.addEventListener('click', () => {
    hamburgerMenu.classList.toggle('active');
    mobileMenuOverlay.classList.toggle('active');
});

// Close mobile menu when clicking outside
mobileMenuOverlay.addEventListener('click', (e) => {
    if (e.target === mobileMenuOverlay) {
        hamburgerMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
    }
});

// Close mobile menu when clicking a menu item
mobileMenuOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburgerMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
    });
});

// Dropdown menu click and delay functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior
            
            // Get the target section ID from href
            const targetId = this.getAttribute('href');
            
            // Add class to show clicked state
            this.classList.add('clicked');
            
            // Wait for 2 seconds
            setTimeout(() => {
                // Remove clicked class
                this.classList.remove('clicked');
                
                // Scroll to target section
                if (targetId) {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }, 2000);
        });
    });
});