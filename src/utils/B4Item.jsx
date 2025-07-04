import transliterate from "./transliterate";
import PathConfigs from "../config/PathConfigs";
import locationTerms from "../config/locationTerms"; // ⬅️ Додаємо назад

function B4Item({ params, x = 0, y = 0, transform }) {
  const mainKey = params.mainText;
  const subInput = params.subText;

  const original = subInput || "";
  const translit = subInput ? transliterate(subInput) : "";

  const entry = mainKey ? locationTerms[mainKey] || {} : {};
  const shortUa = mainKey || "";
  const rawLabel = mainKey || "";
  const position = entry.position || "suffix";
  
  const enLabel =
    position === "suffix"
      ? rawLabel.charAt(0).toLowerCase() + rawLabel.slice(1)
      : rawLabel;

  const firstLine = original ? `${shortUa} ${original}`.trim() : shortUa;
  const secondLine = translit
    ? position === "prefix"
      ? `${enLabel} ${translit}`.trim()
      : `${translit} ${enLabel}`.trim()
    : "";


  const arrow = PathConfigs.smallArrow;
  const iconKey = params.icon;
  const icon = iconKey && PathConfigs[iconKey];

  const directionLayout = {
    "left": {
      rotation: -90,
      arrowX: 30 + (arrow.height - arrow.width) / 2,
      iconX: 30 + arrow.height + 20,
    },
    "straight": {
      rotation: 0,
      arrowX: 30,
      iconX: 30 + arrow.width + 20,
    },
    "straight-left": {
      rotation: -45,
      arrowX: 27,
      iconX: 30 + 654 * arrow.scale + 20,
    },
    "right": {
      rotation: 90,
      arrowX: 570 - arrow.width - (arrow.height - arrow.width) / 2,
      iconX: 30,
    },
    "straight-right": {
      rotation: 45,
      arrowX: 573 - arrow.width,
      iconX: 30,
    },
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
        <tspan
          x={100}
          y={35 + 38}
          fontSize={38 / 0.7}
          dominantBaseline="alphabetic"
          fontFamily="RoadUA-Medium"
        >
          {firstLine}
        </tspan>

        <tspan
          x={100}
          y={110}
          fontSize={20 / 0.7}
          dominantBaseline="alphabetic"
          fontFamily="RoadUA-Medium"
        >
          {secondLine}
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
