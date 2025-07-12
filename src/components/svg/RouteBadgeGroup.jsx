import RectConfigs from "../../config/RectConfigs";
import CircleConfigs from "../../config/CircleConfigs";
import PathConfigs from "../../config/PathConfigs";
import RectRenderer from "../../utils/RectRenderer";
import CircleRenderer from "../../utils/CircleRenderer";
import getColors from "../../config/colorConfig";

export function getRouteBadgeGroupWidth(params = {}) {
  const spacing = 20;
  const categoryToType = {
    "Локальний": "local",
    "Регіональний": "regional",
    "Національний": "national",
  };

  const routeType = categoryToType[params.mainText];
  const routeNumberValid = !!params.routeNumber;
  const isDoubleDigit = +params.routeNumber >= 10;

  let total = 0;

  if (routeType && routeNumberValid) {
    total += routeType === "national"
      ? CircleConfigs["E5B4text"].outerRadius * 2
      : isDoubleDigit
        ? RectConfigs["E4B4text"].outerWidth
        : RectConfigs["E3B4text"].outerWidth;
    total += spacing;
  }

  if (params.showEurovelo) {
    total += RectConfigs["euroveloB4text"].outerWidth + spacing;
  }

  if (params.showVeloParking) {
    total += PathConfigs.veloParking.width * PathConfigs.veloParking.scale + spacing;
  }

  if (params.showVeloSTO) {
    total += PathConfigs.veloSTO.width * PathConfigs.veloSTO.scale + spacing;
  }

  return total;
}

function RouteBadgeGroup({ params = {}, x = 0, y = 0 }) {
  const spacing = 20;
  const elements = [];

  const categoryToType = {
    "Локальний": "local",
    "Регіональний": "regional",
    "Національний": "national",
  };
  const routeType = categoryToType[params.mainText];
  const routeNumberValid = !!params.routeNumber;
  const colors = getColors(params.tableType, routeType, params.isTerminus, params.isTemporaryRoute);

  const isDoubleDigit = +params.routeNumber >= 10;
  const RectConfig = isDoubleDigit ? RectConfigs["E4B4text"] : RectConfigs["E3B4text"];
  const CircleConfig = CircleConfigs["E5B4text"];

  let currentX = 0;

  if (routeType && routeNumberValid) {
    elements.push(
      <g key="badge" transform={`translate(${currentX}, 0)`}>
        {routeType === "national" ? (
          <CircleRenderer
            config={CircleConfig}
            outerColor={colors.routeBox.frame}
            innerColor={colors.routeBox.background}
            cx={CircleConfig.outerRadius}
            cy={CircleConfig.outerRadius}
          />
        ) : (
          <RectRenderer
            config={RectConfig}
            outerColor={colors.routeBox.frame}
            innerColor={colors.routeBox.background}
            x={0}
            y={0}
          />
        )}
        <text
          x={routeType === "national" ? CircleConfig.outerRadius : RectConfig.outerWidth / 2}
          y={routeType === "national" ? CircleConfig.outerRadius + 3 : RectConfig.outerHeight / 2 + 3}
          fill={colors.routeBox.text}
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
