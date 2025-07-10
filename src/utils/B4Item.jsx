import transliterate from "./transliterate";
import PathConfigs from "../config/PathConfigs";
import locationTerms from "../config/locationTerms";
import measureText from "./measureText";
import RouteBadgeGroup, { getRouteBadgeGroupWidth } from "../components/svg/RouteBadgeGroup";

// --- 📏 КОНСТАНТИ ДИЗАЙНУ ---

// Базовий розмір основного шрифту (до масштабування)
const BASE_FONT_SIZE_PRIMARY = 38;
// Базовий розмір допоміжного шрифту (другий рядок)
const BASE_FONT_SIZE_SECONDARY = 20;
// Коефіцієнт візуальної висоти тексту (справжня висота "Ву" замість baseline-to-baseline)
const FONT_VISUAL_HEIGHT_COEFF = 96 / 76;
// Візуальна ширина діагональної стрілки (для напрямків straight-left, straight-right)
const DIAGONAL_ARROW_WIDTH = 65.4; // px

/**
 * Функція підбирає розмір шрифту так, щоб текст вмістився у вказану ширину
 */
function scaleFontToFit(text, font, maxWidth, baseSize, minRatio = 0.8) {
  const measured = measureText(text, font);
  if (measured.width <= maxWidth) return { size: baseSize, ratio: 1 };

  const scaleRatio = maxWidth / measured.width;
  const clampedRatio = Math.max(scaleRatio, minRatio);
  return { size: baseSize * clampedRatio, ratio: clampedRatio };
}

/**
 * Розбиває довгий текст на 2 приблизно рівні рядки
 */
function splitText(text) {
  const words = text.split(" ");
  if (words.length < 2) return [text];
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
}

