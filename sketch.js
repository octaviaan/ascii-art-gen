let sourceImg;
let fileInput;
let widthSlider;
let widthLabel;
let fontSizeSlider;
let fontSizeLabel;
let asciiPaletteSelect;
let customCharsInput;
let asciiOutput;
let layoutContainer;
let asciiContainer;
let settingsPanel;
let measurementSpan;
let charWidth = 6;
let charHeight = 12;
let asciiColor = "#fef6e4";
let colorPicker;
let glowToggle;
let isGlowEnabled = true;
let currentAscii = "";
let asciiColumns = 0;
let asciiRows = 0;
let brightnessSlider;
let brightnessLabel;
let contrastSlider;
let contrastLabel;
let colorModeSelect;
let useSourceColors = false;
let asciiCharGrid = [];
let asciiColorGrid = [];
let spacingSlider;
let spacingLabel;
const EXPORT_BACKGROUND = "none";
const DEFAULT_FONT = "'IBM Plex Mono', 'Courier New', monospace";
let fontFamily = DEFAULT_FONT;
let characterSpacing = 0;

const ASCII_PALETTES = {
  Medium: "@#S%?*+;:,. ",
  Light: "#&@%$*o!;.",
  Minimal: "#:. ",
  Dense: "$@B%8&WM#*oahkbdpqwmZ0QLCJUYXzcvunxrjft/\\\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
  Smooth: "@%#*+=-:. ",
  Blocks: "@#█▓▒░:. ",
  Lines: "|/\\_-:. ",
  Binary: "10 ",
  DotMatrix: "@#o*+=-:. ",
  Retro: "MWNXK0Okxdolc:;,. ",
  MinimalWide: "@$=:. ",
};

