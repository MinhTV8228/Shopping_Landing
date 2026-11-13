/**
 * Cart functionality for Nõn Sợi website
 * Handles add to cart, remove, quantity management
 */

// Cart data storage
let cartItems = [];
let cartCount = 0;

class CartManager {
  constructor() {
    this.eventsAlreadyBound = false;
    this.lastAddTime = 0; // For throttling
    this.init();
  }

  init() {
    // Load cart from localStorage
    this.loadCartFromStorage();
    
    // Update giỏ hàng UI
    this.updateCartUI();
    
    // Initialize badge on page load
    this.initializeBadge();
    
    // Setup add to cart buttons
    this.setupAddToCartButtons();
    
    // Setup cart icon click
    this.setupCartIconClick();
  }

  // Initialize badge when page loads
  initializeBadge() {
    // Wait for DOM to be ready
    $(document).ready(() => {
      this.updateCartBadge();
    });
  }

  // Load cart data from localStorage
  loadCartFromStorage() {
    const savedCart = localStorage.getItem('Nõn Sợi_cart');
    if (savedCart) {
      try {
        cartItems = JSON.parse(savedCart);
        cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
      } catch (e) {
        cartItems = [];
        cartCount = 0;
      }
    } else {
      cartItems = [];
      cartCount = 0;
    }
    window.cartItems = cartItems;
  }

  // Lưu cart data to localStorage
  saveCartToStorage() {
    localStorage.setItem('Nõn Sợi_cart', JSON.stringify(cartItems));
  }

  // Setup add to cart button events
  setupAddToCartButtons() {
    // Only bind once, not multiple times
    if (this.eventsAlreadyBound) {
      console.log('Events already bound, skipping...');
      return;
    }
    
    this.bindAddToCartEvents();
    this.eventsAlreadyBound = true;
    
    console.log('Cart manager initialized and events bound (once)');
  }

  bindAddToCartEvents() {
    // Remove ALL existing event handlers to prevent duplicates
    $(document).off('click.cart');
    
    // Use namespaced event to avoid conflicts
    $(document).on('click.cart', function(e) {
      const button = $(e.target).closest('button');
      
      // Check if this is an add to cart or order now button
      if (button.length && 
          (button.text().includes('Add to cart') || button.text().includes('Order Now'))) {
        
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation(); // Prevent other handlers
        
        console.log('Add to cart button clicked');
        
        const productCard = button.closest('.card');
        
        if (productCard.length) {
          console.log('Product card found, adding to cart...');
          
          // Add a flag to prevent multiple rapid clicks (shorter duration)
          if (button.hasClass('adding-to-cart')) {
            console.log('Already adding to cart, ignoring...');
            return;
          }
          
          button.addClass('adding-to-cart');
          
          cartManager.addToCart(productCard, button);
          
          // Remove flag after a shorter delay to allow quicker subsequent clicks
          setTimeout(() => {
            button.removeClass('adding-to-cart');
          }, 500); // Reduced from 1000ms to 500ms
        } else {
          console.error('Product card not found');
        }
      }
    });

    console.log('Cart events bound successfully with namespace');
  }

  // Extract product info from card element
  extractProductInfo(productCard) {
    const $card = $(productCard);

    const productId = $card.attr('data-product-id');
    const catalogProduct = (window.NONSOI_PRODUCTS || []).find(product => product.id === productId);
    if (catalogProduct) return { ...catalogProduct, quantity: 1 };
    
    console.log('Extracting product info from card:', $card);
    
    const name = $card.find('.card-title, h5.card-title, h6.card-title').first().text().trim();
    const priceText = $card.find('.price').first().text().trim();
    const price = window.parsePrice(priceText);
    const image = $card.find('img').attr('src') || '';
    const description = $card.find('.card-text:not(.fw-bold)').first().text().trim();
    
    const product = {
      id: this.generateProductId(name),
      name: name,
      price: price,
      image: image,
      description: description || 'Sản phẩm khăn cao cấp Nõn Sợi',
      quantity: 1
    };
    
    console.log('Extracted product:', product);
    
    return product;
  }

