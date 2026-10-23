/**
 * Fazaia Inter College - App shell
 * View routing, mobile nav, hero slider, sticky header behaviour.
 */

(function () {
  "use strict";

  const VIEWS = ["home", "setup", "quiz", "results", "about"];

  function $(id) {
    return document.getElementById(id);
  }

  function showView(name) {
    const target = VIEWS.includes(name) ? name : "home";

    document.querySelectorAll("[data-view]").forEach((panel) => {
      const match = panel.getAttribute("data-view") === target;
      panel.classList.toggle("is-visible", match);
      panel.setAttribute("aria-hidden", match ? "false" : "true");
    });

    document.querySelectorAll("[data-nav]").forEach((link) => {
      const active = link.getAttribute("data-nav") === target;
      link.classList.toggle("nav-link-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Keep hash in sync for shareable deep links
    if (history.replaceState) {
      history.replaceState(null, "", target === "home" ? "#" : `#${target}`);
    }
  }

  function openMobileMenu() {
    $("mobile-drawer")?.classList.add("is-open");
    $("mobile-backdrop")?.classList.add("is-open");
    document.body.style.overflow = "hidden";
    $("btn-menu-open")?.setAttribute("aria-expanded", "true");
  }

  function closeMobileMenu() {
    $("mobile-drawer")?.classList.remove("is-open");
    $("mobile-backdrop")?.classList.remove("is-open");
    document.body.style.overflow = "";
    $("btn-menu-open")?.setAttribute("aria-expanded", "false");
  }

  function initHeroSlider() {
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    const counter = $("hero-counter");
    if (!slides.length) return;

    let index = 0;
    let timer;

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle("is-active", n === index));
      dots.forEach((d, n) => {
        d.classList.toggle("bg-gold", n === index);
        d.classList.toggle("bg-white/40", n !== index);
        d.setAttribute("aria-selected", n === index ? "true" : "false");
      });
      if (counter) {
        counter.textContent = `${String(index + 1).padStart(2, "0")}/${String(slides.length).padStart(2, "0")}`;
      }
    }

    function next() {
      goTo(index + 1);
    }

    function startAuto() {
      stopAuto();
      timer = setInterval(next, 6000);
    }

    function stopAuto() {
      if (timer) clearInterval(timer);
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        goTo(Number(dot.getAttribute("data-hero-dot")));
        startAuto();
      });
    });

    $("hero-next")?.addEventListener("click", () => {
      next();
      startAuto();
    });

    $("hero-prev")?.addEventListener("click", () => {
      goTo(index - 1);
      startAuto();
    });

    goTo(0);
    startAuto();
  }

  function initYear() {
    const el = $("footer-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function initNav() {
    document.querySelectorAll("[data-nav]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const view = link.getAttribute("data-nav");
        if (view === "quiz" || view === "setup") {
          window.FazaiaQuiz?.start();
        } else {
          showView(view);
        }
      });
    });

    $("btn-menu-open")?.addEventListener("click", openMobileMenu);
    $("btn-menu-close")?.addEventListener("click", closeMobileMenu);
    $("mobile-backdrop")?.addEventListener("click", closeMobileMenu);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMobileMenu();
    });

    // Hash routing on load
    const hash = (location.hash || "").replace("#", "");
    if (hash === "quiz" || hash === "setup") {
      // Defer so FazaiaQuiz.init has bound handlers / selects
      setTimeout(() => window.FazaiaQuiz?.start(), 0);
    } else if (VIEWS.includes(hash)) {
      showView(hash);
    } else {
      showView("home");
    }
  }

  function initSearch() {
    const form = $("site-search-form");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = new FormData(form).get("q");
      if (!q) return;
      // Lightweight demo: jump to quiz if query mentions quiz/mcq/test
      const lower = String(q).toLowerCase();
      if (/quiz|mcq|test|practice|exam/.test(lower)) {
        window.FazaiaQuiz?.start();
      } else {
        showView("about");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initHeroSlider();
    initYear();
    initSearch();
  });

  window.FazaiaApp = { showView, openMobileMenu, closeMobileMenu };
})();