function setup() {
  noCanvas();
  pixelDensity(1);

  layoutContainer = createDiv();
  layoutContainer.addClass("layout");

  asciiContainer = createDiv();
  asciiContainer.addClass("ascii-container");
  asciiContainer.parent(layoutContainer);

  settingsPanel = createDiv();
  settingsPanel.addClass("settings-panel");
  settingsPanel.attribute("aria-label", "Settings panel");
  settingsPanel.parent(layoutContainer);

  const controls = createDiv();
  controls.addClass("controls");
  controls.parent(settingsPanel);

  const fileDropdown = createElement("details");
  fileDropdown.attribute("open", "");
  fileDropdown.addClass("control-dropdown");
  fileDropdown.parent(controls);

  createElement("summary", "Image Source")
    .addClass("control-summary")
    .parent(fileDropdown);

  const fileBody = createDiv();
  fileBody.addClass("control-body");
  fileBody.parent(fileDropdown);

  fileInput = createFileInput(handleFile);
  fileInput.attribute("accept", "image/*");
  fileInput.parent(fileBody);

  const paletteDropdown = createElement("details");
  paletteDropdown.attribute("open", "");
  paletteDropdown.addClass("control-dropdown");
  paletteDropdown.parent(controls);

  createElement("summary", "Character Palette")
    .addClass("control-summary")
    .parent(paletteDropdown);

  const paletteBody = createDiv();
  paletteBody.addClass("control-body");
  paletteBody.parent(paletteDropdown);

  asciiPaletteSelect = createSelect();
  asciiPaletteSelect.addClass("control-select");
  Object.keys(ASCII_PALETTES).forEach((name) => {
    asciiPaletteSelect.option(name, name);
  });
  asciiPaletteSelect.option("Custom", "custom");
  asciiPaletteSelect.parent(paletteBody);
  asciiPaletteSelect.value("Medium");
  asciiPaletteSelect.changed(handlePaletteChange);

  customCharsInput = createInput(ASCII_PALETTES.Medium);
  customCharsInput.parent(paletteBody);
  customCharsInput.addClass("custom-input");
  customCharsInput.attribute("maxlength", "200");
  customCharsInput.attribute("placeholder", "Enter custom characters");
  customCharsInput.attribute("disabled", "");
  customCharsInput.input(() => {
    asciiPaletteSelect.value("custom");
    generateAscii();
  });

  const widthDropdown = createElement("details");
  widthDropdown.attribute("open", "");
  widthDropdown.addClass("control-dropdown");
  widthDropdown.parent(controls);

  createElement("summary", "Character Width")
    .addClass("control-summary")
    .parent(widthDropdown);

  const widthBody = createDiv();
  widthBody.addClass("control-body");
  widthBody.parent(widthDropdown);

  widthLabel = createSpan();
  widthLabel.addClass("control-value");
  widthLabel.parent(widthBody);

  widthSlider = createSlider(40, 160, 80, 5);
  widthSlider.parent(widthBody);
  widthSlider.addClass("control-slider");
  widthSlider.input(generateAscii);
  updateWidthLabel();

  const fontDropdown = createElement("details");
  fontDropdown.attribute("open", "");
  fontDropdown.addClass("control-dropdown");
  fontDropdown.parent(controls);

  createElement("summary", "Character Size")
    .addClass("control-summary")
    .parent(fontDropdown);

  const fontBody = createDiv();
  fontBody.addClass("control-body");
  fontBody.parent(fontDropdown);

  fontSizeLabel = createSpan();
  fontSizeLabel.addClass("control-value");
  fontSizeLabel.parent(fontBody);

  fontSizeSlider = createSlider(6, 16, 8, 1);
  fontSizeSlider.parent(fontBody);
  fontSizeSlider.addClass("control-slider");
  fontSizeSlider.input(handleFontSizeChange);

  const spacingDropdown = createElement("details");
  spacingDropdown.attribute("open", "");
  spacingDropdown.addClass("control-dropdown");
  spacingDropdown.parent(controls);

  createElement("summary", "Character Spacing")
    .addClass("control-summary")
    .parent(spacingDropdown);

  const spacingBody = createDiv();
  spacingBody.addClass("control-body");
  spacingBody.parent(spacingDropdown);

  spacingLabel = createSpan();
  spacingLabel.addClass("control-value");
  spacingLabel.parent(spacingBody);

  spacingSlider = createSlider(-2, 6, 0, 0.1);
  spacingSlider.parent(spacingBody);
  spacingSlider.addClass("control-slider");
  spacingSlider.input(handleSpacingChange);
  updateSpacingLabel();

  const adjustDropdown = createElement("details");
  adjustDropdown.attribute("open", "");
  adjustDropdown.addClass("control-dropdown");
  adjustDropdown.parent(controls);

  createElement("summary", "Image Adjustments")
    .addClass("control-summary")
    .parent(adjustDropdown);

  const adjustBody = createDiv();
  adjustBody.addClass("control-body");
  adjustBody.parent(adjustDropdown);

  brightnessLabel = createSpan();
  brightnessLabel.addClass("control-value");
  brightnessLabel.parent(adjustBody);

  brightnessSlider = createSlider(-100, 100, 0, 1);
  brightnessSlider.parent(adjustBody);
  brightnessSlider.addClass("control-slider");
  brightnessSlider.input(handleBrightnessChange);
  updateBrightnessLabel();

  contrastLabel = createSpan();
  contrastLabel.addClass("control-value");
  contrastLabel.parent(adjustBody);

  contrastSlider = createSlider(-100, 100, 0, 1);
  contrastSlider.parent(adjustBody);
  contrastSlider.addClass("control-slider");
  contrastSlider.input(handleContrastChange);
  updateContrastLabel();

  const colorModeDropdown = createElement("details");
  colorModeDropdown.attribute("open", "");
  colorModeDropdown.addClass("control-dropdown");
  colorModeDropdown.parent(controls);

  createElement("summary", "Color Mode")
    .addClass("control-summary")
    .parent(colorModeDropdown);

  const colorModeBody = createDiv();
  colorModeBody.addClass("control-body");
  colorModeBody.parent(colorModeDropdown);

  colorModeSelect = createSelect();
  colorModeSelect.addClass("control-select");
  colorModeSelect.option("Monochrome", "monochrome");
  colorModeSelect.option("Source Colors", "source");
  colorModeSelect.parent(colorModeBody);
  colorModeSelect.value("monochrome");
  colorModeSelect.changed(handleColorModeChange);

  const colorDropdown = createElement("details");
  colorDropdown.attribute("open", "");
  colorDropdown.addClass("control-dropdown");
  colorDropdown.parent(controls);

  createElement("summary", "Display Color")
    .addClass("control-summary")
    .parent(colorDropdown);

  const colorBody = createDiv();
  colorBody.addClass("control-body");
  colorBody.parent(colorDropdown);

  const colorLabel = createSpan("Tint");
  colorLabel.addClass("control-value");
  colorLabel.parent(colorBody);

  colorPicker = createColorPicker("#fef6e4");
  colorPicker.addClass("control-color");
  colorPicker.parent(colorBody);
  asciiColor = colorPicker.value();
  colorPicker.input(handleColorChange);

  const glowDropdown = createElement("details");
  glowDropdown.attribute("open", "");
  glowDropdown.addClass("control-dropdown");
  glowDropdown.parent(controls);

  createElement("summary", "Glow Effect")
    .addClass("control-summary")
    .parent(glowDropdown);

  const glowBody = createDiv();
  glowBody.addClass("control-body");
  glowBody.parent(glowDropdown);

  glowToggle = createCheckbox("Enable Glow", true);
  glowToggle.addClass("control-toggle");
  glowToggle.parent(glowBody);
  glowToggle.changed(handleGlowToggle);

  const exportDropdown = createElement("details");
  exportDropdown.attribute("open", "");
  exportDropdown.addClass("control-dropdown");
  exportDropdown.parent(controls);

  createElement("summary", "Export")
    .addClass("control-summary")
    .parent(exportDropdown);

  const exportBody = createDiv();
  exportBody.addClass("control-body");
  exportBody.parent(exportDropdown);

  const pngButton = createButton("Download PNG");
  pngButton.addClass("control-button");
  pngButton.parent(exportBody);
  pngButton.mousePressed(exportPNG);

  const svgButton = createButton("Download SVG");
  svgButton.addClass("control-button");
  svgButton.parent(exportBody);
  svgButton.mousePressed(exportSVG);

  asciiOutput = createDiv("Upload an image to get started.");
  asciiOutput.addClass("ascii-output");
  asciiOutput.style("font-family", fontFamily);
  asciiOutput.style("letter-spacing", `${characterSpacing}px`);
  asciiOutput.parent(asciiContainer);

  measurementSpan = createSpan("");
  measurementSpan.addClass("measure-span");
  measurementSpan.style("font-family", fontFamily);
  measurementSpan.style("line-height", "1");
  measurementSpan.style("font-size", `${fontSizeSlider.value()}px`);
  measurementSpan.style("letter-spacing", `${characterSpacing}px`);
  measurementSpan.parent(asciiContainer);
  updateCharMetrics();

  applyDisplayStyles();
  handleFontSizeChange();
}

