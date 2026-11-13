/**
 * Wishlist Trang functionality
 * Handles wishlist display, item removal, move to cart
 */

class WishlistTrang {
  constructor() {
    this.currentRemoveId = null;
    this.init();
  }

  init() {
    // Wait for wishlist manager to be ready
    setTimeout(() => {
      this.loadWishlistItems();
      this.setupEventHandlers();
    }, 500);
  }

  setupEventHandlers() {
    // Remove item handlers
    $(document).on('click', '.remove-wishlist-btn', (e) => {
      this.showRemoveConfirmation(e);
    });

    $('#confirmRemoveWishlist').on('click', () => {
      this.confirmRemoveItem();
    });

    // Add to cart from wishlist
    $(document).on('click', '.btn-add-to-cart', (e) => {
      this.addToCartFromWishlist(e);
    });

    // Quick remove (without confirmation)
    $(document).on('click', '.btn-remove-wishlist', (e) => {
      this.quickRemoveFromWishlist(e);
    });
  }

  loadWishlistItems() {
    const wishlistItems = window.WishlistManager.getWishlistItems();
    const wishlistContainer = $('#wishlist-items');
    const emptyWishlist = $('#empty-wishlist');

    if (wishlistItems.length === 0) {
      emptyWishlist.show();
      wishlistContainer.hide();
    } else {
      emptyWishlist.hide();
      wishlistContainer.show();
      this.renderWishlistItems(wishlistItems);
    }
  }

  renderWishlistItems(items) {
    const container = $('#wishlist-items');
    container.empty();

    items.forEach(item => {
      const itemHtml = this.createWishlistItemHTML(item);
      container.append(itemHtml);
    });
  }

  createWishlistItemHTML(item) {
    const addedDate = new Date(item.addedAt).toLocaleDateString();

    // Truncate name and description for consistent display, but keep full text for tooltips
    const shortName = item.name.length > 50 ? item.name.substring(0, 50) + '...' : item.name;
    const shortDescription = item.description.length > 100 ? item.description.substring(0, 100) + '...' : item.description;

    return `
      <div class="col-lg-3 col-md-3 col-sm-6 col-12" data-product-id="${item.id}">
        <div class="card wishlist-item h-100">
          <img src="${item.image}" class="card-img-top" alt="${item.name}" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title" title="${item.name}">${shortName}</h5>
            <p class="card-text" title="${item.description}">${shortDescription}</p>
            <div class="price">${window.formatVND(item.price)}</div>
            <small class="text-muted mb-3">Added: ${addedDate}</small>
            <div class="wishlist-actions mt-auto">
              <button class="btn btn-add-to-cart" data-product-id="${item.id}">
                <i class="bi bi-cart-plus me-1"></i>Add to Cart
              </button>
              <button class="btn btn-remove-wishlist" data-product-id="${item.id}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  showRemoveConfirmation(e) {
    const button = $(e.currentTarget);
    const productId = button.data('product-id');
    this.currentRemoveId = productId;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('removeWishlistModal'));
    modal.show();
  }

  confirmRemoveItem() {
    if (this.currentRemoveId) {
      // Remove from wishlist
      window.WishlistManager.removeFromWishlist(this.currentRemoveId);

      // Remove from page
      $(`.col-lg-3[data-product-id="${this.currentRemoveId}"]`).fadeOut(300, function () {
        $(this).remove();
      });

      // Hide modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('removeWishlistModal'));
      modal.hide();

      // Check if wishlist is now empty
      setTimeout(() => {
        this.checkIfEmpty();
      }, 350);

      this.currentRemoveId = null;
    }
  }

  quickRemoveFromWishlist(e) {
    e.preventDefault();
    const button = $(e.currentTarget);
    const productId = button.data('product-id');

    // Show loading state
    button.prop('disabled', true).html('<i class="bi bi-spinner spin"></i>');

    setTimeout(() => {
      // Remove from wishlist
      window.WishlistManager.removeFromWishlist(productId);

      // Remove from page with animation
      $(`.col-lg-3[data-product-id="${productId}"]`).fadeOut(300, function () {
        $(this).remove();
      });

      // Check if wishlist is now empty
      setTimeout(() => {
        this.checkIfEmpty();
      }, 350);
    }, 500);
  }

  addToCartFromWishlist(e) {
    e.preventDefault();
    const button = $(e.currentTarget);
    const productId = button.data('product-id');

    // Show loading state
    const originalText = button.html();
    button.prop('disabled', true).html('<i class="bi bi-spinner spin"></i> Adding...');

    setTimeout(() => {
      // Get product from wishlist
      const wishlistItems = window.WishlistManager.getWishlistItems();
      const product = wishlistItems.find(item => item.id === productId);

      if (product && window.CartManager) {
        // Direct add to cart with complete product data
        const cartProduct = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          description: product.description, // Use actual description from wishlist
          quantity: 1
        };

        console.log('Adding product from wishlist to cart:', cartProduct);

        // Add directly to cart manager without mock card
        window.CartManager.addToCartDirect(cartProduct);

        // Show success feedback
        button.removeClass('btn-add-to-cart').addClass('btn-success')
          .html('<i class="bi bi-check2"></i> Added to Cart!');

        // Đặt lại button after 2 seconds
        setTimeout(() => {
          button.prop('disabled', false).addClass('btn-add-to-cart').removeClass('btn-success')
            .html(originalText);
        }, 2000);

      } else {
        // Error state
        button.removeClass('btn-add-to-cart').addClass('btn-danger')
          .html('<i class="bi bi-exclamation-triangle"></i> Error');

        setTimeout(() => {
          button.prop('disabled', false).addClass('btn-add-to-cart').removeClass('btn-danger')
            .html(originalText);
        }, 2000);
      }
    }, 500);
  }

  checkIfEmpty() {
    const remainingItems = $('#wishlist-items .col-lg-3').length;
    if (remainingItems === 0) {
      $('#wishlist-items').hide();
      $('#empty-wishlist').fadeIn();
    }
  }
}

// Initialize wishlist page when DOM is ready
$(document).ready(() => {
  const wishlistTrang = new WishlistTrang();
  window.WishlistTrang = wishlistTrang;
});

// Add spinning animation for loading states
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
`;
document.head.appendChild(style);