(() => {
  const track = document.getElementById("crew-post-track");
  if (!track) return;
  const cards = [...track.querySelectorAll(".crew-post")],
    prev = document.getElementById("crew-post-prev"),
    next = document.getElementById("crew-post-next"),
    count = document.getElementById("crew-post-count");
  let current = 0,
    queued = false;
  function update() {
    queued = false;
    const left = track.getBoundingClientRect().left;
    let nearest = 0,
      distance = Infinity;
    cards.forEach((card, i) => {
      const d = Math.abs(card.getBoundingClientRect().left - left);
      if (d < distance) {
        distance = d;
        nearest = i;
      }
    });
    current = nearest;
    prev.disabled = track.scrollLeft < 5;
    next.disabled =
      track.scrollLeft >= track.scrollWidth - track.clientWidth - 5;
    count.textContent =
      String(current + 1).padStart(2, "0") +
      " / " +
      String(cards.length).padStart(2, "0");
  }
  function move(delta) {
    const target =
      cards[Math.max(0, Math.min(cards.length - 1, current + delta))];
    track.scrollTo({
      left:
        track.scrollLeft +
        target.getBoundingClientRect().left -
        track.getBoundingClientRect().left -
        2,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
  prev.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  track.addEventListener(
    "scroll",
    () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  track.addEventListener("keydown", (e) => {
    if (e.target !== track) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      move(e.key === "ArrowRight" ? 1 : -1);
    }
  });
  new ResizeObserver(update).observe(track);
  update();
})();