function handleFile(file) {
  if (file.type !== "image") {
    asciiOutput.html("Please upload a valid image file.");
    return;
  }

  loadImage(
    file.data,
    (img) => {
      sourceImg = img;
      generateAscii();
    },
    () => {
      asciiOutput.html("Unable to load that image. Try a different file.");
    }
  );
}

function handlePaletteChange() {
  const selection = asciiPaletteSelect.value();

  if (selection === "custom") {
    customCharsInput.removeAttribute("disabled");
  } else {
    customCharsInput.attribute("disabled", "");
    customCharsInput.value(ASCII_PALETTES[selection]);
  }

  generateAscii();
}

function handleFontSizeChange() {
  if (!fontSizeSlider) {
    return;
  }

  const size = fontSizeSlider.value();
  fontSizeLabel.html(`Character size: ${size}px`);

  if (asciiOutput) {
    asciiOutput.style("font-size", `${size}px`);
  }

  if (measurementSpan) {
    measurementSpan.style("font-size", `${size}px`);
    updateCharMetrics();
  }

  generateAscii();
}

function handleBrightnessChange() {
  if (!brightnessSlider) {
    return;
  }

  updateBrightnessLabel();
  generateAscii();
}

function handleContrastChange() {
  if (!contrastSlider) {
    return;
  }

  updateContrastLabel();
  generateAscii();
}

