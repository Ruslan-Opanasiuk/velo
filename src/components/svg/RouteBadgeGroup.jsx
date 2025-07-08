import RectConfigs from "../../config/RectConfigs";
import CircleConfigs from "../../config/CircleConfigs";
import PathConfigs from "../../config/PathConfigs";
import RectRenderer from "../../utils/RectRenderer";
import CircleRenderer from "../../utils/CircleRenderer";
import { ColorMap } from "../../config/ColorMap";

function RouteBadgeGroup({ params = {}, x = 0, y = 0 }) {
  const { table, number } = ColorMap;

  const spacing = 20;
  let currentX = 0;

  const isDoubleDigit = +params.routeNumber >= 10;
  const RectConfig = isDoubleDigit ? RectConfigs["E4B4text"] : RectConfigs["E3B4text"];
  const CircleConfig = CircleConfigs["E5B4text"];

  // === НОВЕ: визначаємо тип маршруту з mainText ===
  const categoryToType = {
    "Локальний": "local",
    "Регіональний": "regional",
    "Національний": "national",
  };
  const routeType = categoryToType[params.mainText];
  const { bg: tableBackground } = table[params.tableType] || {};
  const { bg: badgeBackground, text: textColor } = number[routeType] || {};
  const renderRouteNumber = !!routeType;

  const elements = [];

  if (renderRouteNumber) {
    elements.push(
      <g key="badge" transform={`translate(${currentX}, 0)`}>
        {routeType === "national" ? (
          <CircleRenderer
            config={CircleConfig}
            outerColor={tableBackground}
            innerColor={badgeBackground}
            cx={CircleConfig.outerRadius}
            cy={CircleConfig.outerRadius}
          />
        ) : (
          <RectRenderer
            config={RectConfig}
            outerColor={tableBackground}
            innerColor={badgeBackground}
            x={0}
            y={0}
          />
        )}
        <text
          x={
            routeType === "national"
              ? CircleConfig.outerRadius
              : RectConfig.outerWidth / 2
          }
          y={
            routeType === "national"
              ? CircleConfig.outerRadius + 3
              : RectConfig.outerHeight / 2 + 3
          }
          fill={textColor}
          fontSize={(routeType === "national" ? 22 : 25) / 0.7}
          fontFamily="RoadUA-Bold"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontFeatureSettings: '"ss02"' }}
        >
          {params.routeNumber}
        </text>
      </g>
    );

    currentX += routeType === "national"
      ? CircleConfig.outerRadius * 2
      : RectConfig.outerWidth;
    currentX += spacing;
  }

  if (params.showEurovelo) {
    const euroveloConfig = RectConfigs["euroveloB4text"];
    const euroveloScale = 42.5 / PathConfigs.eurovelo.height;
    const euroveloIconOffset = (euroveloConfig.outerWidth / 2) - (PathConfigs.eurovelo.width * euroveloScale / 2);

    elements.push(
      <g key="eurovelo" transform={`translate(${currentX}, 0)`}>
        <RectRenderer
          config={euroveloConfig}
          outerColor={"#005187"}
          innerColor={"#005187"}
          x={0}
          y={0}
        />
        <g transform={`translate(${euroveloIconOffset}, ${euroveloIconOffset}) scale(${euroveloScale})`}>
          <path d={PathConfigs.eurovelo.d} fill="#F5C30D" fillRule="evenodd" />
        </g>
        <text
          x={euroveloConfig.outerWidth / 2}
          y={euroveloConfig.outerWidth / 2 + 2}
          fill={"#FFFFFF"}
          fontSize={18 / 0.7}
          fontFamily="RoadUA-Bold"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontFeatureSettings: '"ss02"' }}
        >
          4
        </text>
      </g>
    );

    currentX += euroveloConfig.outerWidth + spacing;
  }

  if (params.showVeloParking) {
    elements.push(
      <g key="veloParking" transform={`translate(${currentX}, 0) scale(${PathConfigs.veloParking.scale})`}>
        <path d={PathConfigs.veloParking.d} fill="#005187" fillRule="evenodd" />
      </g>
    );
    currentX += PathConfigs.veloParking.width * PathConfigs.veloParking.scale + spacing;
  }

  if (params.showVeloSTO) {
    elements.push(
      <g key="veloSTO" transform={`translate(${currentX}, 0) scale(${PathConfigs.veloSTO.scale})`}>
        <path d={PathConfigs.veloSTO.d} fill="#005187" fillRule="evenodd" />
      </g>
    );
  }

  return <g transform={`translate(${x}, ${y})`}>{elements}</g>;
}

export default RouteBadgeGroup;