  // Generate unique product ID
  generateProductId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  // Add product to cart
  addToCart(productCard, button) {
    console.log('addToCart called with:', productCard, button);
    
    // Throttle to prevent rapid multiple adds
    const now = Date.now();
    if (this.lastAddTime && (now - this.lastAddTime) < 500) {
      console.log('Throttling add to cart - too fast');
      return;
    }
    this.lastAddTime = now;
    
    const product = this.extractProductInfo(productCard);
    
    if (!product.name) {
      console.error('Could not extract product information');
      alert('Could not extract product information.');
      return;
    }

    console.log('Adding product to cart:', product);

    // Check if product already exists in cart
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex > -1) {
      // Increase quantity by 1 only
      cartItems[existingItemIndex].quantity += 1;
      console.log('Increased quantity for existing item:', cartItems[existingItemIndex]);
    } else {
      // Add new item with quantity 1
      cartItems.push(product);
      console.log('Added new item to cart:', product);
    }

    // Update giỏ hàng count
    cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    console.log('New cart count:', cartCount);

    // Lưu to localStorage
    this.saveCartToStorage();

    // Update UI
    this.updateCartUI();

    // Show visual feedback
    this.showAddToCartFeedback(button);

    // Animate cart icon
    this.animateCartIcon();
    window.showSiteToast('Đã thêm sản phẩm vào giỏ hàng.');

    console.log('Cart items after adding:', cartItems);
  }

  // Update giỏ hàng UI elements
  updateCartUI() {
    // Update giỏ hàng count badge
    this.updateCartBadge();
    
    // Update giỏ hàng icon background
    this.updateCartIcon();
  }

  // Update giỏ hàng count badge
  updateCartBadge() {
    this.loadCartFromStorage();
    cartCount = cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
    // Find the cart badge element
    const cartBadge = $('.cart-badge');
    
    if (cartCount > 0) {
      // Update badge text and show it
      cartBadge.text(cartCount > 99 ? '99+' : cartCount);
      cartBadge.show().addClass('show');
      
      // Add animation effect
      cartBadge.addClass('updated');
      setTimeout(() => {
        cartBadge.removeClass('updated');
      }, 600);
      
      console.log('Cart badge updated:', cartCount);
    } else {
      // Hide badge when cart is empty
      cartBadge.hide().removeClass('show');
    }
  }

  // Update giỏ hàng icon background
  updateCartIcon() {
    let cartLink = $('a[title="Giỏ hàng"]');
    
    if (cartLink.length === 0) {
      // Fallback: find by cart icon class
      cartLink = $('.bi-cart').closest('a');
    }
    
    if (cartLink.length > 0) {
      // Remove any existing background classes
      cartLink.removeClass('cart-has-items');
      console.log('Cart icon updated - background removed');
    } else {
      console.warn('Cart icon not found for background update');
    }
  }

  // Show add to cart visual feedback
  showAddToCartFeedback(button) {
    const originalText = button.html();
    const originalClasses = button.attr('class');
    
    // Change text to "Added to cart" with success styling
    button.html('<i class="bi bi-check me-1"></i>Added to cart')
          .removeClass('btn-dark btn-outline-dark btn-primary btn-secondary')
          .addClass('btn-success')
          .prop('disabled', false); // Ensure button remains enabled
    
    // Đặt lại after 2 seconds
    setTimeout(() => {
      button.html(originalText)
            .attr('class', originalClasses)
            .prop('disabled', false) // Ensure button remains enabled
            .removeClass('adding-to-cart'); // Remove any processing flags
    }, 2000);
  }

  // Animate cart icon
  animateCartIcon() {
    const cartIcon = $('a[title="Giỏ hàng"]');
    cartIcon.addClass('cart-bounce');
    
    setTimeout(() => {
      cartIcon.removeClass('cart-bounce');
    }, 600);
  }

  // Setup cart icon click to go to cart page
  setupCartIconClick() {
    $(document).on('click', 'a[title="Giỏ hàng"]', (e) => {
      e.preventDefault();
      window.location.href = 'cart.html';
    });
  }

  // Add product directly to cart without DOM extraction
  addToCartDirect(productData) {
    console.log('Direct add to cart called with:', productData);
    
    // Check if item already exists in cart
    const existingItem = cartItems.find(item => item.id === productData.id);
    
    if (existingItem) {
      // Update quantity if item exists
      existingItem.quantity += productData.quantity || 1;
      console.log('Updated existing item quantity:', existingItem);
    } else {
      // Add new item to cart
      const newItem = {
        id: productData.id,
        name: productData.name,
        price: productData.price,
        image: productData.image,
        description: productData.description,
        quantity: productData.quantity || 1
      };
      
      cartItems.push(newItem);
      console.log('Added new item to cart:', newItem);
    }
    
    // Update giỏ hàng count
    cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    
    // Lưu to localStorage
    this.saveCartToStorage();
    
    // Update UI
    this.updateCartUI();
    
    // Animate cart icon
    this.animateCartIcon();
    window.showSiteToast('Đã thêm sản phẩm vào giỏ hàng.');
    
    console.log('Cart items after direct add:', cartItems);
  }

  // Remove item from cart
  removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.id !== productId);
    cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    window.cartItems = cartItems;
    
    this.saveCartToStorage();
    this.updateCartUI();
    window.showSiteToast('Đã xóa sản phẩm khỏi giỏ hàng.', 'info');
  }

  // Update item quantity
  updateQuantity(productId, newQuantity) {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
      if (newQuantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = newQuantity;
        cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        
        this.saveCartToStorage();
        this.updateCartUI();
      }
    }
  }

  // Get cart total
  getCartTotal() {
    return cartItems.reduce((total, item) => {
      const price = window.parsePrice(item.price);
      return total + (price * item.quantity);
    }, 0);
  }

  // Clear entire cart
  clearCart() {
    cartItems = [];
    cartCount = 0;
    window.cartItems = cartItems;
    
    this.saveCartToStorage();
    this.updateCartUI();
  }

  // Get cart items (for cart page)
  getCartItems() {
    return cartItems;
  }

  // Get cart count
  getCartCount() {
    return cartCount;
  }

  // Debug method to test cart functionality
  testAddToCart() {
    const testProduct = {
      id: 'test_product',
      name: 'Test Product',
      price: '$100',
      image: 'images/bath_towel/bathtowel_1.webp',
      description: 'Test product for debugging',
      quantity: 1
    };
    
    cartItems.push(testProduct);
    cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    this.saveCartToStorage();
    this.updateCartUI();
    
    console.log('Test product added:', testProduct);
    console.log('Current cart:', cartItems);
  }
}