function handleColorModeChange() {
  if (!colorModeSelect) {
    return;
  }

  useSourceColors = colorModeSelect.value() === "source";
  renderAsciiOutput();
}

function handleSpacingChange() {
  if (!spacingSlider) {
    return;
  }

  characterSpacing = Number(spacingSlider.value());
  updateSpacingLabel();
  if (asciiOutput) {
    asciiOutput.style("letter-spacing", `${characterSpacing}px`);
  }
  if (measurementSpan) {
    measurementSpan.style("letter-spacing", `${characterSpacing}px`);
    updateCharMetrics();
  }
  if (sourceImg) {
    generateAscii();
  } else {
    renderAsciiOutput();
  }
}

function generateAscii() {
  updateWidthLabel();

  if (!sourceImg) {
    currentAscii = "";
    asciiColumns = 0;
    asciiRows = 0;
    asciiCharGrid = [];
    asciiColorGrid = [];
    renderAsciiOutput();
    return;
  }

  const columns = widthSlider.value();
  const targetRows = calculateTargetRows(columns);

  const workingImg = sourceImg.get();
  workingImg.resize(columns, targetRows);
  workingImg.loadPixels();

  const rows = workingImg.height;
  const chars = getPrimaryChars();
  const brightnessOffset = brightnessSlider ? brightnessSlider.value() : 0;
  const contrastValue = contrastSlider ? contrastSlider.value() : 0;
  const contrastDenominator = 255 * (259 - contrastValue);
  const contrastFactor =
    contrastDenominator !== 0
      ? (259 * (contrastValue + 255)) / contrastDenominator
      : 1;
  const adjustChannel = (channel) =>
    constrain(
      Math.round(contrastFactor * (channel - 128) + 128 + brightnessOffset),
      0,
      255
    );

  const charGrid = [];
  const colorGrid = [];
  let asciiBuilder = "";

  for (let y = 0; y < rows; y++) {
    const rowChars = [];
    const rowColors = [];
    let line = "";

    for (let x = 0; x < workingImg.width; x++) {
      const index = (x + y * workingImg.width) * 4;
      const adjR = adjustChannel(workingImg.pixels[index]);
      const adjG = adjustChannel(workingImg.pixels[index + 1]);
      const adjB = adjustChannel(workingImg.pixels[index + 2]);
      const brightness = (adjR + adjG + adjB) / 3;
      const charIndex = floor(map(brightness, 0, 255, chars.length - 1, 0));
      const asciiChar = chars.charAt(charIndex);
      line += asciiChar;
      rowChars.push(asciiChar);
      rowColors.push(`rgb(${adjR}, ${adjG}, ${adjB})`);
    }

    asciiBuilder += line + "\n";
    charGrid.push(rowChars);
    colorGrid.push(rowColors);
  }

  currentAscii = asciiBuilder;
  asciiColumns = workingImg.width;
  asciiRows = rows;
  asciiCharGrid = charGrid;
  asciiColorGrid = colorGrid;
  renderAsciiOutput();
}

function updateWidthLabel() {
  if (!widthSlider) {
    return;
  }

  widthLabel.html(`Width: ${widthSlider.value()} characters`);
}

function updateBrightnessLabel() {
  if (!brightnessLabel || !brightnessSlider) {
    return;
  }

  const value = brightnessSlider.value();
  brightnessLabel.html(`Brightness: ${formatSignedValue(value)}`);
}

function updateContrastLabel() {
  if (!contrastLabel || !contrastSlider) {
    return;
  }

  const value = contrastSlider.value();
  contrastLabel.html(`Contrast: ${formatSignedValue(value)}`);
}

function updateSpacingLabel() {
  if (!spacingLabel || !spacingSlider) {
    return;
  }

  const value = Number(spacingSlider.value());
  spacingLabel.html(`Letter spacing: ${value.toFixed(1)}px`);
}

