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
    <div className="bg-white border border-gray-300 p-6 shadow-md w-fit">
    <p className="text-xl font-semibold mb-6 text-center">{label}</p>

    <div className="space-y-4">
      {/* Назва */}
      <div className="flex items-center gap-4">
        <label className="w-24 font-medium">Назва:</label>
        <div className="flex gap-2">
          <Select
            value={params.mainText}
            onValueChange={(value) => setParams({ ...params, mainText: value })}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Оберіть місце..." />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(locationTerms).map((key) => (
                <SelectItem key={key} value={key} title={key}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!isCityCenter && !isRoute && (
            <Input
              type="text"
              value={params.subText || ""}
              onChange={(e) => setParams({ ...params, subText: e.target.value })}
              placeholder="Додатковий текст..."
              className="w-36"
            />
          )}

          {isRoute && (
            <Input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              value={params.routeNumber || ""}
              onChange={(e) => setParams({ ...params, routeNumber: e.target.value })}
              disabled={params.numberType === "eurovelo"}
              placeholder="1–99"
              className="w-36"
            />
          )}
        </div>
      </div>

      {/* Напрямок */}
      <div className="flex items-center gap-4">
        <label className="w-24 font-medium">Напрямок:</label>
        <Select value={params.direction} onValueChange={handleDirectionChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
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
                      transform={`rotate(${rotation} ${icon.width / 2} ${icon.height / 2}) scale(${icon.scale})`}
                    />
                  </svg>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Іконка */}
      <div className="flex items-center gap-4">
        <label className="w-24 font-medium">Іконка:</label>
        <Select value={params.icon || ""} onValueChange={handleIconChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
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
