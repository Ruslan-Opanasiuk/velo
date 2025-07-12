import RectRenderer from "./RectRenderer";
import CircleRenderer from "./CircleRenderer";
import PathConfigs from "../config/PathConfigs";
import RectConfigs from "../config/RectConfigs";
import CircleConfigs from "../config/CircleConfigs";
import { getColors } from "../config/colorConfig";

/**
 * 🔵 Компонент прямокутної таблички типу B1:
 * Відображає рамку, номер маршруту (у прямокутнику, колі або іконкою EuroVelo), та стрілку напрямку.
 */
function B1({ params }) {
  // === [1] КОЛЬОРИ ДЛЯ ТАБЛИЧКИ ===
  // Отримуємо кольори відповідно до типу таблиці, типу номера маршруту та чи це кінцева точка
  const colors = getColors(params.tableType, params.numberType);

  // === [2] КОНФІГИ ДЛЯ ОСНОВНОГО КОНТЕЙНЕРА І ВНУТРІШНІХ ФОРМ ===
  const mainConfig = RectConfigs["B1"]; // Загальний прямокутник таблиці
  const circleConfig = CircleConfigs["E5B1"]; // Коло для нац. маршрутів

  // Вибір прямокутника для номеру залежно від кількості цифр
  const isDouble = +params.routeNumber >= 10;
  const rectConfig = isDouble ? RectConfigs["E4B1"] : RectConfigs["E3B1"];

  // === [3] НАПРЯМОК: ОБЧИСЛЕННЯ КУТА ПОВОРОТУ ДЛЯ СТРІЛКИ ===
  const rotationMap = {
    straight: 0,
    right: 90,
    left: -90,
    "straight-right": 45,
    "straight-left": -45,
  };
  const rotation = rotationMap[params.direction];

  // === [4] МАСШТАБ ТА ЗСУВИ ДЛЯ СТРІЛКИ ТА ІКОНКИ EUROVELO ===

  // Стрілка: масштабуємо по висоті 105
  const scale = 105 / PathConfigs.bigArrow.height;
  const xShift = mainConfig.outerWidth / 2 - (PathConfigs.bigArrow.width * scale) / 2;

  // Eurovelo: масштабуємо по висоті 100
  const scale1 = 100 / PathConfigs.eurovelo.height;
  const xShift1 = mainConfig.outerWidth / 2 - (PathConfigs.eurovelo.width * scale1) / 2;

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

        {/* === [5.2] Внутрішній блок з номером маршруту === */}
        {params.numberType === "national" ? (
          // Коло для національного маршруту
          <CircleRenderer
            config={circleConfig}
            outerColor={colors.routeBox.frame}
            innerColor={colors.routeBox.background}
            cx={mainConfig.outerWidth / 2}
            cy={46 + circleConfig.outerRadius - 4}
          />
        ) : params.numberType === "eurovelo" ? (
          // Іконка для EuroVelo маршруту
          <path
            d={PathConfigs.eurovelo.d}
            fill={colors.routeBox.background}
            transform={`
              translate(${xShift1}, 42)
              scale(${scale1})
            `}
          />
        ) : (
          // Прямокутник для звичайних номерів
          <RectRenderer
            config={rectConfig}
            outerColor={colors.routeBox.frame}
            innerColor={colors.routeBox.background}
            x={mainConfig.outerWidth / 2 - rectConfig.outerWidth / 2}
            y={46}
          />
        )}

        {/* === [5.3] Текст з номером маршруту всередині бейджа === */}
        <text
          x={mainConfig.outerWidth / 2}
          y={46 + rectConfig.outerHeight / 2 + 6}
          fill={colors.routeBox.text}
          fontSize={(params.numberType === "national" ? 42 : 45) / 0.7}
          fontFamily="RoadUA-Bold"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontFeatureSettings: '"ss02"' }}
        >
          {params.routeNumber}
        </text>

        {/* === [5.4] Стрілка напрямку маршруту === */}
        <g
          transform={`
            translate(${xShift}, 160)
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

export default B1;
