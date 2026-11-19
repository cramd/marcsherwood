/**
 * 2013 BMW F800GS Sales Page — interactions
 */

document.addEventListener("DOMContentLoaded", () => {
  initThemeManager();
  initMobileMenu();
  initGalleryLightbox();
  initGalleryExpand();
  initHeaderScroll();
  initScrollCue();
});

function initGalleryExpand() {
  const shell = document.querySelector(".f800gs-gallery-shell");
  const toggle = document.getElementById("f800gs-gallery-toggle");
  const label = toggle?.querySelector(".f800gs-gallery-toggle-label");
  const extraItems = document.querySelectorAll(".f800gs-gallery-item--extra");
  if (!shell || !toggle) return;

  const extraCount = extraItems.length;

  function setExpanded(expanded) {
    shell.classList.toggle("is-collapsed", !expanded);
    toggle.setAttribute("aria-expanded", String(expanded));
    if (label) {
      label.textContent = expanded ? "Show fewer photos" : `Show ${extraCount} more photos`;
    }
  }

  setExpanded(false);

  toggle.addEventListener("click", () => {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    setExpanded(!isExpanded);
  });
}

function initScrollCue() {
  const cue = document.querySelector(".f800gs-scroll-cue");
  if (!cue) return;

  function updateCueVisibility() {
    cue.classList.toggle("is-hidden", window.scrollY > 80);
  }

  updateCueVisibility();
  window.addEventListener("scroll", updateCueVisibility, { passive: true });
}

function initThemeManager() {
  const themeToggle = document.getElementById("theme-toggle");
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  if (!themeToggle) return;

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (metaColorScheme) {
      metaColorScheme.content = theme === "dark" ? "dark" : "light";
    }
    localStorage.setItem("color-scheme", theme);
  }

  function getCurrentTheme() {
    const saved = localStorage.getItem("color-scheme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  themeToggle.addEventListener("click", () => {
    const current = getCurrentTheme();
    applyTheme(current === "dark" ? "light" : "dark");
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
    if (!localStorage.getItem("color-scheme")) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });
}

function initMobileMenu() {
  const header = document.getElementById("main-header");
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const navLinks = document.querySelectorAll(".nav-link");
  if (!toggleBtn || !header) return;

  function toggleMenu(forceClose = false) {
    const isOpen = header.classList.contains("menu-open");
    const shouldOpen = forceClose ? false : !isOpen;
    header.classList.toggle("menu-open", shouldOpen);
    toggleBtn.setAttribute("aria-expanded", String(shouldOpen));
  }

  toggleBtn.addEventListener("click", () => toggleMenu());
  navLinks.forEach((link) => link.addEventListener("click", () => toggleMenu(true)));
  document.addEventListener("click", (event) => {
    if (header.classList.contains("menu-open") && !header.contains(event.target)) {
      toggleMenu(true);
    }
  });
}

function initHeaderScroll() {
  const header = document.getElementById("main-header");
  if (!header) return;

  function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 40);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function initGalleryLightbox() {
  const lightbox = document.getElementById("f800gs-lightbox");
  const lightboxImg = document.getElementById("f800gs-lightbox-img");
  const lightboxCaption = document.getElementById("f800gs-lightbox-caption");
  const closeBtn = document.getElementById("f800gs-lightbox-close");
  const prevBtn = document.getElementById("f800gs-lightbox-prev");
  const nextBtn = document.getElementById("f800gs-lightbox-next");
  const galleryItems = Array.from(document.querySelectorAll("[data-gallery-index]"));

  if (!lightbox || !lightboxImg || galleryItems.length === 0) return;

  let currentIndex = 0;

  function showImage(index) {
    const item = galleryItems[index];
    if (!item) return;
    currentIndex = index;
    lightboxImg.src = item.dataset.fullSrc || item.querySelector("img").src;
    lightboxImg.alt = item.querySelector("img").alt;
    if (lightboxCaption) {
      lightboxCaption.textContent = item.dataset.caption || "";
    }
  }

  function openLightbox(index) {
    showImage(index);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
  });

  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  prevBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    showImage((currentIndex - 1 + galleryItems.length) % galleryItems.length);
  });

  nextBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    showImage((currentIndex + 1) % galleryItems.length);
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showImage((currentIndex - 1 + galleryItems.length) % galleryItems.length);
    if (event.key === "ArrowRight") showImage((currentIndex + 1) % galleryItems.length);
  });
}
