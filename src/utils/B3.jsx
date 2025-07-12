import RectRenderer from "./RectRenderer";
import CircleRenderer from "./CircleRenderer";
import PathConfigs from "../config/PathConfigs";
import RectConfigs from "../config/RectConfigs";
import CircleConfigs from "../config/CircleConfigs";
import { getColors } from "../config/colorConfig";

/**
 * 🔵 Компонент таблички типу B3:
 * Прямокутник з іконкою велосипеда, номером маршруту (коло, прямокутник або EuroVelo),
 * стрілкою напрямку.
 */
function B3({ params }) {
  // === [1] КОЛЬОРИ ДЛЯ ТАБЛИЧКИ ===
  // Отримуємо кольори для фону, рамки, тексту та індикаторів залежно від типу таблиці
  const colors = getColors(params.tableType, params.numberType);

  // === [2] КОНФІГИ ОСНОВНИХ ФОРМ ===
  const mainConfig = RectConfigs["B3"]; // Зовнішній прямокутник
  const circleConfig = CircleConfigs["E5B1"]; // Коло для нац. маршрутів

  // Прямокутник для номера маршруту: ширший для двозначних
  const isDouble = +params.routeNumber >= 10;
  const rectConfig = isDouble ? RectConfigs["E4B1"] : RectConfigs["E3B1"];

  // === [3] КУТ ПОВОРОТУ ДЛЯ СТРІЛКИ ЗАЛЕЖНО ВІД НАПРЯМКУ ===
  const rotationMap = {
    straight: 0,
    right: 90,
    left: -90,
    "straight-right": 45,
    "straight-left": -45,
  };
  const rotation = rotationMap[params.direction];

  // === [4] МАСШТАБУВАННЯ ТА ЗСУВИ ДЛЯ ВСТАВНИХ ІКОН ===

  // 🔹 Стрілка напрямку: масштабуємо по висоті 105
  const scale = 105 / PathConfigs.bigArrow.height;
  const xShift = mainConfig.outerWidth / 2 - (PathConfigs.bigArrow.width * scale) / 2;

  // 🔹 Велосипед: масштабуємо по висоті 74
  const scale1 = 74 / PathConfigs.bicycle.height;
  const xShift1 = mainConfig.outerWidth / 2 - (PathConfigs.bicycle.width * scale1) / 2;

  // 🔹 EuroVelo: масштабуємо по висоті 100
  const scale2 = 100 / PathConfigs.eurovelo.height;
  const xShift2 = mainConfig.outerWidth / 2 - (PathConfigs.eurovelo.width * scale2) / 2;

  // === [5] РЕНДЕР SVG ===
  return (
    <svg
      width={mainConfig.outerWidth + 2}
      height={mainConfig.outerHeight + 2}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Внутрішній відступ + тінь */}
      <g transform="translate(1,1)" style={{ filter: "drop-shadow(0 0 1px black)" }}>
        
        {/* === [5.1] Зовнішній прямокутник таблиці === */}
        <RectRenderer
          config={mainConfig}
          outerColor={colors.frameColor}
          innerColor={colors.backgroundColor}
          x={0}
          y={0}
        />

        {/* === [5.2] Внутрішній бейдж номера маршруту === */}
        {params.numberType === "national" ? (
          // 🔸 Коло для національного маршруту
          <CircleRenderer
            config={circleConfig}
            outerColor={colors.routeBox.frame}
            innerColor={colors.routeBox.background}
            cx={mainConfig.outerWidth / 2}
            cy={144 + circleConfig.outerRadius - 4}
          />
        ) : params.numberType === "eurovelo" ? (
          // 🔸 Іконка EuroVelo
          <path
            d={PathConfigs.eurovelo.d}
            fill={colors.routeBox.background}
            transform={`translate(${xShift2}, 140) scale(${scale2})`}
          />
        ) : (
          // 🔸 Прямокутник для звичайного маршруту
          <RectRenderer
            config={rectConfig}
            outerColor={colors.routeBox.frame}
            innerColor={colors.routeBox.background}
            x={mainConfig.outerWidth / 2 - rectConfig.outerWidth / 2}
            y={144}
          />
        )}

        {/* === [5.3] Текст з номером маршруту всередині бейджа === */}
        <text
          x={mainConfig.outerWidth / 2}
          y={144 + rectConfig.outerHeight / 2 + 7}
          fill={colors.routeBox.text}
          fontSize={(params.numberType === "national" ? 42 : 45) / 0.7}
          fontFamily="RoadUA-Bold"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontFeatureSettings: '"ss02"' }}
        >
          {params.routeNumber}
        </text>

        {/* === [5.4] Іконка велосипеда у верхній частині таблиці === */}
        <path
          d={PathConfigs.bicycle.d}
          fill={colors.symbolColor}
          fillRule="evenodd"
          transform={`translate(${xShift1}, 46) scale(${scale1})`}
        />

        {/* === [5.5] Стрілка напрямку у нижній частині таблиці === */}
        <g
          transform={`
            translate(${xShift}, 260)
            rotate(${rotation} ${PathConfigs.bigArrow.width * scale / 2} ${PathConfigs.bigArrow.height * scale / 2})
            scale(${scale})
          `}
        >
          <path d={PathConfigs.bigArrow.d} fill={colors.symbolColor} />
        </g>
      </g>
    </svg>
  );
}

export default B3;
