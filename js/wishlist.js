/**
 * Wishlist functionality for Nõn Sợi website
 * Handles add to wishlist, remove, display management
 */

// Wishlist data storage
let wishlistItems = [];
let wishlistCount = 0;

class WishlistManager {
  constructor() {
    this.lastAddTime = 0; // For throttling
    this.init();
  }

  init() {
    // Load wishlist from localStorage
    this.loadWishlistFromStorage();
    
    // Update wishlist UI
    this.updateWishlistUI();
    
    // Initialize badge on page load
    this.initializeBadge();
    
    // Setup wishlist button events
    this.setupWishlistButtons();
    
    // Setup wishlist icon click
    this.setupWishlistIconClick();
  }

  // Initialize badge when page loads
  initializeBadge() {
    // Wait for DOM to be ready
    $(document).ready(() => {
      this.updateWishlistBadge();
    });
  }

  // Load wishlist data from localStorage
  loadWishlistFromStorage() {
    const savedWishlist = localStorage.getItem('Nõn Sợi_wishlist');
    if (savedWishlist) {
      try {
        wishlistItems = JSON.parse(savedWishlist);
        wishlistCount = wishlistItems.length;
      } catch (e) {
        wishlistItems = [];
        wishlistCount = 0;
      }
    }
  }

  // Lưu wishlist data to localStorage
  saveWishlistToStorage() {
    localStorage.setItem('Nõn Sợi_wishlist', JSON.stringify(wishlistItems));
  }

  // Setup wishlist button events
  setupWishlistButtons() {
    // Remove existing event handlers
    $(document).off('click.wishlist');
    
    // Only handle buttons that DON'T have onclick attributes (avoid conflicts)
    $(document).on('click.wishlist', '.wishlist-btn:not([onclick]):not(#detail-add-wishlist)', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log('Wishlist button clicked (no onclick)');
      
      const button = $(e.currentTarget);
      const productCard = button.closest('.card');
      
      if (productCard.length) {
        console.log('Product card found, processing wishlist...');
        
        // Throttle to prevent rapid multiple adds
        const now = Date.now();
        if (this.lastAddTime && (now - this.lastAddTime) < 500) {
          console.log('Throttling wishlist action - too fast');
          return;
        }
        this.lastAddTime = now;
        
        // Check if item is already in wishlist
        const product = this.extractProductInfo(productCard);
        const isInWishlist = this.isInWishlist(product.id);
        
        if (isInWishlist) {
          this.removeFromWishlist(product.id, button);
          console.log('Removed from wishlist:', product.name);
        } else {
          window.addToWishlist(product.id, product.name, product.price, product.image, product.description);
        }
      } else {
        console.error('Product card not found');
      }
    });

