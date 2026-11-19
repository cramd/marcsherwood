/**
 * Adventure Selfie — badly Photoshop yourself onto the GS. Browser-only, nothing uploaded.
 */

const FUNNY_CAPTIONS = [
  "Totally the previous owner",
  "GS-certified adventure human",
  "Just here for the LEGO",
  "Starbucks navigation: enabled",
  "100% valve-check aware",
  "Definitely not a KTM spy",
  "Heidenau K60 enthusiast (pending)",
  "Seton Lake or bust",
  "Panniers fit my personality",
  "New battery, same dreams",
  "Ask me about ESA",
  "Two owners, zero regrets",
  "Turn-key rider, questionable skills",
  "Oh, the places I will go",
  "Fully armored ego",
];

const VIBE_PRESETS = {
  sticker: {
    label: "Bad sticker",
    mode: "sticker",
    useScenePosition: true,
    scaleMultiplier: 1,
    rotation: -8,
  },
  giant: {
    label: "Giant head",
    mode: "sticker",
    centerX: 0.52,
    centerY: 0.4,
    scale: 0.52,
    rotation: 6,
  },
  lurker: {
    label: "Suspicious lurker",
    mode: "sticker",
    centerX: 0.88,
    centerY: 0.8,
    scale: 0.17,
    rotation: 16,
  },
  photobomb: {
    label: "Photobomb",
    mode: "cutout",
    centerX: 0.12,
    centerY: 0.74,
    scale: 0.26,
    rotation: -12,
  },
  awkward: {
    label: "Awkward cutout",
    mode: "cutout",
    useScenePosition: true,
    scaleMultiplier: 1.08,
    rotation: 4,
  },
};

