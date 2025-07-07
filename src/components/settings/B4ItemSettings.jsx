import locationTerms from "../../config/locationTerms";
import PathConfigs from "../../config/PathConfigs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";

// Компонент налаштувань одного напрямку для В4
function B4ItemSettings({ label, params, setParams }) {
  // Зміна напрямку
  const handleDirectionChange = (value) => {
    setParams({ ...params, direction: value });
  };

  // Зміна піктограми
  const handleIconChange = (value) => {
    const newIcon = value === "none" ? null : value;
    const isCenterOrRoute = newIcon === "cityCentre" || newIcon === "bicycleRoute";
    setParams({
      ...params,
      icon: newIcon,
      mainText: "",
      subText: isCenterOrRoute ? "" : params.subText,
      isUrbanCenter: false,
      customUa: "",
      customEn: "",
    });
  };

  // Зміна категорії
  const handleMainTextChange = (value) => {
    const clearSubText = value === "Центр міста" || value === "Веломаршрут";
    setParams({
      ...params,
      mainText: value,
      subText: clearSubText ? "" : params.subText,
    });
  };

  // Зміна номера маршруту
  const handleRouteNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.startsWith("0")) value = value.slice(1);
    value = value.slice(0, 2);
    setParams({ ...params, routeNumber: value });
  };

  // Галочка "Є центром"
  const handleUrbanCenterToggle = (e) => {
    setParams({ ...params, isUrbanCenter: e.target.checked });
  };

  // Введення власної назви
  const handleCustomUaChange = (e) => {
    setParams({ ...params, customUa: e.target.value });
  };
  const handleCustomEnChange = (e) => {
    setParams({ ...params, customEn: e.target.value });
  };

  const directions = [
    { value: "straight", label: "Прямо", icon: PathConfigs.smallArrow },
    { value: "left", label: "Ліворуч", icon: PathConfigs.smallArrow },
    { value: "right", label: "Праворуч", icon: PathConfigs.smallArrow },
    { value: "straight-left", label: "Прямо і ліворуч", icon: PathConfigs.smallArrow },
    { value: "straight-right", label: "Прямо і праворуч", icon: PathConfigs.smallArrow },
  ];

  const iconLabelsUa = {
    cityCentre: "Центр населеного пункту",
    interchange: "Транспортна розв'язка",
    bridge: "Міст",
    port: "Порт",
    airport: "Аеропорт",
    settlement: "Населений пункт",
    railStation: "Залізничний об'єкт",
    busStation: "Автобусний об'єкт",
    water: "Водний об'єкт",
    streetNetwork: "Вулично-дорожня мережа",
    district: "Частина населеного пункту",
    bicycleRoute: "Веломаршрут",
    other: "Інший об'єкт",
  };

  const iconOptions = Object.keys(locationTerms).map((key) => ({
    value: key,
    label: iconLabelsUa[key] || key,
    icon: PathConfigs[key],
  }));

  const categoryOptions = params.icon && locationTerms[params.icon]
    ? Object.keys(locationTerms[params.icon])
    : [];

  const isBicycleRoute = params.icon === "bicycleRoute" || params.mainText === "Веломаршрут";
  const shouldShowNameField =
    !isBicycleRoute && params.icon !== "cityCentre" &&
    !["Центр міста", "Веломаршрут"].includes(params.mainText);

  return (
    <div className="bg-white border border-gray-300 p-6 shadow-md w-fit">
      <p className="text-xl font-semibold mb-6 text-center">{label}</p>

      <div className="space-y-4">
        {/* Напрямок */}
        <div className="flex items-center gap-4">
          <label className="w-48 font-medium">Напрямок:</label>
          <Select value={params.direction} onValueChange={handleDirectionChange}>
            <SelectTrigger className="w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {directions.map(({ value, label, icon }) => {
                const rotation = B4ItemSettings.directionLayout[value]?.rotation || 0;
                return (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <svg
                        width={24}
                        height={24}
                        viewBox={`0 0 ${icon.width} ${icon.height}`}
                        className="text-gray-700"
                      >
                        <path
                          d={icon.d}
                          fill="currentColor"
                          fillRule="evenodd"
                          transform={`rotate(${rotation} ${icon.width / 2} ${icon.height / 2}) scale(${icon.scale})`}
                        />
                      </svg>
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Піктограма */}
        <div className="flex items-center gap-4">
          <label className="w-48 font-medium">Піктограма:</label>
          <Select value={params.icon ?? ""} onValueChange={handleIconChange}>
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Оберіть піктограму" />
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map(({ value, label, icon }) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    {icon ? (
                      <svg
                        width={24}
                        height={24}
                        viewBox={`0 0 ${icon.width} ${icon.height}`}
                        className="text-gray-700"
                      >
                        <path d={icon.d} fill="currentColor" fillRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="w-6 inline-block" />
                    )}
                    <span>{label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Галочка для "Вулично-дорожня мережа" */}
        {params.icon === "streetNetwork" && (
          <div className="flex items-center gap-2 ml-52">
            <input
              type="checkbox"
              id="isUrbanCenter"
              checked={params.isUrbanCenter || false}
              onChange={handleUrbanCenterToggle}
            />
            <label htmlFor="isUrbanCenter" className="text-sm">Є центром населеного пункту</label>
          </div>
        )}

        {/* Категорія або власний текст */}
        {params.icon === "other" ? (
          <div className="flex items-start gap-4">
            <label className="w-48 font-medium mt-2">Категорія:</label>
            <div className="flex flex-col gap-1">
              <Input
                type="text"
                value={params.customUa || ""}
                onChange={handleCustomUaChange}
                placeholder="Введіть українську назву"
                className="w-[260px]"
              />
              <Input
                type="text"
                value={params.customEn || ""}
                onChange={handleCustomEnChange}
                placeholder="Введіть переклад англійською"
                className="w-[260px]"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <label className="w-48 font-medium">Категорія:</label>
            <Select value={params.mainText} onValueChange={handleMainTextChange}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Оберіть категорію" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Назва або номер маршруту */}
        {isBicycleRoute ? (
          <div className="flex items-center gap-4">
            <label className="w-48 font-medium">Номер маршруту:</label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              value={params.routeNumber || ""}
              onChange={handleRouteNumberChange}
              placeholder="Введіть цифру від 1 до 99"
              className="w-[260px]"
            />
          </div>
        ) : shouldShowNameField && (
          <div className="flex items-center gap-4">
            <label className="w-48 font-medium">Назва:</label>
            <Input
              type="text"
              value={params.subText || ""}
              onChange={(e) => setParams({ ...params, subText: e.target.value })}
              placeholder="Введіть українську назву"
              className="w-[260px]"
            />
          </div>
        )}

        {/* Додаткові позначки (іконки) */}
        <div className="pt-4">
          <p className="font-medium text-center mb-2">Додаткові позначки:</p>
          <div className="flex justify-center border rounded overflow-hidden w-fit mx-auto">
            {["veloSTO", "veloParking", "empty"].map((key) => {
              const icon = PathConfigs[key] ?? PathConfigs.veloSTO;
              return (
                <button
                  key={key}
                  type="button"
                  className="px-4 py-2 border-r last:border-r-0 bg-white hover:bg-gray-100"
                >
                  {key !== "empty" ? (
                    <svg
                      width={24}
                      height={24}
                      viewBox={`0 0 ${icon.width} ${icon.height}`}
                      className="text-gray-700 mx-auto"
                    >
                      <path d={icon.d} fill="currentColor" fillRule="evenodd" />
                    </svg>
                  ) : (
                    <div className="w-6 h-6" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
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
