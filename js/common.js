/**
 * Common JavaScript for Nõn Sợi website
 * Handles navbar functionality and page initialization
 */

window.parsePrice = function (value) {
  const text = String(value == null ? '' : value);
  const amount = Number(text.replace(/[^0-9.-]/g, '')) || 0;
  return text.includes('$') ? Math.round(amount * 25000) : amount;
};

window.formatVND = function (value) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(window.parsePrice(value)) + ' ₫';
};

window.formatVNDHTML = function (value) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(window.parsePrice(value)) + ' <span class="currency-symbol">₫</span>';
};

window.showSiteToast = function (message, type) {
  let toastContainer = document.querySelector('.site-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'site-toast-container';
    const header = document.querySelector('.navbar');
    const toastTop = header ? header.getBoundingClientRect().bottom + 10 : 20;
    toastContainer.style.top = toastTop + 'px';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'site-toast site-toast-' + (type === 'info' ? 'delete' : 'success');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const messageElement = document.createElement('span');
  messageElement.textContent = message;
  const progress = document.createElement('span');
  progress.className = 'site-toast-progress';
  toast.appendChild(messageElement);
  toast.appendChild(progress);
  toastContainer.appendChild(toast);

  setTimeout(function () {
    toast.remove();
    if (!toastContainer.children.length) toastContainer.remove();
  }, 2500);
};

document.addEventListener('click', function (event) {
  const card = event.target.closest('.product-card[data-detail-url]');
  if (!card || event.target.closest('button, a')) return;
  window.location.href = card.dataset.detailUrl;
});

document.addEventListener('keydown', function (event) {
  const card = event.target.closest('.product-card[data-detail-url]');
  if (!card || event.target !== card || (event.key !== 'Enter' && event.key !== ' ')) return;
  event.preventDefault();
  window.location.href = card.dataset.detailUrl;
});

/**
 * Function to call after header is loaded
 */
window.initializeHeaderComponents = function () {
  initializeNavbar();
  setActiveNavItem();

  // Initialize submenu handlers after header loads
  setTimeout(function () {
    initializeSubmenuHandlers();
  }, 100);
};

document.addEventListener('DOMContentLoaded', function () {
  // Initialize navbar functionality - will be called after header loads
  initializeNavbar();

  const headerPlaceholder = document.getElementById('header-placeholder');
  if (headerPlaceholder) {
    const headerObserver = new MutationObserver(function () {
      setActiveNavItem();
      if (window.cartManager) window.cartManager.updateCartUI();
      if (window.wishlistManager) window.wishlistManager.updateWishlistUI();
    });
    headerObserver.observe(headerPlaceholder, { childList: true });
  }

  // Set active navigation item
  setActiveNavItem();

  // Initialize animations
  initializeAnimations();

  // Initialize header scroll behavior
  initializeHeaderScroll();

  // Initialize back to top button
  initializeBackToTop();

  // Initialize badges for cart and wishlist
  initializeBadges();

  // Also initialize after a delay to ensure header is loaded
  setTimeout(function () {
    initializeNavbar();
  }, 1000);
});

/**
 * Initialize cart and wishlist badges on page load
 */
function initializeBadges() {
  // Wait a bit for cart and wishlist managers to be ready
  setTimeout(() => {
    // Initialize cart badge if cart manager exists
    if (typeof window.cartManager !== 'undefined') {
      window.cartManager.updateCartBadge();
    }

    // Initialize wishlist badge if wishlist manager exists  
    if (typeof window.wishlistManager !== 'undefined') {
      window.wishlistManager.updateWishlistBadge();
    }

    // Fallback: directly update badges from localStorage
    updateBadgesFromStorage();

    // Additional delay for wishlist specifically
    setTimeout(() => {
      if (typeof window.wishlistManager !== 'undefined') {
        window.wishlistManager.updateWishlistBadge();
      }
    }, 200);
  }, 100);
}

/**
 * Update badges directly from localStorage as fallback
 */
function updateBadgesFromStorage() {
  try {
    // Update giỏ hàng badge
    const cartData = localStorage.getItem('Nõn Sợi_cart');
    const cartItems = cartData ? JSON.parse(cartData) : [];
    const cartCount = cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);

    const cartBadge = $('.cart-badge');
    const cartIcon = $('a[title="Giỏ hàng"]');

    if (cartCount > 0) {
      cartBadge.text(cartCount > 99 ? '99+' : cartCount).show();
    } else {
      cartBadge.hide();
    }

    // Remove any background classes from cart icon
    cartIcon.removeClass('cart-has-items');

    // Update wishlist badge  
    const wishlistData = localStorage.getItem('Nõn Sợi_wishlist'); // Fixed key name
    const wishlistItems = wishlistData ? JSON.parse(wishlistData) : [];
    const wishlistCount = wishlistItems.length;

    const wishlistBadge = $('.wishlist-badge');
    const wishlistIcon = $('a[title="Danh sách yêu thích"]');

    if (wishlistCount > 0) {
      wishlistBadge.text(wishlistCount > 99 ? '99+' : wishlistCount).show();
    } else {
      wishlistBadge.hide();
    }

    // Remove any background classes from wishlist icon
    wishlistIcon.removeClass('wishlist-has-items');

    console.log('Badges initialized from storage - Cart:', cartCount, 'Wishlist:', wishlistCount);
  } catch (error) {
    console.error('Error updating badges from storage:', error);
  }
}

