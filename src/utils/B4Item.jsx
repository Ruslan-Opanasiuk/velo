import transliterate from "./transliterate";
import PathConfigs from "../config/PathConfigs";
import locationTerms from "../config/locationTerms";
import measureText from "./measureText";

// Масштабування шрифту під maxWidth, зі зменшенням не більше ніж 80%
function scaleFontToFit(text, font, maxWidth, baseSize) {
  const measured = measureText(text, font);
  if (measured.width <= maxWidth) return { size: baseSize, ratio: 1 };
  const scaleRatio = maxWidth / measured.width;
  const clampedRatio = Math.max(scaleRatio, 0.8);
  return { size: baseSize * clampedRatio, ratio: clampedRatio };
}

// Розбивка тексту на два рядки
function splitText(text) {
  const words = text.split(" ");
  if (words.length < 2) return [text];
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
}
function B4Item({ params, x = 0, y = 0, transform }) {
  const mainKey = params.mainText;
  const subInput = params.subText;

  const entry = mainKey ? locationTerms[mainKey] || {} : {};
  const shortUa = entry.ua ?? "";
  const rawLabel = entry.en ?? "";
  const position = entry.position || "suffix";

  const original = subInput || "";
  const translit = subInput ? transliterate(subInput) : "";

  const firstLineRaw = shortUa ? `${shortUa} ${original}`.trim() : original;
  const secondLineRaw = translit && rawLabel
    ? (position === "prefix" ? `${rawLabel} ${translit}` : `${translit} ${rawLabel}`).trim()
    : translit || rawLabel || "";

  const arrow = PathConfigs.smallArrow;

  let iconKey = params.icon;
  if (!iconKey) {
    if (params.numberType === "veloSTO") iconKey = "veloSTO";
    else if (params.numberType === "veloParking") iconKey = "veloParking";
    else if (params.numberType === "eurovelo") iconKey = "eurovelo";
  }
  const icon = iconKey && PathConfigs[iconKey];

  const directionLayout = {
    "left": { rotation: -90, arrowX: 30 + (arrow.height - arrow.width) / 2 },
    "straight": { rotation: 0, arrowX: 30 },
    "straight-left": { rotation: -45, arrowX: 27 },
    "right": { rotation: 90, arrowX: 570 - arrow.width - (arrow.height - arrow.width) / 2 },
    "straight-right": { rotation: 45, arrowX: 573 - arrow.width },
  };

  const layout = directionLayout[params.direction || "straight"];
  const rotation = layout.rotation;
  const arrowX = layout.arrowX;
  const arrowY = 75 - arrow.height / 2;

  // 👇 обчислення X для іконки (з урахуванням відсутності стрілки)
  let iconX = 30;
  if (!params.hideArrow && ["left", "straight", "straight-left"].includes(params.direction)) {
    let arrowVisualWidth = params.direction === "straight"
      ? arrow.width
      : params.direction === "left"
        ? arrow.height
        : 65.4;
    iconX = arrowX + arrowVisualWidth + 20;
  }

  // 👇 обчислення X для тексту
  let textX = icon ? iconX + icon.width * icon.scale + 20 : iconX;

  // 📏 maxWidth
  let arrowRightStart = 570;
  if (params.direction === "right") {
    arrowRightStart = 600 - (arrow.height + 50);
  } else if (params.direction === "straight-right") {
    arrowRightStart = 600 - (65.4 + 50);
  }
  const maxWidth = arrowRightStart - textX;

  const baseFontSize1 = 38 / 0.7;
  const baseFontSize2 = 20 / 0.7;

  let firstLines = [firstLineRaw];
  let { size: fontSize1, ratio } = scaleFontToFit(firstLineRaw, `54px RoadUA-Medium`, maxWidth, baseFontSize1);

  if (ratio <= 0.8) {
    firstLines = splitText(firstLineRaw);
    const sizes = firstLines.map(line =>
      scaleFontToFit(line, `54px RoadUA-Medium`, maxWidth, baseFontSize1)
    );
    const minRatio = Math.min(...sizes.map(s => s.ratio));
    fontSize1 = baseFontSize1 * minRatio;
  }

  const { size: fontSize2 } = scaleFontToFit(secondLineRaw, `28px RoadUA-Medium`, maxWidth, baseFontSize2);

  return (
    <g transform={transform || `translate(${x}, ${y})`}>
      <rect x={30} y={35} width={540} height={80} fill="white" />

      <text>
        {firstLines.map((line, i) => (
          <tspan
            key={i}
            x={textX}
            y={30 + i * fontSize1}
            fontSize={fontSize1}
            dominantBaseline="hanging"
            fontFamily="RoadUA-Medium"
          >
            {line}
          </tspan>
        ))}

        <tspan
          x={textX}
          y={120 + (firstLines.length - 1) * fontSize1}
          fontSize={fontSize2}
          dominantBaseline="text-after-edge"
          fontFamily="RoadUA-Medium"
        >
          {secondLineRaw}
        </tspan>
      </text>

      {/* ➤ Стрілка */}
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

      {/* ⭕ Іконка */}
      {icon && (
        <g transform={`translate(${iconX}, ${75 - icon.height * icon.scale / 2}) scale(${icon.scale})`}>
          <path d={icon.d} fill="#000000" fillRule="evenodd" />
        </g>
      )}
    </g>
  );
}


export default B4Item;
