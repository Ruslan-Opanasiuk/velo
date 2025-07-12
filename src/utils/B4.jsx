import RectRenderer from "./RectRenderer";
import B4Item from "./B4Item";
import B4B7Header from "../components/svg/B4B7Header";
import RectConfigs from "../config/RectConfigs";

/**
 * 📦 Компонент для побудови таблички B4 з кількома напрямками.
 */
function B4({ params }) {
  // === [1] Розрахунок кількості напрямків ===
  // Отримуємо кількість елементів B4Item. Якщо їх немає — вважаємо, що один.
  const count = params.b4Items?.length || 1;

  // === [2] Вибір зовнішньої та внутрішньої рамки ===
  // Рамки вибираються з конфіга відповідно до кількості напрямків.
  const outerRect = RectConfigs[`B${count + 3}`];
  const innerRect = RectConfigs[`strokeB${count + 3}`];

  // === [3] Прапорець для чорної лінії під заголовком ===
  // Якщо тип таблиці — тимчасовий, під заголовком треба чорну лінію.
  const showBlackLine = params.tableType === "temporary";

  // === [4] Функція для розрахунку вертикального положення B4Item ===
  // Кожен елемент зміщується на 150px вниз від попереднього, старт з 200px.
  const b4ItemY = (index) => 200 + index * 150;

  // === [5] Генерація чорних роздільників між різними напрямками ===
  // Якщо напрямок у двох сусідніх елементів різний — між ними рисуємо чорну лінію.
  const renderSeparatorLines = () => {
    const lines = [];

    for (let i = 1; i < params.b4Items.length; i++) {
      const prev = params.b4Items[i - 1];
      const curr = params.b4Items[i];

      if (prev.direction !== curr.direction) {
        const y = b4ItemY(i) - 3;

        lines.push(
          <rect
            key={`line-${i}`}
            x={10}
            y={y}
            width={580}
            height={6}
            fill={"#000000"}
          />
        );
      }
    }

    return lines;
  };


  // === [6] Рендер SVG-таблички ===
  // Основний SVG-контейнер з усіма елементами таблички: фон, рамки, заголовок, напрямки тощо.
  return (
    <svg
      width={outerRect.outerWidth + 2}
      height={outerRect.outerHeight + 2}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        transform="translate(1,1)"
        style={{ filter: "drop-shadow(0 0 1px black)" }}
      >
        {/* === [6.1] Білий зовнішній прямокутник (фон) === */}
        <RectRenderer
          config={outerRect}
          outerColor={"#FFFFFF"}
          innerColor={"#FFFFFF"}
          x={0}
          y={0}
        />


        {/* === [6.2] Елементи B4Item (напрямки) === */}
        {params.b4Items?.map((itemParams, index) => {
          const prev = index > 0 ? params.b4Items[index - 1] : null;

          // Якщо стрілка така сама як у попереднього елемента — не показуємо її ще раз.
          const hideArrow =
            prev && prev.direction === itemParams.direction;

          // Ознака, що це останній напрямок у списку
          const isLast = index === params.b4Items.length - 1;

          return (
            <B4Item
              key={index}
              index={index} 
              params={{
                ...params,
                ...itemParams,
                hideArrow,
              }}
              x={0}
              y={b4ItemY(index)}
              isLast={isLast}
              onTooLong={(val) => updateTooLongFlag(index, val)}
            />
          );
        })}


        {/* === [6.3] Чорна внутрішня рамка === */}
        <RectRenderer
          config={innerRect}
          outerColor={"#000000"}
          innerColor={"none"}
          x={7}
          y={7}
        />

        {/* === [6.4] Заголовок таблички (верхній блок) === */}
        <B4B7Header params={params} />

        {/* === [6.5] Роздільники між різними напрямками === */}
        {renderSeparatorLines()}

        {/* === [6.6] Чорна смуга під заголовком для тимчасових знаків === */}
        {showBlackLine && (
          <rect
            x={10}
            y={197}
            width={580}
            height={6}
            fill={"#000000"}
          />
        )}
      </g>
    </svg>
  );
}

export default B4;
