function B1B6SettingsPanel({ label, params, setParams, enableDirection, allowNoneOption }) {
  const getNumberTypeOptions = () => {
    const options = [];

    if (allowNoneOption) {
      options.push(<option key="none" value="none">Немає</option>);
    }

    if (params.tableType !== "seasonal") {
      options.push(<option key="national" value="national">Національний</option>);
    }

    if (label.includes("В2")) {
      options.push(<option key="regional-local" value="regional">Регіональний/Локальний</option>);
    } else {
      options.push(
        <option key="regional" value="regional">Регіональний</option>,
        <option key="local" value="local">Локальний</option>
      );
    }

    // ❌ Виняток для В4-В6 — не додаємо Eurovelo
    if (params.tableType === "permanent" && !label.includes("В4") && !label.includes("В5") && !label.includes("В6")) {
      options.push(<option key="eurovelo" value="eurovelo">Eurovelo 4</option>);
    }

    return options;
  };

  const handleTableTypeChange = (e) => {
    const tableType = e.target.value;
    let numberType = params.numberType;

    if (tableType === "seasonal" && numberType === "national") {
      numberType = "regional";
    }
    if (tableType !== "permanent" && numberType === "eurovelo") {
      numberType = "regional";
    }

    setParams({ ...params, tableType, numberType });
  };

  const handleNumberTypeChange = (e) => {
    const numberType = e.target.value;
    const routeNumber =
      numberType === "eurovelo" ? "4" :
      numberType === "none" ? "" :
      params.routeNumber;

    setParams({ ...params, numberType, routeNumber });
  };

  const handleRouteNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.startsWith("0")) value = value.slice(1);
    if (params.numberType === "eurovelo") value = "4";
    else value = value.slice(0, 2);

    setParams({ ...params, routeNumber: value });
  };

  return (
    <div className="bg-white border border-gray-300 p-6 shadow-md">
      <p className="text-xl font-semibold mb-4">{label}</p>

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

      {params.numberType !== "none" && (
        <label className="block mb-4">
          Номер маршруту:
          <input
            type="text"
            inputMode="numeric"
            pattern="\\d*"
            value={params.routeNumber}
            onChange={handleRouteNumberChange}
            disabled={params.numberType === "eurovelo"}
            className="w-full mt-1 p-2 border rounded"
            placeholder="Введіть цифрове значення від 1 до 99"
          />
        </label>
      )}

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
    </div>
  );
}

export default B1B6SettingsPanel;
