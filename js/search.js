/**
 * Search functionality for Nõn Sợi website
 * Handles product search with real-time suggestions and navigation to specific products
 */

class ProductSearch {
  constructor() {
    this.searchInput = null;
    this.searchResults = null;
    this.isSearchVisible = false;
    this.debounceTimer = null;
    
    this.init();
  }
  
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupSearch());
    } else {
      this.setupSearch();
    }
  }
  
  setupSearch() {
    // Try to find search elements (they might be loaded via AJAX)
    this.findSearchElements();
    
    // If elements not found, try again after a short delay (for component loading)
    if (!this.searchInput) {
      setTimeout(() => {
        this.findSearchElements();
        if (this.searchInput) {
          this.bindEvents();
          this.handleURLParams();
        }
      }, 1000);
    } else {
      this.bindEvents();
      this.handleURLParams();
    }
  }
  
  findSearchElements() {
    this.searchInput = document.getElementById('searchInput');
    this.searchResults = document.getElementById('searchResults');
    
    // Debug log
    if (this.searchInput && this.searchResults) {
      console.log('Search elements found successfully');
    } else {
      console.log('Search elements not found:', {
        searchInput: !!this.searchInput,
        searchResults: !!this.searchResults
      });
    }
  }
  
  bindEvents() {
    if (!this.searchInput || !this.searchResults) return;
    
    // Search input events
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearchInput(e.target.value);
    });
    
    this.searchInput.addEventListener('focus', () => {
      if (this.searchInput.value.trim()) {
        this.showResults();
      }
    });
    
    this.searchInput.addEventListener('blur', (e) => {
      // Delay hiding to allow clicking on results
      setTimeout(() => {
        if (!this.searchResults.contains(document.activeElement)) {
          this.hideResults();
        }
      }, 150);
    });

    // Handle Enter key to select first result
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = e.target.value.trim();
        if (query) {
          const results = this.searchProduct(query);
          if (results.length > 0) {
            this.selectProduct(results[0].name, results[0].id);
          }
        }
      }
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        this.hideResults();
      }
    });
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideResults();
        this.searchInput.blur();
      }
    });
  }
  
  handleSearchInput(query) {
    // Clear previous timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // Increase debounce time to reduce lag
    this.debounceTimer = setTimeout(() => {
      this.performSearch(query);
    }, 300); // Tăng từ 200ms lên 300ms để giảm lag
  }
  
  performSearch(query) {
    const trimmedQuery = query.trim().toLowerCase();
    
    console.log('Performing search for:', trimmedQuery); // Debug log
    
    if (trimmedQuery.length === 0) {
      this.hideResults();
      return;
    }
    
    if (trimmedQuery.length < 2) {
      this.showNoResults('Please enter at least 2 character to search');
      return;
    }
    
    // Search products
    const results = this.searchProduct(trimmedQuery);
    
    console.log('Search results:', results); // Debug log
    
    if (results.length > 0) {
      this.displayResults(results);
    } else {
      this.showNoResults('Product not found');
    }
  }
  
  searchProduct(query) {
    const products = (window.NONSOI_PRODUCTS || []).map(product => ({
        id: product.id,
        name: product.name,
        price: window.formatVND(product.price),
        originalPrice: product.oldPrice ? window.formatVND(product.oldPrice) : '',
        category: product.categoryLabel || product.category,
        image: product.image,
        detail: product.detailPage
      }));
    return products.filter(product => {
      const searchableText = `${product.name} ${product.category}`.toLowerCase();
      return searchableText.includes(query);
    }).slice(0, 8); // Tăng từ 6 lên 8 results để phù hợp với nhiều sản phẩm hơn
  }
  
  displayResults(results) {
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    results.forEach((product, index) => {
      const resultDiv = document.createElement('div');
      resultDiv.className = 'search-result-item';
      resultDiv.onclick = () => this.selectProduct(product.name, product.id);
      
      // Use template literal with improved image loading
      resultDiv.innerHTML = `
        <div class="d-flex align-items-center">
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            class="search-result-image me-3" 
            loading="lazy"
            onerror="this.style.opacity='0.5'; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik0yNSAyMEMyMi4yNSAyMCAyMCAyMi4yNSAyMCAyNUMyMCAyNy43NSAyMi4yNSAzMCAyNSAzMEMyNy43NSAzMCAzMCAyNy43NSAzMCAyNUMzMCAyMi4yNSAyNy43NSAyMCAyNSAyMFoiIGZpbGw9IiNEREREREQiLz4KPC9zdmc+';"
            onload="this.style.opacity='1';">
          <div class="search-result-info">
            <h6 class="mb-1">${this.highlightQuery(product.name)}</h6>
            <div class="search-result-price">
              <span class="price">${product.price}</span>
              ${product.originalPrice ? `<span class="old-price ms-2">${product.originalPrice}</span>` : ''}
              <span class="category-tag">${product.category}</span>
            </div>
          </div>
        </div>
      `;
      
      fragment.appendChild(resultDiv);
    });
    
    // Clear and append all at once for better performance
    this.searchResults.innerHTML = '';
    this.searchResults.appendChild(fragment);
    this.showResults();
  }
  
  showNoResults(message) {
    this.searchResults.innerHTML = `
      <div class="search-result-item no-results">
        <p class="mb-1">${message}</p>
      </div>
    `;
    this.showResults();
  }
  
  highlightQuery(text) {
    const query = this.searchInput.value.trim();
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  }
  
  showResults() {
    this.searchResults.style.display = 'block';
    this.searchResults.classList.add('show');
    this.isSearchVisible = true;
  }
  
  hideResults() {
    this.searchResults.style.display = 'none';
    this.searchResults.classList.remove('show');
    this.isSearchVisible = false;
  }
  
  selectProduct(productName, productId) {
    // Set search input value
    this.searchInput.value = productName;
    this.hideResults();
    
    // Store the target product ID in sessionStorage
    sessionStorage.setItem('targetProductId', productId);
    
    // Navigate to all-products page
    const target = (window.NONSOI_PRODUCTS || []).find(function (product) { return product.id === productId; });
    window.location.href = target && target.detailPage
      ? target.detailPage + '?id=' + encodeURIComponent(productId)
      : 'all-products.html';
  }
  
  // Public method to clear search
  clearSearch() {
    if (this.searchInput) {
      this.searchInput.value = '';
      this.hideResults();
    }
  }
  
  // Handle URL parameters for search redirection
  handleURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    
    if (searchTerm && this.searchInput) {
      this.searchInput.value = searchTerm;
      
      // Clean up URL
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }

  // Method to highlight search results on all-products page
  highlightSearchResults() {
    const targetProductId = sessionStorage.getItem('targetProductId');

    if (targetProductId) {
      // Scroll to specific product
      this.scrollToProduct(targetProductId);
      sessionStorage.removeItem('targetProductId');
    }
  }

  scrollToProduct(productId) {
    setTimeout(() => {
      // First, show all product batches to ensure the target product is visible
      this.showAllProductBatches();
      
      // Wait a bit longer for the batches to be displayed, then find and scroll to the product
      setTimeout(() => {
        // Find the product card with the specified ID
        const productCards = document.querySelectorAll('.product-card');
        let targetCard = null;

        productCards.forEach(card => {
          if (card.dataset.productId === productId) {
            targetCard = card;
          }
        });

        if (targetCard) {
          // Highlight the product
          targetCard.classList.add('search-highlight');
          
          // Scroll to the product
          targetCard.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });

          // Remove highlight after a few seconds
          setTimeout(() => {
            targetCard.classList.remove('search-highlight');
          }, 3000);

          // Update page title
          const title = document.getElementById('all-products-title');
          if (title) {
            const productName = targetCard.querySelector('.card-title').textContent;
            title.innerHTML = `<h2 class="mb-4">Tất cả sản phẩm - Found: ${productName}</h2>`;
          }
        } else {
          // If product still not found, try one more time after a longer delay
          setTimeout(() => {
            const productCardsRetry = document.querySelectorAll('.product-card');
            let targetCardRetry = null;

            productCardsRetry.forEach(card => {
              if (card.dataset.productId === productId) {
                targetCardRetry = card;
              }
            });

            if (targetCardRetry) {
              targetCardRetry.classList.add('search-highlight');
              targetCardRetry.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });

              setTimeout(() => {
                targetCardRetry.classList.remove('search-highlight');
              }, 3000);

              const title = document.getElementById('all-products-title');
              if (title) {
                const productName = targetCardRetry.querySelector('.card-title').textContent;
                title.innerHTML = `<h2 class="mb-4">Tất cả sản phẩm - Found: ${productName}</h2>`;
              }
            } else {
              // If product still not found, show a message
              const title = document.getElementById('all-products-title');
              if (title) {
                title.innerHTML = `<h2 class="mb-4">Tất cả sản phẩm - Product with ID "${productId}" not found</h2>`;
              }
            }
          }, 2000); // Try again after 2 more seconds
        }
      }, 1500); // Wait 1.5 seconds for batches to load
    }, 500);
  }

  // Helper method to show all product batches
  showAllProductBatches() {
    // Check if we're on all-products page and if it has "view more" functionality
    const moreSection = document.getElementById("more-products");
    const seeMoreContainer = document.getElementById("see-more-container");
    
    if (moreSection && seeMoreContainer) {
      // If "more products" section is hidden, show it
      if (moreSection.style.display === "none" || moreSection.style.display === "") {
        // Use the existing toggleMoreProduct function if available
        if (typeof toggleMoreProduct === 'function') {
          toggleMoreProduct();
        } else {
          // Fallback: manually show the section
          moreSection.style.display = "block";
          seeMoreContainer.style.display = "none";
        }
      }
    }

    // Also handle product batches (if using batch system)
    const productBatches = document.querySelectorAll('.product-batch');
    productBatches.forEach(batch => {
      batch.style.display = 'block';
      batch.classList.add('show');
    });

    // Hide "View More" button and show "View Less" button
    const viewMoreContainer = document.querySelector('.view-more-container');
    const viewLessContainer = document.querySelector('.view-less-container');
    
    if (viewMoreContainer) {
      viewMoreContainer.style.display = 'none';
    }
    
    if (viewLessContainer) {
      viewLessContainer.style.display = 'block';
      viewLessContainer.classList.add('show');
    }

    // Handle any other view more buttons
    const viewMoreBtns = document.querySelectorAll('.view-more-btn');
    viewMoreBtns.forEach(btn => {
      if (btn.style.display !== 'none') {
        btn.click(); // Simulate clicking the view more button
      }
    });
  }
}

// Create search instance
const searchInstance = new ProductSearch();

// Initialize search highlighting when page loads (for all-products.html)
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the all-products page
  if (window.location.pathname.includes('all-products.html')) {
    // Wait a bit longer to ensure all scripts are loaded
    setTimeout(() => {
      searchInstance.highlightSearchResults();
    }, 2000);
    
    // Also try again after an even longer delay as fallback
    setTimeout(() => {
      const targetProductId = sessionStorage.getItem('targetProductId');
      if (targetProductId) {
        console.log('Fallback: Trying to find product again:', targetProductId);
        searchInstance.highlightSearchResults();
      }
    }, 5000);
  }
});

// Make searchInstance globally available
window.searchInstance = searchInstance;
window.NONSOI_Search = searchInstance;