<!-- <script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { browser } from "$app/environment";
  import Nav from "$lib/Nav.svelte";

  type TechId =
    | "html"
    | "css"
    | "js"
    | "react"
    | "vue"
    | "node"
    | "python"
    | "go"
    | "sql"
    | "nosql"
    | "flutter"
    | "reactnative";

  type TechIcon = {
    label: string;
    src: string;
  };

  type ModuleItem = {
    id: string;
    name: string;
    tech: TechId[];
  };

  type Track = {
    title: string;
    modules: ModuleItem[];
  };

  type DisplayLine =
    | { type: "header"; content: string }
    | { type: "module"; content: ModuleItem }
    | { type: "spacer" };

  type IntroState = "BOOT_NOISE" | "DESKTOP" | "OPENING";

  const CONFIG = {
    TYPING_SPEED: 60,
    LOADING_DURATION: 5000,
    LINE_DELAY: 150,
    COMMAND: "ana --curriculum"
  };

  const TECH_ICONS: Record<TechId, TechIcon> = {
    html: {
      label: "HTML",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg"
    },
    css: {
      label: "CSS",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg"
    },
    js: {
      label: "JavaScript",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
    },
    react: {
      label: "React",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
    },
    vue: {
      label: "Vue",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg"
    },
    node: {
      label: "Node.js",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
    },
    python: {
      label: "Python",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
    },
    go: {
      label: "Go",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg"
    },
    sql: {
      label: "SQL",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg"
    },
    nosql: {
      label: "NoSQL",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg"
    },
    flutter: {
      label: "Flutter",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg"
    },
    reactnative: {
      label: "React Native",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
    }
  };

  const ASCII_BANNER = [
    "    _    _   _    _     ",
    "   / \\  | \\ | |  / \\    ",
    "  / _ \\ |  \\| | / _ \\   ",
    " / ___ \\| |\\  |/ ___ \\  ",
    "/_/   \\_\\_| \\_/_/   \\_\\ ",
    "",
    "  ____ _   _ ____  ____ ___ ____ _   _ _     _   _ __  __ ",
    " / ___| | | |  _ \\|  _ \\_ _/ ___| | | | |   | | | |  \\/  |",
    "| |   | | | | |_) | |_) | | |   | | | | |   | | | | |\\/| |",
    "| |___| |_| |  _ <|  _ <| | |___| |_| | |___| |_| | |  | |",
    " \\____|\\___/|_| \\_\\_| \\_\\___\\____|\\___/|_____|\\___/|_| |_|",
    "",
    "                       AnA 17TH                          "
  ];

  const TRACKS: Track[] = [
    {
      title: "Application Development Track",
      modules: [
        { id: "01", name: "Web Development Fundamentals", tech: ["html", "css", "js"] },
        { id: "02", name: "Frontend Frameworks", tech: ["react", "vue"] },
        { id: "03", name: "Backend Engineering", tech: ["node", "python", "go"] },
        { id: "04", name: "Database Management", tech: ["sql", "nosql"] },
        { id: "05", name: "Mobile App Development", tech: ["flutter", "reactnative"] }
      ]
    },
    {
      title: "Architecture Fundamentals Track",
      modules: [
        { id: "01", name: "System Design Principles", tech: [] },
        { id: "02", name: "Data Structures & Algorithms", tech: [] }
      ]
    }
  ];

  let state = "INIT";
  let typedCommand = "";
  let progress = 0;
  let displayedLines: DisplayLine[] = [];
  let previousScrollRestoration: ScrollRestoration = "auto";
  let isCurriculumOpen = false;
  let introState: IntroState = "BOOT_NOISE";

  let isActive = true;
  let progressFrame = 0;
  const pendingTimeouts = new Set<number>();

  const sleep = (ms: number): Promise<void> =>
    new Promise<void>((resolve) => {
      if (!isActive) {
        resolve();
        return;
      }

      const timeoutId = window.setTimeout(() => {
        pendingTimeouts.delete(timeoutId);
        resolve();
      }, ms);

      pendingTimeouts.add(timeoutId);
    });

  async function runSequence() {
    state = "TYPING";
    typedCommand = "";
    progress = 0;
    displayedLines = [];

    for (let i = 0; i <= CONFIG.COMMAND.length; i++) {
      if (!isActive) return;
      typedCommand = CONFIG.COMMAND.slice(0, i);
      await sleep(CONFIG.TYPING_SPEED);
    }

    if (!isActive) return;
    await sleep(500);

    if (!isActive) return;
    state = "LOADING";
    const startTime = Date.now();

    const updateProgress = () => {
      if (!isActive) return;

      const elapsed = Date.now() - startTime;
      progress = Math.min((elapsed / CONFIG.LOADING_DURATION) * 100, 100);

      if (progress < 100) {
        progressFrame = requestAnimationFrame(updateProgress);
      }
    };

    progressFrame = requestAnimationFrame(updateProgress);

    await sleep(CONFIG.LOADING_DURATION + 500);
    if (!isActive) return;

    state = "RENDERING";
    for (const track of TRACKS) {
      if (!isActive) return;
      displayedLines = [...displayedLines, { type: "header", content: track.title }];
      await sleep(CONFIG.LINE_DELAY * 2);

      for (const mod of track.modules) {
        if (!isActive) return;
        displayedLines = [...displayedLines, { type: "module", content: mod }];
        await sleep(CONFIG.LINE_DELAY);
      }

      displayedLines = [...displayedLines, { type: "spacer" }];
    }

    if (!isActive) return;
    state = "DONE";
  }

  async function runIntroSequence() {
    introState = "BOOT_NOISE";
    await sleep(1300);
    if (!isActive) return;
    introState = "DESKTOP";
  }

  async function openCurriculumFromDesktop() {
    if (introState !== "DESKTOP") return;
    introState = "OPENING";
    await sleep(760);
    if (!isActive) return;
    isCurriculumOpen = true;
    runSequence();
  }

  onMount(() => {
    if (browser && "scrollRestoration" in history) {
      previousScrollRestoration = history.scrollRestoration;
      history.scrollRestoration = "manual";
    }
    if (browser) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    runIntroSequence();
  });

  onDestroy(() => {
    isActive = false;

    if (browser && "scrollRestoration" in history) {
      history.scrollRestoration = previousScrollRestoration;
    }

    if (browser && progressFrame) {
      cancelAnimationFrame(progressFrame);
    }

    for (const timeoutId of pendingTimeouts) {
      clearTimeout(timeoutId);
    }

    pendingTimeouts.clear();
  });