    console.log('Wishlist events bound successfully');
  }

  // Extract product info from card element
  extractProductInfo(productCard) {
    const $card = $(productCard);
    const productId = $card.attr('data-product-id');
    const catalogProduct = (window.NONSOI_PRODUCTS || []).find(product => product.id === productId);
    if (catalogProduct) return catalogProduct;
    
    console.log('Extracting product info from card:', $card);
    
    const name = $card.find('.card-title, h5.card-title, h6.card-title').first().text().trim();
    const priceText = $card.find('.price').first().text().trim();
    const price = window.parsePrice(priceText);
    const image = $card.find('img').attr('src') || '';
    const description = $card.find('.product-description, .card-text:not(.fw-bold)').first().text().trim();
    
    const product = {
      id: this.generateProductId(name),
      name: name,
      price: price,
      image: image,
      description: description || 'Sản phẩm khăn cao cấp Nõn Sợi',
      addedAt: new Date().toISOString()
    };
    
    console.log('Extracted product:', product);
    
    return product;
  }

  // Generate unique product ID
  generateProductId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  // Check if product is in wishlist
  isInWishlist(productId) {
    return wishlistItems.some(item => item.id === productId);
  }

  // Remove product from wishlist
  removeFromWishlist(productId, button = null) {
    console.log('Removing from wishlist:', productId);
    
    wishlistItems = wishlistItems.filter(item => item.id !== productId);
    wishlistCount = wishlistItems.length;
    
    // Lưu to localStorage
    this.saveWishlistToStorage();

    // Update UI
    this.updateWishlistUI();

    // Update button state if button provided
    if (button) {
      this.updateWishlistButtonState(button, false);
      this.showRemoveFromWishlistFeedback(button);
    }

    // Optional: Show toast notification
    this.showToast('Removed from wishlist', 'info');

    console.log('Wishlist items after removing:', wishlistItems);
  }

  // Update wishlist UI elements
  updateWishlistUI() {
    // Update wishlist count badge
    this.updateWishlistBadge();
    
    // Update wishlist icon background
    this.updateWishlistIcon();
    
    // Update all wishlist button states
    this.updateAllWishlistButtonStates();
  }

  // Update wishlist count badge
  updateWishlistBadge() {
    // Find the wishlist badge element
    const wishlistBadge = $('.wishlist-badge');
    
    if (wishlistCount > 0) {
      // Update badge text and show it
      wishlistBadge.text(wishlistCount > 99 ? '99+' : wishlistCount);
      wishlistBadge.show().addClass('show');
      
      // Add animation effect
      wishlistBadge.addClass('updated');
      setTimeout(() => {
        wishlistBadge.removeClass('updated');
      }, 600);
      
      console.log('Wishlist badge updated:', wishlistCount);
    } else {
      // Hide badge when wishlist is empty
      wishlistBadge.hide().removeClass('show');
    }
  }

  // Update wishlist icon background
  updateWishlistIcon() {
    let wishlistLink = $('a[title="Wishlist"]');
    
    if (wishlistLink.length === 0) {
      // Fallback: find by heart icon class
      wishlistLink = $('.bi-heart').closest('a');
    }
    
    if (wishlistLink.length > 0) {
      // Remove any existing background classes
      wishlistLink.removeClass('wishlist-has-items');
      console.log('Wishlist icon updated - background removed');
    } else {
      console.warn('Wishlist icon not found for background update');
    }
  }

  // Update all wishlist button states on page
  updateAllWishlistButtonStates() {
    // Handle onclick-based buttons (like in best-sellers page)
    $('button[onclick*="addToWishlist"]').each((index, button) => {
      const $button = $(button);
      const onclickAttr = $button.attr('onclick');
      
      // Extract product ID from onclick attribute
      const match = onclickAttr.match(/addToWishlist\(['"]([^'"]*)['"]/);
      if (match) {
        const productId = match[1];
        const isInWishlist = this.isInWishlist(productId);
        this.updateWishlistButtonState($button, isInWishlist);
      }
    });
    
    // Handle class-based buttons (like in other pages)
    $('.wishlist-btn').each((index, button) => {
      const $button = $(button);
      const $card = $button.closest('.card');
      
      // Skip if this button already handled by onclick method
      if ($button.attr('onclick')) {
        return;
      }
      
      if ($card.length) {
        const product = this.extractProductInfo($card);
        const isInWishlist = this.isInWishlist(product.id);
        this.updateWishlistButtonState($button, isInWishlist);
      }
    });
  }

  // Update individual wishlist button state
  updateWishlistButtonState(button, isInWishlist) {
    const $button = $(button);
    
    if (isInWishlist) {
      // Item is in wishlist - show filled heart with red background
      $button.addClass('added').removeClass('btn-outline-danger').addClass('btn-danger');
      $button.attr('title', 'Remove from Wishlist');
      $button.find('i').removeClass('bi-heart').addClass('bi-heart-fill');
    } else {
      // Item is not in wishlist - show empty heart with outline
      $button.removeClass('added').removeClass('btn-danger').addClass('btn-outline-danger');
      $button.attr('title', 'Add to Wishlist');
      $button.find('i').removeClass('bi-heart-fill').addClass('bi-heart');
    }
  }

  // Show add to wishlist visual feedback
  showAddToWishlistFeedback(button) {
    const $button = $(button);
    
    // Show checkmark temporarily
    $button.addClass('btn-success').removeClass('btn-outline-danger btn-danger');
    $button.find('i').removeClass('bi-heart bi-heart-fill').addClass('bi-check2');
    
    // Đặt lại after 0.8 seconds - ensure filled heart state
    setTimeout(() => {
      $button.removeClass('btn-success');
      // Manually set to filled heart state
      $button.addClass('added btn-danger').removeClass('btn-outline-danger');
      $button.attr('title', 'Remove from Wishlist (click to remove)');
      $button.find('i').removeClass('bi-check2 bi-heart').addClass('bi-heart-fill');
    }, 800);
  }

  // Show remove from wishlist visual feedback
  showRemoveFromWishlistFeedback(button) {
    const $button = $(button);
    
    // Show X temporarily
    $button.addClass('btn-secondary').removeClass('btn-outline-danger btn-danger');
    $button.find('i').removeClass('bi-heart bi-heart-fill').addClass('bi-x');
    
    // Đặt lại after 0.8 seconds - ensure heart icon is restored
    setTimeout(() => {
      $button.removeClass('btn-secondary');
      // Manually set to empty heart state
      $button.removeClass('added btn-danger').addClass('btn-outline-danger');
      $button.attr('title', 'Add to Wishlist (click to add)');
      $button.find('i').removeClass('bi-x bi-heart-fill').addClass('bi-heart');
    }, 800);
  }

  // Animate wishlist icon
  animateWishlistIcon() {
    const wishlistIcon = $('a[title="Wishlist"]');
    wishlistIcon.addClass('wishlist-bounce');
    
    setTimeout(() => {
      wishlistIcon.removeClass('wishlist-bounce');
    }, 600);
  }

  // Setup wishlist icon click to go to wishlist page
  setupWishlistIconClick() {
    $(document).on('click', 'a[title="Wishlist"]', (e) => {
      e.preventDefault();
      window.location.href = 'wishlist.html';
    });
  }

  // Get wishlist items (for wishlist page)
  getWishlistItems() {
    return wishlistItems;
  }

  // Get wishlist count
  getWishlistCount() {
    return wishlistCount;
  }

  // Clear entire wishlist
  clearWishlist() {
    wishlistItems = [];
    wishlistCount = 0;
    
    this.saveWishlistToStorage();
    this.updateWishlistUI();
  }

  // Move item from wishlist to cart
  moveToCart(productId) {
    const item = wishlistItems.find(item => item.id === productId);
    if (item && window.CartManager) {
      // Add to cart
      const cartProduct = {
        ...item,
        quantity: 1
      };
      
      // Simulate adding to cart by calling cart manager
      window.CartManager.addToCart(null, null, cartProduct);
      
      // Remove from wishlist
      this.removeFromWishlist(productId);
      
      return true;
    }
    return false;
  }

  // Show toast notification
  showToast(message, type = 'info') {
    // Remove existing toast
    $('.toast-notification').remove();
    
    const toastHtml = `
      <div class="toast-notification position-fixed" style="top: 20px; right: 20px; z-index: 9999;">
        <div class="alert alert-${type === 'success' ? 'success' : type === 'info' ? 'info' : 'primary'} alert-dismissible fade show" role="alert">
          <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'info' ? 'info-circle' : 'heart'}"></i>
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      </div>
    `;
    
    $('body').append(toastHtml);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      $('.toast-notification').fadeOut(() => $('.toast-notification').remove());
    }, 3000);
  }
}