/**
 * Initialize navbar dropdown functionality
 * This function can be called multiple times safely
 */
function initializeNavbar() {
  // Handle mobile navbar toggle first
  initializeNavbarToggle();

  // Remove Bootstrap dropdown behaviors ONLY on mobile
  if (window.innerWidth <= 991.98) {
    const allDropdownToggles = document.querySelectorAll('[data-bs-toggle="dropdown"]');
    allDropdownToggles.forEach(function (element) {
      element.removeAttribute('data-bs-toggle');
      element.removeAttribute('data-bs-auto-close');
    });
  }

  // Handle Product dropdown click behavior - MOBILE ONLY
  const mainDropdownToggle = document.querySelector('.dropdown-toggle[data-page="products"]');

  if (mainDropdownToggle) {
    // Remove existing event listeners to prevent duplicates
    const newToggle = mainDropdownToggle.cloneNode(true);
    mainDropdownToggle.parentNode.replaceChild(newToggle, mainDropdownToggle);

    // Add click event listener - ONLY for mobile
    newToggle.addEventListener('click', function (e) {
      // ONLY handle clicks on MOBILE screens (responsive)
      if (window.innerWidth > 991.98) {
        // Desktop: Let CSS hover handle this naturally, don't interfere
        return;
      }

      // Mobile ONLY: handle click toggle
      e.preventDefault();
      e.stopPropagation();

      const dropdown = this.closest('.dropdown');
      console.log('Mobile Product dropdown clicked:', dropdown);

      // Đóng all other dropdowns first
      document.querySelectorAll('.dropdown.show').forEach(function (other) {
        if (other !== dropdown) {
          other.classList.remove('show');
          const otherMenu = other.querySelector('.dropdown-menu');
          if (otherMenu) {
            otherMenu.style.display = 'none';
            otherMenu.style.visibility = 'hidden';
            otherMenu.style.opacity = '0';
          }
          // Đóng all submenus in other dropdowns
          other.querySelectorAll('.dropdown-submenu.show').forEach(function (submenu) {
            submenu.classList.remove('show');
            const submenuMenu = submenu.querySelector('.dropdown-menu');
            if (submenuMenu) {
              submenuMenu.style.display = 'none';
              submenuMenu.style.visibility = 'hidden';
              submenuMenu.style.opacity = '0';
            }
          });
        }
      });

      // Toggle current dropdown
      dropdown.classList.toggle('show');

      // Force show/hide with inline styles for mobile
      const dropdownMenu = dropdown.querySelector('.dropdown-menu');
      if (dropdown.classList.contains('show')) {
        dropdownMenu.style.display = 'block';
        dropdownMenu.style.position = 'static';
        dropdownMenu.style.visibility = 'visible';
        dropdownMenu.style.opacity = '1';
        console.log('Mobile dropdown shown');
      } else {
        dropdownMenu.style.display = 'none';
        dropdownMenu.style.visibility = 'hidden';
        dropdownMenu.style.opacity = '0';
        console.log('Mobile dropdown hidden');
      }

      // If closing dropdown, also close all its submenus
      if (!dropdown.classList.contains('show')) {
        dropdown.querySelectorAll('.dropdown-submenu.show').forEach(function (submenu) {
          submenu.classList.remove('show');
          const submenuDropdown = submenu.querySelector('.dropdown-menu');
          if (submenuDropdown) {
            submenuDropdown.style.display = 'none';
            submenuDropdown.style.visibility = 'hidden';
            submenuDropdown.style.opacity = '0';
          }
        });
      }
    });
  }

  // Initialize submenu handlers
  initializeSubmenuHandlers();

  // Đóng dropdowns when clicking outside - only for mobile
  document.addEventListener('click', function (e) {
    if (window.innerWidth <= 991.98 && !e.target.closest('.dropdown')) {
      // Đóng all dropdowns and submenus on mobile when clicking outside
      document.querySelectorAll('.dropdown.show').forEach(function (dropdown) {
        dropdown.classList.remove('show');
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        if (dropdownMenu) {
          dropdownMenu.style.display = 'none';
          dropdownMenu.style.visibility = 'hidden';
          dropdownMenu.style.opacity = '0';
        }

        // Also close all submenus in this dropdown
        dropdown.querySelectorAll('.dropdown-submenu.show').forEach(function (submenu) {
          submenu.classList.remove('show');
          const submenuMenu = submenu.querySelector('.dropdown-menu');
          if (submenuMenu) {
            submenuMenu.style.display = 'none';
            submenuMenu.style.visibility = 'hidden';
            submenuMenu.style.opacity = '0';
          }
        });
      });
    }
  });

  // Handle window resize - reinitialize dropdown behaviors
  let resizeTimeout;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      // Đóng all dropdowns first
      document.querySelectorAll('.dropdown.show').forEach(function (dropdown) {
        dropdown.classList.remove('show');
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        if (dropdownMenu) {
          dropdownMenu.style.display = 'none';
          dropdownMenu.style.visibility = 'hidden';
          dropdownMenu.style.opacity = '0';
        }
      });

      document.querySelectorAll('.dropdown-submenu.show').forEach(function (submenu) {
        submenu.classList.remove('show');
        const submenuMenu = submenu.querySelector('.dropdown-menu');
        if (submenuMenu) {
          submenuMenu.style.display = 'none';
          submenuMenu.style.visibility = 'hidden';
          submenuMenu.style.opacity = '0';
        }
      });

      // Re-initialize based on screen size
      const dropdownElements = document.querySelectorAll('.dropdown-toggle');
      dropdownElements.forEach(function (element) {
        if (window.innerWidth <= 991.98) {
          // Mobile: remove Bootstrap dropdown
          element.removeAttribute('data-bs-toggle');
          element.removeAttribute('data-bs-auto-close');
        } else {
          // Desktop: restore Bootstrap dropdown (for non-Product dropdowns)
          if (!element.hasAttribute('data-page') || element.getAttribute('data-page') !== 'products') {
            element.setAttribute('data-bs-toggle', 'dropdown');
          }
          // Clear inline styles that might interfere with CSS hover
          const dropdown = element.closest('.dropdown');
          if (dropdown) {
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) {
              menu.style.display = '';
              menu.style.visibility = '';
              menu.style.opacity = '';
              menu.style.position = '';
            }
          }
        }
      });

      // Reinitialize submenu handlers after resize
      if (window.innerWidth <= 991.98) {
        initializeSubmenuHandlers();
      }
    }, 100);
  });

  // Handle navbar collapse on mobile
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.querySelector('.navbar-collapse');

  if (navbarToggler && navbarCollapse) {
    navbarToggler.addEventListener('click', function () {
      navbarCollapse.classList.toggle('show');
    });
  }

  /**
   * Initialize mobile navbar toggle functionality
   */
  function initializeNavbarToggle() {
    // Remove existing event listeners and reinitialize
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('#mainNavbar');

    if (navbarToggler && navbarCollapse) {
      // Clone to remove all existing event listeners
      const newToggler = navbarToggler.cloneNode(true);
      navbarToggler.parentNode.replaceChild(newToggler, navbarToggler);

      // Add improved toggle functionality
      newToggler.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Toggle navbar collapse
        const isExpanded = navbarCollapse.classList.contains('show');

        if (isExpanded) {
          // Đóng navbar
          navbarCollapse.classList.remove('show');
          newToggler.setAttribute('aria-expanded', 'false');

          // Also close any open dropdowns when closing navbar
          document.querySelectorAll('.dropdown.show').forEach(function (dropdown) {
            dropdown.classList.remove('show');
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');
            if (dropdownMenu) {
              dropdownMenu.style.display = 'none';
              dropdownMenu.style.visibility = 'hidden';
              dropdownMenu.style.opacity = '0';
            }
          });
        } else {
          // Mở navbar
          navbarCollapse.classList.add('show');
          newToggler.setAttribute('aria-expanded', 'true');
        }

        console.log('Navbar toggled:', !isExpanded ? 'opened' : 'closed');
      });

      // Đóng navbar when clicking nav links on mobile
      const navLinks = navbarCollapse.querySelectorAll('.nav-link:not(.dropdown-toggle)');
      navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          if (window.innerWidth <= 991.98) {
            navbarCollapse.classList.remove('show');
            newToggler.setAttribute('aria-expanded', 'false');
          }
        });
      });

      // Đóng navbar when clicking outside on mobile
      document.addEventListener('click', function (e) {
        if (window.innerWidth <= 991.98) {
          if (!navbarCollapse.contains(e.target) && !newToggler.contains(e.target)) {
            navbarCollapse.classList.remove('show');
            newToggler.setAttribute('aria-expanded', 'false');

            // Also close any open dropdowns
            document.querySelectorAll('.dropdown.show').forEach(function (dropdown) {
              dropdown.classList.remove('show');
              const dropdownMenu = dropdown.querySelector('.dropdown-menu');
              if (dropdownMenu) {
                dropdownMenu.style.display = 'none';
                dropdownMenu.style.visibility = 'hidden';
                dropdownMenu.style.opacity = '0';
              }
            });
          }
        }
      });

      // Handle window resize
      window.addEventListener('resize', function () {
        if (window.innerWidth > 991.98) {
          // Desktop: ensure navbar is always visible and reset state
          navbarCollapse.classList.remove('show');
          newToggler.setAttribute('aria-expanded', 'false');

          // Đặt lại all dropdown styles for desktop
          document.querySelectorAll('.dropdown-menu').forEach(function (menu) {
            menu.style.display = '';
            menu.style.visibility = '';
            menu.style.opacity = '';
            menu.style.position = '';
          });

          document.querySelectorAll('.dropdown.show').forEach(function (dropdown) {
            dropdown.classList.remove('show');
          });
        }
      });
    }
  }

  // Enhanced dropdown hover handling for better UX
  const dropdown = document.querySelector('.dropdown');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  if (dropdown && dropdownMenu && window.innerWidth > 991.98) {
    let hoverTimeout;

    dropdown.addEventListener('mouseenter', function () {
      clearTimeout(hoverTimeout);
    });

    dropdown.addEventListener('mouseleave', function () {
      hoverTimeout = setTimeout(function () {
        // Additional cleanup if needed
      }, 100);
    });
  }
}