function B4Item({ params, x = 0, y = 0, transform }) {

  // --- 1. ПІДГОТОВКА ТЕКСТОВИХ ДАНИХ ---

  const mainKey = params.mainText;
  const subText = params.subText || "";
  const translit = subText ? transliterate(subText) : "";

  let labelUa = "";
  let labelEn = "";

  if (params.icon === "other") {
    labelUa = params.customUa || "";
    labelEn = params.customEn || "";
  } else if (params.icon && mainKey && locationTerms[params.icon]?.[mainKey]) {
    const entry = locationTerms[params.icon][mainKey];
    labelUa = entry.ua ?? "";
    labelEn = entry.en ?? "";
  }

  const mainTextLineRaw = labelUa ? `${labelUa} ${subText}`.trim() : subText;

  let secondaryLine = "";
  if (params.icon === "bicycleRoute") {
    const number = params.routeNumber ? ` ${params.routeNumber}` : "";
    secondaryLine = [translit, labelEn].filter(Boolean).join(" ") + number;
  } else {
    secondaryLine = [translit, labelEn].filter(Boolean).join(" ");
  }

  // --- 2. ОБРОБКА ІКОНКИ ---

  let iconKey = params.icon;

  if (iconKey === "streetNetwork" && params.isUrbanCenter) {
    iconKey = "cityCentre";
  }

  if (!iconKey) {
    switch (params.numberType) {
      case "veloSTO":
        iconKey = "veloSTO";
        break;
      case "veloParking":
        iconKey = "veloParking";
        break;
      case "eurovelo":
        iconKey = "eurovelo";
        break;
    }
  }

  const icon = iconKey && PathConfigs[iconKey];

  // --- 3. РОЗТАШУВАННЯ СТРІЛКИ ТА ІКОНКИ ---

  const xPadding = 40;
  const arrow = PathConfigs.smallArrow;
  const directionLayout = {
    "left": {
      rotation: -90,
      arrowX: xPadding + (arrow.height - arrow.width) / 2,
      iconX: xPadding + arrow.height + 20,
    },
    "straight": {
      rotation: 0,
      arrowX: xPadding,
      iconX: xPadding + arrow.width + 20,
    },
    "straight-left": {
      rotation: -45,
      arrowX: xPadding - 3,
      iconX: xPadding + DIAGONAL_ARROW_WIDTH + 20,
    },
    "right": {
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

  const layout = directionLayout[params.direction || "straight"];
  const { rotation, arrowX, iconX } = layout;
  const arrowY = 75 - arrow.height / 2;

  // --- 4. ПОЗИЦІОНУВАННЯ ТЕКСТУ ---

  let textX = xPadding;

  if (["left", "straight", "straight-left"].includes(params.direction)) {
    let arrowVisualWidth = 0;

    if (params.direction === "straight") arrowVisualWidth = arrow.width;
    else if (params.direction === "left") arrowVisualWidth = arrow.height;
    else if (params.direction === "straight-left") arrowVisualWidth = DIAGONAL_ARROW_WIDTH;

    textX = arrowX + arrowVisualWidth + 20;
  }

  if (icon) {
    textX += icon.width * icon.scale + 20;
  }

  // --- 5. ОБЧИСЛЕННЯ ДОСТУПНОЇ ШИРИНИ ТА ШРИФТІВ ---

  const baseFontSize1 = BASE_FONT_SIZE_PRIMARY / 0.7;
  const baseFontSize2 = BASE_FONT_SIZE_SECONDARY / 0.7;

  let arrowRightSpace = 0;
  if (params.direction === "right") {
    arrowRightSpace = arrow.height + 20;
  } else if (params.direction === "straight-right") {
    arrowRightSpace = DIAGONAL_ARROW_WIDTH + 20;
  }

  const badgeGroupWidth = getRouteBadgeGroupWidth(params);

  const availableTextWidth =
    520 - (textX - xPadding) - arrowRightSpace - badgeGroupWidth;

  // --- 6. ОБРОБКА ПЕРШОГО РЯДКА (1 або 2 рядки) ---

  let mainTextLines;
  let fontSize1;

  const singleLineRatio = scaleFontToFit(
    mainTextLineRaw,
    "54px RoadUA-Medium",
    availableTextWidth,
    baseFontSize1,
    0
  ).ratio;

  if (singleLineRatio >= 0.8) {
    mainTextLines = [mainTextLineRaw];
    fontSize1 = baseFontSize1 * Math.min(singleLineRatio, 1);
  } else {
    mainTextLines = splitText(mainTextLineRaw);

    const adjustedRatio = Math.min(
      scaleFontToFit(mainTextLines[0], "54px RoadUA-Medium", availableTextWidth, baseFontSize1, 0).ratio,
      scaleFontToFit(mainTextLines[1], "54px RoadUA-Medium", availableTextWidth, baseFontSize1, 0).ratio
    );

    fontSize1 = baseFontSize1 * Math.min(0.8, Math.max(adjustedRatio, 0.7));
  }

  const { size: fontSize2 } = scaleFontToFit(secondaryLine, "28px RoadUA-Medium", availableTextWidth, baseFontSize2);

  // --- 7. РОЗМІРИ ТЕКСТУ, ДЛЯ РОЗТАШУВАННЯ БЕЙДЖІВ ---

  const measuredLines = mainTextLines.map(line =>
    measureText(line, `${fontSize1}px RoadUA-Medium`)
  );
  const maxTextWidth = Math.max(...measuredLines.map(m => m.width));
  const routeBadgeX = textX + maxTextWidth + 20;

  // --- 8. ДЕКОРАТИВНІ ХВИЛІ ДЛЯ ВОДИ ---

  const showWave = params.icon === "water";
  const waves = PathConfigs.waves;
  const waveWidth = waves.width * waves.scale;
  const waveCount = showWave ? Math.ceil(maxTextWidth / waveWidth) : 0;

  const yShiftText = fontSize1 * 0.7 * FONT_VISUAL_HEIGHT_COEFF - fontSize1 * 0.7;
  const applyYShift = showWave ? yShiftText : 0;

  // --- 9. РЕНДЕР SVG З ЕЛЕМЕНТАМИ ---

  return (
    <g transform={transform || `translate(${x}, ${y})`}>

      <rect x={xPadding} y={35} width={520} height={80} fill="green" />
      
      {/* ТЕКСТ */}
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

      {/* СТРІЛКА */}
      {!params.hideArrow && (
        <g
          transform={`
            translate(${arrowX}, ${arrowY})
            rotate(${rotation} ${arrow.width / 2} ${arrow.height / 2})
            scale(${arrow.scale})
          `}
        >
          <path d={arrow.d} fill="black" />
        </g>
      )}

      {/* ІКОНКА */}
      {icon && (
        <g
          transform={`translate(${iconX}, ${75 - icon.height * icon.scale / 2}) scale(${icon.scale})`}
        >
          <path d={icon.d} fill="#000000" fillRule="evenodd" />
        </g>
      )}

      {/* ХВИЛІ */}
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

      {/* БЕЙДЖІ */}
      <RouteBadgeGroup params={{ ...params }} x={routeBadgeX} y={35} />
    </g>
  );
}

export default B4Item;