function initAdventureSelfie() {
  const root = document.getElementById("f800gs-adventure-selfie");
  if (!root) return;

  const canvas = root.querySelector("#f800gs-selfie-canvas");
  const fileInput = root.querySelector("#f800gs-selfie-upload");
  const sizeInput = root.querySelector("#f800gs-selfie-size");
  const sizeValue = root.querySelector("#f800gs-selfie-size-value");
  const tiltInput = root.querySelector("#f800gs-selfie-tilt");
  const tiltValue = root.querySelector("#f800gs-selfie-tilt-value");
  const resetBtn = root.querySelector("#f800gs-selfie-reset");
  const downloadBtn = root.querySelector("#f800gs-selfie-download");
  const shuffleCaptionBtn = root.querySelector("#f800gs-selfie-shuffle-caption");
  const captionToggle = root.querySelector("#f800gs-selfie-caption-toggle");
  const dragHint = root.querySelector("#f800gs-selfie-drag-hint");
  const emptyState = root.querySelector("#f800gs-selfie-empty");
  const sceneButtons = Array.from(root.querySelectorAll("[data-selfie-scene]"));
  const vibeButtons = root.querySelectorAll("[data-selfie-vibe]");

  if (!canvas || !fileInput || sceneButtons.length === 0) return;

  const scenes = sceneButtons.map((button) => ({
    id: button.dataset.selfieScene,
    src: button.dataset.selfieSrc,
    label: button.querySelector("span")?.textContent?.trim() || button.dataset.selfieScene,
    defaultX: Number(button.dataset.selfieX),
    defaultY: Number(button.dataset.selfieY),
    defaultScale: Number(button.dataset.selfieScale),
  }));

  const ctx = canvas.getContext("2d");
  const state = {
    sceneId: scenes[0].id,
    vibeId: "sticker",
    backgroundImage: null,
    userImage: null,
    renderMode: "sticker",
    centerX: scenes[0].defaultX,
    centerY: scenes[0].defaultY,
    scale: scenes[0].defaultScale,
    rotation: VIBE_PRESETS.sticker.rotation,
    caption: FUNNY_CAPTIONS[0],
    showCaption: true,
    isDragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0,
  };

  function getActiveScene() {
    return scenes.find((scene) => scene.id === state.sceneId) || scenes[0];
  }

  function pickRandomCaption() {
    const index = Math.floor(Math.random() * FUNNY_CAPTIONS.length);
    return FUNNY_CAPTIONS[index];
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      image.src = src;
    });
  }

  function resizeCanvasToImage(image) {
    const maxWidth = Math.min(960, root.querySelector(".f800gs-selfie-preview-wrap")?.clientWidth || 960);
    const aspectRatio = image.height / image.width;
    canvas.width = Math.round(maxWidth * window.devicePixelRatio);
    canvas.height = Math.round(maxWidth * aspectRatio * window.devicePixelRatio);
    canvas.style.width = `${maxWidth}px`;
    canvas.style.height = `${maxWidth * aspectRatio}px`;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  function canvasDimensions() {
    return {
      width: canvas.width / window.devicePixelRatio,
      height: canvas.height / window.devicePixelRatio,
    };
  }

  function pointerToNormalized(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  }

  function overlayDimensions() {
    const { width } = canvasDimensions();
    if (!state.userImage) return { width: 0, height: 0 };
    const baseWidth = width * state.scale;
    const aspectRatio = state.userImage.height / state.userImage.width;
    return { width: baseWidth, height: baseWidth * aspectRatio };
  }

  function roundRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  function drawStickerPath(context, width, height, isCircle) {
    if (isCircle) {
      const radius = Math.min(width, height) / 2;
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.closePath();
      return;
    }
    roundRect(context, -width / 2, -height / 2, width, height, 14);
  }

  function drawOverlay(image) {
    const { width: canvasWidth, height: canvasHeight } = canvasDimensions();
    const { width, height } = overlayDimensions();
    const centerPixelX = state.centerX * canvasWidth;
    const centerPixelY = state.centerY * canvasHeight;
    const isCircle = state.renderMode === "sticker";
    const rotationRadians = (state.rotation * Math.PI) / 180;

    ctx.save();
    ctx.translate(centerPixelX, centerPixelY);
    ctx.rotate(rotationRadians);

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 9;
    ctx.shadowOffsetY = 13;
    ctx.filter = "saturate(1.22) contrast(1.08) brightness(1.03)";

    drawStickerPath(ctx, width, height, isCircle);
    ctx.clip();
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
    ctx.restore();

    ctx.save();
    drawStickerPath(ctx, width, height, isCircle);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = isCircle ? 10 : 9;
    ctx.stroke();
    drawStickerPath(ctx, width, height, isCircle);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  function drawCaption(width, height) {
    if (!state.showCaption || !state.caption) return;

    const paddingX = 16;
    const boxHeight = 38;
    const bottomGap = 18;
    ctx.font = "700 15px Outfit, Plus Jakarta Sans, sans-serif";
    const textWidth = ctx.measureText(state.caption).width;
    const boxWidth = Math.min(width * 0.92, textWidth + paddingX * 2);
    const boxX = (width - boxWidth) / 2;
    const boxY = height - boxHeight - bottomGap;

    ctx.save();
    ctx.translate(0, 0);
    roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 12);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#111111";
    ctx.stroke();

    ctx.fillStyle = "#111111";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(state.caption, width / 2, boxY + boxHeight / 2);
    ctx.restore();
  }

  function drawObviousBadge(width) {
    if (!state.userImage) return;
    ctx.save();
    ctx.font = "700 11px Outfit, Plus Jakarta Sans, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
    ctx.lineWidth = 2;
    const label = "OBVIOUSLY PHOTOSHOPPED";
    const metrics = ctx.measureText(label);
    const padX = 10;
    const boxW = metrics.width + padX * 2;
    const boxH = 24;
    const boxX = width - boxW - 12;
    const boxY = 12;
    roundRect(ctx, boxX, boxY, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#111111";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, boxX + boxW / 2, boxY + boxH / 2);
    ctx.restore();
  }

  function render() {
    const { width, height } = canvasDimensions();
    ctx.clearRect(0, 0, width, height);

    if (!state.backgroundImage) return;

    ctx.drawImage(state.backgroundImage, 0, 0, width, height);

    if (state.userImage) {
      drawOverlay(state.userImage);
      drawObviousBadge(width);
      drawCaption(width, height);
      if (emptyState) emptyState.hidden = true;
      if (dragHint) dragHint.hidden = false;
      if (downloadBtn) downloadBtn.disabled = false;
    } else {
      if (emptyState) emptyState.hidden = false;
      if (dragHint) dragHint.hidden = true;
      if (downloadBtn) downloadBtn.disabled = true;
    }
  }

  function syncControlsFromState() {
    sizeInput.value = String(Math.round(state.scale * 100));
    if (sizeValue) sizeValue.textContent = `${sizeInput.value}%`;
    if (tiltInput) tiltInput.value = String(Math.round(state.rotation));
    if (tiltValue) tiltValue.textContent = `${tiltInput.value}°`;
    if (captionToggle) captionToggle.checked = state.showCaption;
  }

  function applyVibe(vibeId, keepCaption = true) {
    const vibe = VIBE_PRESETS[vibeId];
    const scene = getActiveScene();
    if (!vibe) return;

    state.vibeId = vibeId;
    state.renderMode = vibe.mode;
    state.rotation = vibe.rotation ?? state.rotation;

    if (vibe.useScenePosition) {
      state.centerX = scene.defaultX;
      state.centerY = scene.defaultY;
      state.scale = scene.defaultScale * (vibe.scaleMultiplier || 1);
    } else {
      state.centerX = vibe.centerX;
      state.centerY = vibe.centerY;
      state.scale = vibe.scale;
    }

    if (!keepCaption) {
      state.caption = pickRandomCaption();
    }

    vibeButtons.forEach((button) => {
      const isActive = button.dataset.selfieVibe === vibeId;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    syncControlsFromState();
    render();
  }

  async function setScene(sceneId) {
    const scene = scenes.find((item) => item.id === sceneId);
    if (!scene) return;

    state.sceneId = scene.id;

    sceneButtons.forEach((button) => {
      const isActive = button.dataset.selfieScene === scene.id;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    state.backgroundImage = await loadImage(scene.src);
    resizeCanvasToImage(state.backgroundImage);
    applyVibe(state.vibeId, true);
  }

  function applyUserFile(file) {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        state.userImage = image;
        state.caption = pickRandomCaption();
        state.rotation = state.rotation + (Math.random() * 6 - 3);
        syncControlsFromState();
        render();
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function resetPlacement() {
    applyVibe(state.vibeId, false);
  }

  function downloadComposite() {
    if (!state.userImage || !state.backgroundImage) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const fileName = `f800gs-photoshop-${state.sceneId}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "My questionable F800GS adventure",
            text: state.caption,
          });
          return;
        } catch (error) {
          if (error.name === "AbortError") return;
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  sceneButtons.forEach((button) => {
    button.addEventListener("click", () => setScene(button.dataset.selfieScene));
  });

  vibeButtons.forEach((button) => {
    button.addEventListener("click", () => applyVibe(button.dataset.selfieVibe, false));
  });

  fileInput.addEventListener("change", () => {
    applyUserFile(fileInput.files?.[0]);
  });

  sizeInput.addEventListener("input", () => {
    state.scale = Number(sizeInput.value) / 100;
    if (sizeValue) sizeValue.textContent = `${sizeInput.value}%`;
    render();
  });

  tiltInput?.addEventListener("input", () => {
    state.rotation = Number(tiltInput.value);
    if (tiltValue) tiltValue.textContent = `${tiltInput.value}°`;
    render();
  });

  captionToggle?.addEventListener("change", () => {
    state.showCaption = captionToggle.checked;
    render();
  });

  shuffleCaptionBtn?.addEventListener("click", () => {
    state.caption = pickRandomCaption();
    render();
  });

  resetBtn?.addEventListener("click", resetPlacement);
  downloadBtn?.addEventListener("click", downloadComposite);

  canvas.addEventListener("pointerdown", (event) => {
    if (!state.userImage) return;
    const point = pointerToNormalized(event.clientX, event.clientY);
    state.isDragging = true;
    state.dragOffsetX = point.x - state.centerX;
    state.dragOffsetY = point.y - state.centerY;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.isDragging) return;
    const point = pointerToNormalized(event.clientX, event.clientY);
    state.centerX = Math.min(0.98, Math.max(0.02, point.x - state.dragOffsetX));
    state.centerY = Math.min(0.98, Math.max(0.02, point.y - state.dragOffsetY));
    render();
  });

  canvas.addEventListener("pointerup", () => {
    state.isDragging = false;
  });

  canvas.addEventListener("pointercancel", () => {
    state.isDragging = false;
  });

  window.addEventListener("resize", () => {
    if (!state.backgroundImage) return;
    resizeCanvasToImage(state.backgroundImage);
    render();
  });

  setScene(state.sceneId).catch(() => {
    if (emptyState) {
      emptyState.textContent = "Could not load adventure scene. Try refreshing the page.";
    }
  });
}

document.addEventListener("DOMContentLoaded", initAdventureSelfie);