/**
 * Set active navigation item based on current page
 */
function setActiveNavItem() {
  const currentPage = getCurrentTrangName();
  const navLinks = document.querySelectorAll('.nav-link[data-page], .wishlist-icon[data-page], .cart-icon[data-page]');

  navLinks.forEach(function (link) {
    link.classList.toggle('active', Boolean(currentPage) && link.getAttribute('data-page') === currentPage);
  });
}

/**
 * Get current page name from URL
 */
function getCurrentTrangName() {
  const path = window.location.pathname;
  const filename = path.split('/').pop().toLowerCase();

  // Map filenames to page names
  const pageMap = {
    'index.html': 'home',
    '': 'home', // Root path
    'about.html': 'about',
    'contact.html': 'contact',
    'feedback.html': 'feedback',
    'policies-and-term.html': 'policies',
    'wishlist.html': 'wishlist',
    'cart.html': 'cart',
    // Product pages
    'all-products.html': 'products',
    'bath-robes.html': 'products',
    'bath-towels.html': 'products',
    'face-towels.html': 'products',
    'hand-towels.html': 'products',
    'best-sellers.html': 'products',
    'new-products.html': 'products',
    'sale-products.html': 'products',
    'bath-robe-detail.html': 'products',
    'bath-towel-detail.html': 'products',
    'face-towel-detail.html': 'products',
    'hand-towel-detail.html': 'products'
  };

  return pageMap[filename] || '';
}

