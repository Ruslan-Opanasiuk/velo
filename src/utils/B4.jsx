import RectRenderer from "./RectRenderer";
import CircleRenderer from "./CircleRenderer";
import B4Item from "./B4Item";
import RectConfigs from "../config/RectConfigs";
import PathConfigs from "../config/PathConfigs";
import CircleConfigs from "../config/CircleConfigs";
import { ColorMap } from "../config/ColorMap";

function B4({ params }) {

  const xPadding = 40;
  const paddingX = 560;
  

  // Отримуємо кольори фону та тексту з мапи
  const { table, number } = ColorMap;
  const { bg: tableBackground, fg: tableForeground } = table[params.tableType];
  const { bg: badgeBackground, text: defaultTextColor } = number[params.numberType] || {};
  const textColor = params.tableType === "seasonal" ? "#F5C30D" : defaultTextColor || "#000000";


  const circleBadge = CircleConfigs["E5B4"];
  const isDoubleDigit = +params.routeNumber >= 10;
  const rectBadge = isDoubleDigit ? RectConfigs["E4B4"] : RectConfigs["E3B4"];

  const count = params.b4Items?.length || 1;

  // Конфігурації розміру таблички для 1, 2 або 3 напрямків
  const outerRect = RectConfigs[`B${count + 3}`];
  const innerRect = RectConfigs[`strokeB${count + 3}`];

  const showBlackLine = params.tableType === "temporary";

  const bicycleScale = 86 / PathConfigs.bicycle.height;

  // Визначення ширини бейджа маршруту залежно від типу
  const badgeWidth =
    params.numberType === "none"
      ? 0
      : params.numberType === "national"
      ? circleBadge.outerRadius * 2
      : rectBadge.outerWidth;

  // Центрування всього блоку піктограма + маршрут
  const groupX =
    300 -
    (PathConfigs.bicycle.width * bicycleScale +
      (params.numberType !== "none" ? 30 + badgeWidth : 0)) / 2;

  // Позиції кожного B4Item
  const b4ItemY = (index) => 200 + index * 150;

  // Вставки чорних ліній між напрямками з різними стрілками
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
      width={outerRect.outerWidth+2}
      height={outerRect.outerHeight+2}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(1,1)" style={{ filter: "drop-shadow(0 0 1px black)" }}>
      {/* Зовнішній білий контур */}
      <RectRenderer
        config={outerRect}
        outerColor={"#FFFFFF"}
        innerColor={"#FFFFFF"}
        x={0}
        y={0}
      />
      {/* Внутрішній чорний контур */}
      <RectRenderer
        config={innerRect}
        outerColor={"#000000"}
        innerColor={"#FFFFFF"}
        x={7}
        y={7}
      />

      {/* Верхня заокруглена частина */}
      <path
        d={PathConfigs.topRoundedOuterRect.d}
        fill={params.tableType === "seasonal" ? "#FFFFFF" : tableBackground}
      />
      <path d={PathConfigs.topRoundedInnerRect.d} fill={tableForeground} />




      {/* Іконка велосипеда + маршрут */}
      <g transform={`translate(${groupX}, 5)`}>
        {/* Іконка велосипеда */}
        <path
          d={PathConfigs.bicycle.d}
          fill={tableBackground}
          fillRule="evenodd"
          transform={`translate(0, ${
            100 - (PathConfigs.bicycle.height * bicycleScale) / 2
          }) scale(${bicycleScale})`}
        />

        {/* Бейдж з номером маршруту */}
        {params.numberType !== "none" && (
          <g transform={`translate(${PathConfigs.bicycle.width * bicycleScale + 30}, 0)`}>
            {/* Якщо тип — національний — малюємо коло */}
            {params.numberType === "national" ? (
              <CircleRenderer
                config={circleBadge}
                outerColor={tableBackground}
                innerColor={badgeBackground}
                cx={circleBadge.outerRadius}
                cy={100}
              />
            ) : (
              // Інакше прямокутник
              <RectRenderer
                config={rectBadge}
                outerColor={tableBackground}
                innerColor={badgeBackground}
                x={0}
                y={100 - rectBadge.outerHeight / 2 + 5}
              />
            )}

            {/* Текст номера */}
            <text
              x={
                params.numberType === "national"
                  ? circleBadge.outerRadius
                  : rectBadge.outerWidth / 2
              }
              y={(params.numberType === "national" ? 105 : 110)}
              fill={textColor}
              fontSize={(params.numberType === "national" ? 38 : 41) / 0.7}
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




      {/* Напрямки В4 */}
      {params.b4Items?.map((itemParams, index) => {
        const prev = index > 0 ? params.b4Items[index - 1] : null;
        const hideArrow = prev && prev.direction === itemParams.direction;
        return (
          <B4Item
            key={index}
            params={{ ...params, ...itemParams, hideArrow }}
            x={0}
            y={b4ItemY(index)}
            onTooLong={(val) => updateTooLongFlag(index, val)}
          />
        );
      })}

      {/* Роздільники між стрілками */}
      {renderSeparatorLines()}

      {/* Чорна смуга під верхнім блоком, якщо тип "temporary" */}
      {showBlackLine && (
        <rect x={10} y={197} width={580} height={6} fill={"#000000"} />
      )}


      </g>
    </svg>
  );
}

export default B4;
