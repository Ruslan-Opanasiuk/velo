import RectRenderer from "./RectRenderer";
import CircleRenderer from "./CircleRenderer";
import PathConfigs from "../config/PathConfigs";
import RectConfigs from "../config/RectConfigs";
import CircleConfigs from "../config/CircleConfigs";
import { ColorMap } from "../config/ColorMap";

function B1({ params }) {
  const { table, number } = ColorMap;
  const { bg: tableBg, fg: tableFg } = table[params.tableType];
  const { bg: numberBg } = number[params.numberType];
  const textColor = params.tableType === "seasonal"
    ? "#F5C30D"
    : number[params.numberType].text;

  const mainConfig = RectConfigs["B1"];
  const circleConfig = CircleConfigs["E5B1"];
  const isDouble = +params.routeNumber >= 10;
  const rectConfig = isDouble ? RectConfigs["E4B1"] : RectConfigs["E3B1"];

  const rotationMap = {
    straight: 0,
    right: 90,
    left: -90,
    "straight-right": 45,
    "straight-left": -45
  };
  const rotation = rotationMap[params.direction];

  const scale = 105 / PathConfigs.bigArrow.height;
  const xShift = (mainConfig.outerWidth / 2) - (PathConfigs.bigArrow.width * scale / 2);

  const scale1 = 100 / PathConfigs.eurovelo.height;
  const xShift1 = (mainConfig.outerWidth / 2) - (PathConfigs.eurovelo.width * scale1 / 2);

  return (
    <svg
      width={mainConfig.outerWidth+2}
      height={mainConfig.outerHeight+2}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(1,1)" style={{ filter: "drop-shadow(0 0 1px black)" }}>
      <RectRenderer
        config={mainConfig}
        outerColor={params.tableType === "seasonal" ? "#FFFFFF" : tableBg}
        innerColor={tableFg}
        x={0}
        y={0}
      />

      {/* Внутрішня фігура */}
      {params.numberType === "national" ? (
        <CircleRenderer
          config={circleConfig}
          outerColor={tableBg}
          innerColor={numberBg}
          cx={mainConfig.outerWidth / 2}
          cy={46 + circleConfig.outerRadius -4}
        />
      ) : params.numberType === "eurovelo" ? (
        <path
          d={PathConfigs.eurovelo.d}
          fill={numberBg}
          transform={`
            translate(${xShift1}, 42)
            scale(${scale1})
          `}
        />
      ) : (
        <RectRenderer
          config={rectConfig}
          outerColor={tableBg}
          innerColor={numberBg}
          x={mainConfig.outerWidth / 2 - rectConfig.outerWidth / 2}
          y={46}
        />
      )}

      {/* Текст з номером (не показуємо для eurovelo, якщо треба прибрати) */}
      <text
        x={mainConfig.outerWidth / 2}
        y={46 + rectConfig.outerHeight / 2 + 6}
        fill={textColor}
        fontSize={(params.numberType === "national" ? 42 : 45) / 0.7}
        fontFamily="RoadUA-Bold"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontFeatureSettings: '"ss02"' }}
      >
        {params.routeNumber}
      </text>

      {/* Стрілка */}
      <g
        transform={`
          translate(${xShift}, 160)
          rotate(${rotation} ${PathConfigs.bigArrow.width * scale / 2} ${PathConfigs.bigArrow.height * scale / 2})
          scale(${scale})
        `}
      >
        <path d={PathConfigs.bigArrow.d} fill={tableBg} />
      </g>
      </g>
    </svg>
  );
}

export default B1;
