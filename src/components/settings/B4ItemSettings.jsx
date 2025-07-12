
import { useEffect } from "react";
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

function B4ItemSettings({ index, label, params, setParams, isTooLong, tableType }) {
  const handleDirectionChange = (value) => {
    setParams({ ...params, direction: value });
  };

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

  const handleMainTextChange = (value) => {
    const clearSubText = value === "Центр міста" || value === "Веломаршрут";
    setParams({
      ...params,
      mainText: value,
      subText: clearSubText ? "" : params.subText,
    });
  };

  const handleRouteNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.startsWith("0")) value = value.slice(1);
    value = value.slice(0, 2);
    setParams({ ...params, routeNumber: value });
  };

  const handleUrbanCenterToggle = (e) => {
    setParams({ ...params, isUrbanCenter: e.target.checked });
  };

  const handleCustomUaChange = (e) => {
    setParams({ ...params, customUa: e.target.value });
  };
  
  const handleCustomEnChange = (e) => {
    setParams({ ...params, customEn: e.target.value });
  };
  
  const handleTemporaryRouteToggle = (e) => {
    setParams({ ...params, isTemporaryRoute: e.target.checked });
  };


  useEffect(() => {
    if (tableType === "seasonal" && params.mainText === "Національний") {
      setParams({ ...params, mainText: "Регіональний" });
    }
  }, [tableType, params.mainText]);

  const allDirections = [
    { value: "straight", label: "Прямо", icon: PathConfigs.smallArrow },
    { value: "left", label: "Ліворуч", icon: PathConfigs.smallArrow },
    { value: "right", label: "Праворуч", icon: PathConfigs.smallArrow },
    { value: "straight-left", label: "Прямо і ліворуч", icon: PathConfigs.smallArrow },
    { value: "straight-right", label: "Прямо і праворуч", icon: PathConfigs.smallArrow },
    { value: "end", label: "Кінець маршруту", icon: null },
  ];

  // ⬇️ Прибираємо "Кінець маршруту", якщо не перший елемент
  const directions = index === 0
    ? allDirections
    : allDirections.filter((d) => d.value !== "end");


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
    ? Object.keys(locationTerms[params.icon]).filter((key) => {
        if (tableType === "seasonal" && key === "Національний") return false;
        return true;
      })
    : [];

  const isBicycleRoute = params.icon === "bicycleRoute" || params.mainText === "Веломаршрут";
  const shouldShowNameField =
    !isBicycleRoute && params.icon !== "cityCentre" &&
    !["Центр міста", "Веломаршрут"].includes(params.mainText);

  return (
    <div className="bg-white border border-gray-300 p-6 shadow-md w-fit">
      <p className="text-xl font-semibold mb-6 text-center">{label}</p>

      <div className="space-y-4">
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
                      {icon ? (
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
                      ) : (
                        <span className="w-6 inline-block" />
                      )}
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
              disabled={isTooLong}
              
            />
          </div>
        )}

        {/* Тимчасовий маршрут */}
        <div className="flex items-center gap-2 ml-52">
          <input
            type="checkbox"
            id="isTemporaryRoute"
            checked={params.isTemporaryRoute || false}
            onChange={handleTemporaryRouteToggle}
          />
          <label htmlFor="isTemporaryRoute" className="text-sm">Тимчасовий маршрут</label>
        </div>


        {/* Додаткові позначки (іконки) */}
        <div className="pt-4">
        <p className="font-medium text-center mb-2">Додаткові позначки:</p>
        <div className="flex justify-center border rounded overflow-hidden w-fit mx-auto">
          {[
            { key: "showEurovelo", iconKey: "eurovelo" },
            { key: "showVeloParking", iconKey: "veloParking" },
            { key: "showVeloSTO", iconKey: "veloSTO" },
          ].map(({ key, iconKey }) => {
            const icon = PathConfigs[iconKey];
            const isActive = params[key];

            return (
              <button
                key={key}
                type="button"
                className={`px-4 py-2 border-r last:border-r-0 ${
                  isActive ? "bg-blue-100" : "bg-white hover:bg-gray-100"
                }`}
                onClick={() => {
                  const activeKeys = ["showEurovelo", "showVeloParking", "showVeloSTO"].filter(k => params[k]);
                  const isTryingToAdd = !params[key];
                  const maxAllowed = params.icon === "bicycleRoute" ? 1 : 2;

                  if (isTryingToAdd && activeKeys.length >= maxAllowed) return;

                  setParams({ ...params, [key]: !params[key] });
                }}
              >
                <svg
                  width={24}
                  height={24}
                  viewBox={`0 0 ${icon.width} ${icon.height}`}
                  className="text-gray-700 mx-auto"
                >
                  <path d={icon.d} fill="currentColor" fillRule="evenodd" />
                </svg>
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
  end: { rotation: 0 },
};

export default B4ItemSettings;