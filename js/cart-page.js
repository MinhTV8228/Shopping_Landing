/**
 * Cart Trang functionality
 * Handles cart display, quantity updates, item removal
 */

class CartTrang {
  constructor() {
    this.currentRemoveId = null;
    this.init();
  }

  init() {
    // Wait for cart manager to be ready
    setTimeout(() => {
      this.loadCartItems();
      this.setupEventHandlers();
      this.updateCartSummary();
    }, 500);
  }

  setupEventHandlers() {
    // Quantity change handlers
    $(document).on('click', '.quantity-btn', (e) => {
      this.handleQuantityChange(e);
    });

    $(document).on('change', '.quantity-input', (e) => {
      this.handleQuantityInput(e);
    });

    // Remove item handlers
    $(document).on('click', '.remove-btn', (e) => {
      this.showRemoveConfirmation(e);
    });

    $('#confirmRemove').on('click', () => {
      this.confirmRemoveItem();
    });

    // Promo code
    $('#applyPromo').on('click', () => {
      this.applyPromoCode();
    });

    // Checkout
    $('#checkoutBtn').on('click', () => {
      this.proceedToCheckout();
    });
  }

  loadCartItems() {
    // Get cart items from localStorage directly
    const savedCart = localStorage.getItem('Nõn Sợi_cart');
    let cartItems = [];
    
    if (savedCart) {
      try {
        cartItems = JSON.parse(savedCart);
      } catch (e) {
        console.error('Error parsing cart data:', e);
        cartItems = [];
      }
    }
    
    console.log('Cart items loaded:', cartItems);
    
    const cartItemsContainer = $('#cart-items');
    const emptyCartContainer = $('#empty-cart');

    if (cartItems.length === 0) {
      cartItemsContainer.hide();
      emptyCartContainer.show();
      console.log('Showing empty cart message');
      return;
    }

    emptyCartContainer.hide();
    cartItemsContainer.show();

    let itemsHTML = '';
    cartItems.forEach(item => {
      itemsHTML += this.generateCartItemHTML(item);
    });

    cartItemsContainer.html(itemsHTML);
    console.log('Cart items displayed');
  }

