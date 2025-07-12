import transliterate from "./transliterate";
import PathConfigs from "../config/PathConfigs";
import locationTerms from "../config/locationTerms";
import measureText from "./measureText";
import RouteBadgeGroup, {
  getRouteBadgeGroupWidth,
} from "../components/svg/RouteBadgeGroup";

// === [0] КОНСТАНТИ ШРИФТУ ТА ПРОПОРЦІЙ ===
const BASE_FONT_SIZE_PRIMARY = 38;
const BASE_FONT_SIZE_SECONDARY = 20;
const FONT_VISUAL_HEIGHT_COEFF = 96 / 76;
const DIAGONAL_ARROW_WIDTH = 65.4;

// === [1] АДАПТИВНЕ ЗМЕНШЕННЯ ШРИФТУ, якщо текст не влазить у доступну ширину ===
function scaleFontToFit(text, font, maxWidth, baseSize, minRatio = 0.8) {
  const measured = measureText(text, font);
  if (measured.width <= maxWidth) return { size: baseSize, ratio: 1 };
  const scaleRatio = maxWidth / measured.width;
  const clampedRatio = Math.max(scaleRatio, minRatio);
  return { size: baseSize * clampedRatio, ratio: clampedRatio };
}

// === [2] РОЗБИТТЯ ДОВГОГО ТЕКСТУ НА ДВА РЯДКИ (посередині) ===
function splitText(text) {
  const words = text.split(" ");
  if (words.length < 2) return [text];
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
}

