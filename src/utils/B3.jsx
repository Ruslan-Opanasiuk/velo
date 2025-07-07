// components/B1.jsx
import RectRenderer from "./RectRenderer";
import CircleRenderer from "./CircleRenderer";
import PathConfigs from "../config/PathConfigs";
import RectConfigs from "../config/RectConfigs";
import CircleConfigs from "../config/CircleConfigs";
import { ColorMap } from "../config/ColorMap";

function B3({ params }) {
  // Розпакування кольорів за типами
  const { table, number } = ColorMap;
  const { bg: numberBg } = number[params.numberType];
  const { bg: tableBg, fg: tableFg } = table[params.tableType];
    const textColor = params.tableType === "seasonal"
    ? "#F5C30D"
    : number[params.numberType].text;

  // Вибір конфігів
  const mainConfig = RectConfigs["B3"];
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

  const scale1 = 74 / PathConfigs.bicycle.height;
  const xShift1 = (mainConfig.outerWidth / 2) - (PathConfigs.bicycle.width * scale1 / 2);

  const scale2 = 100 / PathConfigs.eurovelo.height;
  const xShift2 = (mainConfig.outerWidth / 2) - (PathConfigs.eurovelo.width * scale2 / 2);

  return (
    <svg
      width={mainConfig.outerWidth}
      height={mainConfig.outerHeight}
      xmlns="http://www.w3.org/2000/svg"
    >

      {/* Зовнішня таблиця */}
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
          cy={144 + circleConfig.outerRadius - 4}
        />
      ) : params.numberType === "eurovelo" ? (
        <path
          d={PathConfigs.eurovelo.d}
          fill={numberBg}
          transform={`
            translate(${xShift2}, 140)
            scale(${scale2})
          `}
        />
      ) : (
        <RectRenderer
          config={rectConfig}
          outerColor={tableBg}
          innerColor={numberBg}
          x={mainConfig.outerWidth / 2 - rectConfig.outerWidth / 2}
          y={144}
        />
      )}

      {/* Текст з номером */}
      <text
        x={mainConfig.outerWidth / 2}
        y={144 + rectConfig.outerHeight / 2 + 7}
        fill={textColor}
        fontSize={(params.numberType === "national" ? 42 : 45) / 0.7}
        fontFamily="RoadUA-Bold"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontFeatureSettings: '"ss02"' }}
      >
        {params.routeNumber}
      </text>

      {/* Велосипед */}
      <path
        d={PathConfigs.bicycle.d}
        fill={tableBg}
        fillRule="evenodd"
        transform={`translate(${xShift1}, 46) scale(${scale1})`}
      />

      {/* Стрілка */}
      <g
        transform={
          `translate(${xShift}, 260)
           rotate(${rotation} ${PathConfigs.bigArrow.width * scale / 2} ${PathConfigs.bigArrow.height * scale / 2})
           scale(${scale})`
        }
      >
        <path d={PathConfigs.bigArrow.d} fill={tableBg} />
      </g>
    </svg>
  );
}

export default B3;