/**
 * Initialize submenu handlers for mobile
 */
function initializeSubmenuHandlers() {
  const submenuToggles = document.querySelectorAll('.dropdown-submenu .dropdown-toggle');
  console.log('Found submenu toggles:', submenuToggles.length);

  submenuToggles.forEach(function (toggle, index) {
    console.log('Processing submenu toggle', index, toggle);

    // Remove existing listeners by cloning
    const newToggle = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(newToggle, toggle);

    newToggle.addEventListener('click', function (e) {
      console.log('Submenu toggle clicked');

      // ONLY handle clicks on MOBILE screens (responsive)
      if (window.innerWidth > 991.98) {
        console.log('Desktop - ignoring click');
        // Desktop: Let CSS hover handle this naturally
        return;
      }

      // Mobile: handle submenu toggle
      e.preventDefault();
      e.stopPropagation();

      const submenu = this.closest('.dropdown-submenu');
      const mainDropdown = this.closest('.dropdown');

      console.log('Submenu element:', submenu);
      console.log('Main dropdown element:', mainDropdown);

      // Only allow submenu toggle if main dropdown is open
      if (!mainDropdown.classList.contains('show')) {
        console.log('Main dropdown not open - returning');
        return;
      }

      console.log('Mobile submenu clicked:', submenu);
      console.log('Current submenu state before toggle:', submenu.classList.contains('show'));

      // Đóng other submenus in the same dropdown
      mainDropdown.querySelectorAll('.dropdown-submenu.show').forEach(function (other) {
        if (other !== submenu) {
          console.log('Closing other submenu:', other);
          other.classList.remove('show');
          const otherSubmenuMenu = other.querySelector('.dropdown-menu');
          if (otherSubmenuMenu) {
            otherSubmenuMenu.style.display = 'none';
            otherSubmenuMenu.style.visibility = 'hidden';
            otherSubmenuMenu.style.opacity = '0';
          }
        }
      });

      // Toggle current submenu
      submenu.classList.toggle('show');
      console.log('Submenu state after toggle:', submenu.classList.contains('show'));

      // Force show/hide with inline styles - use !important through setProperty
      const submenuDropdown = submenu.querySelector('.dropdown-menu');
      console.log('Submenu dropdown element:', submenuDropdown);
      console.log('Submenu dropdown current styles:', window.getComputedStyle(submenuDropdown));

      if (submenu.classList.contains('show')) {
        submenuDropdown.style.setProperty('display', 'block', 'important');
        submenuDropdown.style.setProperty('visibility', 'visible', 'important');
        submenuDropdown.style.setProperty('opacity', '1', 'important');
        submenuDropdown.style.setProperty('position', 'static', 'important');
        submenuDropdown.style.setProperty('transform', 'none', 'important');
        submenuDropdown.style.setProperty('height', 'auto', 'important');
        submenuDropdown.style.setProperty('overflow', 'visible', 'important');
        console.log('Mobile submenu shown with forced styles');
        console.log('Submenu dropdown styles after show:', submenuDropdown.style.cssText);
      } else {
        submenuDropdown.style.setProperty('display', 'none', 'important');
        submenuDropdown.style.setProperty('visibility', 'hidden', 'important');
        submenuDropdown.style.setProperty('opacity', '0', 'important');
        submenuDropdown.style.setProperty('height', '0', 'important');
        submenuDropdown.style.setProperty('overflow', 'hidden', 'important');
        console.log('Mobile submenu hidden with forced styles');
        console.log('Submenu dropdown styles after hide:', submenuDropdown.style.cssText);
      }
    });
  });
}

