import transliterate from "./transliterate";
import PathConfigs from "../config/PathConfigs";
import locationTerms from "../config/locationTerms";
import measureText from "./measureText";
import RouteBadgeGroup from "../components/svg/RouteBadgeGroup";

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

  let firstLines = [firstLineRaw];
  let { size: fontSize1, ratio } = scaleFontToFit(firstLineRaw, "54px RoadUA-Medium", 520, baseFontSize1);
  if (ratio <= 0.8) {
    firstLines = splitText(firstLineRaw);
    const sizes = firstLines.map(line =>
      scaleFontToFit(line, "54px RoadUA-Medium", 520, baseFontSize1)
    );
    const minRatio = Math.min(...sizes.map(s => s.ratio));
    fontSize1 = baseFontSize1 * minRatio;
  }

  const { size: fontSize2 } = scaleFontToFit(secondLineRaw, "28px RoadUA-Medium", 520, baseFontSize2);

  const measuredText = measureText(firstLines.join(" "), `${fontSize1}px RoadUA-Medium`);
  const routeBadgeX = textX + measuredText.width + 20;

  return (
    <g transform={transform || `translate(${x}, ${y})`}>
      <rect x={xPadding} y={35} width={520} height={80} fill="white" />

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

      <RouteBadgeGroup
        params={{ ...params }}
        x={routeBadgeX}
        y={35}
      />
    </g>
  );
}

export default B4Item;
