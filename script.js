const portraitStage = document.querySelector("#portraitStage");
const routeButtons = [...document.querySelectorAll(".route")];
const storyDots = [...document.querySelectorAll(".story-dot")];
const storyPanels = [...document.querySelectorAll(".story-panel")];
const previewText = document.querySelector("#previewText");
const soundToggle = document.querySelector(".sound-toggle");
const portraitImage = document.querySelector("#portraitImage");
const particleCanvas = document.querySelector("#particleVeil");
const particleContext = particleCanvas.getContext("2d", { alpha: true });
const particleMouse = { x: 0, y: 0, active: false };
let portraitParticles = [];
let particleMetrics = { width: 0, height: 0, dpr: 1 };

const routeCopy = {
  mind: "从一个问题开始：模型为什么会学出像是“理解”世界的表征？",
  self: "理性、敏感、不安分。比标签更重要的，是这些矛盾如何同时存在。",
  moon: "按下快门，是为了留下肉眼无法同时看见的一整段变化。"
};

function setRoute(route, shouldScroll = false) {
  routeButtons.forEach((button) => {
    const active = button.dataset.route === route;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });

  storyDots.forEach((button) => {
    button.classList.toggle("active", button.dataset.route === route);
  });

  storyPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === route);
  });

  previewText.textContent = routeCopy[route];

  if (shouldScroll) {
    document.querySelector("#story").scrollIntoView({ behavior: "smooth" });
  }
}

portraitStage.addEventListener("pointermove", (event) => {
  const bounds = portraitStage.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width) * 100;
  const y = ((event.clientY - bounds.top) / bounds.height) * 100;
  particleMouse.x = event.clientX - bounds.left;
  particleMouse.y = event.clientY - bounds.top;
  particleMouse.active = true;
  portraitStage.style.setProperty("--x", `${x}%`);
  portraitStage.style.setProperty("--y", `${y}%`);
  portraitStage.classList.add("engaged");
});

portraitStage.addEventListener("pointerleave", () => {
  particleMouse.active = false;
  portraitStage.classList.remove("engaged");
});

function getObjectFitCoverSource(image, targetWidth, targetHeight) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = targetWidth / targetHeight;

  if (imageRatio > targetRatio) {
    const sourceHeight = image.naturalHeight;
    const sourceWidth = sourceHeight * targetRatio;
    return {
      sx: (image.naturalWidth - sourceWidth) / 2,
      sy: 0,
      sw: sourceWidth,
      sh: sourceHeight
    };
  }

  const sourceWidth = image.naturalWidth;
  const sourceHeight = sourceWidth / targetRatio;
  return {
    sx: 0,
    sy: image.naturalHeight * 0.28 - sourceHeight * 0.28,
    sw: sourceWidth,
    sh: sourceHeight
  };
}

function buildPortraitParticles() {
  const bounds = portraitStage.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  particleMetrics = { width: bounds.width, height: bounds.height, dpr };
  particleCanvas.width = Math.round(bounds.width * dpr);
  particleCanvas.height = Math.round(bounds.height * dpr);
  particleCanvas.style.width = `${bounds.width}px`;
  particleCanvas.style.height = `${bounds.height}px`;
  particleContext.setTransform(dpr, 0, 0, dpr, 0, 0);

  const sampleCanvas = document.createElement("canvas");
  const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
  sampleCanvas.width = Math.max(1, Math.round(bounds.width));
  sampleCanvas.height = Math.max(1, Math.round(bounds.height));
  const source = getObjectFitCoverSource(portraitImage, bounds.width, bounds.height);
  sampleContext.drawImage(
    portraitImage,
    source.sx,
    source.sy,
    source.sw,
    source.sh,
    0,
    0,
    sampleCanvas.width,
    sampleCanvas.height
  );

  const isSmall = window.matchMedia("(max-width: 820px)").matches;
  const gap = isSmall ? 19 : 23;
  const jitter = gap * 0.62;
  portraitParticles = [];

  for (let y = gap * 0.5; y < bounds.height; y += gap) {
    for (let x = gap * 0.5; x < bounds.width; x += gap) {
      const px = Math.max(0, Math.min(sampleCanvas.width - 1, Math.round(x)));
      const py = Math.max(0, Math.min(sampleCanvas.height - 1, Math.round(y)));
      const [r, g, b] = sampleContext.getImageData(px, py, 1, 1).data;
      const brightness = (r + g + b) / 765;
      const edgeFade = Math.min(1, Math.max(0.22, (x / bounds.width) * 1.4));

      if (Math.random() > 0.78 + brightness * 0.12) {
        continue;
      }

      portraitParticles.push({
        x: x + (Math.random() - 0.5) * jitter,
        y: y + (Math.random() - 0.5) * jitter,
        originX: x,
        originY: y,
        driftX: (Math.random() - 0.5) * 0.22,
        driftY: (Math.random() - 0.5) * 0.22,
        phase: Math.random() * Math.PI * 2,
        radius: 1.25 + Math.random() * 1.55,
        color: `rgb(${r}, ${g}, ${b})`,
        alpha: (0.18 + brightness * 0.36) * edgeFade
      });
    }
  }
}

