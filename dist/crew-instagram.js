(() => {
  const track = document.getElementById("crew-post-track");
  if (!track) return;
  const cards = [...track.querySelectorAll(".crew-post")],
    prev = document.getElementById("crew-post-prev"),
    next = document.getElementById("crew-post-next"),
    count = document.getElementById("crew-post-count");
  // Only keep Instagram players alive near the viewport and visible in the rail.
  let feedNearby=false;
  const visibleTiles=new Set(), frames=[...track.querySelectorAll('iframe[data-src]')];
  function syncPlayers(){frames.forEach(frame=>{const active=feedNearby&&!document.hidden&&visibleTiles.has(frame.closest('.crew-post'));if(active&&!frame.hasAttribute('src'))frame.src=frame.dataset.src;else if(!active&&frame.hasAttribute('src'))frame.removeAttribute('src')})}
  new IntersectionObserver(entries=>{feedNearby=entries[0].isIntersecting;syncPlayers()},{rootMargin:'250px 0px'}).observe(track);
  const tileObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting&&entry.intersectionRatio>.08)visibleTiles.add(entry.target);else visibleTiles.delete(entry.target)});syncPlayers()},{root:track,rootMargin:'0px',threshold:.08});
  cards.forEach(card=>tileObserver.observe(card));document.addEventListener('visibilitychange',syncPlayers);
  const progress=document.createElement('div');
  progress.className='crew-film-progress';progress.setAttribute('role','progressbar');progress.setAttribute('aria-label','Instagram carousel position');progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax','100');
  const fill=document.createElement('span');progress.append(fill);track.after(progress);
  cards.forEach((card,i)=>{card.dataset.frame=String(i+1).padStart(2,'0');card.querySelector('.crew-post-meta>span').textContent=card.dataset.frame;});
  const mediaBoxes=[...track.querySelectorAll('.crew-post-media')];
  const sizeEmbeds=new ResizeObserver(entries=>entries.forEach(({target,contentRect})=>target.style.setProperty('--embed-scale',String(contentRect.width/340))));
  mediaBoxes.forEach(box=>sizeEmbeds.observe(box));
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
    const range=track.scrollWidth-track.clientWidth;
    const fraction=range>0?Math.max(0,Math.min(1,track.scrollLeft/range)):1;
    progress.style.setProperty('--film-progress',String(fraction));
    progress.setAttribute('aria-valuenow',String(Math.round(fraction*100)));
    cards.forEach((card,i)=>card.classList.toggle('is-current',i===current));
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