// Initialize wishlist manager
const wishlistManager = new WishlistManager();

// Make wishlist manager globally available
window.wishlistManager = wishlistManager;

// Debug: Add to window for testing
window.wishlistManager = wishlistManager;
window.wishlistItems = wishlistItems;

// Export for global access
window.WishlistManager = wishlistManager;

// Global functions for onclick events
window.addToWishlist = function(id, name, price, image, description = '', showAlert = false) {
  console.log('Global addToWishlist called:', {id, name, price, image, showAlert, description});
  
  // Throttle to prevent duplicate calls
  const now = Date.now();
  if (now - (window.lastWishlistCall || 0) < 300) {
    console.log('Throttled duplicate addToWishlist call');
    return;
  }
  window.lastWishlistCall = now;
  
  const formattedPrice = price;
  
  const product = {
    id: id,
    name: name,
    price: formattedPrice,
    image: image,
    description: description || 'Sản phẩm khăn cao cấp Nõn Sợi',
    addedAt: new Date().toISOString()
  };
  
  console.log('Formatted product for wishlist:', product);
  
  // Check if item already exists
  const existingItemIndex = wishlistItems.findIndex(item => item.id === id);
  const isInWishlist = existingItemIndex > -1;
  
  // Find the button that was clicked
  const clickedButton = (typeof event !== 'undefined' && event.target) ? event.target.closest('button') : null;
  
  if (isInWishlist) {
    // Remove from wishlist (same logic as index page)
    wishlistItems = wishlistItems.filter(item => item.id !== id);
    
    // Lưu to localStorage  
    localStorage.setItem('Nõn Sợi_wishlist', JSON.stringify(wishlistItems));
    
    // Update UI
    wishlistManager.updateWishlistBadge();
    
    // Update all button states on the page
    setTimeout(() => {
      wishlistManager.updateAllWishlistButtonStates();
    }, 50);
    
    if (showAlert) {
      alert(`${name} removed from wishlist!`);
    } else if (clickedButton) {
      // Show remove feedback: X icon with gray background
      const isSmallButton = clickedButton.className.includes('btn-sm');
      const originalClasses = clickedButton.className;
      
      // Show X temporarily
      if (isSmallButton) {
        clickedButton.className = 'btn btn-secondary btn-sm';
      } else {
        clickedButton.className = 'btn btn-secondary';
      }
      clickedButton.innerHTML = '<i class="bi bi-x"></i>';
      
      // Đặt lại to proper state after animation
      setTimeout(() => {
        if (isSmallButton) {
          clickedButton.className = 'btn btn-outline-danger btn-sm border me-2';
        } else {
          clickedButton.className = 'btn btn-outline-danger wishlist-btn';
        }
        clickedButton.innerHTML = '<i class="bi bi-heart"></i>';
        clickedButton.title = 'Add to Wishlist';
      }, 800);
    }
    
    console.log('Removed from wishlist:', wishlistItems);
  } else {
    // Add to wishlist
    wishlistItems.push(product);
    
    // Lưu to localStorage  
    localStorage.setItem('Nõn Sợi_wishlist', JSON.stringify(wishlistItems));
    
    // Update UI
    wishlistManager.updateWishlistBadge();
    
    // Update all button states on the page
    setTimeout(() => {
      wishlistManager.updateAllWishlistButtonStates();
    }, 50);
    
    if (showAlert) {
      alert(`${name} added to wishlist!`);
    } else if (clickedButton) {
      // Show add feedback: checkmark with green background first
      const isSmallButton = clickedButton.className.includes('btn-sm');
      
      // Show green checkmark temporarily
      if (isSmallButton) {
        clickedButton.className = 'btn btn-success btn-sm';
      } else {
        clickedButton.className = 'btn btn-success';
      }
      clickedButton.innerHTML = '<i class="bi bi-check2"></i>';
      
      // Then change to filled heart with red background
      setTimeout(() => {
        if (isSmallButton) {
          clickedButton.className = 'btn btn-danger btn-sm border me-2';
        } else {
          clickedButton.className = 'btn btn-danger wishlist-btn';
        }
        clickedButton.innerHTML = '<i class="bi bi-heart-fill"></i>';
        clickedButton.title = 'Remove from Wishlist';
      }, 800);
    }
    
    console.log('Added to wishlist:', wishlistItems);
  }
};