function formatSignedValue(value) {
  return `${value > 0 ? "+" : ""}${value}`;
}

function getPrimaryChars() {
  if (!asciiPaletteSelect) {
    return ASCII_PALETTES.Medium;
  }

  const selection = asciiPaletteSelect.value();
  if (selection === "custom") {
    return sanitizeChars(customCharsInput ? customCharsInput.value() : " ");
  }

  return ASCII_PALETTES[selection] || ASCII_PALETTES.Medium;
}

function sanitizeChars(input) {
  const replaced = input.replace(/\s/g, " ");
  return replaced.length ? replaced : " ";
}

function updateCharMetrics() {
  if (!measurementSpan) {
    return;
  }

  const bounds = measurementSpan.elt.getBoundingClientRect();
  if (bounds.width > 0 && bounds.height > 0) {
    charWidth = bounds.width;
    charHeight = bounds.height;
  }
}

function calculateTargetRows(columns) {
  if (!sourceImg) {
    return columns;
  }

  if (!charWidth || !charHeight) {
    updateCharMetrics();
  }

  const aspect = sourceImg.height / sourceImg.width;
  const effectiveCharWidth = charWidth
    ? Math.max(1, charWidth + characterSpacing)
    : null;
  const cellRatio =
    effectiveCharWidth && charHeight ? effectiveCharWidth / charHeight : 0.6;
  const rows = aspect * columns * cellRatio;
  return max(1, round(rows));
}

function handleColorChange() {
  if (!colorPicker) {
    return;
  }

  asciiColor = colorPicker.value();
  renderAsciiOutput();
}

function handleGlowToggle() {
  if (!glowToggle) {
    return;
  }

  isGlowEnabled = glowToggle.checked();
  renderAsciiOutput();
}

function exportPNG() {
  if (!hasAsciiArt()) {
    window.alert("Generate ASCII art before exporting.");
    return;
  }

  updateCharMetrics();

  const fontSizeValue = fontSizeSlider ? fontSizeSlider.value() : 8;
  const padding = Math.ceil(fontSizeValue * 0.75);
  const canvasHeight = Math.max(
    1,
    Math.ceil(asciiRows * charHeight + padding * 2)
  );
  const asciiText = normalizeAsciiForExport(currentAscii);
  const usingSourceColors =
    useSourceColors && asciiCharGrid.length && asciiColorGrid.length;
  const lineHeight = charHeight || fontSizeValue;
  const baseCharWidth = charWidth || fontSizeValue * 0.6;
  const charStep = Math.max(1, baseCharWidth + characterSpacing);
  const widthContribution =
    baseCharWidth * asciiColumns +
    characterSpacing * Math.max(0, asciiColumns - 1);
  const canvasWidth = Math.max(1, Math.ceil(widthContribution + padding * 2));

  const gfx = createGraphics(canvasWidth, canvasHeight);
  gfx.pixelDensity(2);
  gfx.clear(0, 0, 0, 0);
  gfx.noStroke();
  gfx.textFont(getPrimaryFontName(fontFamily));
  gfx.textSize(fontSizeValue);
  gfx.textAlign(LEFT, TOP);
  gfx.textLeading(lineHeight);
  gfx.push();

  const rowsData = asciiCharGrid.length
    ? asciiCharGrid
    : asciiText.split("\n").map((line) => line.split(""));
  const colorsData = useSourceColors ? asciiColorGrid : null;
  const defaultColor = asciiColor || "#fef6e4";
  const baseGlowColor = hexToRgba(defaultColor, 0.9);

  if (!useSourceColors) {
    gfx.fill(defaultColor);
    if (isGlowEnabled) {
      gfx.drawingContext.shadowColor = baseGlowColor;
      gfx.drawingContext.shadowBlur = fontSizeValue * 2.2;
      gfx.drawingContext.shadowOffsetX = 0;
      gfx.drawingContext.shadowOffsetY = 0;
    } else {
      gfx.drawingContext.shadowBlur = 0;
    }
  }

  let yPos = padding;
  for (let row = 0; row < rowsData.length; row++) {
    const rowChars = rowsData[row];
    const rowColors = colorsData && colorsData[row] ? colorsData[row] : null;
    let xPos = padding;

    for (let col = 0; col < rowChars.length; col++) {
      const char = rowChars[col] || " ";
      if (useSourceColors) {
        const color = (rowColors && rowColors[col]) || defaultColor;
        gfx.fill(color);
        if (isGlowEnabled) {
          gfx.drawingContext.shadowColor = hexToRgba(color, 0.9);
          gfx.drawingContext.shadowBlur = fontSizeValue * 2.2;
          gfx.drawingContext.shadowOffsetX = 0;
          gfx.drawingContext.shadowOffsetY = 0;
        } else {
          gfx.drawingContext.shadowBlur = 0;
        }
      }

      gfx.text(char, xPos, yPos);
      xPos += charStep;
    }

    yPos += lineHeight;
  }

  gfx.pop();

  const dataURL = gfx.canvas.toDataURL("image/png");
  gfx.remove();

  downloadDataURL("ascii-art.png", dataURL);
}