// Initialize cart manager
const cartManager = new CartManager();

// Make cart manager globally available
window.cartManager = cartManager;

// Debug: Add to window for testing
window.cartManager = cartManager;
window.testCart = () => cartManager.testAddToCart();

// Export for global access
window.CartManager = cartManager;
window.cartItems = cartItems;

// Global functions for onclick events
window.addToCart = function(id, name, price, image, showAlert = true) {
  console.log('Global addToCart called:', {id, name, price, image, showAlert});
  
  const cleanPrice = window.parsePrice(price);
  
  console.log('Cleaned price:', cleanPrice);
  
  const product = {
    id: id,
    name: name,
    price: cleanPrice,
    image: image,
    quantity: 1
  };
  
  // Add to cart items
  const existingItemIndex = cartItems.findIndex(item => item.id === id);
  
  if (existingItemIndex > -1) {
    cartItems[existingItemIndex].quantity += 1;
  } else {
    cartItems.push(product);
  }

  cartCount = cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  window.cartItems = cartItems;
  
  cartManager.saveCartToStorage();
  
  // Update UI
  cartManager.updateCartBadge();
  cartManager.updateCartUI();
  
  // Show a short notification instead of blocking the page with an alert.
  window.showSiteToast(`Đã thêm ${name} vào giỏ hàng.`);
  if (showAlert) {
    // Show button feedback when the caller requests the standard add action.
    const clickedButton = (typeof event !== 'undefined' && event.target) ? event.target.closest('button') : null;
    if (clickedButton) {
      const originalText = clickedButton.innerHTML;
      clickedButton.innerHTML = '<i class="bi bi-check me-1"></i>Added to cart';
      clickedButton.classList.add('btn-success');
      clickedButton.classList.remove('btn-outline-dark');
      
      // Đặt lại after 2 seconds
      setTimeout(() => {
        clickedButton.innerHTML = originalText;
        clickedButton.classList.remove('btn-success');
        clickedButton.classList.add('btn-outline-dark');
      }, 2000);
    }
  } else {
    // Find the button that was clicked and update its text
    const clickedButton = (typeof event !== 'undefined' && event.target) ? event.target.closest('button') : null;
    if (clickedButton) {
      const originalText = clickedButton.innerHTML;
      clickedButton.innerHTML = '<i class="bi bi-check me-1"></i>Added to cart';
      clickedButton.classList.add('btn-success');
      clickedButton.classList.remove('btn-outline-dark');
      
      // Đặt lại after 2 seconds
      setTimeout(() => {
        clickedButton.innerHTML = originalText;
        clickedButton.classList.remove('btn-success');
        clickedButton.classList.add('btn-outline-dark');
      }, 2000);
    }
  }
  
  console.log('Cart updated:', cartItems);
};

// Debug logging
console.log('Cart system initialized');
console.log('Test cart with: window.testCart()');




