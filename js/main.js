/* =========================================================
   Dan's Cafe — site behaviour
   Plain browser JavaScript, no libraries, no build step.
   Everything in here is progressive: with JS switched off the
   page still reads, scrolls and links out correctly.
   ========================================================= */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    if (window.scrollY > 8) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  if (header) {
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
  }

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var navMobile = document.getElementById("navMobile");

  function setNav(open) {
    if (!navToggle || !navMobile) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navMobile.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (navToggle && navMobile) {
    navToggle.addEventListener("click", function () {
      setNav(navToggle.getAttribute("aria-expanded") !== "true");
    });

    navMobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNav(false);
      });
    });

    /* Escape closes the menu and hands focus back to the button that
       opened it, so keyboard users are never stranded inside it. */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setNav(false);
        navToggle.focus();
      }
    });

    /* Resizing up to the desktop layout hides the panel in CSS; clear the
       open state too so the body does not stay locked from scrolling. */
    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (e) {
      if (e.matches) setNav(false);
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-desktop a"));
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navLinks.forEach(function (link) {
              var isActive = link.getAttribute("href") === "#" + id;
              link.classList.toggle("is-active", isActive);
              /* Underline alone is invisible to a screen reader. */
              if (isActive) {
                link.setAttribute("aria-current", "true");
              } else {
                link.removeAttribute("aria-current");
              }
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  /* ---------- Scroll reveal (multiple considered variants) ---------- */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal], [data-reveal-fade], [data-reveal-scale], [data-reveal-group]")
  );
  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );
      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  /* ---------- Magnetic buttons ---------- */
  if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        btn.style.setProperty("--mx", x + "%");
        btn.style.setProperty("--my", y + "%");
      });
    });
  }

  /* ---------- Hero parallax (subtle) ---------- */
  var parallaxEl = document.querySelector("[data-parallax]");
  if (parallaxEl && !prefersReducedMotion) {
    var ticking = false;
    function updateParallax() {
      var rect = parallaxEl.getBoundingClientRect();
      var progress = 1 - Math.min(Math.max(rect.top / window.innerHeight, 0), 1);
      var offset = progress * 22;
      parallaxEl.style.transform = "translateY(" + (12 - offset) + "px)";
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
    updateParallax();
  }

  /* ---------- Highlight today's opening hours row ---------- */
  var hoursTable = document.getElementById("hoursTable");
  if (hoursTable) {
    var today = new Date().getDay();
    var row = hoursTable.querySelector('tr[data-day="' + today + '"]');
    if (row) row.classList.add("is-today");
  }

  /* ---------- Mobile sticky order bar ---------- */
  var mobileOrderBar = document.getElementById("mobileOrderBar");
  var orderSection = document.getElementById("order");
  if (mobileOrderBar && orderSection && "IntersectionObserver" in window) {
    var heroSection = document.querySelector(".hero");
    var barObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.target === heroSection) {
            mobileOrderBar.classList.toggle("is-visible", !entry.isIntersecting);
          }
          if (entry.target === orderSection && entry.isIntersecting) {
            mobileOrderBar.classList.remove("is-visible");
          } else if (entry.target === orderSection && !entry.isIntersecting && heroSection) {
            var heroRect = heroSection.getBoundingClientRect();
            if (heroRect.bottom < 0) mobileOrderBar.classList.add("is-visible");
          }
        });
      },
      { threshold: 0 }
    );
    if (heroSection) barObserver.observe(heroSection);
    barObserver.observe(orderSection);
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    var onScrollBackToTop = function () {
      backToTop.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.8);
    };
    onScrollBackToTop();
    window.addEventListener("scroll", onScrollBackToTop, { passive: true });
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* =========================================================
     Contact form
     ---------------------------------------------------------
     Nothing receives this form yet, so the submit handler below
     hands the message to the visitor's own email app instead.

     TO WIRE UP A REAL HANDLER LATER:
       1. Add action="your-endpoint" method="post" to the <form>
          in index.html.
       2. Delete this whole "Contact form" block.
     The markup does not need to change — every field already has
     a name attribute, so a handler will receive:
       name, phone, date, party, message
     ========================================================= */
  var contactForm = document.getElementById("contactForm");
  var contactStatus = document.getElementById("contactStatus");
  var CONTACT_EMAIL = "danscafeinwhitchurch@gmail.com";

  /* ------------------------------------------------------------------
     SENDING THE ENQUIRY FORM BY EMAIL
     ------------------------------------------------------------------
     A plain HTML site cannot send email on its own — that needs a
     server. FormSubmit acts as that server, free, with no account,
     no API key and no domain required.

     ONE-TIME ACTIVATION:
       1. Fill in and send the form once on the live site
       2. FormSubmit emails danscafeinwhitchurch@gmail.com a confirmation link
       3. Click it — every submission from then on arrives in that inbox

     Until it is activated, FormSubmit replies with an error and the
     visitor is shown the phone number, so no enquiry is silently lost.
     ------------------------------------------------------------------ */
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/" + CONTACT_EMAIL;

  function showStatus(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.className = "form-status is-visible " + (type === "error" ? "is-error" : "is-success");
  }

  function setFieldError(input, errorEl, message) {
    if (message) {
      input.setAttribute("aria-invalid", "true");
      errorEl.textContent = message;
      errorEl.classList.add("is-visible");
    } else {
      input.removeAttribute("aria-invalid");
      errorEl.textContent = "";
      errorEl.classList.remove("is-visible");
    }
  }

  if (contactForm) {
    var nameInput = document.getElementById("contactName");
    var phoneInput = document.getElementById("contactPhone");
    var messageInput = document.getElementById("contactMessage");
    var dateInput = document.getElementById("contactDate");
    var partyInput = document.getElementById("contactParty");

    var required = [
      { input: nameInput, error: document.getElementById("contactNameError"), message: "Please tell us your name." },
      { input: phoneInput, error: document.getElementById("contactPhoneError"), message: "Please give us a phone number so we can reply." },
      { input: messageInput, error: document.getElementById("contactMessageError"), message: "Please write us a short message." }
    ];

    /* Validate on blur, not on every keystroke — no red text while the
       visitor is still halfway through typing. */
    required.forEach(function (f) {
      f.input.addEventListener("blur", function () {
        if (f.input.value.trim()) setFieldError(f.input, f.error, "");
      });
    });

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var firstInvalid = null;
      required.forEach(function (f) {
        var empty = !f.input.value.trim();
        setFieldError(f.input, f.error, empty ? f.message : "");
        if (empty && !firstInvalid) firstInvalid = f.input;
      });

      if (firstInvalid) {
        showStatus(contactStatus, "Please fill in your name, phone number and message.", "error");
        firstInvalid.focus();
        return;
      }

      var lines = [
        "New enquiry from the website:",
        "",
        "Name: " + nameInput.value.trim(),
        "Phone: " + phoneInput.value.trim()
      ];
      if (dateInput.value) lines.push("Preferred date: " + dateInput.value);
      if (partyInput.value) lines.push("Party size: " + partyInput.value);
      lines.push("", "Message:", messageInput.value.trim());

      var visitorName = nameInput.value.trim();
      var subject = "Website enquiry from " + visitorName;

      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var originalLabel = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
      showStatus(contactStatus, "Sending your message…", "success");

      function sendFailed() {
        showStatus(
          contactStatus,
          "Sorry, that didn't send. Please call us on 01948 258170 or email " + CONTACT_EMAIL + ".",
          "error"
        );
      }

      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: subject,
          _captcha: "false",
          _template: "table",
          Name: visitorName,
          Phone: phoneInput.value.trim(),
          "Preferred date": dateInput.value || "Not given",
          "Party size": partyInput.value || "Not given",
          Message: messageInput.value.trim()
        })
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; });
        })
        .then(function (data) {
          /* FormSubmit returns success as either boolean true or the
             string "true" depending on endpoint version. */
          var ok = data && (data.success === true || data.success === "true");
          if (ok) {
            contactForm.reset();
            showStatus(contactStatus, "Thanks! Your message has been sent — we'll be in touch soon.", "success");
          } else {
            sendFailed();
          }
        })
        .catch(sendFailed)
        .then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
        });
    });
  }

  /* ---------- Menu lightbox ----------
     Opens the full-size scan of any menu. The menu list is read from
     the cards in the markup rather than hard-coded here, so adding or
     reordering a menu in index.html needs no change in this file. */
  var lightbox = document.getElementById("menuLightbox");
  var menuButtons = Array.prototype.slice.call(document.querySelectorAll(".menu-photo-btn"));

  if (lightbox && menuButtons.length) {
    var lbImg = document.getElementById("menuLightboxImg");
    var lbStage = document.getElementById("menuLightboxStage");
    var lbTitle = document.getElementById("menuLightboxTitle");
    var lbIndex = document.getElementById("menuLightboxIndex");
    var lbTotal = document.getElementById("menuLightboxTotal");
    var lbZoom = document.getElementById("menuLightboxZoom");
    var lbZoomLabel = lbZoom ? lbZoom.querySelector(".menu-lightbox-tool-label") : null;

    var menus = menuButtons.map(function (btn) {
      var img = btn.querySelector("img");
      var caption = btn.querySelector(".menu-photo-caption");
      return {
        src: img ? img.getAttribute("src") : "",
        alt: img ? img.getAttribute("alt") : "",
        title: caption ? caption.textContent.trim() : "Menu"
      };
    });

    var current = 0;
    var lastFocused = null;
    lbTotal.textContent = String(menus.length);

    function setZoom(on) {
      lbStage.classList.toggle("is-zoomed", on);
      if (lbZoom) {
        lbZoom.setAttribute("aria-pressed", String(on));
        if (lbZoomLabel) lbZoomLabel.textContent = on ? "Zoom out" : "Zoom in";
      }
      if (!on) {
        lbStage.scrollTop = 0;
        lbStage.scrollLeft = 0;
      }
    }

    function show(i) {
      current = (i + menus.length) % menus.length;
      var m = menus[current];
      lbImg.setAttribute("src", m.src);
      lbImg.setAttribute("alt", m.alt);
      lbTitle.textContent = m.title;
      lbIndex.textContent = String(current + 1);
      setZoom(false);

      /* Warm the neighbouring scans so paging through feels instant. */
      [current + 1, current - 1].forEach(function (n) {
        var next = menus[(n + menus.length) % menus.length];
        if (next && next.src) {
          var pre = new Image();
          pre.src = next.src;
        }
      });
    }

    /* Screen readers can otherwise still wander into the page behind an
       open dialog, since aria-modal alone isn't enough in every AT. */
    var behind = Array.prototype.slice.call(
      document.querySelectorAll("body > header, body > main, body > footer")
    );

    function setBehindHidden(hide) {
      behind.forEach(function (el) {
        if (hide) el.setAttribute("aria-hidden", "true");
        else el.removeAttribute("aria-hidden");
      });
    }

    function openLightbox(i) {
      /* Deliberately the tile itself rather than document.activeElement:
         Safari doesn't focus a button when you click it, so activeElement
         would be <body> and focus would be lost on close. */
      lastFocused = menuButtons[i] || document.activeElement;
      show(i);
      lightbox.hidden = false;
      setBehindHidden(true);
      document.body.style.overflow = "hidden";
      var closeBtn = lightbox.querySelector("[data-menu-close].menu-lightbox-tool");
      if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      setBehindHidden(false);
      document.body.style.overflow = "";
      setZoom(false);
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
      lastFocused = null;
    }

    menuButtons.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        openLightbox(i);
      });
    });

    lightbox.addEventListener("click", function (e) {
      var closer = e.target.closest ? e.target.closest("[data-menu-close]") : null;
      if (closer) {
        closeLightbox();
        return;
      }
      var stepBtn = e.target.closest ? e.target.closest("[data-menu-step]") : null;
      if (stepBtn) show(current + Number(stepBtn.getAttribute("data-menu-step")));
    });

    if (lbZoom) {
      lbZoom.addEventListener("click", function () {
        setZoom(!lbStage.classList.contains("is-zoomed"));
      });
    }

    lbImg.addEventListener("click", function () {
      setZoom(!lbStage.classList.contains("is-zoomed"));
    });

    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;

      if (e.key === "Escape") {
        closeLightbox();
        return;
      }
      if (e.key === "ArrowRight") {
        show(current + 1);
        return;
      }
      if (e.key === "ArrowLeft") {
        show(current - 1);
        return;
      }

      /* Keep Tab inside the dialog while it's open. */
      if (e.key === "Tab") {
        var focusables = Array.prototype.slice
          .call(lightbox.querySelectorAll("button, [href], img[tabindex], [tabindex]:not([tabindex='-1'])"))
          .filter(function (el) {
            return el.offsetParent !== null || el === document.activeElement;
          });
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }


  /* ---------- Cookie consent ----------
     The GA loader and the stored choice live in the inline <head> script
     (window.dcConsent) so a returning visitor who accepted starts
     analytics immediately. This half is only the banner UI. */
  var cookieBanner = document.getElementById("cookieBanner");
  var consentApi = window.dcConsent;

  if (cookieBanner && consentApi) {
    var acceptBtn = document.getElementById("cookieAccept");
    var declineBtn = document.getElementById("cookieDecline");
    var settingsBtn = document.getElementById("cookieSettings");
    var orderBar = document.getElementById("mobileOrderBar");

    function syncBannerHeight() {
      if (cookieBanner.hidden) return;
      document.documentElement.style.setProperty(
        "--cookie-banner-h",
        cookieBanner.offsetHeight + "px"
      );
    }

    function showBanner() {
      cookieBanner.hidden = false;
      document.body.classList.add("has-cookie-banner");
      syncBannerHeight();
    }

    function hideBanner() {
      cookieBanner.hidden = true;
      document.body.classList.remove("has-cookie-banner");
    }

    function choose(granted) {
      if (granted) consentApi.accept();
      else consentApi.decline();
      hideBanner();
      /* Send focus somewhere sensible rather than letting it fall to
         <body> when the button that had it disappears. */
      if (settingsBtn) settingsBtn.focus({ preventScroll: true });
    }

    if (acceptBtn) acceptBtn.addEventListener("click", function () { choose(true); });
    if (declineBtn) declineBtn.addEventListener("click", function () { choose(false); });

    /* Withdrawing consent has to be as easy as giving it, so the footer
       control reopens this at any time. */
    if (settingsBtn) {
      settingsBtn.addEventListener("click", function () {
        showBanner();
        if (declineBtn) declineBtn.focus({ preventScroll: true });
      });
    }

    window.addEventListener("resize", syncBannerHeight, { passive: true });

    /* Only interrupt someone who hasn't chosen yet. */
    if (!consentApi.get()) showBanner();
  }

})();
