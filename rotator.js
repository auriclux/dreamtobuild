/* ==========================================================================
   DREAM TO BUILD — SYNCHRONIZED HERO ROTATOR ENGINE
   Troubleshooting Guide:
   - MUTEX LOCK: 'isRotating' prevents race conditions if timer & click fire together.
   - RANDOMIZATION: Picks a random image index different from the current one.
   - TRANSITIONS: Randomly assigns one of 4 CSS animations (Fade, Slide, Zoom, Palsy).
   ========================================================================== */

class HeroRotator {
  constructor(imagePool, heroImgElement, captionElement, intervalMs = 7000) {
    this.imagePool = imagePool; // Array of { url, title, subtitle } objects
    this.heroImgEl = heroImgElement;
    this.captionEl = captionElement;
    this.intervalMs = intervalMs;
    this.currentIndex = 0;
    this.timerId = null;
    this.isRotating = false;

    if (this.imagePool.length > 0) {
      this.init();
    }
  }

  init() {
    this.startTimer();
  }

  startTimer() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      this.rotateRandom(true);
    }, this.intervalMs);
  }

  resetTimer() {
    this.startTimer(); // Resets the 7-second countdown when user interacts manually
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
    const targetData = this.imagePool[this.currentIndex];

    // Choose a random transition style (Fade, Slide, Zoom, Palsy)
    const transitions = ["transition-fade", "transition-slide", "transition-zoom", "transition-palsy"];
    const randomTransition = transitions[Math.floor(Math.random() * transitions.length)];

    // Apply animation class
    this.heroImgEl.className = `rotator-hero-img ${randomTransition}`;
    
    // Update image source and metadata
    this.heroImgEl.src = targetData.url;
    if (this.captionEl && targetData.title) {
      this.captionEl.textContent = targetData.title;
    }

    // Release mutex lock after animation duration completes
    setTimeout(() => {
      this.heroImgEl.className = "rotator-hero-img";
      this.isRotating = false;
    }, 1100); // Matches longest animation duration (Palsy = 1.1s)

    if (!isAuto) {
      this.resetTimer();
    }
  }

  jumpTo(index) {
    if (index >= 0 && index < this.imagePool.length) {
      this.currentIndex = index;
      this.rotateRandom(false);
    }
  }
}