function drawPortraitParticles(time = 0) {
  const { width, height } = particleMetrics;
  particleContext.clearRect(0, 0, width, height);
  particleContext.save();
  particleContext.filter = "blur(0.15px)";

  for (const particle of portraitParticles) {
    const floatX = Math.sin(time * 0.00045 + particle.phase) * 3.5;
    const floatY = Math.cos(time * 0.00038 + particle.phase * 0.8) * 4.2;
    let distanceInfluence = 0;

    if (particleMouse.active) {
      const dx = particle.x + floatX - particleMouse.x;
      const dy = particle.y + floatY - particleMouse.y;
      const distance = Math.hypot(dx, dy);
      distanceInfluence = Math.max(0, 1 - distance / 180);
    }

    particle.x += (particle.originX - particle.x) * 0.012 + particle.driftX;
    particle.y += (particle.originY - particle.y) * 0.012 + particle.driftY;
    particle.driftX *= 0.985;
    particle.driftY *= 0.985;

    const radius = particle.radius + distanceInfluence * 8.2;
    const alpha = Math.min(0.98, particle.alpha + distanceInfluence * 0.64);

    particleContext.globalAlpha = alpha;
    particleContext.fillStyle = particle.color;
    particleContext.beginPath();
    particleContext.arc(particle.x + floatX, particle.y + floatY, radius, 0, Math.PI * 2);
    particleContext.fill();

    if (distanceInfluence > 0.08) {
      particleContext.globalAlpha = distanceInfluence * 0.2;
      particleContext.strokeStyle = "rgba(255, 255, 255, 0.72)";
      particleContext.lineWidth = 0.7;
      particleContext.stroke();
    }
  }

  particleContext.restore();
  requestAnimationFrame(drawPortraitParticles);
}

function initPortraitParticles() {
  if (!portraitImage.complete || !portraitImage.naturalWidth) {
    portraitImage.addEventListener("load", initPortraitParticles, { once: true });
    return;
  }

  buildPortraitParticles();
  requestAnimationFrame(drawPortraitParticles);
}

window.addEventListener("resize", () => {
  window.clearTimeout(window.portraitResizeTimer);
  window.portraitResizeTimer = window.setTimeout(buildPortraitParticles, 180);
});

initPortraitParticles();

routeButtons.forEach((button) => {
  button.addEventListener("mouseenter", () => setRoute(button.dataset.route));
  button.addEventListener("click", () => setRoute(button.dataset.route, true));
});

storyDots.forEach((button) => {
  button.addEventListener("click", () => setRoute(button.dataset.route));
});

document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(button.dataset.scroll).scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll(".trait").forEach((button) => {
  button.addEventListener("click", () => {
    const trait = button.dataset.trait;
    document.querySelectorAll(".trait").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    document.querySelectorAll(".trait-copy").forEach((copy) => {
      copy.classList.toggle("active", copy.dataset.copy === trait);
    });
  });
});

const moons = [
  { src: "pictures/食既九连.png", title: "食既 · 九连", alt: "月食过程九连拍" },
  { src: "pictures/血月六连.png", title: "血月 · 六连", alt: "血月过程六连拍" },
  { src: "pictures/血月八连.png", title: "血月 · 八连", alt: "血月过程八连拍" }
];
let moonIndex = 0;
const moonImage = document.querySelector("#moonImage");
const moonCount = document.querySelector("#moonCount");
const moonTitle = document.querySelector("#moonTitle");
const moonProgress = document.querySelector(".moon-progress i");

function showMoon(nextIndex) {
  moonIndex = (nextIndex + moons.length) % moons.length;
  moonImage.classList.add("changing");

  window.setTimeout(() => {
    const moon = moons[moonIndex];
    moonImage.src = moon.src;
    moonImage.alt = moon.alt;
    moonCount.textContent = `0${moonIndex + 1} / 03`;
    moonTitle.textContent = moon.title;
    moonProgress.style.transform = `translateX(${moonIndex * 100}%)`;
    moonImage.classList.remove("changing");
  }, 260);
}

document.querySelector("#moonPrev").addEventListener("click", () => showMoon(moonIndex - 1));
document.querySelector("#moonNext").addEventListener("click", () => showMoon(moonIndex + 1));

let audioContext;
let ambientNodes = [];

soundToggle.addEventListener("click", () => {
  if (soundToggle.classList.contains("active")) {
    ambientNodes.forEach((node) => node.stop?.());
    ambientNodes = [];
    audioContext?.close();
    audioContext = null;
    soundToggle.classList.remove("active");
    return;
  }

  audioContext = new AudioContext();
  const master = audioContext.createGain();
  master.gain.value = 0.035;
  master.connect(audioContext.destination);

  [110, 164.81, 220].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = index === 1 ? "sine" : "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.value = index === 1 ? 0.45 : 0.22;
    oscillator.connect(gain).connect(master);
    oscillator.start();
    ambientNodes.push(oscillator);
  });

  soundToggle.classList.add("active");
});

const chapters = [...document.querySelectorAll(".chapter")];
const chapterIndex = document.querySelector(".chapter-index");
const chapterName = document.querySelector(".chapter-name");

const chapterObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (visible) {
    chapterIndex.textContent = visible.target.dataset.chapter;
    chapterName.textContent = visible.target.dataset.label;
  }
}, { threshold: [0.25, 0.5, 0.75] });

chapters.forEach((chapter) => chapterObserver.observe(chapter));
