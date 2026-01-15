/* assets-style-guide-image.js
   Interactions for the standalone "Assets, Style Guide & Image" screen.
*/
(function () {
  "use strict";

  /**
   * PUBLIC_INTERFACE
   * Copy text to clipboard using the best available method.
   * @param {string} text Text to copy.
   * @returns {Promise<void>}
   */
  async function copyToClipboard(text) {
    if (!text) return;

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return;
    }

    // Fallback for older browsers: use a temporary textarea.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "true");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  /**
   * PUBLIC_INTERFACE
   * Show a brief toast-like inline status message.
   * @param {string} message Message to display.
   * @param {"info"|"error"} kind Message kind.
   */
  function showToast(message, kind) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.hidden = false;
    toast.textContent = message;
    toast.dataset.kind = kind || "info";

    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      toast.hidden = true;
      toast.textContent = "";
      delete toast.dataset.kind;
    }, 1600);
  }

  /**
   * PUBLIC_INTERFACE
   * Build a token payload for exporting.
   * @returns {Record<string, string>}
   */
  function getTokens() {
    return {
      primary: "#3b82f6",
      secondary: "#64748b",
      success: "#06b6d4",
      error: "#EF4444",
      background: "#f9fafb",
      surface: "#ffffff",
      text: "#111827",
    };
  }

  /**
   * PUBLIC_INTERFACE
   * Generate CSS variable string for copying.
   * @returns {string}
   */
  function getCssVarsText() {
    const t = getTokens();
    return [
      ":root {",
      `  --primary: ${t.primary};`,
      `  --secondary: ${t.secondary};`,
      `  --success: ${t.success};`,
      `  --error: ${t.error};`,
      `  --background: ${t.background};`,
      `  --surface: ${t.surface};`,
      `  --text: ${t.text};`,
      "}",
    ].join("\n");
  }

  function downloadJson(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function wireSwatchCopy() {
    document.querySelectorAll("[data-hex]").forEach((el) => {
      el.addEventListener("click", async () => {
        const hex = el.getAttribute("data-hex");
        try {
          await copyToClipboard(hex);
          showToast(`Copied ${hex} to clipboard`, "info");
        } catch (e) {
          showToast("Could not copy to clipboard in this browser.", "error");
        }
      });
    });
  }

  function wireGenericCopy() {
    document.querySelectorAll("[data-copy]").forEach((el) => {
      el.addEventListener("click", async (evt) => {
        evt.stopPropagation();
        const txt = el.getAttribute("data-copy");
        try {
          await copyToClipboard(txt);
          showToast(`Copied: ${txt}`, "info");
        } catch (e) {
          showToast("Copy failed.", "error");
        }
      });
    });
  }

  function wireHeaderButtons() {
    const btnCopyCssVars = document.getElementById("btnCopyCssVars");
    if (btnCopyCssVars) {
      btnCopyCssVars.addEventListener("click", async () => {
        try {
          await copyToClipboard(getCssVarsText());
          showToast("Copied CSS variables", "info");
        } catch (e) {
          showToast("Copy failed.", "error");
        }
      });
    }

    const btnDownloadJson = document.getElementById("btnDownloadJson");
    if (btnDownloadJson) {
      btnDownloadJson.addEventListener("click", () => {
        downloadJson("style-tokens.json", getTokens());
        showToast("Downloaded style-tokens.json", "info");
      });
    }
  }

  function wireGridOverlay() {
    const btnToggleGrid = document.getElementById("btnToggleGrid");
    const gridOverlay = document.getElementById("gridOverlay");
    if (!btnToggleGrid || !gridOverlay) return;

    btnToggleGrid.addEventListener("click", () => {
      const willShow = gridOverlay.hidden;
      gridOverlay.hidden = !willShow;
      showToast(willShow ? "Grid overlay enabled" : "Grid overlay disabled", "info");
    });
  }

  // Init
  wireSwatchCopy();
  wireGenericCopy();
  wireHeaderButtons();
  wireGridOverlay();
})();
