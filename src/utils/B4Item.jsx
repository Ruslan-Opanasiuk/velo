import transliterate from "./transliterate";
import PathConfigs from "../config/PathConfigs";
import locationTerms from "../config/locationTerms";
import measureText from "./measureText";
import RouteBadgeGroup, { getRouteBadgeGroupWidth } from "../components/svg/RouteBadgeGroup";

function scaleFontToFit(text, font, maxWidth, baseSize, minRatio = 0.8) {
  const measured = measureText(text, font);
  if (measured.width <= maxWidth) return { size: baseSize, ratio: 1 };
  const scaleRatio = maxWidth / measured.width;
  const clampedRatio = Math.max(scaleRatio, minRatio);
  return { size: baseSize * clampedRatio, ratio: clampedRatio };
}

function splitText(text) {
  const words = text.split(" ");
  if (words.length < 2) return [text];
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
}

function B4Item({ params, x = 0, y = 0, transform }) {
  const xPadding = 40;
  const mainKey = params.mainText;
  const subInput = params.subText;

  let shortUa = "";
  let rawLabel = "";

  if (params.icon === "other") {
    shortUa = params.customUa || "";
    rawLabel = params.customEn || "";
  } else if (params.icon && mainKey && locationTerms[params.icon]?.[mainKey]) {
    const entry = locationTerms[params.icon][mainKey];
    shortUa = entry.ua ?? "";
    rawLabel = entry.en ?? "";
  }

  const original = subInput || "";
  const translit = subInput ? transliterate(subInput) : "";

  const firstLineRaw = shortUa ? `${shortUa} ${original}`.trim() : original;
  const secondLineRaw = translit && rawLabel
    ? `${translit} ${rawLabel}`.trim()
    : translit || rawLabel || "";

  const arrow = PathConfigs.smallArrow;

  let iconKey = params.icon;
  if (iconKey === "streetNetwork" && params.isUrbanCenter) {
    iconKey = "cityCentre";
  }
  if (!iconKey) {
    if (params.numberType === "veloSTO") iconKey = "veloSTO";
    else if (params.numberType === "veloParking") iconKey = "veloParking";
    else if (params.numberType === "eurovelo") iconKey = "eurovelo";
  }

  const icon = iconKey && PathConfigs[iconKey];

  const directionLayout = {
    "left": { rotation: -90, arrowX: xPadding + (arrow.height - arrow.width) / 2, iconX: xPadding + arrow.height + 20 },
    "straight": { rotation: 0, arrowX: xPadding, iconX: xPadding + arrow.width + 20 },
    "straight-left": { rotation: -45, arrowX: xPadding - 3, iconX: xPadding + 654 * arrow.scale + 20 },
    "right": { rotation: 90, arrowX: 560 - arrow.width - (arrow.height - arrow.width) / 2, iconX: xPadding },
    "straight-right": { rotation: 45, arrowX: 560 + 3 - arrow.width, iconX: xPadding },
  };

  const layout = directionLayout[params.direction || "straight"];
  const rotation = layout.rotation;
  const arrowX = layout.arrowX;
  const arrowY = 75 - arrow.height / 2;
  const iconX = layout.iconX;

  let textX = 40;

  if (["left", "straight", "straight-left"].includes(params.direction)) {
    let arrowVisualWidth = 0;
    if (params.direction === "straight") arrowVisualWidth = arrow.width;
    else if (params.direction === "left") arrowVisualWidth = arrow.height;
    else if (params.direction === "straight-left") arrowVisualWidth = 65.4;
    textX = arrowX + arrowVisualWidth + 20;
  }

  if (icon) {
    textX += icon.width * icon.scale + 20;
  }

  const baseFontSize1 = 38 / 0.7;
  const baseFontSize2 = 20 / 0.7;

  let arrowRightSpace = 0;

  if (params.direction === "right") {
    arrowRightSpace = arrow.height + 20;
  } else if (params.direction === "straight-right") {
    arrowRightSpace = 65.4 + 20;
  }
  const badgeGroupWidth = getRouteBadgeGroupWidth(params);

  const availableTextWidth =
    520 - (textX - xPadding) - arrowRightSpace - badgeGroupWidth;

  // --- ФІНАЛЬНА ЛОГІКА ВІДПОВІДНО ДО ОСТАННІХ ІНСТРУКЦІЙ ---
  let firstLines;
  let fontSize1;

  // 1. Перевіряємо, який РЕАЛЬНИЙ коефіцієнт потрібен для одного рядка
  const trueSingleLineRatio = scaleFontToFit(firstLineRaw, "54px RoadUA-Medium", availableTextWidth, baseFontSize1, 0).ratio;

  // 2. Якщо тексту достатньо зменшення до 20% (коефіцієнт >= 0.8)...
  if (trueSingleLineRatio >= 0.8) {
    // ...то залишаємо один рядок і встановлюємо потрібний розмір шрифту.
    firstLines = [firstLineRaw];
    fontSize1 = baseFontSize1 * Math.min(trueSingleLineRatio, 1.0); // Обмежуємо зверху, щоб не збільшувати
  } else {
    // 3. Якщо потрібно зменшувати більше, ніж на 20% - розбиваємо на два рядки.
    firstLines = splitText(firstLineRaw);

    // 4. Тепер розраховуємо, який коефіцієнт потрібен для цих ДВОХ рядків
    const neededRatioForSplitLines = Math.min(
      scaleFontToFit(firstLines[0], "54px RoadUA-Medium", availableTextWidth, baseFontSize1, 0).ratio,
      scaleFontToFit(firstLines[1], "54px RoadUA-Medium", availableTextWidth, baseFontSize1, 0).ratio
    );

    // 5. Визначаємо фінальний коефіцієнт за вашими правилами:
    // - Він не може бути більшим за 0.8 ("шрифт лишається попереднім").
    // - Він не може бути меншим за 0.7 ("зменшити ще на 10 відсотків (всього 30)").
    const finalRatio = Math.min(0.8, Math.max(neededRatioForSplitLines, 0.7));
    
    fontSize1 = baseFontSize1 * finalRatio;
  }
  // --- КІНЕЦЬ ФІНАЛЬНОЇ ЛОГІКИ ---

  const { size: fontSize2 } = scaleFontToFit(secondLineRaw, "28px RoadUA-Medium", availableTextWidth, baseFontSize2);

    // Вимірюємо кожен рядок окремо
  const measuredLines = firstLines.map(line =>
    measureText(line, `${fontSize1}px RoadUA-Medium`)
  );

  // Беремо максимальну ширину
  const maxTextWidth = Math.max(...measuredLines.map(m => m.width));

  // Обчислюємо позицію бейджів
  const routeBadgeX = textX + maxTextWidth + 20;

  const yShiftText = fontSize1*0.7*(96/76)-fontSize1*0.7;
  const applyYShift = params.icon === "water" ? yShiftText : 0;

  const waves = PathConfigs.waves;
  const showWave = params.icon === "water";
  const waveWidth = waves.width * waves.scale;
  const waveCount = showWave ? Math.ceil(maxTextWidth / waveWidth) : 0;




  return (
    <g transform={transform || `translate(${x}, ${y})`}>
      {/* <rect x={xPadding} y={35} width={520} height={80} fill="green" /> */}

      {firstLines.length === 1 ? (
        <text>
          <tspan
            x={textX}
            y={35+fontSize1*0.7 - applyYShift}
            fontSize={fontSize1}
            fontFamily="RoadUA-Medium"
          >
            {firstLines[0]}
          </tspan>
          <tspan
            x={textX}
            y={115 - (20 * (96 / 76) - 20) - applyYShift}
            fontSize={fontSize2}
            fontFamily="RoadUA-Medium"
          >
            {secondLineRaw}
          </tspan>
        </text>
      ) : (
        <text x={textX} fontFamily="RoadUA-Medium">
          <tspan
            x={textX}
            y={35}
            dominant-baseline="middle"
            fontSize={fontSize1}
          >
            {firstLines[0]}
          </tspan>
          <tspan
            x={textX}
            y={75 + fontSize1 * 0.35}
            fontSize={fontSize1}
          >
            {firstLines[1]}
          </tspan>
          <tspan
            x={textX}
            y={115}
            dominant-baseline="middle"
            fontSize={fontSize2}
          >
            {secondLineRaw}
          </tspan>
        </text>
      )}

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

      {icon && (
        <g transform={`translate(${iconX}, ${75 - icon.height * icon.scale / 2}) scale(${icon.scale})`}>
          <path d={icon.d} fill="#000000" fillRule="evenodd" />
        </g>
      )}

      {showWave && (
        <g transform={`translate(${textX}, ${108})`}>
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

      <RouteBadgeGroup
        params={{ ...params }}
        x={routeBadgeX}
        y={35}
      />
    </g>
  );
}

export default B4Item;