  generateCartItemHTML(item) {
    // Debug logging
    console.log('Processing item:', item);
    console.log('Raw price:', item.price, 'Type:', typeof item.price);
    
    // Ensure price is a number and format properly
    let price = 0;
    
    // Handle different price formats
    if (typeof item.price === 'string') {
      price = window.parsePrice(item.price);
    } else if (typeof item.price === 'number') {
      price = window.parsePrice(item.price);
    }
    
    console.log('Processed price:', price);
    
    const quantity = parseInt(item.quantity) || 1;
    const itemTotal = price * quantity;
    
    console.log('Quantity:', quantity, 'Item total:', itemTotal);
    
    return `
      <div class="cart-item d-flex align-items-start p-3 border-bottom" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image me-3" style="width: 80px; height: 80px; object-fit: cover;">
        
        <div class="cart-item-details flex-grow-1">
          <h5 class="cart-item-name mb-1">${item.name}</h5>
          <p class="cart-item-description text-muted mb-2">${item.description || 'High-quality athletic wear'}</p>
          <div class="cart-item-price fw-bold">${window.formatVND(price)}</div>
        </div>
        
        <div class="cart-item-actions d-flex flex-column align-items-end">
          <div class="quantity-controls d-flex align-items-center mb-2">
            <button class="btn btn-outline-secondary btn-sm quantity-btn" data-action="decrease" data-id="${item.id}" ${quantity <= 1 ? 'disabled' : ''}>
              <i class="bi bi-dash"></i>
            </button>
            <input type="number" class="form-control quantity-input mx-2" value="${quantity}" min="1" max="99" data-id="${item.id}" style="width: 60px; text-align: center;">
            <button class="btn btn-outline-secondary btn-sm quantity-btn" data-action="increase" data-id="${item.id}">
              <i class="bi bi-plus"></i>
            </button>
          </div>
          
          <div class="d-flex align-items-center">
            <span class="me-3 fw-bold">${window.formatVND(itemTotal)}</span>
            <button class="btn btn-outline-danger btn-sm remove-btn" data-id="${item.id}" title="Remove item">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  handleQuantityChange(e) {
    const button = $(e.target).closest('.quantity-btn');
    const action = button.data('action');
    const productId = button.data('id');
    const quantityInput = button.siblings('.quantity-input');
    const currentQuantity = parseInt(quantityInput.val());
    
    let newQuantity = currentQuantity;
    
    if (action === 'increase') {
      newQuantity = Math.min(currentQuantity + 1, 99);
    } else if (action === 'decrease') {
      newQuantity = Math.max(currentQuantity - 1, 1);
    }
    
    if (newQuantity !== currentQuantity) {
      quantityInput.val(newQuantity);
      this.updateItemQuantity(productId, newQuantity);
    }
  }

  handleQuantityInput(e) {
    const input = $(e.target);
    const productId = input.data('id');
    let newQuantity = parseInt(input.val()) || 1;
    
    // Validate quantity range
    newQuantity = Math.max(1, Math.min(99, newQuantity));
    input.val(newQuantity);
    
    this.updateItemQuantity(productId, newQuantity);
  }

  updateItemQuantity(productId, newQuantity) {
    // Get cart items from localStorage directly
    const savedCart = localStorage.getItem('Nõn Sợi_cart');
    let cartItems = [];
    
    if (savedCart) {
      try {
        cartItems = JSON.parse(savedCart);
      } catch (e) {
        console.error('Error parsing cart data:', e);
        return;
      }
    }
    
    // Find and update the item
    const itemIndex = cartItems.findIndex(item => item.id === productId);
    if (itemIndex !== -1) {
      cartItems[itemIndex].quantity = newQuantity;
      
      // Lưu back to localStorage
      localStorage.setItem('Nõn Sợi_cart', JSON.stringify(cartItems));
      
      // Update giỏ hàng badge if cartManager exists
      if (window.cartManager) {
        window.cartManager.updateCartBadge();
      }
    }
    
    // Update UI
    this.updateCartSummary();
    this.updateQuantityButtons(productId, newQuantity);
    this.updateItemTotal(productId, newQuantity);
    
    // Animate the change
    const cartItem = $(`.cart-item[data-id="${productId}"]`);
    cartItem.addClass('cart-item-updated');
    setTimeout(() => {
      cartItem.removeClass('cart-item-updated');
    }, 300);
  }

  updateQuantityButtons(productId, quantity) {
    const decreaseBtn = $(`.quantity-btn[data-action="decrease"][data-id="${productId}"]`);
    
    if (quantity <= 1) {
      decreaseBtn.prop('disabled', true);
    } else {
      decreaseBtn.prop('disabled', false);
    }
  }

  updateItemTotal(productId, newQuantity) {
    // Get cart items from localStorage to find the price
    const savedCart = localStorage.getItem('Nõn Sợi_cart');
    let cartItems = [];
    
    if (savedCart) {
      try {
        cartItems = JSON.parse(savedCart);
        const item = cartItems.find(item => item.id === productId);
        if (item) {
          // Handle different price formats
          let price = 0;
          if (typeof item.price === 'string') {
            price = window.parsePrice(item.price);
          } else if (typeof item.price === 'number') {
            price = window.parsePrice(item.price);
          }
          
          const itemTotal = price * newQuantity;
          
          // Update the item total display
          const cartItem = $(`.cart-item[data-id="${productId}"]`);
          cartItem.find('.me-3.fw-bold').text(window.formatVND(itemTotal));
        }
      } catch (e) {
        console.error('Error updating item total:', e);
      }
    }
  }

  showRemoveConfirmation(e) {
    const removeBtn = $(e.target).closest('.remove-btn');
    this.currentRemoveId = removeBtn.data('id');
    
    const modal = new bootstrap.Modal(document.getElementById('removeModal'));
    modal.show();
  }

  confirmRemoveItem() {
    if (this.currentRemoveId) {
      const cartItem = $(`.cart-item[data-id="${this.currentRemoveId}"]`);
      
      // Animate removal
      cartItem.addClass('cart-item-leave');
      
      setTimeout(() => {
        // Remove from localStorage
        const savedCart = localStorage.getItem('Nõn Sợi_cart');
        let cartItems = [];
        
        if (savedCart) {
          try {
            cartItems = JSON.parse(savedCart);
            cartItems = cartItems.filter(item => item.id !== this.currentRemoveId);
            localStorage.setItem('Nõn Sợi_cart', JSON.stringify(cartItems));
          } catch (e) {
            console.error('Error removing item:', e);
          }
        }
        
        // Update giỏ hàng badge if cartManager exists
        if (window.cartManager) {
          window.cartManager.updateCartBadge();
        }
        
        // Remove from DOM
        cartItem.remove();
        
        // Update UI
        this.updateCartSummary();
        
        // Check if cart is empty
        if (cartItems.length === 0) {
          $('#cart-items').hide();
          $('#empty-cart').show();
        }
        
        this.currentRemoveId = null;
      }, 300);
      
      // Hide modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('removeModal'));
      modal.hide();
    }
  }

  calculateItemTotal(item) {
    const price = window.parsePrice(item.price);
    return price * item.quantity;
  }

  updateCartSummary() {
    // Get cart items from localStorage directly
    const savedCart = localStorage.getItem('Nõn Sợi_cart');
    let cartItems = [];
    
    if (savedCart) {
      try {
        cartItems = JSON.parse(savedCart);
      } catch (e) {
        console.error('Error parsing cart data:', e);
        cartItems = [];
      }
    }
    
    // Calculate subtotal
    let subtotal = 0;
    cartItems.forEach(item => {
      // Handle different price formats
      let price = 0;
      if (typeof item.price === 'string') {
        price = window.parsePrice(item.price);
      } else if (typeof item.price === 'number') {
        price = window.parsePrice(item.price);
      }
      
      const quantity = parseInt(item.quantity) || 0;
      subtotal += price * quantity;
    });
    
    const shipping = 0; // Free shipping
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    $('#subtotal').text(window.formatVND(subtotal));
    $('#tax').text(window.formatVND(tax));
    $('#total').text(window.formatVND(total));
    
    // Update checkout button
    if (cartItems.length === 0) {
      $('#checkoutBtn').prop('disabled', true).text('Cart is empty');
    } else {
      $('#checkoutBtn').prop('disabled', false).html('<i class="bi bi-credit-card me-2"></i>Checkout');
    }
  }

  applyPromoCode() {
    const promoCode = $('#promoCode').val().trim().toUpperCase();
    const promoBtn = $('#applyPromo');
    
    if (!promoCode) {
      this.showPromoMessage('Please enter a promo code', 'error');
      return;
    }
    
    // Simulate promo code validation
    promoBtn.prop('disabled', true).text('Checking...');
    
    setTimeout(() => {
      const validCodes = {
        'SAVE10': { discount: 0.1, description: '10% off' },
        'WELCOME': { discount: 0.05, description: '5% off' },
        'FREESHIP': { discount: 0, description: 'Free shipping', freeShipping: true }
      };
      
      if (validCodes[promoCode]) {
        this.showPromoMessage(`Applied successfully: ${validCodes[promoCode].description}`, 'success');
        // Apply discount logic here
      } else {
        this.showPromoMessage('Invalid promo code', 'error');
      }
      
      promoBtn.prop('disabled', false).text('Apply');
    }, 1000);
  }

  showPromoMessage(message, type) {
    // Remove existing message
    $('.promo-message').remove();
    
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const promoMessage = $(`
      <div class="alert ${alertClass} promo-message mt-2 mb-0" role="alert">
        <small>${message}</small>
      </div>
    `);
    
    $('.promo-code').after(promoMessage);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      promoMessage.fadeOut(() => promoMessage.remove());
    }, 3000);
  }

  proceedToCheckout() {
    // Get cart items from localStorage
    const savedCart = localStorage.getItem('Nõn Sợi_cart');
    let cartItems = [];
    
    if (savedCart) {
      try {
        cartItems = JSON.parse(savedCart);
      } catch (e) {
        console.error('Error parsing cart data:', e);
        cartItems = [];
      }
    }
    
    if (cartItems.length === 0) {
      return;
    }
    
    // Show checkout modal/confirmation
    const checkoutBtn = $('#checkoutBtn');
    const originalText = checkoutBtn.html();
    
    checkoutBtn.prop('disabled', true).html('<div class="spinner-border spinner-border-sm me-2"></div>Processing...');
    
    // Simulate checkout process
    setTimeout(() => {
      // Calculate total
      let total = 0;
      cartItems.forEach(item => {
        // Handle different price formats
        let price = 0;
        if (typeof item.price === 'string') {
        price = window.parsePrice(item.price);
        } else if (typeof item.price === 'number') {
        price = window.parsePrice(item.price);
        }
        
        const quantity = parseInt(item.quantity) || 0;
        total += price * quantity;
      });
      
      // Add tax
      total = total + (total * 0.08);
      
      // Show success message
      const confirmCheckout = confirm(
        `Complete your order?\n\nTotal: $${total.toFixed(2)}\n\nClick OK to confirm payment and clear your cart.`
      );
      
      if (confirmCheckout) {
        // Clear the cart after successful checkout
        localStorage.removeItem('Nõn Sợi_cart');
        
        // Update giỏ hàng badge if cartManager exists
        if (window.cartManager) {
          window.cartManager.updateCartBadge();
        }
        
        // Show success message
        alert('🎉 Payment successful!\n\nCảm ơn bạn for your purchase!\nYour order has been processed and your cart has been cleared.');
        
        // Reload the page to show empty cart
        window.location.reload();
      } else {
        // Restore button if cancelled
        checkoutBtn.prop('disabled', false).html(originalText);
      }
    }, 1500);
  }
}

// Initialize cart page when DOM is ready
$(document).ready(() => {
  const cartTrang = new CartTrang();
  window.CartTrang = cartTrang;
});




