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
        if (!Array.isArray(wishlistItems)) wishlistItems = [];
      } catch (e) {
        wishlistItems = [];
      }
    } else {
      wishlistItems = [];
    }
    wishlistCount = wishlistItems.length;
    window.wishlistItems = wishlistItems;
  }

  // Lưu wishlist data to localStorage
  saveWishlistToStorage() {
    wishlistCount = wishlistItems.length;
    window.wishlistItems = wishlistItems;
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
          window.addToWishlist(product.id, product.name, product.price, product.image, product.description, false, button[0]);
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
    window.wishlistItems = wishlistItems;
    
    // Lưu to localStorage
    this.saveWishlistToStorage();

    // Update UI
    this.updateWishlistUI();

    // Update button state if button provided
    if (button) {
      this.updateWishlistButtonState(button, false);
      this.showRemoveFromWishlistFeedback(button);
    }

    window.showSiteToast('Đã xóa khỏi danh sách yêu thích.', 'info');

    console.log('Wishlist items after removing:', wishlistItems);
  }

  // Update wishlist UI elements
  updateWishlistUI() {
    wishlistCount = wishlistItems.length;
    window.wishlistItems = wishlistItems;
    // Update wishlist count badge
    this.updateWishlistBadge();
    
    // Update wishlist icon background
    this.updateWishlistIcon();
    
    // Update all wishlist button states
    this.updateAllWishlistButtonStates();
  }

  // Update wishlist count badge
  updateWishlistBadge() {
    wishlistCount = wishlistItems.length;
    // Find the wishlist badge element
    const wishlistBadge = $('.wishlist-badge');

    wishlistBadge
      .text(wishlistCount > 99 ? '99+' : wishlistCount)
      .toggle(wishlistCount > 0)
      .toggleClass('show', wishlistCount > 0);

    if (wishlistCount > 0) {
      
      // Add animation effect
      wishlistBadge.addClass('updated');
      setTimeout(() => {
        wishlistBadge.removeClass('updated');
      }, 600);
      
      console.log('Wishlist badge updated:', wishlistCount);
    }
  }

  // Update wishlist icon background
  updateWishlistIcon() {
    let wishlistLink = $('a[title="Danh sách yêu thích"]');
    
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
    const wishlistIcon = $('a[title="Danh sách yêu thích"]');
    wishlistIcon.addClass('wishlist-bounce');
    
    setTimeout(() => {
      wishlistIcon.removeClass('wishlist-bounce');
    }, 600);
  }

  // Setup wishlist icon click to go to wishlist page
  setupWishlistIconClick() {
    $(document).on('click', 'a[title="Danh sách yêu thích"]', (e) => {
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
window.addToWishlist = function(id, name, price, image, description = '', showAlert = false, sourceButton = null) {
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
  
  if (isInWishlist) {
    wishlistManager.removeFromWishlist(id, sourceButton);
    console.log('Removed from wishlist:', wishlistItems);
  } else {
    wishlistItems.push(product);
    wishlistCount = wishlistItems.length;
    window.wishlistItems = wishlistItems;
    wishlistManager.saveWishlistToStorage();
    wishlistManager.updateWishlistUI();
    if (sourceButton) wishlistManager.updateWishlistButtonState(sourceButton, true);
    if (showAlert) {
      window.showSiteToast(`Đã thêm ${name} vào danh sách yêu thích.`);
    } else {
      window.showSiteToast('Đã thêm vào danh sách yêu thích.');
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




