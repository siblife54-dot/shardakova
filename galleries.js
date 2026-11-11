"use strict";

(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const viewer = document.getElementById("proof-viewer");
  const viewerImage = viewer?.querySelector(".proof-viewer-media img");
  const viewerTitle = viewer?.querySelector("#proof-viewer-title");
  const originalLink = viewer?.querySelector(".proof-original");
  const closeButton = viewer?.querySelector(".proof-viewer-close");
  let opener = null;

  if (viewer && typeof viewer.showModal === "function") {
    closeButton.addEventListener("click", () => viewer.close());
    viewer.addEventListener("click", (event) => {
      if (event.target !== viewer) return;
      const box = viewer.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right ||
          event.clientY < box.top || event.clientY > box.bottom) viewer.close();
    });
    viewer.addEventListener("close", () => {
      document.documentElement.classList.remove("proof-viewer-open");
      viewerImage.removeAttribute("src");
      opener?.focus({ preventScroll: true });
    });
  }

  document.querySelectorAll("[data-gallery]").forEach((gallery) => {
    const rail = gallery.querySelector(".proof-rail");
    const cards = [...rail.querySelectorAll(".proof-card")];
    const previous = gallery.querySelector("[data-gallery-prev]");
    const next = gallery.querySelector("[data-gallery-next]");
    const counter = gallery.querySelector(".proof-count");
    let current = 0;
    let scheduled = false;
    const padding = () => parseFloat(getComputedStyle(rail).scrollPaddingLeft) || 0;

    function update() {
      scheduled = false;
      const target = rail.scrollLeft + padding();
      let nearest = 0;
      cards.forEach((card, index) => {
        if (Math.abs(card.offsetLeft - target) < Math.abs(cards[nearest].offsetLeft - target)) nearest = index;
      });
      current = nearest;
      cards.forEach((card, index) => card.classList.toggle("is-current", index === current));
      previous.disabled = current === 0;
      next.disabled = current === cards.length - 1;
      const label = `${String(current + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
      if (counter.textContent !== label) counter.textContent = label;
    }

    function scheduleUpdate() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    }

    function move(index, behavior = "auto") {
      index = Math.max(0, Math.min(cards.length - 1, index));
      rail.scrollTo({ left: cards[index].offsetLeft - padding(), behavior });
      if (behavior === "auto") update();
      return index;
    }

    const behaviorFor = (event) => reducedMotion.matches || event.detail === 0 ? "auto" : "smooth";
    previous.addEventListener("click", (event) => move(current - 1, behaviorFor(event)));
    next.addEventListener("click", (event) => move(current + 1, behaviorFor(event)));
    rail.addEventListener("scroll", scheduleUpdate, { passive: true });
    rail.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const destinations = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: cards.length - 1 };
      if (!(event.key in destinations)) return;
      event.preventDefault();
      const index = move(destinations[event.key]);
      if (event.target.closest(".proof-open")) cards[index].querySelector(".proof-open").focus({ preventScroll: true });
    });
    rail.addEventListener("focusin", (event) => {
      const link = event.target.closest(".proof-open");
      if (link) move(cards.indexOf(link.closest(".proof-card")));
    });

    gallery.addEventListener("click", (event) => {
      const link = event.target.closest(".proof-open");
      if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
          !viewer || typeof viewer.showModal !== "function") return;
      event.preventDefault();
      opener = link;
      const thumbnail = link.querySelector("img");
      const index = cards.indexOf(link.closest(".proof-card"));
      viewerTitle.textContent = `${gallery.id === "results" ? "Результат" : "Отзыв"} ${index + 1} из ${cards.length}`;
      viewerImage.width = Number(thumbnail.getAttribute("width"));
      viewerImage.height = Number(thumbnail.getAttribute("height"));
      viewerImage.alt = thumbnail.alt;
      viewerImage.src = link.href;
      originalLink.href = link.href;
      viewer.showModal();
      document.documentElement.classList.add("proof-viewer-open");
      closeButton.focus({ preventScroll: true });
    });

    if (typeof ResizeObserver === "function") new ResizeObserver(scheduleUpdate).observe(rail);
    else window.addEventListener("resize", scheduleUpdate);
    gallery.querySelector(".proof-controls").hidden = false;
    gallery.dataset.galleryReady = "";
    update();
  });
})();
