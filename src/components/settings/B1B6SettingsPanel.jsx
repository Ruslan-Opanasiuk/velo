function B1B6SettingsPanel({ label, params, setParams, enableDirection, allowNoneOption }) {
  // Генерує список опцій для вибору рівня маршруту (тип номеру)
  const getNumberTypeOptions = () => {
    const options = [];

    // Якщо дозволено, додаємо опцію "Немає"
    if (allowNoneOption) {
      options.push(<option key="none" value="none">Немає</option>);
    }

    // Опція "Національний" доступна, якщо маршрут не сезонний
    if (params.tableType !== "seasonal") {
      options.push(<option key="national" value="national">Національний</option>);
    }

    // Для В2 показуємо одну комбіновану опцію
    if (label.includes("В2")) {
      options.push(<option key="regional-local" value="regional">Регіональний/Локальний</option>);
    } else {
      // Інакше додаємо окремо "Регіональний" та "Локальний"
      options.push(
        <option key="regional" value="regional">Регіональний</option>,
        <option key="local" value="local">Локальний</option>
      );
    }

    // Eurovelo дозволений тільки для постійних маршрутів, окрім В4-В6
    if (params.tableType === "permanent" && !label.includes("В4") && !label.includes("В5") && !label.includes("В6")) {
      options.push(<option key="eurovelo" value="eurovelo">Eurovelo 4</option>);
    }

    return options;
  };

  // Коли змінюється тип таблички (постійний, сезонний тощо)
  const handleTableTypeChange = (e) => {
    const tableType = e.target.value;
    let numberType = params.numberType;

    // Якщо вибрано сезонний тип — національний рівень не дозволений
    if (tableType === "seasonal" && numberType === "national") {
      numberType = "regional";
    }

    // Eurovelo доступний лише для постійних маршрутів
    if (tableType !== "permanent" && numberType === "eurovelo") {
      numberType = "regional";
    }

    setParams({ ...params, tableType, numberType });
  };

  // Коли змінюється рівень маршруту (тип номеру)
  const handleNumberTypeChange = (e) => {
    const numberType = e.target.value;

    // Автоматично підставляємо номер маршруту, якщо це Eurovelo (фіксовано 4)
    // або очищаємо, якщо обрано "немає"
    const routeNumber =
      numberType === "eurovelo" ? "4" :
      numberType === "none" ? "" :
      params.routeNumber;

    setParams({ ...params, numberType, routeNumber });
  };

  // Обробка зміни номера маршруту
  const handleRouteNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // залишаємо лише цифри

    if (value.startsWith("0")) value = value.slice(1); // прибираємо початкові нулі

    if (params.numberType === "eurovelo") value = "4"; // якщо Eurovelo — фіксоване значення
    else value = value.slice(0, 2); // максимум 2 цифри

    setParams({ ...params, routeNumber: value });
  };

  // Обробка вибору кількості напрямів (для В4)
  const handleRouteCountChange = (count) => {
    const newItems = Array.from({ length: count }, (_, i) => {
      return params.b4Items?.[i] || {
        mainText: "",
        subText: "",
        direction: "straight",
        routeNumber: "",
      };
    });
    setParams({ ...params, b4Items: newItems });
  };

  return (
    <div className="bg-white border border-gray-300 p-6 shadow-md">
      <p className="text-xl font-semibold mb-4">{label}</p>

      {/* Вибір типу таблички */}
      <label className="block mb-4">
        Призначення веломаршруту:
        <select
          value={params.tableType}
          onChange={handleTableTypeChange}
          className="w-full mt-1 p-2 border rounded"
        >
          <option value="permanent">Постійний</option>
          <option value="seasonal">Сезонний</option>
          <option value="temporary">Тимчасовий</option>
        </select>
      </label>

      {/* Вибір рівня маршруту (тип номеру) */}
      <label className="block mb-4">
        Рівень веломаршруту:
        <select
          value={params.numberType}
          onChange={handleNumberTypeChange}
          className="w-full mt-1 p-2 border rounded"
        >
          {getNumberTypeOptions()}
        </select>
      </label>

      {/* Введення номера маршруту — якщо опція не "немає" */}
      {params.numberType !== "none" && (
        <label className="block mb-4">
          Номер маршруту:
          <input
            type="text"
            inputMode="numeric"
            pattern="\\d*"
            value={params.routeNumber}
            onChange={handleRouteNumberChange}
            disabled={params.numberType === "eurovelo"} // Заборона редагування для Eurovelo
            className="w-full mt-1 p-2 border rounded"
            placeholder="Введіть цифру від 1 до 99"
          />
        </label>
      )}

      {/* Вибір напрямку, якщо це дозволено (для B1-B3) */}
      {enableDirection && (
        <label className="block">
          Напрямок:
          <select
            value={params.direction}
            onChange={(e) => setParams({ ...params, direction: e.target.value })}
            className="w-full mt-1 p-2 border rounded"
          >
            <option value="straight">Прямо</option>
            <option value="left">Ліворуч</option>
            <option value="right">Праворуч</option>
            <option value="straight-left">Прямо і ліворуч</option>
            <option value="straight-right">Прямо і праворуч</option>
          </select>
        </label>
      )}

      {/* Вибір кількості точок інтересу — тільки для В4 */}
      {label.includes("В4") && (
        <div className="mt-4">
          <p className="mb-1 font-medium">Кількість напрямків</p>
          <div className="inline-flex border rounded overflow-hidden">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => handleRouteCountChange(num)}
                className={`px-4 py-2 border-r last:border-r-0 ${
                  params.b4Items?.length === num
                    ? "bg-gray-300 font-semibold"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default B1B6SettingsPanel;
