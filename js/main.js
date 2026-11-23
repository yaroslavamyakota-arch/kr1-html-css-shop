// Основные действия сайта PlantFuel

document.addEventListener('DOMContentLoaded', function () {
    // Мобильное меню
    const menuButton = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.site-nav');
    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(menu.classList.contains('is-open')));
        });
    }

    // Корзина сохраняется при переходе между страницами сайта
    let cart = [];
    try {
        cart = JSON.parse(sessionStorage.getItem('plantfuel-cart')) || [];
    } catch (error) {
        cart = [];
    }

    function saveCart() {
        try {
            sessionStorage.setItem('plantfuel-cart', JSON.stringify(cart));
        } catch (error) {
            // Корзина продолжит работать до перехода со страницы.
        }
    }
    const cartPanel = document.getElementById('cart-panel');
    const cartBackdrop = document.querySelector('.cart-backdrop');
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.querySelector('[data-cart-count]');
    const cartTotal = document.getElementById('cart-total');
    const orderDialog = document.getElementById('order-dialog');
    const orderForm = document.getElementById('order-form');
    const selectedProduct = document.getElementById('selected-product');
    const orderSummary = document.getElementById('order-cart-summary');
    const successMessage = document.getElementById('success-message');

    function showCart() {
        if (!cartItems) return;
        cartItems.innerHTML = '';
        let total = 0;
        let amount = 0;

        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="cart-empty">Корзина пока пуста. Добавьте товары из каталога.</p>';
        }

        cart.forEach(function (item, index) {
            const sum = item.price * item.quantity;
            total += sum;
            amount += item.quantity;
            const row = document.createElement('div');
            row.className = 'cart-item';
            row.innerHTML = `
                <div class="cart-item__name">${item.name}</div>
                <div class="cart-item__price">${sum.toLocaleString('ru-RU')} ₽</div>
                <div class="cart-item__controls">
                    <button type="button" data-action="minus" data-index="${index}">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" data-action="plus" data-index="${index}">+</button>
                    <button type="button" data-action="remove" data-index="${index}">Удалить</button>
                </div>`;
            cartItems.appendChild(row);
        });

        if (cartCount) cartCount.textContent = amount;
        if (cartTotal) cartTotal.textContent = total.toLocaleString('ru-RU') + ' ₽';
    }

    document.querySelectorAll('[data-product]').forEach(function (button) {
        button.addEventListener('click', function () {
            const name = button.dataset.product;
            const price = Number(button.dataset.price);
            const found = cart.find(function (item) { return item.name === name; });
            if (found) {
                found.quantity += 1;
            } else {
                cart.push({ name: name, price: price, quantity: 1 });
            }
            saveCart();
            showCart();
            button.textContent = 'Добавлено';
        });
    });

    document.querySelectorAll('[data-cart-open]').forEach(function (button) {
        button.addEventListener('click', function () {
            if (cartPanel) cartPanel.hidden = false;
            if (cartBackdrop) cartBackdrop.hidden = false;
        });
    });
    document.querySelectorAll('[data-cart-close]').forEach(function (button) {
        button.addEventListener('click', function () {
            if (cartPanel) cartPanel.hidden = true;
            if (cartBackdrop) cartBackdrop.hidden = true;
        });
    });

    if (cartItems) {
        cartItems.addEventListener('click', function (event) {
            const button = event.target.closest('[data-action]');
            if (!button) return;
            const item = cart[Number(button.dataset.index)];
            if (!item) return;
            if (button.dataset.action === 'plus') item.quantity += 1;
            if (button.dataset.action === 'minus') item.quantity -= 1;
            if (button.dataset.action === 'remove' || item.quantity <= 0) {
                cart.splice(Number(button.dataset.index), 1);
            }
            saveCart();
            showCart();
        });
    }

    const clearButton = document.querySelector('[data-cart-clear]');
    if (clearButton) {
        clearButton.addEventListener('click', function () {
            cart = [];
            saveCart();
            showCart();
        });
    }

    const checkoutButton = document.querySelector('[data-checkout]');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function () {
            if (cart.length === 0) return;
            let total = 0;
            let description = '';
            cart.forEach(function (item) {
                total += item.price * item.quantity;
                description += item.name + ' — ' + item.quantity + ' шт.\n';
            });
            if (selectedProduct) selectedProduct.value = description;
            if (orderSummary) {
                orderSummary.hidden = false;
                orderSummary.textContent = 'Состав заказа:\n' + description + 'Итого: ' + total.toLocaleString('ru-RU') + ' ₽';
            }
            if (cartPanel) cartPanel.hidden = true;
            if (cartBackdrop) cartBackdrop.hidden = true;
            if (orderDialog) orderDialog.showModal();
        });
    }

    document.querySelectorAll('[data-order-open]').forEach(function (button) {
        button.addEventListener('click', function () {
            if (orderDialog) orderDialog.showModal();
        });
    });

    const closeDialog = document.querySelector('.dialog-close');
    if (closeDialog && orderDialog) {
        closeDialog.addEventListener('click', function () { orderDialog.close(); });
    }
    if (orderForm) {
        orderForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (!orderForm.checkValidity()) {
                orderForm.reportValidity();
                return;
            }
            if (successMessage) successMessage.hidden = false;
            orderForm.reset();
            cart = [];
            saveCart();
            showCart();
        });
    }
    showCart();

    // Поиск и фильтр товаров в каталоге
    const search = document.getElementById('search-products');
    const priceFrom = document.getElementById('price-from');
    const priceTo = document.getElementById('price-to');
    const cards = document.querySelectorAll('#catalog-products .product-card');
    function filterProducts() {
        const phrase = search ? search.value.toLowerCase() : '';
        const min = priceFrom && priceFrom.value ? Number(priceFrom.value) : 0;
        const max = priceTo && priceTo.value ? Number(priceTo.value) : Infinity;
        cards.forEach(function (card) {
            const name = card.dataset.name.toLowerCase();
            const price = Number(card.dataset.price);
            card.hidden = !name.includes(phrase) || price < min || price > max;
        });
    }
    [search, priceFrom, priceTo].forEach(function (field) {
        if (field) field.addEventListener('input', filterProducts);
    });
    const resetFilters = document.getElementById('reset-filters');
    if (resetFilters) {
        resetFilters.addEventListener('click', function () {
            if (search) search.value = '';
            if (priceFrom) priceFrom.value = '';
            if (priceTo) priceTo.value = '';
            filterProducts();
        });
    }

    // Окно консультанта
    const chatButton = document.querySelector('.chat-launcher');
    const chatPanel = document.querySelector('.chat-panel');
    const chatClose = document.querySelector('.chat-close');
    if (chatButton && chatPanel) {
        chatButton.addEventListener('click', function () { chatPanel.hidden = !chatPanel.hidden; });
    }
    if (chatClose && chatPanel) {
        chatClose.addEventListener('click', function () { chatPanel.hidden = true; });
    }

    // Карусель отзывов: кнопки, точки и автоматическое переключение
    const reviewTrack = document.getElementById('review-track');
    const reviews = reviewTrack ? Array.from(reviewTrack.children) : [];
    const reviewDots = document.querySelectorAll('[data-review-dot]');
    const reviewWindow = document.querySelector('.review-window');
    let reviewNumber = 0;
    let reviewTimer;

    function showReview(number) {
        if (!reviewTrack || reviews.length === 0) return;
        reviewNumber = (number + reviews.length) % reviews.length;
        reviewTrack.style.transform = 'translateX(-' + reviewNumber * 100 + '%)';
        reviewDots.forEach(function (dot, index) {
            dot.classList.toggle('is-active', index === reviewNumber);
        });
    }

    function startReviewTimer() {
        if (reviews.length < 2) return;
        clearInterval(reviewTimer);
        reviewTimer = setInterval(function () {
            showReview(reviewNumber + 1);
        }, 5000);
    }

    const previousReview = document.querySelector('[data-review-prev]');
    const nextReview = document.querySelector('[data-review-next]');
    if (previousReview) previousReview.addEventListener('click', function () {
        showReview(reviewNumber - 1);
        startReviewTimer();
    });
    if (nextReview) nextReview.addEventListener('click', function () {
        showReview(reviewNumber + 1);
        startReviewTimer();
    });
    reviewDots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showReview(Number(dot.dataset.reviewDot));
            startReviewTimer();
        });
    });
    if (reviewWindow) {
        reviewWindow.addEventListener('mouseenter', function () { clearInterval(reviewTimer); });
        reviewWindow.addEventListener('mouseleave', startReviewTimer);
    }
    showReview(0);
    startReviewTimer();

    // Выпадающее меню каталога
    document.querySelectorAll('.nav-dropdown__toggle').forEach(function (button) {
        const dropdown = button.closest('.nav-dropdown');

        button.addEventListener('click', function (event) {
            event.stopPropagation();
            const isOpen = dropdown.classList.toggle('is-open');
            button.setAttribute('aria-expanded', String(isOpen));
        });

        dropdown.querySelectorAll('.nav-dropdown__menu a').forEach(function (link) {
            link.addEventListener('click', function () {
                dropdown.classList.remove('is-open');
                button.setAttribute('aria-expanded', 'false');
            });
        });
    });

    // Закрываем меню при клике вне него или по Escape
    document.addEventListener('click', function (event) {
        if (!event.target.closest('.nav-dropdown')) {
            document.querySelectorAll('.nav-dropdown.is-open').forEach(function (dropdown) {
                dropdown.classList.remove('is-open');
                const button = dropdown.querySelector('.nav-dropdown__toggle');
                if (button) button.setAttribute('aria-expanded', 'false');
            });
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            document.querySelectorAll('.nav-dropdown.is-open').forEach(function (dropdown) {
                dropdown.classList.remove('is-open');
                const button = dropdown.querySelector('.nav-dropdown__toggle');
                if (button) button.setAttribute('aria-expanded', 'false');
            });
        }
    });



    // Подсказка по выбранному способу доставки
    const deliveryMethod = document.getElementById('delivery-method');
    const deliveryCity = document.getElementById('delivery-city');
    const deliveryResult = document.getElementById('delivery-result');

    function updateDeliveryInfo() {
        if (!deliveryMethod || !deliveryResult) return;

        const city = deliveryCity ? deliveryCity.value.trim() : '';
        let title = '';
        let message = '';

        if (deliveryMethod.value === 'courier') {
            title = 'Курьер по Москве';
            message = city
                ? 'Для адреса «' + city + '» ориентир — 1–2 рабочих дня. Точную дату и стоимость подтвердим после проверки адреса и состава заказа.'
                : 'Ориентир по Москве — 1–2 рабочих дня. Точную дату и стоимость подтвердим после уточнения адреса и состава заказа.';
        } else if (deliveryMethod.value === 'pickup') {
            title = 'Самовывоз в Москве';
            message = 'Самовывоз бесплатный. Обычно заказ можно забрать через 1–2 рабочих дня после подтверждения наличия. Адрес точки указан на Яндекс.Карте; время согласуйте заранее.';
        } else {
            title = 'Доставка по России';
            message = city
                ? 'Для города «' + city + '» ориентир — 3–10 рабочих дней. Точный срок и стоимость зависят от службы и будут подтверждены перед отправкой.'
                : 'Ориентир по России — 3–10 рабочих дней. Укажите город, чтобы консультант уточнил доступную службу, срок и стоимость.';
        }

        deliveryResult.querySelector('strong').textContent = title;
        deliveryResult.querySelector('p').textContent = message;
    }

    if (deliveryMethod) deliveryMethod.addEventListener('change', updateDeliveryInfo);
    if (deliveryCity) deliveryCity.addEventListener('input', updateDeliveryInfo);
    updateDeliveryInfo();

    // Кнопка «Наверх»
    const topButton = document.querySelector('.to-top');
    if (topButton) {
        window.addEventListener('scroll', function () {
            topButton.classList.toggle('is-visible', window.scrollY > 400);
        });
        topButton.addEventListener('click', function () {
            window.scrollTo(0, 0);
        });
    }
});