/**
 * Initialize page animations
 */
function initializeAnimations() {
  // Add fade-in animation to main content
  const mainContent = document.querySelector('main, .container');
  if (mainContent) {
    mainContent.classList.add('fade-in');
  }

  // Animate cards on scroll
  const cards = document.querySelectorAll('.card');
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const cardObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('slide-up');
      }
    });
  }, observerOptions);

  cards.forEach(function (card) {
    cardObserver.observe(card);
  });
}

/**
 * Search functionality
 */
function initializeSearch() {
  const searchInput = document.querySelector('.search-input');

  if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const searchTerm = this.value.trim();

        if (searchTerm) {
          // Implement search functionality here
          console.log('Searching for:', searchTerm);
          // You can add actual search logic here
        }
      }
    });
  }
}

/**
 * Utility functions
 */
const Utils = {
  // Smooth scroll to element
  scrollTo: function (element) {
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  },

  // Show loading state
  showLoading: function () {
    document.body.style.cursor = 'wait';
  },

  // Hide loading state
  hideLoading: function () {
    document.body.style.cursor = 'default';
  },

  // Debounce function for performance
  debounce: function (func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = function () {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

/**
 * Initialize header scroll behavior
 */
function initializeHeaderScroll() {
  setTimeout(() => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Keep the header visible while scrolling.
    navbar.classList.remove('header-hidden');
    navbar.classList.add('header-visible');
  }, 500); // Wait for header component to load
}

/**
 * Initialize back to top button
 */
function initializeBackToTop() {
  const backToTopBtn = document.getElementById('backToTop');
  if (!backToTopBtn) return;

  // Show/hide button based on scroll position
  const toggleButton = Utils.debounce(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  }, 10);

  // Smooth scroll to top when clicked
  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Listen for scroll events
  window.addEventListener('scroll', toggleButton);
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', initializeSearch);

// Export for use in other files if needed
window.NONSOI = {
  initializeNavbar,
  initializeSubmenuHandlers,
  setActiveNavItem,
  getCurrentTrangName,
  initializeAnimations,
  initializeHeaderScroll,
  initializeBackToTop,
  Utils
};