</script>

<Nav />

<main class="curriculum-page">
  <section class="intro-stage">
    <div class="computer">
      <div class="computer-screen">
        {#if !isCurriculumOpen}
          {#if introState === "BOOT_NOISE"}
            <div class="boot-noise" aria-hidden="true">
              <div class="boot-glow"></div>
              <p class="boot-text">zzzt... powering on</p>
            </div>
          {:else}
            <div class="desktop" class:opening={introState === "OPENING"}>
              <button
                class="desktop-app"
                type="button"
                on:click={openCurriculumFromDesktop}
                aria-label="Open AnA curriculum app"
              >
                <img class="desktop-app-icon" src="/logo.svg" alt="AnA logo" />
                <span class="desktop-app-label">AnA Curriculum</span>
              </button>
              <p class="desktop-tip">앱 아이콘을 눌러 커리큘럼 열기</p>
            </div>
          {/if}
        {:else}
          <div class="monitor-app" in:fade={{ duration: 260 }}>
            <section class="page-header" in:fade={{ duration: 220 }}>
              <p class="eyebrow">ANA 17TH PROGRAM</p>
              <h1>Curriculum Overview</h1>
              <p class="subtitle">Tracks, modules, and practical stacks for the next AnA generation.</p>
              <p class="meta">2 Tracks | 7 Modules | Project-Driven Learning</p>
            </section>

            <section class="terminal-window" in:fade={{ duration: 280, delay: 60 }}>
              <div class="title-bar">
                <div class="buttons">
                  <span class="dot close"></span>
                  <span class="dot minimize"></span>
                  <span class="dot expand"></span>
                </div>
                <div class="window-title">ana --curriculum | zsh</div>
              </div>

              <div class="terminal-content">
                <div class="line">
                  <span class="prompt">$</span>
                  <span class="cmd">{typedCommand}</span>
                  {#if state === "TYPING"}<span class="cursor">_</span>{/if}
                </div>

                {#if state === "LOADING"}
                  <div class="loading-container" in:fade>
                    <div class="msg">&gt; Loading modules...</div>
                    <div class="bar-row">
                      <span class="bracket">[</span>
                      <span class="bar-fill">{"#".repeat(Math.floor(progress / 5)).padEnd(20, " ")}</span>
                      <span class="bracket">]</span>
                      <span class="percent">{Math.floor(progress)}%</span>
                    </div>
                  </div>
                {/if}

                {#if state === "RENDERING" || state === "DONE"}
                  <pre class="ascii-banner" in:fade>{ASCII_BANNER.join("\n")}</pre>
                {/if}

                <div class="results">
                  {#each displayedLines as line}
                    <div class="line-item" in:slide={{ duration: 150 }}>
                      {#if line.type === "header"}
                        <div class="track-title">[{line.content}]</div>
                      {:else if line.type === "module"}
                        <div class="module-row">
                          <span class="tree">└──</span>
                          <span class="id">{line.content.id}.</span>
                          <span class="name">{line.content.name}</span>
                          {#if line.content.tech.length}
                            <span class="divider">|</span>
                            <span class="tech-stack">
                              {#each line.content.tech as tech}
                                {@const icon = TECH_ICONS[tech]}
                                <img class="tech-icon" src={icon.src} alt={icon.label} title={icon.label} loading="lazy" />
                              {/each}
                            </span>
                          {/if}
                        </div>
                      {:else}
                        <div class="spacer"></div>
                      {/if}
                    </div>
                  {/each}
                </div>

                {#if state === "DONE"}
                  <div class="line done-line" in:fade>
                    <span class="prompt">$</span> ana &gt; <span class="cursor-blink">_</span>
                  </div>
                {/if}
              </div>
            </section>
          </div>
        {/if}
      </div>
      <div class="computer-stand"></div>
    </div>
  </section>
</main>

<style>
  .curriculum-page {
    --bg: #f9f9f9;
    --term-bg: #fcfbf7;
    --term-header: #ebe6dc;
    --term-border: #d7cfbf;
    --term-fg: #2f2b24;
    --term-muted: #6f6658;
    --accent-green: #5f8a48;
    --accent-amber: #b48f3f;
    --accent-blue: #4f668a;
    --accent-soft: #dbe8d2;
    margin-top: 5rem;
    min-height: calc(100vh - 5rem);
    padding: 1.75rem 1rem 3rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.95rem;
    background-color: var(--bg);
  }

  .intro-stage {
    width: min(100%, 860px);
    min-height: calc(100vh - 10rem);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .computer {
    width: min(92vw, 740px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.65rem;
  }

  .computer-screen {
    width: 100%;
    aspect-ratio: 16 / 10;
    border-radius: 14px;
    padding: 0.85rem;
    overflow: hidden;
    border: 1px solid #b7b2a7;
    background: linear-gradient(165deg, #f0ece2, #ddd7ca);
    box-shadow:
      0 25px 45px rgba(48, 44, 36, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  .computer-stand {
    width: 26%;
    height: 10px;
    border-radius: 999px;
    background: #ccc5b7;
    box-shadow: 0 10px 24px rgba(44, 38, 30, 0.16);
  }

  .boot-noise,
  .desktop {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    border: 1px solid #9ea8b3;
  }

  .boot-noise {
    background:
      radial-gradient(circle at 40% 45%, #c2d3e2 0%, #8fa4ba 27%, #4f6070 54%, #202833 100%);
    animation: screenFlicker 95ms steps(2) infinite;
  }

  .boot-noise::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.09) 0,
        rgba(255, 255, 255, 0.09) 1px,
        rgba(0, 0, 0, 0.09) 2px,
        rgba(0, 0, 0, 0.09) 3px
      );
    mix-blend-mode: overlay;
    pointer-events: none;
  }

  .boot-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 50%, rgba(208, 231, 255, 0.22), transparent 58%);
    animation: scanMove 1.2s ease-in-out infinite;
  }

  .boot-text {
    position: absolute;
    left: 1rem;
    bottom: 0.8rem;
    margin: 0;
    color: #e8f4ff;
    font-size: clamp(0.72rem, 1.2vw, 0.98rem);
    letter-spacing: 0.06em;
    font-weight: 700;
    text-shadow: 0 0 8px rgba(202, 232, 255, 0.52);
  }

  .desktop {
    background:
      linear-gradient(145deg, #355b8b, #29496f 55%, #203d63),
      radial-gradient(circle at 22% 20%, rgba(255, 255, 255, 0.1), transparent 45%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 1rem;
  }

  .desktop::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at center, transparent 55%, rgba(0, 0, 0, 0.22) 100%);
    pointer-events: none;
  }

  .desktop-app {
    border: 0;
    background: transparent;
    color: #fff;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transform: translateZ(0);
    transition: transform 220ms ease;
  }

  .desktop-app:hover {
    transform: translateY(-2px) scale(1.03);
  }

  .desktop.opening .desktop-app {
    animation: appOpen 720ms cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
  }

  .desktop-app-icon {
    width: clamp(52px, 7vw, 70px);
    height: clamp(52px, 7vw, 70px);
    filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.35));
  }

  .desktop-app-label {
    font-size: clamp(0.76rem, 1.1vw, 0.96rem);
    color: #f7fbff;
    letter-spacing: 0.02em;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.45);
  }

  .desktop-tip {
    margin: 0;
    color: #d6e8ff;
    font-size: clamp(0.7rem, 1vw, 0.84rem);
    letter-spacing: 0.02em;
    text-shadow: 0 1px 5px rgba(0, 0, 0, 0.42);
  }

  .monitor-app {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    border: 1px solid #9ea8b3;
    background: #f3eee1;
    padding: 0.7rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    overflow: hidden;
  }

  .page-header {
    width: 100%;
    color: var(--term-fg);
    font-family: "JetBrains Mono", "Fira Code", monospace;
  }

  .eyebrow {
    margin: 0;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    color: var(--accent-green);
    font-weight: 700;
  }

  .page-header h1 {
    margin: 0.35rem 0 0;
    font-size: clamp(1.5rem, 2.2vw, 2rem);
    letter-spacing: 0;
    font-weight: 800;
  }

  .subtitle {
    margin: 0.4rem 0 0;
    color: var(--term-muted);
    font-size: 0.92rem;
  }

  .meta {
    margin: 0.4rem 0 0;
    color: var(--accent-blue);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .terminal-window {
    width: 100%;
    background-color: var(--term-bg);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 15px 34px rgba(43, 39, 34, 0.12);
    border: 1px solid var(--term-border);
    min-height: 0;
    flex: 1;
  }

  .title-bar {
    background-color: var(--term-header);
    height: 35px;
    display: flex;
    align-items: center;
    padding: 0 15px;
    position: relative;
  }

  .buttons {
    display: flex;
    gap: 8px;
    z-index: 2;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .close {
    background-color: #ff5f56;
  }

  .minimize {
    background-color: #ffbd2e;
  }

  .expand {
    background-color: #27c93f;
  }

  .window-title {
    position: absolute;
    width: 100%;
    text-align: center;
    left: 0;
    font-size: 13px;
    color: var(--term-muted);
    font-family: sans-serif;
  }

  .terminal-content {
    padding: 18px 16px 20px;
    color: var(--term-fg);
    font-family: "JetBrains Mono", "Fira Code", "Courier New", monospace;
    font-size: 13px;
    line-height: 1.6;
    min-height: 0;
    height: 100%;
    overflow: auto;
  }

  .prompt {
    color: var(--accent-green);
    font-weight: bold;
    margin-right: 8px;
  }

  .cmd {
    color: var(--term-fg);
  }

  .loading-container {
    margin: 15px 0;
    color: var(--accent-green);
  }

  .bar-fill {
    color: var(--accent-amber);
    white-space: pre;
    font-weight: 700;
  }

  .percent {
    margin-left: 10px;
    min-width: 40px;
    display: inline-block;
    color: var(--accent-blue);
    font-weight: 700;
  }

  .ascii-banner {
    margin: 0 0 0.95rem;
    padding: 0.78rem 0.85rem;
    border-radius: 8px;
    background-color: #f3eee1;
    color: #2d3748;
    font-size: clamp(0.46rem, 1.14vw, 0.88rem);
    line-height: 1.18;
    letter-spacing: 0;
    font-weight: 800;
    text-rendering: geometricPrecision;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    white-space: pre;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .track-title {
    color: var(--accent-green);
    margin-top: 12px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .module-row {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--term-muted);
    padding: 0.12rem 0;
  }

  .tree {
    color: #98a17f;
  }

  .id {
    color: var(--accent-blue);
  }

  .name {
    color: var(--term-fg);
  }

  .divider {
    color: #b5ad9e;
    margin-left: 2px;
  }

  .tech-stack {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    flex-wrap: wrap;
  }

  .tech-icon {
    width: 18px;
    height: 18px;
    object-fit: contain;
    display: inline-block;
  }

  .spacer {
    height: 12px;
  }

  .cursor,
  .cursor-blink {
    animation: blink 1s step-end infinite;
  }

  .done-line {
    margin-top: 4px;
  }

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }

  @keyframes screenFlicker {
    0% {
      filter: saturate(0.85) contrast(1.1) brightness(0.95);
    }
    50% {
      filter: saturate(1.12) contrast(1.2) brightness(1.06);
    }
    100% {
      filter: saturate(0.9) contrast(1.08) brightness(0.98);
    }
  }

  @keyframes scanMove {
    0% {
      transform: translateY(-32%);
      opacity: 0.2;
    }
    50% {
      transform: translateY(12%);
      opacity: 0.46;
    }
    100% {
      transform: translateY(45%);
      opacity: 0.2;
    }
  }

  @keyframes appOpen {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    60% {
      transform: scale(1.95);
      opacity: 0.9;
    }
    100% {
      transform: scale(3.5);
      opacity: 0;
    }
  }

  @media (max-width: 768px) {
    .curriculum-page {
      margin-top: 4.4rem;
      padding: 1rem 0.75rem 2rem;
      gap: 0.75rem;
    }

    .intro-stage {
      min-height: calc(100vh - 7rem);
    }

    .computer {
      width: min(95vw, 680px);
      gap: 0.52rem;
    }

    .computer-screen {
      padding: 0.6rem;
    }

    .monitor-app {
      padding: 0.55rem;
      gap: 0.5rem;
    }

    .page-header h1 {
      font-size: 1.1rem;
    }

    .subtitle {
      font-size: 0.76rem;
      margin-top: 0.22rem;
    }

    .meta {
      font-size: 0.64rem;
      letter-spacing: 0.01em;
      margin-top: 0.24rem;
    }

    .terminal-content {
      padding: 12px 10px 14px;
      font-size: 11px;
    }

    .ascii-banner {
      font-size: 0.3rem;
      line-height: 1.12;
      padding: 0.4rem 0.42rem;
    }

    .module-row {
      flex-wrap: wrap;
      row-gap: 2px;
    }
  }
</style> -->
