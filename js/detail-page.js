/**
 * Product detail page logic for the Nõn Sợi bath linen shop
 * Reads js/product-data.js (window.NONSOI_PRODUCTS) and renders the
 * gallery, price block, size options and related products.
 */

(function () {
  'use strict';

  const DEFAULT_CATEGORY = 'robe';
  const SIZE_IMAGE = 'images/logo/size.jpg';
  let galleryImages = [];
  let galleryIndex = 0;
  let currentProduct = null;

  /* ---------- helpers ---------- */

  function money(value) {
    return window.formatVND(value);
  }

  function getProductId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function findProduct(id) {
    if (!id) return null;
    const list = window.NONSOI_PRODUCTS || [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function productsOfCategory(category) {
    const list = window.NONSOI_PRODUCTS || [];
    return list.filter(function (p) {
      return p.category === category;
    });
  }

  /* ---------- gallery ---------- */

  function markActiveThumbnail(index) {
    const thumbs = document.querySelectorAll('#thumbnail-wrapper .thumbnail-image');
    thumbs.forEach(function (thumb, i) {
      thumb.classList.toggle('active', i === index);
    });
  }

  function setMainImage(index) {
    const mainImage = document.getElementById('main-image');
    if (!mainImage || !galleryImages.length) return;

    galleryIndex = (index + galleryImages.length) % galleryImages.length;
    mainImage.src = galleryImages[galleryIndex];
    if (currentProduct) {
      mainImage.alt = currentProduct.name;
    }
    markActiveThumbnail(galleryIndex);
  }

  function renderGallery(product) {
    const wrapper = document.getElementById('thumbnail-wrapper');
    galleryImages = (product.images && product.images.length) ? product.images.slice() : [product.image];

    if (galleryImages.indexOf(product.image) === -1) {
      galleryImages.unshift(product.image);
    }
    galleryImages = galleryImages.filter(function (src) {
      return src !== SIZE_IMAGE;
    });
    galleryImages = galleryImages.slice(0, 4);
    galleryImages.push(SIZE_IMAGE);

    if (wrapper) {
      wrapper.innerHTML = '';
      galleryImages.forEach(function (src, index) {
        const thumb = document.createElement('img');
        thumb.src = src;
        thumb.alt = product.name + ' - ảnh ' + (index + 1);
        thumb.className = 'thumbnail-image';
        thumb.loading = 'lazy';
        thumb.addEventListener('click', function () {
          setMainImage(index);
        });
        wrapper.appendChild(thumb);
      });
    }

    setMainImage(galleryImages.indexOf(product.image));

    const prev = document.getElementById('gallery-prev');
    const next = document.getElementById('gallery-next');
    if (prev && !prev.dataset.bound) {
      prev.dataset.bound = '1';
      prev.addEventListener('click', function () {
        setMainImage(galleryIndex - 1);
      });
    }
    if (next && !next.dataset.bound) {
      next.dataset.bound = '1';
      next.addEventListener('click', function () {
        setMainImage(galleryIndex + 1);
      });
    }
  }

  /* ---------- product information ---------- */

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function renderRating(product) {
    const container = document.getElementById('detail-rating');
    if (!container) return;

    const rating = Number(product.rating);
    if (!rating) {
      container.hidden = true;
      container.replaceChildren();
      return;
    }

    container.hidden = false;
    container.replaceChildren();
    for (let star = 1; star <= 5; star++) {
      const icon = document.createElement('i');
      icon.className = star <= Math.floor(rating) ? 'bi bi-star-fill' : (star - rating < 1 ? 'bi bi-star-half' : 'bi bi-star');
      container.appendChild(icon);
    }

    const text = document.createElement('span');
    text.className = 'text-muted ms-2';
    text.textContent = rating.toFixed(1) + ' / 5' + (product.reviewCount ? ' (' + product.reviewCount + ' đánh giá)' : '');
    container.appendChild(text);
  }

  function renderSizes(product) {
    const wrapper = document.getElementById('size-wrapper');
    if (!wrapper) return;

    const sizes = (product.sizes && product.sizes.length) ? product.sizes : ['Tiêu chuẩn'];
    wrapper.innerHTML = '';

    sizes.forEach(function (size, index) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn-outline-secondary size-btn' + (index === 0 ? ' active' : '');
      button.textContent = size;
      button.addEventListener('click', function () {
        document.querySelectorAll('#size-wrapper .size-btn').forEach(function (btn) {
          btn.classList.remove('active');
        });
        button.classList.add('active');
      });
      wrapper.appendChild(button);
    });
  }

  function selectedSize() {
    const active = document.querySelector('#size-wrapper .size-btn.active');
    return active ? active.textContent.trim() : '';
  }

  function renderInfo(product) {
    document.title = product.name + ' - Khăn & Áo choàng tắm Nõn Sợi';
    renderRating(product);

    setText('detail-breadcrumb', product.name);
    setText('detail-category', product.categoryLabel);
    setText('detail-name', product.name);
    setText('detail-price', money(product.price));
    setText('detail-old-price', product.oldPrice ? money(product.oldPrice) : '');
    setText('detail-desc', product.description);
    setText('detail-material', product.material);
    setText('detail-weave', product.weave || '');
    setText('detail-style', product.style || '');
    setText('detail-size-info', product.sizeInfo);
    setText('detail-material-source', product.materialSource || '');
    setText('detail-developer', product.developer || '');
    setText('detail-manufacturer', product.manufacturer || '');
    setText('detail-development-year', product.developmentYear || '');
    setText('detail-care', product.care);
  }

  /* ---------- buttons ---------- */

  function paintWishlistState(button, isSaved) {
    if (!button) return;
    if (isSaved) {
      button.classList.remove('btn-outline-danger');
      button.classList.add('btn-danger');
      button.innerHTML = '<i class="bi bi-heart-fill me-1"></i>Đã yêu thích';
    } else {
      button.classList.remove('btn-danger');
      button.classList.add('btn-outline-danger');
      button.innerHTML = '<i class="bi bi-heart me-1"></i>Yêu thích';
    }
  }

  function isInWishlist(id) {
    // The wishlist manager keeps the live array, so prefer its API.
    if (window.wishlistManager && typeof window.wishlistManager.isInWishlist === 'function') {
      const saved = window.wishlistManager.isInWishlist(id);
      if (typeof saved === 'boolean') return saved;
    }

    const list = (typeof wishlistItems !== 'undefined' && Array.isArray(wishlistItems))
      ? wishlistItems
      : (window.wishlistItems || []);
    return list.some(function (item) {
      return item.id === id;
    });
  }

  function bindActions(product) {
    const cartBtn = document.getElementById('detail-add-cart');
    if (cartBtn && !cartBtn.dataset.bound) {
      cartBtn.dataset.bound = '1';
      cartBtn.addEventListener('click', function () {
        if (typeof window.addToCart === 'function') {
          window.addToCart(product.id, product.name, product.price, product.image, false);
        }
        const note = document.getElementById('detail-selected-size');
        if (note) {
          const size = selectedSize();
          note.textContent = 'Đã thêm vào giỏ' + (size ? ' - kích thước ' + size : '') + '.';
        }
      });
    }

    const wishBtn = document.getElementById('detail-add-wishlist');
    if (wishBtn && !wishBtn.dataset.bound) {
      wishBtn.dataset.bound = '1';
      paintWishlistState(wishBtn, isInWishlist(product.id));
      wishBtn.addEventListener('click', function () {
        if (typeof window.addToWishlist === 'function') {
          window.addToWishlist(product.id, product.name, product.price, product.image, product.description, false);
          setTimeout(function () {
            paintWishlistState(wishBtn, isInWishlist(product.id));
          }, 60);
        }
      });
    }
  }

  /* ---------- related products ---------- */

  function relatedCard(product) {
    const col = document.createElement('div');
    col.className = 'col';

    const card = document.createElement('div');
    card.className = 'card product-card h-100';
    card.dataset.productId = product.id;

    const image = document.createElement('img');
    image.src = product.image;
    image.alt = product.name;
    image.className = 'card-img-top';

    const body = document.createElement('div');
    body.className = 'card-body';

    const name = document.createElement('h5');
    name.className = 'card-title';
    name.textContent = product.name;

    const description = document.createElement('p');
    description.className = 'product-description';
    description.textContent = product.description || '';

    const prices = document.createElement('div');
    prices.className = 'd-flex align-items-center mb-3';

    const price = document.createElement('span');
    price.className = 'price';
    price.textContent = money(product.price);
    prices.appendChild(price);

    if (product.oldPrice) {
      const oldPrice = document.createElement('span');
      oldPrice.className = 'old-price';
      oldPrice.textContent = money(product.oldPrice);
      prices.appendChild(oldPrice);
    }

    const actions = document.createElement('div');
    actions.className = 'd-flex justify-content-between';

    const detailUrl = (product.detailPage || 'all-products.html') + '?id=' + encodeURIComponent(product.id);
    card.tabIndex = 0;
    card.setAttribute('role', 'link');
    card.setAttribute('aria-label', 'Xem ' + product.name);
    card.dataset.detailUrl = detailUrl;
    card.style.cursor = 'pointer';

    const wishlist = document.createElement('button');
    wishlist.type = 'button';
    wishlist.className = 'btn btn-outline-danger wishlist-btn btn-sm';
    wishlist.title = 'Thêm vào danh sách yêu thích';
    wishlist.innerHTML = '<i class="bi bi-heart"></i>';
    actions.appendChild(wishlist);
    body.appendChild(name);
    body.appendChild(description);
    body.appendChild(prices);
    body.appendChild(actions);
    card.appendChild(image);
    card.appendChild(body);
    col.appendChild(card);
    return col;
  }

  function renderRelated(product) {
    const row = document.getElementById('related-row');
    if (!row) return;

    const related = productsOfCategory(product.category)
      .filter(function (p) { return p.id !== product.id; })
      .slice(0, 3);

    row.replaceChildren();
    related.forEach(function (relatedProduct) {
      row.appendChild(relatedCard(relatedProduct));
    });

    // Reflect the saved state on the small heart buttons.
    row.querySelectorAll('.wishlist-btn').forEach(function (button, index) {
      const item = related[index];
      if (item && isInWishlist(item.id)) {
        button.classList.remove('btn-outline-danger');
        button.classList.add('btn-danger');
        button.innerHTML = '<i class="bi bi-heart-fill"></i>';
      }
    });
  }

  /* ---------- init ---------- */

  function init() {
    const section = document.getElementById('product-detail');
    if (!section) return;

    const category = section.getAttribute('data-category') || DEFAULT_CATEGORY;
    let product = findProduct(getProductId());

    if (!product || product.category !== category) {
      const fallback = productsOfCategory(category);
      product = fallback[0] || product;
    }

    if (!product) {
      console.warn('detail-page.js: no product found for category', category);
      return;
    }

    currentProduct = product;
    renderGallery(product);
    renderInfo(product);
    renderSizes(product);
    bindActions(product);
    renderRelated(product);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
