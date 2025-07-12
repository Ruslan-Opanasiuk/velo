import RectRenderer from "../../utils/RectRenderer";
import CircleRenderer from "../../utils/CircleRenderer";
import PathConfigs from "../../config/PathConfigs";
import CircleConfigs from "../../config/CircleConfigs";
import RectConfigs from "../../config/RectConfigs";
import { getColors } from "../../config/colorConfig";

/**
 * 🔵 Компонент шапки для табличок B4/B7:
 * малює верхній фон з заокругленням, іконку велосипеда, маршрутний бейдж та номер маршруту.
 */
function B4B7Header({ params }) {
  // === [1] КОЛЬОРИ З ТАБЛИЧКИ ===
  // Отримуємо кольори відповідно до типу таблиці, типу номера маршруту та чи це кінцева точка
  const colors = getColors(params.tableType, params.numberType);

  // === [2] ВИБІР ФОРМИ ДЛЯ БЕЙДЖА ===
  // Для національного маршруту — круг, інакше — прямокутник залежно від кількості цифр
  const circleBadge = CircleConfigs["E5B4"];

  const isDoubleDigit = +params.routeNumber >= 10;

  const rectBadge = isDoubleDigit
    ? RectConfigs["E4B4"]
    : RectConfigs["E3B4"];

  // === [3] МАСШТАБ ІКОНКИ ВЕЛОСИПЕДА ===
  // Масштабуємо велосипед до висоти 86
  const bicycleScale = 86 / PathConfigs.bicycle.height;

  // === [4] ШИРИНА БЕЙДЖА ===
  // Якщо немає типу — 0, інакше вибираємо по типу: круг або прямокутник
  const badgeWidth =
    params.numberType === "none"
      ? 0
      : params.numberType === "national"
      ? circleBadge.outerRadius * 2
      : rectBadge.outerWidth;

  // === [5] ГОРИЗОНТАЛЬНЕ ВИРІВНЮВАННЯ ВСЬОГО ГРУПОВОГО БЛОКУ ===
  // Центруємо велосипед + бейдж у межах ширини 600 (тобто по 300)
  const groupX =
    300 -
    (
      PathConfigs.bicycle.width * bicycleScale +
      (params.numberType !== "none" ? 30 + badgeWidth : 0)
    ) / 2;

  // === [6] РЕНДЕР ШАПКИ ===
  return (
    <>
      {/* === [6.1] Верхній заокруглений блок === */}
      {/* Малюється у два шари: зовнішній і внутрішній */}
      <path
        d={PathConfigs.topRoundedOuterRect.d}
        fill={colors.frameColor}
      />
      <path
        d={PathConfigs.topRoundedInnerRect.d}
        fill={colors.backgroundColor}
      />

      {/* === [6.2] Іконка велосипеда + маршрутний бейдж === */}
      <g transform={`translate(${groupX}, 5)`}>
        {/* Іконка велосипеда */}
        <path
          d={PathConfigs.bicycle.d}
          fill={colors.symbolColor}
          fillRule="evenodd"
          transform={`translate(0, ${
            100 - (PathConfigs.bicycle.height * bicycleScale) / 2
          }) scale(${bicycleScale})`}
        />

        {/* Якщо задано тип маршруту — рендеримо бейдж */}
        {params.numberType !== "none" && (
          <g transform={`translate(${PathConfigs.bicycle.width * bicycleScale + 30}, 0)`}>
            {/* === [6.2.1] КОЛО для нац. маршруту === */}
            {params.numberType === "national" ? (
              <CircleRenderer
                config={circleBadge}
                outerColor={colors.routeBox.frame}
                innerColor={colors.routeBox.background}
                cx={circleBadge.outerRadius}
                cy={100}
              />
            ) : (
              // === [6.2.2] ПРЯМОКУТНИК для решти типів ===
              <RectRenderer
                config={rectBadge}
                outerColor={colors.routeBox.frame}
                innerColor={colors.routeBox.background}
                x={0}
                y={100 - rectBadge.outerHeight / 2 + 5}
              />
            )}

            {/* === [6.2.3] НОМЕР МАРШРУТУ УСЕРЕДИНІ БЕЙДЖА === */}
            <text
              x={
                params.numberType === "national"
                  ? circleBadge.outerRadius
                  : rectBadge.outerWidth / 2
              }
              y={
                params.numberType === "national"
                  ? 105
                  : 110
              }
              fill={colors.routeBox.text}
              fontSize={
                (params.numberType === "national" ? 38 : 41) / 0.7
              }
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
    </>
  );
}

export default B4B7Header;
