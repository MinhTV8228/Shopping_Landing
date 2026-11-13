(function () {
  'use strict';

  function money(value) {
    return window.formatVND(value);
  }

  function createCard(product) {
    const col = document.createElement('div');
    col.className = 'col';

    const card = document.createElement('div');
    card.className = 'card product-card h-100';
    card.innerHTML = '<img class="card-img-top" loading="lazy">' +
      '<div class="card-body"><h5 class="card-title"></h5>' +
      '<p class="product-description"></p><div class="d-flex align-items-center mb-3">' +
      '<span class="price"></span><span class="old-price"></span></div>' +
      '<div class="d-flex justify-content-between"><button class="btn btn-outline-dark btn-sm cart-button">' +
      '<i class="bi bi-cart me-1"></i>Th\u00eam v\u00e0o gi\u1ecf</button>' +
      '<button class="btn btn-outline-danger wishlist-btn btn-sm"><i class="bi bi-heart"></i></button></div></div>';

    card.querySelector('img').src = product.image;
    card.querySelector('img').alt = product.name;
    card.querySelector('.card-title').textContent = product.name;
    card.dataset.productId = product.id;
    card.querySelector('.product-description').textContent = product.description || '';
    card.querySelector('.price').textContent = money(product.price);
    card.querySelector('.old-price').textContent = product.oldPrice ? money(product.oldPrice) : '';
    const detailUrl = (product.detailPage || 'all-products.html') + '?id=' + encodeURIComponent(product.id);
    card.tabIndex = 0;
    card.setAttribute('role', 'link');
    card.setAttribute('aria-label', 'Xem ' + product.name);
    card.dataset.detailUrl = detailUrl;
    card.style.cursor = 'pointer';
    card.querySelector('.cart-button').addEventListener('click', function () {
      addToCart(product.id, product.name, product.price, product.image, false);
    });
    col.appendChild(card);
    return col;
  }

  function productsFor(filter) {
    const products = window.NONSOI_PRODUCTS || [];
    if (!filter || filter === 'all') return products;
    if (filter === 'sale') {
      return products.filter(function (product) { return product.isSale === true; });
    }
    if (filter === 'best') {
      return products.filter(function (product) { return product.isBestSeller === true; });
    }
    if (filter === 'new') {
      return products.filter(function (product) { return product.isNew === true; });
    }
    return products.filter(function (product) { return product.category === filter; });
  }

  function render(section) {
    const sourceRows = section.querySelectorAll('.row:has(.product-card)');
    sourceRows.forEach(function (row) { row.remove(); });

    const products = productsFor(section.dataset.productFilter)
      .slice(0, Number(section.dataset.productLimit) || undefined);

    const row = document.createElement('div');
    row.className = 'row row-cols-1 row-cols-md-4 g-4 mb-4';
    products.forEach(function (product) {
      row.appendChild(createCard(product));
    });

    if (!products.length) {
      const emptyState = document.createElement('p');
      emptyState.className = 'text-muted';
      emptyState.textContent = 'Ch\u01b0a c\u00f3 s\u1ea3n ph\u1ea9m trong danh m\u1ee5c n\u00e0y.';
      row.appendChild(emptyState);
    }

    const followingContent = section.querySelector('.text-center.mt-4, .text-center.mt-5');
    section.insertBefore(row, followingContent || null);
  }

  function init() {
    document.querySelectorAll('[data-product-filter]').forEach(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
