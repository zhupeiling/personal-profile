const portraitStage = document.querySelector("#portraitStage");
const routeButtons = [...document.querySelectorAll(".route")];
const storyDots = [...document.querySelectorAll(".story-dot")];
const storyPanels = [...document.querySelectorAll(".story-panel")];
const previewText = document.querySelector("#previewText");
const soundToggle = document.querySelector(".sound-toggle");

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
  portraitStage.style.setProperty("--x", `${x}%`);
  portraitStage.style.setProperty("--y", `${y}%`);
  portraitStage.classList.add("engaged");
});

portraitStage.addEventListener("pointerleave", () => {
  portraitStage.classList.remove("engaged");
});

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
