(() => {
  const THEME_KEY = "ai-story-theme";

  /**
   * localStorage 접근이 제한된 환경에서도 안전하게 테마 값을 읽습니다.
   */
  function getSavedTheme() {
    try {
      return window.localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  }

  /**
   * 사용자가 선택한 테마를 localStorage에 저장합니다.
   */
  function saveTheme(theme) {
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // file:// 보안 정책 등으로 저장이 막힌 경우 무시
    }
  }

  /**
   * 현재 다크/라이트 모드 상태를 DOM과 버튼 라벨에 반영합니다.
   */
  function applyTheme(isDark) {
    document.body.classList.toggle("dark", isDark);
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.textContent = isDark ? "☀️ 밝은 화면" : "🌙 어두운 화면";
      themeToggle.setAttribute("aria-pressed", String(isDark));
    }
  }

  /**
   * 페이지 로드 시 저장된 테마를 복원하고 토글 버튼 이벤트를 연결합니다.
   */
  function initTheme() {
    const saved = getSavedTheme();
    applyTheme(saved === "dark");

    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const nextDark = !document.body.classList.contains("dark");
        applyTheme(nextDark);
        saveTheme(nextDark ? "dark" : "light");
      });
    }
  }

  /**
   * 현재 URL 경로에 해당하는 상단 내비게이션 버튼에 active 클래스를 부여합니다.
   */
  function highlightActiveNav() {
    const rawPath = (window.location.pathname || "").replace(/\\/g, "/");
    let normalized = rawPath.split("/").pop() || "index.html";
    if (rawPath.includes("/people/")) {
      normalized = "people.html";
    } else if (rawPath.includes("/models/")) {
      normalized = "models.html";
    }

    const navLinks = document.querySelectorAll(".header-controls .nav-pill[data-page]");
    navLinks.forEach((link) => {
      const targetPage = link.getAttribute("data-page");
      const isActive = targetPage === normalized;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  /**
   * index.html의 3단 서랍(펼쳐 보기 / 스크립트 읽어보기) 패널을 열고 닫습니다.
   * 버튼 요소 또는 패널 ID를 인자로 받아 동작합니다.
   */
  function toggleDrawer(triggerOrPanelId) {
    let trigger = null;
    let panel = null;

    if (typeof triggerOrPanelId === "string") {
      panel = document.getElementById(triggerOrPanelId);
      trigger = document.querySelector(`[data-drawer-target="${triggerOrPanelId}"]`);
    } else if (triggerOrPanelId && triggerOrPanelId.nodeType === 1) {
      trigger = triggerOrPanelId;
      const targetId = trigger.getAttribute("data-drawer-target");
      if (targetId) {
        panel = document.getElementById(targetId);
      } else if (trigger.closest(".scene-card")) {
        panel = trigger.closest(".scene-card").querySelector(".drawer-panel");
      }
    }

    if (!panel) return;

    const card = panel.closest(".scene-card");
    const willOpen = !panel.classList.contains("open");

    // 같은 카드 내 다른 서랍은 닫아 3단 서랍이 깔끔하게 전환되도록 정리
    if (card && willOpen) {
      card.querySelectorAll(".drawer-panel.open").forEach((otherPanel) => {
        if (otherPanel !== panel) {
          otherPanel.classList.remove("open");
          const otherBtn = card.querySelector(`[data-drawer-target="${otherPanel.id}"]`);
          updateDrawerButtonLabel(otherBtn, false);
        }
      });
    }

    panel.classList.toggle("open", willOpen);
    updateDrawerButtonLabel(trigger, willOpen);
  }

  /**
   * 서랍 버튼의 열림/닫힘 상태 라벨과 aria-expanded를 갱신합니다.
   */
  function updateDrawerButtonLabel(btn, isOpen) {
    if (!btn) return;
    btn.classList.toggle("is-open", isOpen);
    btn.setAttribute("aria-expanded", String(isOpen));
    const openLabel = btn.getAttribute("data-open-label");
    const closeLabel = btn.getAttribute("data-close-label");
    if (openLabel && closeLabel) {
      btn.textContent = isOpen ? closeLabel : openLabel;
    }
  }

  /**
   * index.html의 서랍 토글 및 전체 펼치기/접기 버튼 이벤트를 연결합니다.
   */
  function initDrawers() {
    document.querySelectorAll("[data-drawer-target]").forEach((btn) => {
      btn.addEventListener("click", () => toggleDrawer(btn));
    });

    const toggleAllBtn = document.getElementById("toggleAllDrawers");
    if (toggleAllBtn) {
      toggleAllBtn.addEventListener("click", () => {
        const panels = document.querySelectorAll(".drawer-panel[data-drawer-kind='detail']");
        const anyClosed = Array.from(panels).some((p) => !p.classList.contains("open"));
        panels.forEach((panel) => {
          panel.classList.toggle("open", anyClosed);
          const btn = document.querySelector(`[data-drawer-target="${panel.id}"]`);
          updateDrawerButtonLabel(btn, anyClosed);
        });
        toggleAllBtn.textContent = anyClosed ? "🔼 모든 해설 서랍 접기" : "📂 모든 해설 서랍 펼치기";
      });
    }
  }

  /**
   * data-copy-text 버튼 클릭 시 클립보드로 URL을 복사하고 안내 문구를 표시합니다.
   */
  function initCopyButtons() {
    document.querySelectorAll("[data-copy-text]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const text = btn.getAttribute("data-copy-text");
        if (!text) return;
        const original = btn.textContent;
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = "✓ 복사됨";
        } catch {
          btn.textContent = "복사 실패";
        }
        window.setTimeout(() => {
          btn.textContent = original;
        }, 1600);
      });
    });
  }

  window.toggleDrawer = toggleDrawer;

  initTheme();
  highlightActiveNav();
  initDrawers();
  initCopyButtons();
})();
