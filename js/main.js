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
})();