// === [3] ОСНОВНИЙ SVG-КОМПОНЕНТ ЕЛЕМЕНТА B4 ===
function B4Item({ params, x = 0, y = 0, transform, isLast = false, index = 0 }) {
  // === [3.1] ПРОВІРКИ СПЕЦИФІЧНИХ УМОВ ===
  // Визначаємо, чи потрібно показати жовтий фон для тимчасового маршруту
  const shouldShowTemporaryBg = params.isTemporaryRoute === true;
  const TEMP_COLOR = "#F5C30D";

  // Визначаємо, чи це початок маршруту (перший пункт з напрямком "end")
  const isEndRoute = params.direction === "end" && index === 0;

  // === [3.2] ФОРМУВАННЯ ТЕКСТОВИХ МІТКИ ===
  // Отримуємо ключ основної мітки та підрядка
  const mainKey = params.mainText;
  const subText = params.subText || "";

  // Транслітерація підрядка для англійської мітки
  const translit = subText ? transliterate(subText) : "";

  // Основні тексти українською та англійською
  let labelUa = "";
  let labelEn = "";

  // Якщо іконка — "other", використовуємо кастомні назви
  if (params.icon === "other") {
    labelUa = params.customUa || "";
    labelEn = params.customEn || "";
  }
  // Інакше — беремо відповідні назви з locationTerms
  else if (params.icon && mainKey && locationTerms[params.icon]?.[mainKey]) {
    const entry = locationTerms[params.icon][mainKey];
    labelUa = entry.ua ?? "";
    labelEn = entry.en ?? "";
  }

  // === [3.3] СКЛАДАННЯ ТЕКСТОВИХ РЯДКІВ ===
  // 🔹 Головний рядок: українська назва + subText
  const mainTextLineRaw = labelUa ? `${labelUa} ${subText}`.trim() : subText;

  // 🔹 Другий рядок (англійський): транслітерація + EN
  let secondaryLine = "";
  if (params.icon === "bicycleRoute") {
    // Якщо велосипедний маршрут — додаємо номер
    const number = params.routeNumber ? ` ${params.routeNumber}` : "";
    secondaryLine = [translit, labelEn].filter(Boolean).join(" ") + number;
  } else {
    secondaryLine = [translit, labelEn].filter(Boolean).join(" ");
  }

  // === [3.4] ВИЗНАЧЕННЯ ІКОНКИ З КОНФІГІВ ===
  let iconKey = params.icon;

  // Спеціальна обробка: якщо "streetNetwork" та "isUrbanCenter", то показуємо "cityCentre"
  if (iconKey === "streetNetwork" && params.isUrbanCenter) {
    iconKey = "cityCentre";
  }

  // Якщо іконка не задана — пробуємо визначити з типу номера маршруту
  if (!iconKey) {
    switch (params.numberType) {
      case "veloSTO":
      case "veloParking":
      case "eurovelo":
        iconKey = params.numberType;
        break;
    }
  }

  const icon = iconKey && PathConfigs[iconKey];

  // === [3.5] ЛЕЯУТ: КООРДИНАТИ СТРІЛОК, ІКОНОК, ТЕКСТУ ===
  const xPadding = 40;
  const arrow = PathConfigs.smallArrow;

  // Параметри для різних напрямків
  const directionLayout = {
    left: {
      rotation: -90,
      arrowX: xPadding + (arrow.height - arrow.width) / 2,
      iconX: xPadding + arrow.height + 20,
    },
    straight: {
      rotation: 0,
      arrowX: xPadding,
      iconX: xPadding + arrow.width + 20,
    },
    "straight-left": {
      rotation: -45,
      arrowX: xPadding - 3,
      iconX: xPadding + DIAGONAL_ARROW_WIDTH + 20,
    },
    right: {
      rotation: 90,
      arrowX: 560 - arrow.width - (arrow.height - arrow.width) / 2,
      iconX: xPadding,
    },
    "straight-right": {
      rotation: 45,
      arrowX: 560 + 3 - arrow.width,
      iconX: xPadding,
    },
  };

  const layout = directionLayout[params.direction] || {};
  const rotation = layout.rotation || 0;
  const arrowX = layout.arrowX || 0;
  const iconX = layout.iconX || xPadding;
  const arrowY = 75 - arrow.height / 2;

  // === [3.6] ОБЧИСЛЕННЯ textX — координати початку тексту ===
  let textX = xPadding;

  // Додаємо ширину стрілки (якщо вона зліва)
  if (["left", "straight", "straight-left"].includes(params.direction)) {
    const arrowVisualWidth = {
      straight: arrow.width,
      left: arrow.height,
      "straight-left": DIAGONAL_ARROW_WIDTH,
    }[params.direction] || 0;

    textX = arrowX + arrowVisualWidth + 20;
  }

  // Додаємо ширину іконки
  if (icon) {
    textX += icon.width * icon.scale + 20;
  }

  // === [3.7] ДОСТУПНА ШИРИНА ТЕКСТОВОГО БЛОКУ ===
  const baseFontSize1 = BASE_FONT_SIZE_PRIMARY / 0.7;
  const baseFontSize2 = BASE_FONT_SIZE_SECONDARY / 0.7;

  const arrowRightSpace = ["right", "straight-right"].includes(params.direction)
    ? (params.direction === "right" ? arrow.height : DIAGONAL_ARROW_WIDTH) + 20
    : 0;

  const badgeGroupWidth = getRouteBadgeGroupWidth(params);

  const availableTextWidthMain =
    520 - (textX - xPadding) - arrowRightSpace - badgeGroupWidth;

  const availableTextWidthSecondary =
    520 - (textX - xPadding) - arrowRightSpace;

  // === [3.8] АДАПТИВНИЙ РОЗМІР ШРИФТУ, МОЖЛИВИЙ ПЕРЕНОС НА 2 РЯДКИ ===
  let mainTextLines;
  let fontSize1;

  const { ratio: singleLineRatio } = scaleFontToFit(
    mainTextLineRaw,
    "54px RoadUA-Medium",
    availableTextWidthMain,
    baseFontSize1,
    0
  );

  if (singleLineRatio >= 0.8) {
    // Якщо текст вміщується в один рядок — лишаємо так
    mainTextLines = [mainTextLineRaw];
    fontSize1 = baseFontSize1 * Math.min(singleLineRatio, 1);
  } else {
    // Інакше розбиваємо на два рядки, підганяємо шрифт
    mainTextLines = splitText(mainTextLineRaw);
    const adjustedRatio = Math.min(
      scaleFontToFit(
        mainTextLines[0],
        "54px RoadUA-Medium",
        availableTextWidthMain,
        baseFontSize1,
        0
      ).ratio,
      scaleFontToFit(
        mainTextLines[1],
        "54px RoadUA-Medium",
        availableTextWidthMain,
        baseFontSize1,
        0
      ).ratio
    );
    fontSize1 = baseFontSize1 * Math.min(0.8, Math.max(adjustedRatio, 0.7));
  }

  const { size: fontSize2 } = scaleFontToFit(
    secondaryLine,
    "28px RoadUA-Medium",
    availableTextWidthSecondary,
    baseFontSize2
  );

  // === [3.9] ДОДАТКОВІ ОБЧИСЛЕННЯ: ширина тексту, бейдж, хвилі ===
  const measuredLines = mainTextLines.map((line) =>
    measureText(line, `${fontSize1}px RoadUA-Medium`)
  );
  const maxTextWidth = Math.max(...measuredLines.map((m) => m.width));
  const routeBadgeX = textX + maxTextWidth + 20;

  const showWave = params.icon === "water";
  const waves = PathConfigs.waves;
  const waveWidth = waves.width * waves.scale;
  const waveAreaWidth = Math.min(maxTextWidth, availableTextWidthMain);
  const waveCount = showWave ? Math.floor(waveAreaWidth / waveWidth) : 0;

  const yShiftText = fontSize1 * 0.7 * FONT_VISUAL_HEIGHT_COEFF - fontSize1 * 0.7;
  const applyYShift = showWave ? yShiftText : 0;

  // === [4] РЕНДЕР SVG ===
  return (
    <g transform={transform || `translate(${x}, ${y})`}>
      {/* === [4.1] Тимчасовий жовтий фон === */}
      {shouldShowTemporaryBg &&
        (isLast ? (
          <path
            d={PathConfigs.temporaryRouteFooterBg.d}
            fill={TEMP_COLOR}
            fillRule="evenodd"
          />
        ) : (
          <rect x={10} y={0} width={580} height={150} fill={TEMP_COLOR} />
        ))}

      {/* === [4.2] Стрічка "кінець маршруту" (червона) === */}
      {isEndRoute && (
        <g
          transform={`translate(${params.b4Items?.length === 1 ? 31 : 0}, ${
            params.b4Items?.length === 1 ? -10 : 0
          }) scale(1)`}
        >
          <path d={PathConfigs.stripeBig.d} fill="#CC0000" fillRule="evenodd" />
        </g>
      )}

      {/* === [4.3] Основний текст (1 або 2 рядки + англійська назва) === */}
      {mainTextLines.length === 1 ? (
        <text>
          <tspan
            x={textX}
            y={35 + fontSize1 * 0.7 - applyYShift}
            fontSize={fontSize1}
            fontFamily="RoadUA-Medium"
          >
            {mainTextLines[0]}
          </tspan>
          <tspan
            x={textX}
            y={115 - (20 * FONT_VISUAL_HEIGHT_COEFF - 20) - applyYShift}
            fontSize={fontSize2}
            fontFamily="RoadUA-Medium"
          >
            {secondaryLine}
          </tspan>
        </text>
      ) : (
        <text x={textX} fontFamily="RoadUA-Medium">
          <tspan x={textX} y={35} dominantBaseline="middle" fontSize={fontSize1}>
            {mainTextLines[0]}
          </tspan>
          <tspan x={textX} y={75 + fontSize1 * 0.35} fontSize={fontSize1}>
            {mainTextLines[1]}
          </tspan>
          <tspan x={textX} y={115} dominantBaseline="middle" fontSize={fontSize2}>
            {secondaryLine}
          </tspan>
        </text>
      )}

      {/* === [4.4] Стрілка напрямку (окрім "end") === */}
      {params.direction !== "end" && !params.hideArrow && (
        <g
          transform={`translate(${arrowX}, ${arrowY}) rotate(${rotation} ${
            arrow.width / 2
          } ${arrow.height / 2}) scale(${arrow.scale})`}
        >
          <path d={arrow.d} fill="black" />
        </g>
      )}

      {/* === [4.5] Іконка типу маршруту (якщо є) === */}
      {icon && (
        <g
          transform={`translate(${iconX}, ${
            75 - (icon.height * icon.scale) / 2
          }) scale(${icon.scale})`}
        >
          <path d={icon.d} fill="#000000" fillRule="evenodd" />
        </g>
      )}

      {/* === [4.6] Хвильки для водного маршруту === */}
      {showWave && (
        <g transform={`translate(${textX}, 108)`}>
          {Array.from({ length: waveCount }).map((_, i) => (
            <path
              key={i}
              d={waves.d}
              transform={`translate(${i * waveWidth}, 0) scale(${waves.scale})`}
              fill="#005187"
            />
          ))}
        </g>
      )}

      {/* === [4.7] Група бейджів маршруту === */}
      <RouteBadgeGroup params={{ 
        ...params, 
        isTerminus: isEndRoute, 
        isTemporaryRoute: shouldShowTemporaryBg }} 
        x={routeBadgeX} 
        y={35} />

    </g>
  );
}

export default B4Item;
