/**
 * Основной JavaScript файл для сайта
 */

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function () {
  // Инициализация всех компонентов
  initMobileMenu();
  initSmoothScroll();
  initScrollToTop();
  initContactForm();
  initImageLightbox();

  console.log('Сайт загружен и готов к работе!');
});

/**
 * Мобильное меню
 */
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!mobileToggle || !mobileMenu) return;

  // Переключение мобильного меню
  mobileToggle.addEventListener('click', function () {
    mobileMenu.classList.toggle('active');
    mobileToggle.classList.toggle('active');

    // Анимация кнопки-гамбургера
    const spans = mobileToggle.querySelectorAll('span');
    spans.forEach((span, index) => {
      if (mobileToggle.classList.contains('active')) {
        if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
        if (index === 1) span.style.opacity = '0';
        if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
      } else {
        span.style.transform = 'none';
        span.style.opacity = '1';
      }
    });
  });

  // Закрытие меню при клике на ссылку
  mobileLinks.forEach(link => {
    link.addEventListener('click', function () {
      mobileMenu.classList.remove('active');
      mobileToggle.classList.remove('active');

      const spans = mobileToggle.querySelectorAll('span');
      spans.forEach(span => {
        span.style.transform = 'none';
        span.style.opacity = '1';
      });
    });
  });

  // Закрытие меню при клике вне его
  document.addEventListener('click', function (e) {
    if (!mobileToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('active');
      mobileToggle.classList.remove('active');

      const spans = mobileToggle.querySelectorAll('span');
      spans.forEach(span => {
        span.style.transform = 'none';
        span.style.opacity = '1';
      });
    }
  });
}

/**
 * Плавная прокрутка к якорям
 */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      // Проверяем, что это не просто #
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();

        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = target.offsetTop - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Кнопка "Наверх"
 */
function initScrollToTop() {
  // Создаем кнопку "Наверх"
  const scrollToTopBtn = document.createElement('button');
  scrollToTopBtn.innerHTML = '↑';
  scrollToTopBtn.className = 'scroll-to-top';
  scrollToTopBtn.setAttribute('aria-label', 'Прокрутить наверх');
  scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--color-primary);
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
    `;

  document.body.appendChild(scrollToTopBtn);

  // Показ/скрытие кнопки при прокрутке
  window.addEventListener('scroll', function () {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.style.opacity = '1';
      scrollToTopBtn.style.visibility = 'visible';
    } else {
      scrollToTopBtn.style.opacity = '0';
      scrollToTopBtn.style.visibility = 'hidden';
    }
  });

  // Прокрутка наверх при клике
  scrollToTopBtn.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Обработка форм обратной связи
 */
function initContactForm() {
  const forms = document.querySelectorAll('.contact-form');

  forms.forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Получаем данные формы
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Простая валидация
      if (validateForm(data)) {
        // Имитация отправки (замените на реальную отправку)
        simulateFormSubmission(form, data);
      }
    });
  });
}

/**
 * Валидация формы
 */
function validateForm(data) {
  let isValid = true;
  const errors = [];

  // Проверка имени
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Имя должно содержать минимум 2 символа');
    isValid = false;
  }

  // Проверка email
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Введите корректный email');
    isValid = false;
  }

  // Проверка телефона (если есть)
  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('Введите корректный номер телефона');
    isValid = false;
  }

  // Проверка сообщения
  if (!data.message || data.message.trim().length < 10) {
    errors.push('Сообщение должно содержать минимум 10 символов');
    isValid = false;
  }

  // Показываем ошибки
  if (!isValid) {
    showNotification('Ошибка: ' + errors.join(', '), 'error');
  }

  return isValid;
}

/**
 * Проверка email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Проверка телефона
 */
function isValidPhone(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Имитация отправки формы
 */
function simulateFormSubmission(form, data) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  // Показываем процесс отправки
  submitBtn.textContent = 'Отправка...';
  submitBtn.disabled = true;

  // Имитируем задержку сети
  setTimeout(() => {
    // Здесь должна быть реальная отправка на сервер
    console.log('Данные формы:', data);

    // Показываем успешное сообщение
    showNotification('Сообщение отправлено успешно!', 'success');

    // Очищаем форму
    form.reset();

    // Восстанавливаем кнопку
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

  }, 2000);
}

/**
 * Показ уведомлений
 */
function showNotification(message, type = 'info') {
  // Создаем элемент уведомления
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;

  // Устанавливаем цвет в зависимости от типа
  switch (type) {
    case 'success':
      notification.style.backgroundColor = '#28a745';
      break;
    case 'error':
      notification.style.backgroundColor = '#dc3545';
      break;
    case 'warning':
      notification.style.backgroundColor = '#ffc107';
      notification.style.color = '#000';
      break;
    default:
      notification.style.backgroundColor = '#17a2b8';
  }

  document.body.appendChild(notification);

  // Анимация появления
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Автоматическое скрытие
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 5000);
}

/**
 * Лайтбокс для изображений
 */
function initImageLightbox() {
  const images = document.querySelectorAll('.lightbox-image, .gallery img');

  images.forEach(img => {
    img.addEventListener('click', function () {
      openLightbox(this.src, this.alt);
    });

    // Добавляем курсор указатель
    img.style.cursor = 'pointer';
  });
}

/**
 * Открытие лайтбокса
 */
function openLightbox(src, alt = '') {
  // Создаем элементы лайтбокса
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 5px;
    `;

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 30px;
        background: none;
        border: none;
        color: white;
        font-size: 40px;
        cursor: pointer;
        z-index: 10001;
    `;

  lightbox.appendChild(img);
  lightbox.appendChild(closeBtn);
  document.body.appendChild(lightbox);

  // Анимация появления
  setTimeout(() => {
    lightbox.style.opacity = '1';
  }, 100);

  // Закрытие лайтбокса
  const closeLightbox = () => {
    lightbox.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(lightbox);
    }, 300);
  };

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Закрытие по Escape
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      closeLightbox();
      document.removeEventListener('keydown', escHandler);
    }
  });
}

/**
 * Утилиты
 */

// Дебаунс функция для оптимизации событий
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Троттлинг функция
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Проверка поддержки функций браузером
function isSupported() {
  return {
    localStorage: typeof (Storage) !== "undefined",
    fetch: typeof (fetch) !== "undefined",
    promises: typeof (Promise) !== "undefined"
  };
}

// Экспорт функций для использования в других скриптах
window.SrubSibir = {
  showNotification,
  openLightbox,
  debounce,
  throttle,
  isSupported
};