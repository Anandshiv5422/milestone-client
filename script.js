const navbar = document.querySelector(".navbar");
const navToggle = document.querySelector(".nav-toggle");
const reviewGrid = document.querySelector("#reviews-grid");
const parallaxItems = document.querySelectorAll(".hero-parallax");
const productsTrack = document.querySelector("#products-track");
const productsPrev = document.querySelector("#products-prev");
const productsNext = document.querySelector("#products-next");
const productsStatus = document.querySelector("#products-status");
const clientTrack = document.querySelector("#client-track");
const clientsStatus = document.querySelector("#clients-status");

const reviewData = [
  {
    title: "High quality product confidence",
    quote: "Profile highlights emphasize high quality, non-toxic nature, long shelf life, and accurate composition across the offered products.",
    author: "Company profile",
    source: "Customer satisfaction section",
  },
  {
    title: "Easy to use and sealed packing",
    quote: "Products are presented in sealed packing to help prevent damage and support easier use in the market.",
    author: "Company profile",
    source: "Customer satisfaction section",
  },
  {
    title: "Reliable and eco-friendly",
    quote: "The brochure describes the products as reliable in nature, eco-friendly, and available in different specifications.",
    author: "Company profile",
    source: "Customer satisfaction section",
  },
];

const updateNavbarState = () => {
  if (navbar) {
    navbar.classList.toggle("scrolled", window.scrollY > 12);
  }
};

const closeMenu = () => {
  if (navbar && navToggle) {
    navbar.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
};

const handleAnchorScroll = (event) => {
  const href = event.currentTarget.getAttribute("href");

  if (!href || !href.startsWith("#")) {
    return;
  }

  const target = document.querySelector(href);

  if (!target) {
    return;
  }

  event.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  closeMenu();
};

const renderReviews = () => {
  if (!reviewGrid) {
    return;
  }

  reviewGrid.innerHTML = reviewData
    .map(
      (review) => `
        <article class="review-card reveal">
          <span class="review-source">Google review highlight</span>
          <div class="review-stars" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <h3>${review.title}</h3>
          <p>${review.quote}</p>
          <div class="review-meta">
            <span>${review.author}</span>
            <span>${review.source}</span>
          </div>
        </article>
      `
    )
    .join("");
};

const setupRevealAnimation = () => {
  const allRevealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    allRevealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 55, 280)}ms`;
      revealObserver.observe(item);
    });
  } else {
    allRevealItems.forEach((item) => item.classList.add("visible"));
  }
};

const updateParallax = () => {
  const scrollY = window.scrollY;

  parallaxItems.forEach((item, index) => {
    const speed = (index + 1) * 0.08;
    item.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
  });
};

const clampIndex = (index, maxIndex) => {
  if (index < 0) {
    return 0;
  }

  if (index > maxIndex) {
    return maxIndex;
  }

  return index;
};

const createPagedSlider = ({
  track,
  itemsSelector,
  perViewDesktop,
  perViewTablet,
  perViewMobile,
  statusEl,
  statusFormatter,
}) => {
  if (!track) {
    return null;
  }

  const items = Array.from(track.querySelectorAll(itemsSelector));
  let currentIndex = 0;

  const getPerView = () => {
    if (window.innerWidth <= 820) {
      return perViewMobile;
    }

    if (window.innerWidth <= 1080) {
      return perViewTablet;
    }

    return perViewDesktop;
  };

  const render = () => {
    const perView = getPerView();
    const maxIndex = Math.max(0, items.length - perView);
    currentIndex = clampIndex(currentIndex, maxIndex);
    const offset = items[currentIndex] ? items[currentIndex].offsetLeft : 0;
    track.style.transform = `translateX(-${offset}px)`;

    if (statusEl) {
      const start = items.length === 0 ? 0 : currentIndex + 1;
      const end = Math.min(currentIndex + perView, items.length);
      statusEl.textContent = statusFormatter(start, end, items.length);
    }

    return { perView, maxIndex };
  };

  const next = () => {
    const { perView, maxIndex } = render();
    if (currentIndex >= maxIndex) {
      currentIndex = 0;
    } else {
      currentIndex = Math.min(currentIndex + perView, maxIndex);
    }
    render();
  };

  const prev = () => {
    const { perView, maxIndex } = render();
    if (currentIndex <= 0) {
      currentIndex = maxIndex;
    } else {
      currentIndex = Math.max(currentIndex - perView, 0);
    }
    render();
  };

  render();
  return { next, prev, render, track };
};

const setupAutoplay = (slider, delay) => {
  if (!slider || !slider.track) {
    return;
  }

  let timer = null;

  const start = () => {
    if (timer) {
      return;
    }

    timer = window.setInterval(() => {
      slider.next();
    }, delay);
  };

  const stop = () => {
    if (!timer) {
      return;
    }

    window.clearInterval(timer);
    timer = null;
  };

  slider.track.addEventListener("mouseenter", stop);
  slider.track.addEventListener("mouseleave", start);
  slider.track.addEventListener("focusin", stop);
  slider.track.addEventListener("focusout", start);
  start();
};

if (navToggle && navbar) {
  navToggle.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", handleAnchorScroll);
});

const productSlider = createPagedSlider({
  track: productsTrack,
  itemsSelector: ".product-card",
  perViewDesktop: 3,
  perViewTablet: 2,
  perViewMobile: 1,
  statusEl: productsStatus,
  statusFormatter: (start, end, total) => `Showing ${start}-${end} of ${total}`,
});

const clientSlider = createPagedSlider({
  track: clientTrack,
  itemsSelector: ".client-name",
  perViewDesktop: 4,
  perViewTablet: 2,
  perViewMobile: 1,
  statusEl: clientsStatus,
  statusFormatter: (start, end, total) => `${total} listed clients | showing ${start}-${end}`,
});

if (productsPrev && productSlider) {
  productsPrev.addEventListener("click", productSlider.prev);
}

if (productsNext && productSlider) {
  productsNext.addEventListener("click", productSlider.next);
}

renderReviews();
setupRevealAnimation();
updateNavbarState();
updateParallax();
setupAutoplay(productSlider, 2600);
setupAutoplay(clientSlider, 1800);

window.addEventListener("scroll", updateNavbarState, { passive: true });
window.addEventListener("scroll", updateParallax, { passive: true });
window.addEventListener("resize", () => {
  if (productSlider) {
    productSlider.render();
  }

  if (clientSlider) {
    clientSlider.render();
  }
});
