// components/B2.jsx
import RectRenderer from "./RectRenderer";
import CircleRenderer from "./CircleRenderer";
import PathConfigs from "../config/PathConfigs";
import RectConfigs from "../config/RectConfigs";
import CircleConfigs from "../config/CircleConfigs";
import { ColorMap } from "../config/ColorMap";

function B2({ params }) {
  // Розпакування кольорів за типами
  const { table } = ColorMap;
  const { bg: tableBg, fg: tableFg, textB2: textColor} = table[params.tableType];

  // Вибір конфігів
  const mainConfig = RectConfigs["B1"];
  const circleConfig = CircleConfigs["E5B1"];
  const isDouble = +params.routeNumber >= 10;
  const rectConfig = isDouble ? RectConfigs["E4B1"] : RectConfigs["E3B1"];

  const scale = 74 / PathConfigs.bicycle.height;
  const xShift = (mainConfig.outerWidth / 2) - (PathConfigs.bicycle.width * scale / 2);

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
      {params.numberType !== "eurovelo" && (
        params.numberType === "national" ? (
          <CircleRenderer
            config={circleConfig}
            outerColor={tableBg}
            innerColor={"#989898"}
            cx={mainConfig.outerWidth / 2}
            cy={160 + circleConfig.outerRadius - 4}
          />
        ) : (
          <RectRenderer
            config={rectConfig}
            outerColor={tableBg}
            innerColor={"#989898"}
            x={mainConfig.outerWidth / 2 - rectConfig.outerWidth / 2}
            y={160}
          />
        )
      )}


      <path
        d={PathConfigs.stripe.d}
        fill="#CC0000"
      />

      {/* Внутрішня фігура */}
      {params.numberType === "national" ? (
        <CircleRenderer
          config={circleConfig}
          outerColor={tableBg}
          innerColor={"none"}
          cx={mainConfig.outerWidth/2}
          cy={160 + circleConfig.outerRadius - 4}
        />
      ) : params.numberType === "eurovelo" ? (
        <path
          d={PathConfigs.eurovelo.d}
          fill={"#F5C30D"}
          transform={`
            translate(${xShift1}, 156)
            scale(${scale1})
          `}
        />
      ) : (
        <RectRenderer
          config={rectConfig}
          outerColor={tableBg}
          innerColor={"none"}
          x={mainConfig.outerWidth/2 - rectConfig.outerWidth/2}
          y={160}
        />
      )}

      <path
        d={PathConfigs.bicycle.d}
        fill={tableBg}
        fillRule="evenodd"
        transform={`translate(${xShift}, 48) scale(${scale})`}
      />

      {/* Текст з номером */}
      <text
        x={mainConfig.outerWidth/2}
        y={160 + rectConfig.outerHeight/2 + 6} //ПІДПРАВИТИ
        fill={textColor}
        fontSize={(params.numberType === "national" ? 42 : 45) / 0.7}
        fontFamily="RoadUA-Bold"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontFeatureSettings: '"ss02"' }}
      >
        {params.routeNumber}
      </text>
      </g>
    </svg>
  );
}

export default B2;
