// Получаем модальное окно по id.
const orderDialog = document.getElementById('order-dialog');

// Получаем все кнопки заказа в карточках товаров.
const orderButtons = document.querySelectorAll('.product-card__button, .product-page__button');

// Получаем кнопку закрытия модального окна.
const closeDialogButton = document.getElementById('close-order-dialog');

// Получаем скрытое поле, в которое будет записан выбранный товар.
const selectedProductInput = document.getElementById('selected-product');

// Перебираем все кнопки «Заказать».
orderButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const productName = button.dataset.product;
        selectedProductInput.value = productName;
        
        orderDialog.showModal();
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            const nameInput = document.getElementById('order-name');
            if (nameInput) {
                // preventScroll: true не дает окну прокручиваться при фокусе
                nameInput.focus({ preventScroll: true }); 
            }
        }, 50);
    });
});

// Закрываем модальное окно по кнопке «Закрыть».
closeDialogButton.addEventListener('click', () => {
    orderDialog.close();
});

// Получаем форму заявки.
const orderForm = document.getElementById('order-form');

// Получаем сообщение об успешной отправке.
const successMessage = document.getElementById('success-message');

// Обрабатываем отправку формы.
orderForm.addEventListener('submit', (event) => {
    // Отменяем стандартную отправку формы,
    // потому что backend пока не подключён.
    event.preventDefault();

    // Сбрасываем предыдущие признаки ошибок.
    const formElements = Array.from(orderForm.elements);

    formElements.forEach((element) => {
        if (element.willValidate) {
            element.removeAttribute('aria-invalid');
        }
    });

    // Проверяем встроенные HTML-ограничения формы.
    if (!orderForm.checkValidity()) {
        formElements.forEach((element) => {
            if (element.willValidate && !element.checkValidity()) {
                element.setAttribute('aria-invalid', 'true');
            }
        });

        // Показываем стандартные сообщения браузера.
        orderForm.reportValidity();
        return;
    }

    // Показываем сообщение об успешной отправке.
    successMessage.hidden = false;

    // Очищаем форму.
    orderForm.reset();

    // Закрываем модальное окно.
    orderDialog.close();
});

// Улучшенное модальное окно: закрытие по крестику и клику на фон
const closeDialogX = document.querySelector('.order-dialog__close');

if (closeDialogX) {
    closeDialogX.addEventListener('click', () => {
        orderDialog.close();
    });
}

// Закрытие по клику на затемненный фон (backdrop)
orderDialog.addEventListener('click', (event) => {
    const rect = orderDialog.getBoundingClientRect();
    const isInDialog = (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
    );
    
    if (!isInDialog) {
        orderDialog.close();
    }
});
orderDialog.addEventListener('close', () => {
    document.body.style.overflow = '';
});