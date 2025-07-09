import transliterate from "./transliterate";
import PathConfigs from "../config/PathConfigs";
import locationTerms from "../config/locationTerms";
import measureText from "./measureText";
import RouteBadgeGroup, { getRouteBadgeGroupWidth } from "../components/svg/RouteBadgeGroup";


// ============================================================================
// ⬛ Функції для обробки тексту
// ============================================================================

// Масштабує шрифт, щоб текст вмістився у вказану ширину
function scaleFontToFit(text, font, maxWidth, baseSize) {
  const measured = measureText(text, font);
  if (measured.width <= maxWidth) return { size: baseSize, ratio: 1 };
  const scaleRatio = maxWidth / measured.width;
  const clampedRatio = Math.max(scaleRatio, 0.8);
  return { size: baseSize * clampedRatio, ratio: clampedRatio };
}

// Ділить довгий рядок на два коротші (для двох рядків тексту)
function splitText(text) {
  const words = text.split(" ");
  if (words.length < 2) return [text];
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
}


// ============================================================================
// ⬛ Основний компонент B4Item
// ============================================================================

function B4Item({ params, x = 0, y = 0, transform }) {
  const xPadding = 40;

  // --------------------------------------------------------------------------
  // 🟦 Формування тексту з locationTerms або custom вводу
  // --------------------------------------------------------------------------

  const mainKey = params.mainText;
  const subInput = params.subText;

  let shortUa = "";
  let rawLabel = "";

  if (params.icon === "other") {
    shortUa = params.customUa || "";
    rawLabel = params.customEn || "";
  } else if (params.icon && mainKey && locationTerms[params.icon]?.[mainKey]) {
    const entry = locationTerms[params.icon][mainKey];
    shortUa = entry.ua ?? "";
    rawLabel = entry.en ?? "";
  }

  const original = subInput || "";
  const translit = subInput ? transliterate(subInput) : "";

  // Перший (укр) і другий (латиниця) рядки тексту
  const firstLineRaw = shortUa ? `${shortUa} ${original}`.trim() : original;
  const secondLineRaw = translit && rawLabel
    ? `${translit} ${rawLabel}`.trim()
    : translit || rawLabel || "";


  // --------------------------------------------------------------------------
  // 🟦 Налаштування іконки та стрілки
  // --------------------------------------------------------------------------

  const arrow = PathConfigs.smallArrow;

  // Виправлення типу іконки в окремих випадках
  let iconKey = params.icon;
  if (iconKey === "streetNetwork" && params.isUrbanCenter) {
    iconKey = "cityCentre";
  }
  if (!iconKey) {
    if (params.numberType === "veloSTO") iconKey = "veloSTO";
    else if (params.numberType === "veloParking") iconKey = "veloParking";
    else if (params.numberType === "eurovelo") iconKey = "eurovelo";
  }

  const icon = iconKey && PathConfigs[iconKey];


  // --------------------------------------------------------------------------
  // 🟦 Координати стрілки, іконки та тексту — залежно від напрямку
  // --------------------------------------------------------------------------

  const directionLayout = {
    "left": {
      rotation: -90,
      arrowX: xPadding + (arrow.height - arrow.width) / 2,
      iconX: xPadding + arrow.height + 20
    },
    "straight": {
      rotation: 0,
      arrowX: xPadding,
      iconX: xPadding + arrow.width + 20
    },
    "straight-left": {
      rotation: -45,
      arrowX: xPadding - 3,
      iconX: xPadding + 654 * arrow.scale + 20
    },
    "right": {
      rotation: 90,
      arrowX: 560 - arrow.width - (arrow.height - arrow.width) / 2,
      iconX: xPadding
    },
    "straight-right": {
      rotation: 45,
      arrowX: 560 + 3 - arrow.width,
      iconX: xPadding
    }
  };

  const layout = directionLayout[params.direction || "straight"];
  const { rotation, arrowX, iconX } = layout;
  const arrowY = 75 - arrow.height / 2;


  // --------------------------------------------------------------------------
  // 🟦 Обчислення позиції тексту
  // --------------------------------------------------------------------------

  let textX = 40;

  if (["left", "straight", "straight-left"].includes(params.direction)) {
    let arrowVisualWidth = 0;
    if (params.direction === "straight") arrowVisualWidth = arrow.width;
    else if (params.direction === "left") arrowVisualWidth = arrow.height;
    else if (params.direction === "straight-left") arrowVisualWidth = 65.4;
    textX = arrowX + arrowVisualWidth + 20;
  }

  if (icon) {
    textX += icon.width * icon.scale + 20;
  }


  // --------------------------------------------------------------------------
  // 🟦 Обробка шрифтів: масштабування, перенесення
  // --------------------------------------------------------------------------

  const baseFontSize1 = 38 / 0.7;
  const baseFontSize2 = 20 / 0.7;

  let arrowRightSpace = 0;
  if (params.direction === "right") arrowRightSpace = arrow.height + 20;
  else if (params.direction === "straight-right") arrowRightSpace = 65.4 + 20;

  const badgeGroupWidth = getRouteBadgeGroupWidth(params);
  const availableTextWidth = 520 - (textX - xPadding) - arrowRightSpace - badgeGroupWidth;

  // Масштабуємо перший рядок, за потреби розбиваємо на 2 рядки
  let firstLines = [firstLineRaw];
  let { size: fontSize1, ratio } = scaleFontToFit(firstLineRaw, "54px RoadUA-Medium", availableTextWidth, baseFontSize1);
  if (ratio <= 0.8) {
    firstLines = splitText(firstLineRaw);

    // нова логіка: перший рядок — фіксовано зменшений на 30%, другий — динамічно
    const fontSizeLine1 = baseFontSize1 * 0.7;
    const { size: fontSizeLine2 } = scaleFontToFit(
      firstLines[1],
      "54px RoadUA-Medium",
      availableTextWidth,
      baseFontSize1
    );
    fontSize1 = [fontSizeLine1, fontSizeLine2];
  }

  const { size: fontSize2 } = scaleFontToFit(secondLineRaw, "28px RoadUA-Medium", availableTextWidth, baseFontSize2);

  const measuredText = measureText(firstLines.join(" "), `${Array.isArray(fontSize1) ? fontSize1[0] : fontSize1}px RoadUA-Medium`);
  const routeBadgeX = textX + measuredText.width + 20;


  // --------------------------------------------------------------------------
  // 🟩 Рендер SVG
  // --------------------------------------------------------------------------

  return (
    <g transform={transform || `translate(${x}, ${y})`}>

      {/* Прямокутник-основа */}
      {/* <rect x={xPadding} y={35} width={520} height={80} fill="green" /> */}
      {/* <rect x={xPadding} y={74.5} width={520} height={1} fill="red" /> */}

      {/* Текст українською та англійською */}
      <text>
        {firstLines.map((line, i) => {
          const isSplit = firstLines.length > 1;

          // Обчислюємо Y динамічно:
          const y = isSplit
            ? 35 + 4 + i * (Array.isArray(fontSize1) ? fontSize1[i] : fontSize1) * 0.91 // для 2 рядків
            : 35 + 38 + i * fontSize1; // для одного рядка

          return (
            <tspan
              key={i}
              x={textX}
              y={y}
              fontSize={Array.isArray(fontSize1) ? fontSize1[i] : fontSize1}
              fontFamily="RoadUA-Medium"
            >
              {line}
            </tspan>
          );
        })}

        {/* Англійський рядок */}
        <tspan
          x={textX}
          y={
            firstLines.length > 1
              ? 115 + 5 // для 2 рядків укр
              : 115 - (20 * (96 / 76) - 20) // для 1 рядка укр
          }
          fontSize={fontSize2}
          fontFamily="RoadUA-Medium"
        >
          {secondLineRaw}
        </tspan>
      </text>


      {/* Стрілка */}
      {!params.hideArrow && (
        <g
          transform={`
            translate(${arrowX}, ${arrowY})
            rotate(${rotation} ${arrow.width / 2} ${arrow.height / 2})
            scale(${arrow.scale})
          `}
        >
          <path d={arrow.d} fill="black" />
        </g>
      )}

      {/* Іконка */}
      {icon && (
        <g transform={`translate(${iconX}, ${75 - icon.height * icon.scale / 2}) scale(${icon.scale})`}>
          <path d={icon.d} fill="#000000" fillRule="evenodd" />
        </g>
      )}

      {/* Бейдж з номером маршруту */}
      <RouteBadgeGroup
        params={{ ...params }}
        x={routeBadgeX}
        y={35}
      />
    </g>
  );
}

export default B4Item;
