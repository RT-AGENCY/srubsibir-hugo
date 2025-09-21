/**
 * Основной JavaScript файл для сайта СрубСибирь
 */

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function () {
  // Инициализация всех компонентов
  initMobileMenu();
  initMobileSearch();
  initDesktopSearch();
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
  const mobileMenuClose = document.getElementById('mobile-menu-close'); // Новая кнопка закрытия
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const body = document.body;

  if (!mobileToggle || !mobileMenu) return;

  // Переменная для сохранения позиции скролла
  let scrollPosition = 0;

  /**
   * Открытие мобильного меню
   */
  function openMobileMenu() {
    // Сохраняем текущую позицию скролла
    scrollPosition = window.pageYOffset;

    // Блокируем скролл body
    body.style.position = 'fixed';
    body.style.top = `-${scrollPosition}px`;
    body.style.width = '100%';
    body.classList.add('mobile-menu-open');

    // Показываем меню
    mobileMenu.classList.remove('closing');
    mobileMenu.classList.add('active');
    mobileToggle.classList.add('active');

    // Анимация кнопки-гамбургера
    animateHamburger(true);

    console.log('Мобильное меню открыто');
  }

  /**
   * Закрытие мобильного меню
   */
  function closeMobileMenu() {
    // Добавляем класс закрытия для анимации
    mobileMenu.classList.add('closing');
    mobileToggle.classList.remove('active');

    // Анимация кнопки-гамбургера
    animateHamburger(false);

    // Восстанавливаем скролл body
    body.classList.remove('mobile-menu-open');
    body.style.position = '';
    body.style.top = '';
    body.style.width = '';

    // Восстанавливаем позицию скролла
    window.scrollTo(0, scrollPosition);

    // Убираем классы после анимации
    setTimeout(() => {
      mobileMenu.classList.remove('active', 'closing');
    }, 300);

    console.log('Мобильное меню закрыто');
  }

  /**
   * Анимация гамбургера
   */
  function animateHamburger(isActive) {
    const spans = mobileToggle.querySelectorAll('span');
    spans.forEach((span, index) => {
      if (isActive) {
        if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
        if (index === 1) span.style.opacity = '0';
        if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
      } else {
        span.style.transform = 'none';
        span.style.opacity = '1';
      }
    });
  }

  // Переключение мобильного меню по клику на кнопку-гамбургер
  mobileToggle.addEventListener('click', function (e) {
    e.stopPropagation();

    if (mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // НОВЫЙ обработчик: Закрытие по кнопке крестика
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', function (e) {
      e.stopPropagation();
      closeMobileMenu();
    });
  }

  // Закрытие меню при клике на ссылку
  mobileLinks.forEach(link => {
    link.addEventListener('click', function () {
      closeMobileMenu();
    });
  });

  // Закрытие меню при клике вне его
  document.addEventListener('click', function (e) {
    if (mobileMenu.classList.contains('active') &&
      !mobileMenu.contains(e.target) &&
      !mobileToggle.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Закрытие меню по клавише Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // Предотвращаем закрытие при клике внутри меню
  mobileMenu.addEventListener('click', function (e) {
    e.stopPropagation();
  });

  // Обработка изменения размера окна
  window.addEventListener('resize', debounce(function () {
    // Закрываем меню если экран стал больше
    if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  }, 250));

  // Экспорт функций в глобальный объект
  window.SrubSibir = window.SrubSibir || {};
  window.SrubSibir.openMobileMenu = openMobileMenu;
  window.SrubSibir.closeMobileMenu = closeMobileMenu;
}

function initDesktopSearch() {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  if (!searchForm || !searchInput) {
    return;
  }

  // Обработка отправки десктопной формы поиска
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const query = searchInput.value.trim();
    if (query.length >= 2) {
      // Показываем состояние загрузки
      searchForm.classList.add('loading');

      // Перенаправляем на страницу результатов поиска
      setTimeout(() => {
        window.location.href = `/search/?query=${encodeURIComponent(query)}`;
      }, 300);
    } else {
      // Показываем уведомление о минимальной длине запроса
      showNotification('Введите минимум 2 символа для поиска', 'warning');
    }
  });
}

/**
 * Мобильный поиск - скрытый по умолчанию
 */
function initMobileSearch() {
  // Элементы мобильного поиска
  const mobileSearchToggle = document.getElementById('mobile-search-toggle');
  const mobileSearch = document.getElementById('mobile-search');
  const mobileSearchClose = document.getElementById('mobile-search-close');
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  const mobileSearchForm = document.querySelector('.mobile-search-form');
  const body = document.body;

  // Проверяем наличие элементов
  if (!mobileSearchToggle || !mobileSearch) {
    console.log('Элементы мобильного поиска не найдены');
    return;
  }

  /**
   * Открытие мобильного поиска
   */
  mobileSearchToggle.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    // Добавляем классы для анимации
    mobileSearch.classList.remove('closing');
    mobileSearch.classList.add('active');
    mobileSearchToggle.classList.add('active');

    // Блокируем скролл body
    body.classList.add('mobile-search-open');

    // Фокус на поле ввода с задержкой для анимации
    setTimeout(() => {
      if (mobileSearchInput) {
        mobileSearchInput.focus();
      }
    }, 300);

    console.log('Мобильный поиск открыт');
  });

  /**
   * Закрытие мобильного поиска
   */
  function closeMobileSearch() {
    // Анимация закрытия
    mobileSearch.classList.add('closing');
    mobileSearchToggle.classList.remove('active');

    // Убираем блокировку скролла
    body.classList.remove('mobile-search-open');

    // Очищаем поле ввода
    if (mobileSearchInput) {
      mobileSearchInput.value = '';
    }

    // Скрываем результаты поиска
    const mobileSearchResults = document.getElementById('mobileSearchResults');
    if (mobileSearchResults) {
      mobileSearchResults.style.display = 'none';
      mobileSearchResults.innerHTML = '';
    }

    // Удаляем активные классы после анимации
    setTimeout(() => {
      mobileSearch.classList.remove('active', 'closing');
    }, 300);

    console.log('Мобильный поиск закрыт');
  }

  // Кнопка закрытия
  if (mobileSearchClose) {
    mobileSearchClose.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeMobileSearch();
    });
  }

  /**
   * Закрытие по Escape
   */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileSearch.classList.contains('active')) {
      closeMobileSearch();
    }
  });

  /**
   * Закрытие при клике вне области поиска
   */
  document.addEventListener('click', function (e) {
    // Проверяем, что поиск открыт
    if (!mobileSearch.classList.contains('active')) return;

    // Если клик внутри области поиска - не закрываем
    if (mobileSearch.contains(e.target) || mobileSearchToggle.contains(e.target)) {
      return;
    }

    // Закрываем поиск
    closeMobileSearch();
  });

  /**
   * Предотвращаем закрытие при клике внутри формы поиска
   */
  if (mobileSearchForm) {
    mobileSearchForm.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    // Обработка отправки мобильной формы поиска
    mobileSearchForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const query = mobileSearchInput.value.trim();
      if (query.length >= 2) {
        // Показываем состояние загрузки
        mobileSearchForm.classList.add('loading');

        // Перенаправляем на страницу результатов поиска
        setTimeout(() => {
          window.location.href = `/search/?query=${encodeURIComponent(query)}`;
        }, 300);
      } else {
        // Показываем уведомление о минимальной длине запроса
        showNotification('Введите минимум 2 символа для поиска', 'warning');
      }
    });
  }

  // Экспорт функций в глобальный объект
  window.SrubSibir = window.SrubSibir || {};
  window.SrubSibir.openMobileSearch = () => mobileSearchToggle.click();
  window.SrubSibir.closeMobileSearch = closeMobileSearch;
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

        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
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
        bottom: 92px;
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
  window.addEventListener('scroll', debounce(function () {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.style.opacity = '1';
      scrollToTopBtn.style.visibility = 'visible';
    } else {
      scrollToTopBtn.style.opacity = '0';
      scrollToTopBtn.style.visibility = 'hidden';
    }
  }, 100));

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
  const originalText = submitBtn ? submitBtn.textContent : '';

  if (submitBtn) {
    // Показываем процесс отправки
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
  }

  // Имитируем задержку сети
  setTimeout(() => {
    // Здесь должна быть реальная отправка на сервер
    console.log('Данные формы:', data);

    // Показываем успешное сообщение
    showNotification('Сообщение отправлено успешно!', 'success');

    // Очищаем форму
    form.reset();

    // Восстанавливаем кнопку
    if (submitBtn) {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
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
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
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
      if (document.body.contains(lightbox)) {
        document.body.removeChild(lightbox);
      }
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

// Проверка на мобильное устройство
function isMobileDevice() {
  return window.innerWidth <= 768;
}

// Экспорт функций для использования в других скриптах
window.SrubSibir = window.SrubSibir || {};
Object.assign(window.SrubSibir, {
  showNotification,
  openLightbox,
  debounce,
  throttle,
  isSupported,
  isMobileDevice
});