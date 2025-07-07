import { useState } from "react";

import SignSelector from "./components/SignSelector";
import SignPreview from "./components/SignPreview";
import B1B6SettingsPanel from "./components/settings/B1B6SettingsPanel";
import B4ItemSettings from "./components/settings/B4ItemSettings";

function App() {
  const [signType, setSignType] = useState("В1");

  const [params, setParams] = useState({
    tableType: "permanent",
    numberType: "national",
    routeNumber: "",
    direction: "straight",
    b4Items: [
      {
        mainText: "",
        subText: "",
        direction: "straight",
        routeNumber: "",
      },
    ],
  });

  const isB1toB3 = ["В1", "В2", "В3"].includes(signType);
  const isB4toB6 = ["В4", "В5", "В6"].includes(signType);
  const isB4 = signType === "В4";

  const enableDirection = isB1toB3 && signType !== "В2";
  const allowNoneOption = isB4toB6;

  const safeParams = {
    ...params,
    numberType: isB1toB3 && params.numberType === "none" ? "regional" : params.numberType,
  };

  const updateB4Item = (index, updatedItem) => {
    const updatedItems = [...params.b4Items];
    updatedItems[index] = updatedItem;
    setParams({ ...params, b4Items: updatedItems });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-center p-6">
      <h1 className="text-3xl font-bold mb-6">Конструктор Велосипедного маршрутного орієнтування</h1>

      <SignSelector signType={signType} setSignType={setSignType} />

      <div className="flex justify-between max-w-4xl mx-auto mb-6 p-4">
        <div className="flex justify-end w-1/2 p-2">
          <SignPreview signType={signType} params={safeParams} />
        </div>

        <div className="flex flex-col gap-4 justify-start w-1/2 p-2">
          {(isB1toB3 || isB4toB6) && (
            <B1B6SettingsPanel
              label={`Налаштування ${signType}`}
              params={safeParams}
              setParams={setParams}
              enableDirection={enableDirection}
              allowNoneOption={allowNoneOption}
            />
          )}

          {isB4 &&
            params.b4Items.map((item, index) => (
              <B4ItemSettings
                key={index}
                label={`Напрям ${index + 1}`}
                params={item}
                setParams={(newItem) => updateB4Item(index, newItem)}
              />
            ))}
        </div>
      </div>

      <button className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700">
        Експортувати знак
      </button>
    </div>
  );
}

export default App;
