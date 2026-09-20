/* ==========================================================
   script.js | Smart kassa by XORAZM ETM
   ========================================================== */

(function () {
  "use strict";

  /* ---------- 1. Telefondagi menyu ---------- */
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("mainNav");

  function setMenu(open) {
    if (!menuBtn || !nav) return;
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Menyuni yopish" : "Menyuni ochish");
  }

  if (menuBtn && nav) {
    // Tugma bosilganda ochiladi yoki yopiladi
    menuBtn.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });

    // Menyudagi biror silka bosilsa, menyu yopiladi
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    // Menyudan tashqariga bosilsa, yopiladi
    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(e.target) || menuBtn.contains(e.target)) return;
      setMenu(false);
    });

    // Esc tugmasi bosilsa, yopiladi
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        menuBtn.focus();
      }
    });

    // Ekran kengayib, menyu oddiy ko'rinishga o'tsa, yopib qo'yamiz
    const desktop = window.matchMedia("(min-width: 861px)");
    desktop.addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- 2. Pastdagi yil ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 3. Menyuda hozirgi bo'limni belgilash ---------- */
  if (nav && "IntersectionObserver" in window) {
    const links = Array.from(nav.querySelectorAll('a.nav__link[href^="#"]'));
    const byId = {};
    links.forEach(function (a) {
      byId[a.getAttribute("href").slice(1)] = a;
    });

    function setActive(id) {
      links.forEach(function (a) {
        const on = byId[id] === a;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" } // ekran o'rtasidagi bo'lim tanlanadi
    );

    Object.keys(byId).forEach(function (id) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    // Sahifaning eng tepasida hech qaysi silka belgilanmasin
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY < 300) setActive(null);
      },
      { passive: true }
    );
  }
})();
