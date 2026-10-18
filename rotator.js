/* ==========================================================================
   DREAM TO BUILD — SYNCHRONIZED HERO ROTATOR ENGINE
   Features: Mutex lock (race-condition safe), 7s timer, randomized selection,
   and randomized transition styles (Fade, Slide, Zoom, Palsy).
   ========================================================================== */

class HeroRotator {
  constructor(imagePool, heroImgEl, titleEl, badgeEl, descEl, intervalMs = 7000) {
    this.imagePool = imagePool; // Array of { url, title, badgeText, badgeClass, desc }
    this.heroImgEl = heroImgEl;
    this.titleEl = titleEl;
    this.badgeEl = badgeEl;
    this.descEl = descEl;
    this.intervalMs = intervalMs;
    this.currentIndex = 0;
    this.timerId = null;
    this.isRotating = false;

    if (this.imagePool.length > 0) {
      this.startTimer();
    }
  }

  startTimer() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      this.rotateRandom(true);
    }, this.intervalMs);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  resetTimer() {
    this.startTimer(); // Resets 7-second cadence on manual interaction
  }

  async rotateRandom(isAuto = false) {
    if (this.isRotating || this.imagePool.length <= 1) return;
    this.isRotating = true;

    // Pick a random index different from current
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * this.imagePool.length);
    } while (nextIndex === this.currentIndex && this.imagePool.length > 1);

    this.currentIndex = nextIndex;
    const target = this.imagePool[this.currentIndex];

    // Choose a random transition style
    const transitions = ["transition-fade", "transition-slide", "transition-zoom", "transition-palsy"];
    const randomTransition = transitions[Math.floor(Math.random() * transitions.length)];

    // Apply animation class and update elements
    if (this.heroImgEl) {
      this.heroImgEl.className = `rotator-hero-img ${randomTransition}`;
      this.heroImgEl.src = target.url;
    }
    if (this.titleEl) this.titleEl.textContent = target.title || "";
    if (this.badgeEl) {
      this.badgeEl.textContent = target.badgeText || "";
      this.badgeEl.className = `badge ${target.badgeClass || ''}`;
    }
    if (this.descEl) this.descEl.textContent = target.desc || "";

    // Release mutex lock after longest animation completes (Palsy = 1.1s)
    setTimeout(() => {
      if (this.heroImgEl) {
        this.heroImgEl.className = "rotator-hero-img";
      }
      this.isRotating = false;
    }, 1100);

    if (!isAuto) {
      this.resetTimer();
    }
  }
}
