import RectRenderer from "./RectRenderer"; // Компонент для прямокутників (рамки, фон)
import CircleRenderer from "./CircleRenderer"; // Компонент для кола (нац. маршрут)
import B4Item from "./B4Item"; // Один напрямок B4
import RectConfigs from "../config/RectConfigs"; // Конфігурації прямокутників
import PathConfigs from "../config/PathConfigs"; // Шляхи (SVG path) до іконок
import CircleConfigs from "../config/CircleConfigs"; // Конфігурації кіл
import { ColorMap } from "../config/ColorMap"; // Мапа кольорів (по типу таблиці/маршруту)

/**
 * 📦 Компонент для побудови таблички B4 з кількома напрямками.
 */
function B4({ params }) {
  // --- 1. КОЛЬОРИ ---

  // Отримуємо колір фону та тексту таблиці
  const { table, number } = ColorMap;
  const { bg: tableBackground, fg: tableForeground } = table[params.tableType];

  // Отримуємо кольори для бейджа з номером маршруту
  const { bg: badgeBackground, text: defaultTextColor } = number[params.numberType] || {};

  // Колір тексту: якщо сезонна табличка — фіксований жовтий, інакше — зі словника
  const textColor = params.tableType === "seasonal" ? "#F5C30D" : defaultTextColor || "#000000";

  // --- 2. КОНФІГУРАЦІЯ МАРШРУТНОГО БЕЙДЖА ---

  // Бейдж у вигляді круга для нац. маршруту
  const circleBadge = CircleConfigs["E5B4"];

  // Якщо номер маршруту ≥ 10 — використовуємо більший прямокутник
  const isDoubleDigit = +params.routeNumber >= 10;
  const rectBadge = isDoubleDigit ? RectConfigs["E4B4"] : RectConfigs["E3B4"];

  // --- 3. КОНФІГУРАЦІЯ РОЗМІРУ ВСІЄЇ ТАБЛИЧКИ ---

  // Кількість напрямків (1–3)
  const count = params.b4Items?.length || 1;

  // Отримуємо відповідний прямокутник (рамка) за кількістю напрямків
  const outerRect = RectConfigs[`B${count + 3}`];
  const innerRect = RectConfigs[`strokeB${count + 3}`];

  // Якщо таблиця тимчасова — потрібно малювати чорну лінію зверху
  const showBlackLine = params.tableType === "temporary";

  // --- 4. РОЗМІЩЕННЯ ІКОНКИ ВЕЛОСИПЕДА + МАРШРУТ ---

  // Масштабування іконки велосипеда під розмір таблиці
  const bicycleScale = 86 / PathConfigs.bicycle.height;

  // Ширина бейджа маршруту (0 — якщо "none")
  const badgeWidth =
    params.numberType === "none"
      ? 0
      : params.numberType === "national"
      ? circleBadge.outerRadius * 2
      : rectBadge.outerWidth;

  // Центруємо блок (велосипед + бейдж) по центру таблиці (ширина 600 → центр 300)
  const groupX =
    300 -
    (PathConfigs.bicycle.width * bicycleScale +
      (params.numberType !== "none" ? 30 + badgeWidth : 0)) / 2;

  // --- 5. РОЗТАШУВАННЯ ЕЛЕМЕНТІВ B4Item ---

  /**
   * Обчислює Y-координату для кожного елемента B4Item
   * @param index - номер елемента (0, 1, 2)
   */
  const b4ItemY = (index) => 200 + index * 150;

  // --- 6. РЕНДЕР РОЗДІЛЬНИХ ЛІНІЙ МІЖ НАПРЯМКАМИ ---

  /**
   * Рендерить чорні лінії між напрямками, якщо їх стрілки різні
   */
  const renderSeparatorLines = () => {
    const lines = [];

    for (let i = 1; i < params.b4Items.length; i++) {
      const prev = params.b4Items[i - 1];
      const curr = params.b4Items[i];

      if (prev.direction !== curr.direction) {
        const y = b4ItemY(i) - 3; // Зміщення вгору перед новим блоком
        lines.push(
          <rect key={`line-${i}`} x={10} y={y} width={580} height={6} fill={"#000000"} />
        );
      }
    }

    return lines;
  };

  // --- 7. РЕНДЕР SVG ---

  return (
    <svg
      width={outerRect.outerWidth + 2}
      height={outerRect.outerHeight + 2}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Загальна група з невеликим зміщенням та тінню */}
      <g transform="translate(1,1)" style={{ filter: "drop-shadow(0 0 1px black)" }}>
        {/* Зовнішня біла рамка */}
        <RectRenderer
          config={outerRect}
          outerColor={"#FFFFFF"}
          innerColor={"#FFFFFF"}
          x={0}
          y={0}
        />

        {/* Внутрішня чорна рамка */}
        <RectRenderer
          config={innerRect}
          outerColor={"#000000"}
          innerColor={"#FFFFFF"}
          x={7}
          y={7}
        />

        {/* Верхній заокруглений блок з фоном */}
        <path
          d={PathConfigs.topRoundedOuterRect.d}
          fill={params.tableType === "seasonal" ? "#FFFFFF" : tableBackground}
        />
        <path d={PathConfigs.topRoundedInnerRect.d} fill={tableForeground} />

        {/* --- ВЕЛОСИПЕД + БЕЙДЖ МАРШРУТУ --- */}
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

          {/* Бейдж маршруту (коло або прямокутник + номер) */}
          {params.numberType !== "none" && (
            <g transform={`translate(${PathConfigs.bicycle.width * bicycleScale + 30}, 0)`}>
              {/* Нац. маршрут = коло */}
              {params.numberType === "national" ? (
                <CircleRenderer
                  config={circleBadge}
                  outerColor={tableBackground}
                  innerColor={badgeBackground}
                  cx={circleBadge.outerRadius}
                  cy={100}
                />
              ) : (
                // Інші типи = прямокутник
                <RectRenderer
                  config={rectBadge}
                  outerColor={tableBackground}
                  innerColor={badgeBackground}
                  x={0}
                  y={100 - rectBadge.outerHeight / 2 + 5}
                />
              )}

              {/* Текст номера маршруту всередині бейджа */}
              <text
                x={
                  params.numberType === "national"
                    ? circleBadge.outerRadius
                    : rectBadge.outerWidth / 2
                }
                y={params.numberType === "national" ? 105 : 110}
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

        {/* --- НАПРЯМКИ B4Item --- */}
        {params.b4Items?.map((itemParams, index) => {
          const prev = index > 0 ? params.b4Items[index - 1] : null;

          // Якщо напрямок такий самий як попередній — не малюємо стрілку
          const hideArrow = prev && prev.direction === itemParams.direction;

          return (
            <B4Item
              key={index}
              params={{ ...params, ...itemParams, hideArrow }}
              x={0}
              y={b4ItemY(index)}
              onTooLong={(val) => updateTooLongFlag(index, val)} // (опціонально)
            />
          );
        })}

        {/* --- ЧОРНІ ЛІНІЇ МІЖ РІЗНИМИ СТРІЛКАМИ --- */}
        {renderSeparatorLines()}

        {/* --- ЧОРНА СМУГА ПІД ВЕЛОБЛОКОМ (тільки для типу "temporary") --- */}
        {showBlackLine && (
          <rect x={10} y={197} width={580} height={6} fill={"#000000"} />
        )}
      </g>
    </svg>
  );
}

export default B4;
