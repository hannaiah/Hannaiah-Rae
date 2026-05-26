const nav = document.querySelector("nav");
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const themeToggle = document.getElementById("theme-toggle");

function updateThemeIcons() {
    const sun = document.querySelector(".icon-sun");
    const moon = document.querySelector(".icon-moon");

    if (document.body.classList.contains("light")) {
        if (sun) sun.style.opacity = "1";
        if (moon) moon.style.opacity = "0";
    } else {
        if (sun) sun.style.opacity = "0";
        if (moon) moon.style.opacity = "1";
    }
}

function applySavedTheme() {
    let savedTheme = null;

    try {
        savedTheme = localStorage.getItem("theme");
    } catch (error) {
        savedTheme = null;
    }

    document.body.classList.toggle("light", savedTheme === "light");
    updateThemeIcons();
}

function setActiveNav(linkToActivate) {
    navLinks.forEach(link => {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
    });

    if (linkToActivate) {
        linkToActivate.classList.add("active");
        linkToActivate.setAttribute("aria-current", "page");
    }
}

function createPageTransitionOverlay() {
    let overlay = document.getElementById("transition-overlay");

    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = "transition-overlay";
    overlay.innerHTML = `
        <div class="transition-slabs" aria-hidden="true">
            <span class="transition-slab"></span>
            <span class="transition-slab"></span>
            <span class="transition-slab"></span>
            <span class="transition-slab"></span>
        </div>
    `;
    document.body.appendChild(overlay);

    return overlay;
}

function goToPageWithTransition(href) {
    const prefersReducedMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
        window.location.href = href;
        return;
    }

    const overlay = createPageTransitionOverlay();
    document.body.classList.add("transitioning");
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "all";
    overlay.classList.remove("active");

    setTimeout(() => {
        overlay.classList.add("active");
    }, 30);

    setTimeout(() => {
        window.location.href = href;
    }, 800);
}

document.addEventListener("keydown", e => {
    if (e.key.toLowerCase() !== "t") return;

    const overlay = createPageTransitionOverlay();
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "all";
    overlay.classList.remove("active");

    setTimeout(() => {
        overlay.classList.add("active");
    }, 30);

    setTimeout(() => {
        overlay.classList.remove("active");
        overlay.style.opacity = "1";
        overlay.style.pointerEvents = "";
    }, 800);
});

function updateIndexActiveSection() {
    const isIndexPage = window.location.pathname.endsWith("/") ||
        window.location.pathname.endsWith("index.html");

    if (!isIndexPage) return;

    const professionalLink = document.querySelector('.nav-links a[href="index.html"]');
    const skillsLink = document.querySelector('.nav-links a[href="index.html#skills"]');
    const projectsLink = document.querySelector('.nav-links a[href="index.html#projects"]');
    const skillsSection = document.getElementById("skills");
    const projectsSection = document.getElementById("projects");
    const scrollPosition = window.scrollY + window.innerHeight * 0.35;

    if (projectsSection && scrollPosition >= projectsSection.offsetTop) {
        setActiveNav(projectsLink);
    } else if (skillsSection && scrollPosition >= skillsSection.offsetTop) {
        setActiveNav(skillsLink);
    } else {
        setActiveNav(professionalLink);
    }
}

applySavedTheme();

window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("fade-in");
    document.body.classList.remove("fade-out");
    updateIndexActiveSection();
});

window.addEventListener("scroll", () => {
    if (nav) {
        nav.classList.toggle("scrolled", window.scrollY > 50);
    }

    updateIndexActiveSection();
    showTimeline();
});

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const isLight = document.body.classList.toggle("light");

        try {
            localStorage.setItem("theme", isLight ? "light" : "dark");
        } catch (error) {
            // The toggle still works for the current page when storage is unavailable.
        }

        updateThemeIcons();
    });
}

if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
        nav.classList.toggle("open");
    });
}

if (nav) {
    nav.addEventListener("click", (e) => {
        if (e.target === nav) {
            location.reload();
        }
    });
}