// Debug logging
console.log('Wishlist system initialized');
console.log('Current wishlist:', wishlistItems);

// Global function to update wishlist button states on page load
window.updateWishlistButtonStates = function() {
  // Update all buttons with onclick="addToWishlist(...)"
  $('button[onclick*="addToWishlist"]').each(function() {
    const button = $(this);
    const onclickAttr = button.attr('onclick');
    
    // Extract product ID from onclick attribute
    const match = onclickAttr.match(/addToWishlist\(['"]([^'"]*)['"]/);
    if (match) {
      const productId = match[1];
      const isInWishlist = wishlistItems.some(item => item.id === productId);
      
      if (isInWishlist) {
        // Set to filled heart state (in wishlist)
        button.removeClass('btn-outline-danger').addClass('btn-danger');
        button.find('i').removeClass('bi-heart').addClass('bi-heart-fill');
        button.attr('title', 'Remove from Wishlist');
      } else {
        // Set to empty heart state (not in wishlist)  
        button.removeClass('btn-danger').addClass('btn-outline-danger');
        button.find('i').removeClass('bi-heart-fill').addClass('bi-heart');
        button.attr('title', 'Add to Wishlist');
      }
    }
  });
  
  console.log('Wishlist button states updated for', wishlistItems.length, 'items');
};

// Auto-update button states when page loads
$(document).ready(function() {
  setTimeout(updateWishlistButtonStates, 500);
});




