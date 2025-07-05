import RectRenderer from "./RectRenderer";
import CircleRenderer from "./CircleRenderer";
import B4Item from "./B4Item";
import RectConfigs from "../config/RectConfigs";
import PathConfigs from "../config/PathConfigs";
import CircleConfigs from "../config/CircleConfigs";
import { ColorMap } from "../config/ColorMap";

function B4({ params }) {
  const { table, number } = ColorMap;
  const { bg: tableBackground, fg: tableForeground } = table[params.tableType];
  const { bg: badgeBackground } = number[params.numberType] || {};
  const textColor =
    params.tableType === "seasonal"
      ? "#F5C30D"
      : number[params.numberType]?.text;

  const circleBadge = CircleConfigs["E5B4"];
  const isDoubleDigit = +params.routeNumber >= 10;
  const rectBadge = isDoubleDigit ? RectConfigs["E4B4"] : RectConfigs["E3B4"];

  const count = params.b4Items?.length || 1;
  const outerRect = RectConfigs[`B${count + 3}`];
  const innerRect = RectConfigs[`strokeB${count + 3}`];
  const showBlackLine = params.tableType === "temporary";

  const bicycleScale = 86 / PathConfigs.bicycle.height;
  const euroveloScale = 100 / PathConfigs.eurovelo.height;

  const badgeWidth =
    params.numberType === "none"
      ? 0
      : params.numberType === "national"
      ? circleBadge.outerRadius * 2
      : params.numberType === "eurovelo"
      ? PathConfigs.eurovelo.width * euroveloScale
      : rectBadge.outerWidth;

  const groupX =
    300 -
    (PathConfigs.bicycle.width * bicycleScale +
      (params.numberType !== "none" ? 30 + badgeWidth : 0)) /
      2;

  const b4ItemY = (index) => 200 + index * 150;

  const renderSeparatorLines = () => {
    const lines = [];
    for (let i = 1; i < params.b4Items.length; i++) {
      const prev = params.b4Items[i - 1];
      const curr = params.b4Items[i];
      if (prev.direction !== curr.direction) {
        const y = b4ItemY(i) - 3;
        lines.push(
          <rect key={`line-${i}`} x={10} y={y} width={580} height={6} fill={"#000000"} />
        );
      }
    }
    return lines;
  };

  return (
    <svg
      width={outerRect.outerWidth}
      height={outerRect.outerHeight}
      xmlns="http://www.w3.org/2000/svg"
    >
      <RectRenderer
        config={outerRect}
        outerColor={"#FFFFFF"}
        innerColor={"#FFFFFF"}
        x={0}
        y={0}
      />
      <RectRenderer
        config={innerRect}
        outerColor={"#000000"}
        innerColor={"#FFFFFF"}
        x={5}
        y={5}
      />
      <path
        d={PathConfigs.topRoundedOuterRect.d}
        fill={params.tableType === "seasonal" ? "#FFFFFF" : tableBackground}
      />
      <path d={PathConfigs.topRoundedInnerRect.d} fill={tableForeground} />

      <g transform={`translate(${groupX}, 5)`}>
        <path
          d={PathConfigs.bicycle.d}
          fill={tableBackground}
          fillRule="evenodd"
          transform={`translate(0, ${
            100 - (PathConfigs.bicycle.height * bicycleScale) / 2
          }) scale(${bicycleScale})`}
        />

        {params.numberType !== "none" && (
          <g transform={`translate(${PathConfigs.bicycle.width * bicycleScale + 30}, 0)`}>
            {params.numberType === "national" ? (
              <CircleRenderer
                config={circleBadge}
                outerColor={tableBackground}
                innerColor={badgeBackground}
                cx={circleBadge.outerRadius}
                cy={100}
              />
            ) : params.numberType === "eurovelo" ? (
              <path
                d={PathConfigs.eurovelo.d}
                fill={badgeBackground}
                transform={`translate(0, ${
                  100 - (PathConfigs.eurovelo.height * euroveloScale) / 2
                }) scale(${euroveloScale})`}
              />
            ) : (
              <RectRenderer
                config={rectBadge}
                outerColor={tableBackground}
                innerColor={badgeBackground}
                x={0}
                y={100 - rectBadge.outerHeight / 2}
              />
            )}

            <text
              x={
                params.numberType === "national"
                  ? circleBadge.outerRadius
                  : params.numberType === "eurovelo"
                  ? (PathConfigs.eurovelo.width * euroveloScale) / 2
                  : rectBadge.outerWidth / 2
              }
              y={105}
              fill={textColor}
              fontSize={(params.numberType === "national" ? 36 : 41) / 0.7}
              fontFamily="RoadUA-Bold"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontFeatureSettings: '"ss02"' }}
            >
              {params.routeNumber}
            </text>
          </g>
        )}
      </g>

      {params.b4Items?.map((itemParams, index) => {
        const prev = index > 0 ? params.b4Items[index - 1] : null;
        const hideArrow = prev && prev.direction === itemParams.direction;
        return (
          <B4Item
            key={index}
            params={{ ...itemParams, hideArrow }}
            x={0}
            y={b4ItemY(index)}
          />
        );
      })}

      {renderSeparatorLines()}

      {showBlackLine && (
        <rect x={10} y={197} width={580} height={6} fill={"#000000"} />
      )}
    </svg>
  );
}

export default B4;
