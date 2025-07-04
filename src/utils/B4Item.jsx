import transliterate from "./transliterate";
import PathConfigs from "../config/PathConfigs";
import locationTerms from "../config/locationTerms";
import measureText from "./measureText";

function scaleFontToFit(text, font, maxWidth, baseSize) {
  const measured = measureText(text, font);
  if (measured.width <= maxWidth) return { size: baseSize, ratio: 1 };

  const scaleRatio = maxWidth / measured.width;
  const clampedRatio = Math.max(scaleRatio, 0.8);
  return { size: baseSize * clampedRatio, ratio: clampedRatio };
}

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

  const maxWidth = 460;
  const baseFontSize1 = 38 / 0.7;
  const baseFontSize2 = 20 / 0.7;

  let firstLines = [firstLineRaw];
  let { size: fontSize1, ratio } = scaleFontToFit(firstLineRaw, `54px RoadUA-Medium`, maxWidth, baseFontSize1);

  // Якщо масштаб уже на межі — сплітимо текст
  if (ratio <= 0.8) {
    firstLines = splitText(firstLineRaw);
    const sizes = firstLines.map(line =>
      scaleFontToFit(line, `54px RoadUA-Medium`, maxWidth, baseFontSize1)
    );
    const minRatio = Math.min(...sizes.map(s => s.ratio));
    fontSize1 = baseFontSize1 * minRatio;
  }

  const { size: fontSize2 } = scaleFontToFit(secondLineRaw, `28px RoadUA-Medium`, maxWidth, baseFontSize2);

  const arrow = PathConfigs.smallArrow;
  const iconKey = params.icon;
  const icon = iconKey && PathConfigs[iconKey];

  const directionLayout = {
    "left": { rotation: -90, arrowX: 30 + (arrow.height - arrow.width) / 2, iconX: 30 + arrow.height + 20 },
    "straight": { rotation: 0, arrowX: 30, iconX: 30 + arrow.width + 20 },
    "straight-left": { rotation: -45, arrowX: 27, iconX: 30 + 654 * arrow.scale + 20 },
    "right": { rotation: 90, arrowX: 570 - arrow.width - (arrow.height - arrow.width) / 2, iconX: 30 },
    "straight-right": { rotation: 45, arrowX: 573 - arrow.width, iconX: 30 },
  };

  const layout = directionLayout[params.direction || "straight"];
  const rotation = layout.rotation;
  const arrowX = layout.arrowX;
  const arrowY = 75 - arrow.height / 2;
  const iconX = layout.iconX;

  return (
    <g transform={transform || `translate(${x}, ${y})`}>
      <rect x={30} y={35} width={540} height={80} fill="red" />

      <text>
        {firstLines.map((line, i) => (
          <tspan
            key={i}
            x={100}
            y={35 + 38 + i * (fontSize1 + 2)}
            fontSize={fontSize1}
            dominantBaseline="alphabetic"
            fontFamily="RoadUA-Medium"
          >
            {line}
          </tspan>
        ))}

        <tspan
          x={100}
          y={110 + (firstLines.length - 1) * (fontSize1 + 2)}
          fontSize={fontSize2}
          dominantBaseline="alphabetic"
          fontFamily="RoadUA-Medium"
        >
          {secondLineRaw}
        </tspan>
      </text>

      <g
        transform={`
          translate(${arrowX}, ${arrowY})
          rotate(${rotation} ${arrow.width / 2} ${arrow.height / 2})
          scale(${arrow.scale})
        `}
      >
        <path d={arrow.d} fill="black" />
      </g>

      {icon && (
        <g transform={`translate(${iconX}, ${75 - icon.height * icon.scale / 2}) scale(${icon.scale})`}>
          <path d={icon.d} fill="#000000" fillRule="evenodd" />
        </g>
      )}
    </g>
  );
}

export default B4Item;