function exportSVG() {
  if (!hasAsciiArt()) {
    window.alert("Generate ASCII art before exporting.");
    return;
  }

  updateCharMetrics();

  const fontSizeValue = fontSizeSlider ? fontSizeSlider.value() : 8;
  const padding = Math.ceil(fontSizeValue * 0.75);
  const baseCharWidth = charWidth || fontSizeValue * 0.6;
  const spacingContribution = characterSpacing * Math.max(0, asciiColumns - 1);
  const widthContribution = baseCharWidth * asciiColumns + spacingContribution;
  const svgWidth = Math.max(1, Math.ceil(widthContribution + padding * 2));
  const svgHeight = Math.max(
    1,
    Math.ceil(asciiRows * charHeight + padding * 2)
  );
  const lineHeight = charHeight || fontSizeValue;
  const textColor = asciiColor || "#fef6e4";
  const asciiText = normalizeAsciiForExport(currentAscii);
  const usingSourceColors =
    useSourceColors && asciiCharGrid.length && asciiColorGrid.length;
  const charStep = Math.max(1, baseCharWidth + characterSpacing);

  const rowsData = asciiCharGrid.length
    ? asciiCharGrid
    : asciiText.split("\n").map((line) => line.split(""));
  const colorsData = usingSourceColors ? asciiColorGrid : null;

  let textMarkup = "";

  for (let row = 0; row < rowsData.length; row++) {
    const rowChars = rowsData[row];
    const rowColors = colorsData && colorsData[row] ? colorsData[row] : null;
    const baseline = padding + row * lineHeight;
    let xPos = padding;

    for (let col = 0; col < rowChars.length; col++) {
      const char = rowChars[col] || " ";
      const color = rowColors && rowColors[col] ? rowColors[col] : textColor;
      const safeChar = escapeForSVGChar(char);
      textMarkup += `<tspan x="${xPos}" y="${baseline}" fill="${color}">${safeChar}</tspan>`;
      xPos += charStep;
    }
  }

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <rect width="100%" height="100%" fill="${EXPORT_BACKGROUND}"/>
  <text x="${padding}" y="${padding}" fill="${textColor}" font-family="${fontFamily}" font-size="${fontSizeValue}" xml:space="preserve" style="white-space:pre">${textMarkup}</text>
</svg>`;

  downloadBlob("ascii-art.svg", svgContent, "image/svg+xml");
}

function hasAsciiArt() {
  return (
    asciiColumns > 0 &&
    asciiRows > 0 &&
    asciiCharGrid.length === asciiRows &&
    asciiColorGrid.length === asciiRows
  );
}

function downloadDataURL(filename, dataURL) {
  downloadURL(filename, dataURL);
}

function downloadBlob(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  downloadURL(filename, url);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadURL(filename, href) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function escapeForSVG(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeForSVGChar(char) {
  if (char === " ") {
    return "&#160;";
  }

  return escapeForSVG(char);
}

function normalizeAsciiForExport(asciiText) {
  if (!asciiText) {
    return "";
  }

  const normalized = asciiText.replace(/\r\n/g, "\n");
  return normalized.endsWith("\n") ? normalized.slice(0, -1) : normalized;
}

function hexToRgba(hexColor, alpha = 1) {
  if (!hexColor) {
    return `rgba(255, 255, 255, ${alpha})`;
  }

  let sanitized = hexColor.trim();

  if (/^rgba?\(/i.test(sanitized)) {
    const values = sanitized
      .replace(/rgba?\(/i, "")
      .replace(")", "")
      .split(",")
      .map((part) => parseFloat(part.trim()));

    if (values.length >= 3 && values.every((value) => !Number.isNaN(value))) {
      const [r, g, b] = values;
      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(
        b
      )}, ${alpha})`;
    }
  }

  if (sanitized.startsWith("#")) {
    sanitized = sanitized.slice(1);
  }

  if (sanitized.length === 3) {
    sanitized = sanitized
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (sanitized.length !== 6 || /[^0-9a-f]/i.test(sanitized)) {
    return `rgba(255, 255, 255, ${alpha})`;
  }

  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getPrimaryFontName(stack) {
  if (!stack) {
    return "Courier New";
  }

  const first = stack.split(",")[0];
  const cleaned = first.replace(/['"]/g, "").trim();
  return cleaned || "Courier New";
}

function escapeHtmlChar(char) {
  switch (char) {
    case "&":
      return "&amp;";
    case "<":
      return "&lt;";
    case ">":
      return "&gt;";
    case '"':
      return "&quot;";
    case "'":
      return "&#39;";
    case " ":
      return "&nbsp;";
    default:
      return char;
  }
}

function renderAsciiOutput() {
  if (!asciiOutput) {
    return;
  }

  asciiOutput.style("font-family", fontFamily);
  asciiOutput.style("letter-spacing", `${characterSpacing}px`);

  if (!hasAsciiArt()) {
    asciiOutput.html("Upload an image to get started.");
    const displayColor = asciiColor || "#fef6e4";
    asciiOutput.style("color", displayColor);
    if (isGlowEnabled) {
      asciiOutput.style(
        "text-shadow",
        `0 0 6px ${displayColor}, 0 0 18px ${displayColor}, 0 0 36px ${displayColor}`
      );
    } else {
      asciiOutput.style("text-shadow", "none");
    }
    return;
  }

  if (useSourceColors && asciiCharGrid.length && asciiColorGrid.length) {
    let html = "";

    for (let row = 0; row < asciiCharGrid.length; row++) {
      const rowChars = asciiCharGrid[row];
      const rowColors = asciiColorGrid[row];
      let rowHtml = "";

      for (let col = 0; col < rowChars.length; col++) {
        const char = rowChars[col] || " ";
        const color = rowColors[col] || asciiColor || "#fef6e4";
        const safeChar = escapeHtmlChar(char);
        const styleParts = [`color:${color}`];

        if (isGlowEnabled) {
          styleParts.push(
            `text-shadow:0 0 6px ${color},0 0 18px ${color},0 0 36px ${color}`
          );
        }

        rowHtml += `<span style="${styleParts.join("; ")}">${safeChar}</span>`;
      }

      html += rowHtml;
      if (row < asciiCharGrid.length - 1) {
        html += "<br>";
      }
    }

    asciiOutput.html(html);
    asciiOutput.style("color", "");
    asciiOutput.style("text-shadow", "none");
  } else {
    if (asciiOutput.elt) {
      asciiOutput.elt.textContent = currentAscii;
    } else {
      asciiOutput.html(currentAscii);
    }

    const displayColor = asciiColor || "#fef6e4";
    asciiOutput.style("color", displayColor);
    if (isGlowEnabled) {
      asciiOutput.style(
        "text-shadow",
        `0 0 6px ${displayColor}, 0 0 18px ${displayColor}, 0 0 36px ${displayColor}`
      );
    } else {
      asciiOutput.style("text-shadow", "none");
    }
  }
}

function applyDisplayStyles() {
  renderAsciiOutput();
}
