import RectRenderer from "./RectRenderer";
import CircleRenderer from "./CircleRenderer";
import PathConfigs from "../config/PathConfigs";
import RectConfigs from "../config/RectConfigs";
import CircleConfigs from "../config/CircleConfigs";
import { getColors } from "../config/colorConfig";

/**
 * 🔴 Компонент таблички типу B2:
 * Варіант таблички з червоною стрічкою, сірим фоном під номером та іконкою велосипеда.
 * Залежно від типу — рендериться коло, прямокутник або EuroVelo.
 */
function B2({ params }) {
  // === [1] КОЛЬОРИ ДЛЯ ТАБЛИЧКИ ===
  // isTerminus завжди true — це кінцева табличка
  const colors = getColors(params.tableType, params.numberType, true);

  // === [2] КОНФІГИ ДЛЯ ЗОВНІШНЬОГО КОРПУСУ ТА БЕЙДЖА ===
  const mainConfig = RectConfigs["B1"]; // Зовнішній прямокутник
  const circleConfig = CircleConfigs["E5B1"]; // Коло для нац. маршрутів

  // Прямокутник для звичайних номерів: вибір залежить від кількості цифр
  const isDouble = +params.routeNumber >= 10;
  const rectConfig = isDouble ? RectConfigs["E4B1"] : RectConfigs["E3B1"];

  // === [3] МАСШТАБ ТА ВИРІВНЮВАННЯ ІКОН ===

  // Велосипед: масштабуємо до висоти 74
  const scale = 74 / PathConfigs.bicycle.height;
  const xShift =
    mainConfig.outerWidth / 2 - (PathConfigs.bicycle.width * scale) / 2;

  // EuroVelo: масштабуємо до висоти 100
  const scale1 = 100 / PathConfigs.eurovelo.height;
  const xShift1 =
    mainConfig.outerWidth / 2 - (PathConfigs.eurovelo.width * scale1) / 2;

  // === [4] РЕНДЕР SVG ===
  return (
    <svg
      width={mainConfig.outerWidth + 2}
      height={mainConfig.outerHeight + 2}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Відступ та тінь */}
      <g
        transform="translate(1,1)"
        style={{ filter: "drop-shadow(0 0 1px black)" }}
      >
        {/* === [4.1] Зовнішній прямокутник таблички === */}
        <RectRenderer
          config={mainConfig}
          outerColor={colors.frameColor}
          innerColor={colors.backgroundColor}
          x={0}
          y={0}
        />

        {/* === [4.2] Сірий фон під номером маршруту (тільки не EuroVelo) === */}
        {params.numberType !== "eurovelo" && (
          params.numberType === "national" ? (
            // Коло
            <CircleRenderer
              config={circleConfig}
              outerColor={colors.routeBox.frame}
              innerColor={"#989898"} // сірий внутрішній фон
              cx={mainConfig.outerWidth / 2}
              cy={160 + circleConfig.outerRadius - 4}
            />
          ) : (
            // Прямокутник
            <RectRenderer
              config={rectConfig}
              outerColor={colors.routeBox.frame}
              innerColor={"#989898"} // сірий внутрішній фон
              x={mainConfig.outerWidth / 2 - rectConfig.outerWidth / 2}
              y={160}
            />
          )
        )}

        {/* === [4.3] Червона горизонтальна стрічка === */}
        <path d={PathConfigs.stripe.d} fill="#CC0000" />

        {/* === [4.4] Верхній контур номерного бейджа === */}
        {params.numberType === "national" ? (
          // 🔸 Контур кола
          <CircleRenderer
            config={circleConfig}
            outerColor={colors.routeBox.frame}
            innerColor={"none"} // тільки контур
            cx={mainConfig.outerWidth / 2}
            cy={160 + circleConfig.outerRadius - 4}
          />
        ) : params.numberType === "eurovelo" ? (
          // 🔸 EuroVelo — з фіксованим жовтим фоном
          <path
            d={PathConfigs.eurovelo.d}
            fill={"#F5C30D"}
            transform={`translate(${xShift1}, 156) scale(${scale1})`}
          />
        ) : (
          // 🔸 Контур прямокутника
          <RectRenderer
            config={rectConfig}
            outerColor={colors.routeBox.frame}
            innerColor={"none"} // тільки контур
            x={mainConfig.outerWidth / 2 - rectConfig.outerWidth / 2}
            y={160}
          />
        )}

        {/* === [4.5] Іконка велосипеда у верхній частині === */}
        <path
          d={PathConfigs.bicycle.d}
          fill={colors.symbolColor}
          fillRule="evenodd"
          transform={`translate(${xShift}, 48) scale(${scale})`}
        />

        {/* === [4.6] Текст з номером маршруту всередині бейджа === */}
        <text
          x={mainConfig.outerWidth / 2}
          y={160 + rectConfig.outerHeight / 2 + 6}
          fill={colors.routeBox.text}
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