document.addEventListener("click", e => {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href === "#") return;
    if (link.target === "_blank" || link.hasAttribute("download")) return;

    const targetUrl = new URL(href, window.location.href);
    const isExternal = targetUrl.protocol.startsWith("http") &&
        targetUrl.origin !== window.location.origin;
    if (isExternal) return;

    const isCurrentPath = targetUrl.pathname === window.location.pathname;
    const isIndexPage = window.location.pathname.endsWith("/") ||
        window.location.pathname.endsWith("index.html");
    const targetId = targetUrl.hash.replace("#", "");
    const isSamePageIndexSection = targetUrl.pathname.endsWith("index.html") &&
        isIndexPage &&
        targetId;
    const target = targetId ? document.getElementById(targetId) : null;

    if ((isCurrentPath || isSamePageIndexSection) && target) {
        e.preventDefault();
        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
        setActiveNav(link);
        history.replaceState(null, "", `#${targetId}`);
        return;
    }

    if (isCurrentPath && targetUrl.hash === window.location.hash) return;

    e.preventDefault();
    goToPageWithTransition(targetUrl.href);
});

const timelineItems = document.querySelectorAll(".timeline-item");
const timelineLine = document.querySelector(".timeline-line");
const timeline = document.querySelector(".timeline");

function showTimeline() {
    if (!timeline || !timelineLine || timelineItems.length === 0) return;

    const triggerBottom = window.innerHeight * 0.85;

    timelineItems.forEach(item => {
        const boxTop = item.getBoundingClientRect().top;

        if (boxTop < triggerBottom) {
            item.classList.add("show");
        }
    });

    const timelineRect = timeline.getBoundingClientRect();
    let height = window.innerHeight - timelineRect.top;

    if (height < 0) height = 0;
    if (height > timeline.offsetHeight) height = timeline.offsetHeight;

    timelineLine.style.height = `${height}px`;
}

window.addEventListener("DOMContentLoaded", showTimeline);

const skills = document.querySelectorAll(".skill-progress");
const skillCards = document.querySelectorAll(".skill-card");

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute("data-width");
                entry.target.style.width = width;

                const card = entry.target.closest(".skill-card");
                if (card) card.classList.add("skill-animate");
            }
        });
    }, { threshold: 0.5 });

    skills.forEach(skill => observer.observe(skill));
} else {
    skills.forEach(skill => {
        skill.style.width = skill.getAttribute("data-width") || "0";
    });
}

skillCards.forEach(card => {
    card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
    });

    card.addEventListener("mouseleave", () => {
        card.style.removeProperty("--mouse-x");
        card.style.removeProperty("--mouse-y");
    });
});

const contactForm = document.getElementById("contactForm");

function showError(input, message) {
    const formGroup = input.parentElement;
    const error = formGroup.querySelector(".error-msg");

    if (error) {
        error.textContent = message;
        error.style.visibility = "visible";
    }

    input.style.borderColor = "red";
}

function clearErrors() {
    const errors = document.querySelectorAll(".error-msg");
    const inputs = document.querySelectorAll("input, textarea");

    errors.forEach(error => {
        error.style.visibility = "hidden";
    });

    inputs.forEach(input => {
        input.style.borderColor = "";
    });
}

function validateEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

if (contactForm) {
    contactForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const messageInput = document.getElementById("message");
        let isValid = true;

        clearErrors();

        if (nameInput && nameInput.value.trim() === "") {
            showError(nameInput, "Name cannot be empty");
            isValid = false;
        }

        if (emailInput && emailInput.value.trim() === "") {
            showError(emailInput, "Email cannot be empty");
            isValid = false;
        } else if (emailInput && !validateEmail(emailInput.value)) {
            showError(emailInput, "Enter a valid email");
            isValid = false;
        }

        if (messageInput && messageInput.value.trim() === "") {
            showError(messageInput, "Message cannot be empty");
            isValid = false;
        }

        if (!isValid) return;

        if (window.emailjs) {
            emailjs.init("rE_BKBZemqnFe8Esi");
            emailjs.send("service_qe1vj6o", "template_nx16gwe")
                .then(() => {
                    alert("Message sent successfully!");
                    contactForm.reset();
                });
        } else {
            alert("Email service is currently unavailable. Please try again later.");
        }
    });
}