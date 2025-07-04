import locationTerms from "../../config/locationTerms";
import PathConfigs from "../../config/PathConfigs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";

function B4ItemSettings({ label, params, setParams }) {
  const handleDirectionChange = (value) => {
    setParams({ ...params, direction: value });
  };

  const handleIconChange = (value) => {
    setParams({ ...params, icon: value });
  };

  const directions = [
    { value: "straight", label: "Прямо", icon: PathConfigs.smallArrow },
    { value: "left", label: "Ліворуч", icon: PathConfigs.smallArrow },
    { value: "right", label: "Праворуч", icon: PathConfigs.smallArrow },
    { value: "straight-left", label: "Прямо і ліворуч", icon: PathConfigs.smallArrow },
    { value: "straight-right", label: "Прямо і праворуч", icon: PathConfigs.smallArrow },
  ];

  const allowedIcons = [
    "cityCentre",
    "interchange",
    "port",
    "settlement",
    "bridge",
    "railStation",
    "airport",
    "busStation",
  ];

  const iconLabels = {
    cityCentre: "Центр міста",
    interchange: "Розв'язка",
    port: "Порт",
    settlement: "Населений пункт",
    bridge: "Міст",
    railStation: "Залізнична станція",
    airport: "Аеропорт",
    busStation: "Автостанція",
  };

  const iconOptions = allowedIcons.map((key) => ({
    value: key,
    label: iconLabels[key] || key,
    icon: PathConfigs[key],
  }));

  const isCityCenter = params.mainText === "Центр міста";
  const isRoute = params.mainText === "Веломаршрут";

  return (
    <div className="bg-white border border-gray-300 p-6 shadow-md">
      <p className="text-xl font-semibold mb-4">{label}</p>

      <div className="flex gap-4 mb-4">
        <input
          list="city-options"
          value={params.mainText || ""}
          onChange={(e) => setParams({ ...params, mainText: e.target.value })}
          placeholder="Оберіть або введіть..."
          className="w-1/2 p-2 border rounded"
        />
        <datalist id="city-options">
          {Object.keys(locationTerms).map((key) => (
            <option key={key} value={key} />
          ))}
        </datalist>

        {!isCityCenter && !isRoute && (
          <input
            type="text"
            value={params.subText || ""}
            onChange={(e) => setParams({ ...params, subText: e.target.value })}
            placeholder="Додатковий текст..."
            className="w-1/2 p-2 border rounded"
          />
        )}

        {isRoute && (
          <input
            type="text"
            inputMode="numeric"
            pattern="\\d*"
            value={params.routeNumber || ""}
            onChange={(e) => setParams({ ...params, routeNumber: e.target.value })}
            disabled={params.numberType === "eurovelo"}
            className="w-1/2 p-2 border rounded"
            placeholder="Введіть цифрове значення від 1 до 99"
          />
        )}
      </div>

      {/* Напрямок */}
      <label className="block mb-1 font-medium">Напрямок:</label>
      <Select value={params.direction} onValueChange={handleDirectionChange}>
        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
        <SelectContent>
          {directions.map(({ value, label, icon }) => {
            const rotation = B4ItemSettings.directionLayout[value]?.rotation || 0;
            return (
              <SelectItem
                key={value}
                value={value}
                title={label}
                className="flex items-center justify-center"
              >
                <svg
                  width={24}
                  height={24}
                  viewBox={`0 0 ${icon.width} ${icon.height}`}
                  className="text-gray-700"
                >
                  <path
                    d={icon.d}
                    fill="currentColor"
                    transform={`
                      rotate(${rotation} ${icon.width / 2} ${icon.height / 2})
                      scale(${icon.scale})
                    `}
                  />
                </svg>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Іконка */}
      <label className="block mt-4 mb-1 font-medium">Іконка:</label>
      <Select value={params.icon || ""} onValueChange={handleIconChange}>
        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
        <SelectContent>
          {iconOptions.map(({ value, label, icon }) => (
            <SelectItem
              key={value}
              value={value}
              title={label}
              className="flex items-center justify-center"
            >
              <svg
                width={24}
                height={24}
                viewBox={`0 0 ${icon.width} ${icon.height}`}
                className="text-gray-700"
              >
                <path d={icon.d} fill="currentColor" fillRule="evenodd" />
              </svg>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

B4ItemSettings.directionLayout = {
  straight: { rotation: 0 },
  left: { rotation: -90 },
  right: { rotation: 90 },
  "straight-left": { rotation: -45 },
  "straight-right": { rotation: 45 },
};

export default B4ItemSettings;
