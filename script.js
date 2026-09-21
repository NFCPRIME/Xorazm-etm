/* ==========================================================
   script.js | Smart kassa by XORAZM ETM
   ========================================================== */

(function () {
  "use strict";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

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
    menuBtn.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(e.target) || menuBtn.contains(e.target)) return;
      setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        menuBtn.focus();
      }
    });
    window.matchMedia("(min-width: 861px)").addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- 2. Pastdagi yil ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 3. Menyuda hozirgi bo'limni belgilash ---------- */
  if (nav && "IntersectionObserver" in window) {
    const links = $$('a.nav__link[href^="#"]', nav);
    const byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

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
        entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    Object.keys(byId).forEach(function (id) {
      const s = document.getElementById(id);
      if (s) observer.observe(s);
    });
    window.addEventListener("scroll", function () {
      if (window.scrollY < 300) setActive(null);
    }, { passive: true });
  }

  /* ==========================================================
     4. ADMIN PANELDAN KELGAN MA'LUMOTLAR (data/*.json)
     Fayl o'qilmasa, index.html dagi tayyor matn o'z holicha qoladi.
     ========================================================== */

  const telA = $('a[href^="tel:"]');
  const tgA = $('a[href*="t.me"]');
  const igA = $('a[href*="instagram.com"]');
  let telHref = telA ? telA.getAttribute("href") : "tel:+998900000000";
  let tgHref = tgA ? tgA.getAttribute("href") : "https://t.me/xorazm_etm";
  let igHref = igA ? igA.getAttribute("href") : "https://instagram.com/xorazm_etm_";
  let kanalHref = "";

  async function oqi(nom) {
    try {
      const r = await fetch("data/" + nom + ".json", { cache: "no-cache" });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) {
      return null;
    }
  }
  const royxat = (d) => (d && Array.isArray(d.items) ? d.items : null);

  // "/images/a.png" ni "images/a.png" ga aylantiradi (GitHub Pages uchun kerak)
  function rasmYoli(p) {
    p = String(p || "").trim();
    if (!p) return "";
    if (/^(https?:)?\/\//i.test(p) || p.indexOf("data:") === 0) return p;
    return p.replace(/^\/+/, "");
  }

  // "@nom" yoki "t.me/nom" yozilsa ham to'g'ri silka qiladi
  function silka(u, baza) {
    u = String(u || "").trim();
    if (!u) return "";
    if (u.charAt(0) === "@") return baza + u.slice(1);
    if (!/^https?:\/\//i.test(u)) return "https://" + u;
    return u;
  }

  function sanaFormat(iso) {
    const oy = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return d.getDate() + "-" + oy[d.getMonth()] + ", " + d.getFullYear();
  }

  // Pastdagi silkalar: Telegram, Telegram kanal, Instagram
  function ijtimoiy() {
    const box = document.getElementById("socialLinks");
    if (!box) return;
    const royxatt = [
      ["Telegram", tgHref],
      ["Telegram kanal", kanalHref],
      ["Instagram", igHref]
    ].filter(function (x) { return x[1]; });
    box.innerHTML = royxatt.map(function (x) {
      return '<a href="' + esc(x[1]) + '" target="_blank" rel="noopener">' + x[0] + "</a>";
    }).join("");
  }

  function sozlamalar(s) {
    if (!s) return;

    if (s.telefon) telHref = "tel:" + String(s.telefon).replace(/[^\d+]/g, "");
    if (s.telegram) tgHref = silka(s.telegram, "https://t.me/");
    if (s.instagram) igHref = silka(s.instagram, "https://instagram.com/");
    kanalHref = silka(s.telegram_kanal, "https://t.me/");

    if (s.hero_sarlavha && $(".hero__title")) $(".hero__title").textContent = s.hero_sarlavha;
    if (s.hero_matn && $(".hero__lead")) $(".hero__lead").textContent = s.hero_matn;

    const abzatslar = $$(".about__text > p");
    if (s.haqida_1 && abzatslar[0]) abzatslar[0].textContent = s.haqida_1;
    if (s.haqida_2 && abzatslar[1]) abzatslar[1].textContent = s.haqida_2;

    $$(".contact__row").forEach(function (row) {
      const dt = $("dt", row), dd = $("dd", row);
      if (!dt || !dd) return;
      const k = dt.textContent.trim().toLowerCase();
      if (k === "telefon" && s.telefon) {
        const a = $("a", dd);
        if (a) a.textContent = s.telefon; else dd.textContent = s.telefon;
      }
      if (k === "manzil" && s.manzil) dd.textContent = s.manzil;
      if (k === "ish vaqti" && s.ish_vaqti) dd.textContent = s.ish_vaqti;
    });

    const xarita = $(".contact__map iframe");
    if (xarita && s.xarita) {
      xarita.src = "https://maps.google.com/maps?q=" + encodeURIComponent(s.xarita) + "&output=embed";
    }

    const lp = rasmYoli(s.logo_poscode);
    if (lp) $$(".brand__logo, .poscode__brand img").forEach(function (i) { i.src = lp; });
    const le = rasmYoli(s.logo_etm);
    if (le) $$(".about__logo img, .footer__brand img").forEach(function (i) { i.src = le; });

    ijtimoiy();
  }

  function chizMahsulotlar(items) {
    const box = $(".product-grid");
    if (!box || !items) return;
    if (!items.length) {
      box.innerHTML = '<p class="section__lead">Mahsulotlar tez orada qo\'shiladi.</p>';
      return;
    }
    box.innerHTML = items.map(function (m) {
      const rasm = rasmYoli(m.rasm);
      const media = rasm
        ? '<img class="card__img" src="' + esc(rasm) + '" alt="' + esc(m.nomi) + '" width="640" height="400" loading="lazy">'
        : '<div class="card__img"></div>';
      const narx = String(m.narx || "").trim();
      const narxHtml = narx
        ? '<p class="price">' + esc(narx) + "</p>"
        : '<p class="price price--ask">Narxini so\'rang</p>';
      return (
        '<article class="card">' + media +
        '<div class="card__body">' +
        '<h3 class="card__title">' + esc(m.nomi) + "</h3>" +
        '<p class="card__text">' + esc(m.tavsif) + "</p>" +
        narxHtml +
        '<div class="card__actions">' +
        '<a class="btn btn--primary btn--sm" href="' + esc(telHref) + '">Qo\'ng\'iroq qilish</a>' +
        '<a class="btn btn--outline btn--sm" href="' + esc(tgHref) + '" target="_blank" rel="noopener">Telegram</a>' +
        "</div></div></article>"
      );
    }).join("");
  }

  function chizXizmatlar(items) {
    const box = $(".service-grid");
    if (!box || !items) return;
    box.innerHTML = items.map(function (x) {
      return '<div class="service"><h3 class="service__title">' + esc(x.nomi) + "</h3><p>" + esc(x.matn) + "</p></div>";
    }).join("");
  }

  function chizRaqamlar(items) {
    const box = $(".stats__inner");
    if (!box || !items) return;
    box.innerHTML = items.map(function (r) {
      return '<div class="stat"><strong class="stat__num">' + esc(r.son) + '</strong><span class="stat__label">' + esc(r.yozuv) + "</span></div>";
    }).join("");
  }

  function chizYangiliklar(items) {
    const box = $(".news-grid");
    if (!box || !items) return;
    if (!items.length) {
      box.innerHTML = '<p class="section__lead">Hozircha yangilik yo\'q.</p>';
      return;
    }
    const tartib = items.slice().sort(function (a, b) {
      return String(b.sana || "").localeCompare(String(a.sana || ""));
    });
    box.innerHTML = tartib.map(function (n) {
      const sana = sanaFormat(n.sana);
      return (
        '<article class="news-card"><div class="news-card__meta">' +
        (n.aksiya ? '<span class="badge">Aksiya</span>' : "") +
        (sana ? '<time datetime="' + esc(n.sana) + '">' + esc(sana) + "</time>" : "") +
        '</div><h3 class="news-card__title">' + esc(n.sarlavha) + "</h3><p>" + esc(n.matn) + "</p></article>"
      );
    }).join("");
  }

  function chizSavollar(items) {
    const box = $(".faq");
    if (!box || !items) return;
    box.innerHTML = items.map(function (q) {
      return (
        '<details class="faq__item"><summary class="faq__q">' + esc(q.savol) +
        '</summary><p class="faq__a">' + esc(q.javob) + "</p></details>"
      );
    }).join("");
  }

  // Sahifadagi hamma qo'ng'iroq, Telegram va Instagram tugmalarini yangilaydi
  // (pastdagi #socialLinks ga tegmaydi, u alohida chiziladi)
  function silkalarniYangila() {
    $$('a[href^="tel:"]').forEach(function (a) { a.setAttribute("href", telHref); });
    $$('a[href*="t.me"]').forEach(function (a) {
      if (!a.closest("#socialLinks")) a.setAttribute("href", tgHref);
    });
    $$('a[href*="instagram.com"]').forEach(function (a) {
      if (!a.closest("#socialLinks")) a.setAttribute("href", igHref);
    });
  }

  function qoll(n) {
    sozlamalar(n[0]);
    chizMahsulotlar(royxat(n[1]));
    chizXizmatlar(royxat(n[2]));
    chizRaqamlar(royxat(n[3]));
    chizYangiliklar(royxat(n[4]));
    chizSavollar(royxat(n[5]));
    silkalarniYangila();
  }

  async function yukla() {
    const nomlar = ["sayt", "mahsulotlar", "xizmatlar", "raqamlar", "yangiliklar", "savollar"];
    const KESH = "etm-data-v1";

    // 1) oldingi kirishdagi ma'lumot bo'lsa, darrov ko'rsatamiz
    let eski = null;
    try { eski = JSON.parse(localStorage.getItem(KESH)); } catch (e) {}
    if (eski) qoll(eski);

    // 2) orqada yangisini olamiz
    const n = await Promise.all(nomlar.map(oqi));
    const yangi = JSON.stringify(n);
    if (yangi !== JSON.stringify(eski)) qoll(n);

    // 3) hammasi to'liq o'qilgan bo'lsagina saqlaymiz
    if (n.every(Boolean)) {
      try { localStorage.setItem(KESH, yangi); } catch (e) {}
    }
  }

  yukla();
})();
