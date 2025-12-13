"use client";

import { useState, useEffect } from "react";

type Config = {
  mode: "names" | "numbers";
  participants: string[];
  min_number: number;
  max_number: number;
  allow_repeat: boolean;
};

type ThemeConfig = {
  app_name: string;
  primary_color: string;
  secondary_color: string;
  effect_color: string;
  is_dark_mode: boolean;
};

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Config, theme: ThemeConfig) => void;
  onPreview?: (theme: ThemeConfig) => void;
  currentConfig?: Config;
  currentTheme?: ThemeConfig;
}

export default function ConfigModal({
  isOpen,
  onClose,
  onSave,
  onPreview,
  currentConfig,
  currentTheme,
}: ConfigModalProps) {
  const [activeTab, setActiveTab] = useState<"names" | "numbers" | "theme">(
    "names"
  );
  const [namesText, setNamesText] = useState("");
  const [minNum, setMinNum] = useState(1);
  const [maxNum, setMaxNum] = useState(100);
  const [allowRepeat, setAllowRepeat] = useState(false);

  // Theme State default values if not provided
  const [appName, setAppName] = useState(
    currentTheme?.app_name || "Sorteador Premium"
  );
  const [primaryColor, setPrimaryColor] = useState(
    currentTheme?.primary_color || "#9333ea"
  );
  const [secondaryColor, setSecondaryColor] = useState(
    currentTheme?.secondary_color || "#db2777"
  );
  const [effectColor, setEffectColor] = useState(
    currentTheme?.effect_color || "#3b82f6"
  );
  const [isDarkMode, setIsDarkMode] = useState(
    currentTheme?.is_dark_mode !== undefined ? currentTheme.is_dark_mode : true
  );

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen && currentTheme) {
      setIsDarkMode(currentTheme.is_dark_mode);
      setAppName(currentTheme.app_name);
      setPrimaryColor(currentTheme.primary_color);
      setSecondaryColor(currentTheme.secondary_color);
      setEffectColor(currentTheme.effect_color);
    }
  }, [isOpen]); // Only run on open, not when currentTheme changes (avoids loop with preview)

  // Live Preview Effect
  useEffect(() => {
    if (onPreview && isOpen) {
      onPreview({
        app_name: appName,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        effect_color: effectColor,
        is_dark_mode: isDarkMode,
      });
    }
  }, [
    appName,
    primaryColor,
    secondaryColor,
    effectColor,
    isDarkMode,
    onPreview,
    isOpen,
  ]);

  if (!isOpen) return null;

  const handleTabChange = (tab: "names" | "numbers" | "theme") => {
    setActiveTab(tab);
  };

  const handleSave = () => {
    let participants: string[] = [];
    // Only update participants if we are in "names" mode
    if (activeTab === "names") {
      participants = namesText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Prepare config object. If activeTab is 'theme', we shouldn't change the game mode
    // strictly speaking unless we track 'gameMode' separately.
    // For now, let's assume if we are editing theme, we don't change mode,
    // OR we default to "names" if on theme tab?
    // Better: We should probably track 'activeGameMode' and 'activeTab' separately.
    // But given the constraints, let's just assume if activeTab is 'theme', we keep the current config mode?
    // However, the `Config` type requires 'mode'.
    // Let's pass the current props config mode if local activeTab is 'theme'.

    // Simplification for this fix: If activeTab is theme, assume "names" or keep previous?
    // Let's rely on a derived mode.
    const modeToSave =
      activeTab === "theme" ? currentConfig?.mode || "names" : activeTab;

    onSave(
      {
        mode: modeToSave,
        participants:
          activeTab === "names"
            ? participants
            : currentConfig?.participants || [],
        min_number: minNum,
        max_number: maxNum,
        allow_repeat: allowRepeat,
      },
      {
        app_name: appName,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        effect_color: effectColor,
        is_dark_mode: isDarkMode,
      }
    );

    // Don't close here, let parent handle it to avoid revert race condition
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border
          ${
            isDarkMode
              ? "bg-slate-900 border-slate-700"
              : "bg-white border-slate-200"
          }
        `}
      >
        <div className="p-6">
          <h2
            className={`text-2xl font-bold mb-6 ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Configurações do Sorteio
          </h2>

          {/* Tabs */}
          <div
            className={`flex rounded-lg p-1 mb-6 ${
              isDarkMode ? "bg-slate-800" : "bg-slate-100"
            }`}
          >
            {["names", "numbers", "theme"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab as any)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab
                    ? "text-white shadow-lg"
                    : isDarkMode
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                style={{
                  backgroundColor:
                    activeTab === tab ? primaryColor : "transparent",
                }}
              >
                {tab === "names"
                  ? "Nomes"
                  : tab === "numbers"
                  ? "Números"
                  : "Personalizar"}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-4">
            {activeTab === "theme" ? (
              <div className="space-y-4">
                <div
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    isDarkMode
                      ? "bg-slate-800 border-slate-700"
                      : "bg-slate-100 border-slate-200"
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Modo Escuro
                  </span>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      !isDarkMode ? "bg-slate-400" : ""
                    }`}
                    style={{
                      backgroundColor: isDarkMode ? primaryColor : undefined,
                    }}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDarkMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Nome do Sorteio
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className={`w-full rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 border
                      ${
                        isDarkMode
                          ? "bg-slate-800 border-slate-700 text-white"
                          : "bg-slate-100 border-slate-200 text-slate-900"
                      }`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label
                      className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Cor Primária
                    </label>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Cor Secundária
                    </label>
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Cor Efeitos
                    </label>
                    <input
                      type="color"
                      value={effectColor}
                      onChange={(e) => setEffectColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ) : activeTab === "names" ? (
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Lista de Participantes (nomes separados por linha ou vírgula)
                </label>
                <div className="relative">
                  <textarea
                    value={namesText}
                    onChange={(e) => setNamesText(e.target.value)}
                    placeholder="Alice&#10;Bob&#10;Charlie"
                    className={`w-full h-40 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none custom-scrollbar border
                      ${
                        isDarkMode
                          ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                          : "bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400"
                      }`}
                  />
                  <div className="absolute right-2 bottom-2 text-xs text-slate-500">
                    {namesText.split(/[\n,]+/).filter(Boolean).length} / 300
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Mínimo
                  </label>
                  <input
                    type="number"
                    value={minNum}
                    onChange={(e) => setMinNum(Number(e.target.value))}
                    className={`w-full rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 border
                      ${
                        isDarkMode
                          ? "bg-slate-800 border-slate-700 text-white"
                          : "bg-slate-100 border-slate-200 text-slate-900"
                      }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Máximo
                  </label>
                  <input
                    type="number"
                    value={maxNum}
                    onChange={(e) => setMaxNum(Number(e.target.value))}
                    className={`w-full rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 border
                      ${
                        isDarkMode
                          ? "bg-slate-800 border-slate-700 text-white"
                          : "bg-slate-100 border-slate-200 text-slate-900"
                      }`}
                  />
                </div>
              </div>
            )}

            {/* Repeat Toggle */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl border ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Permitir Repetição?
                </span>
                <span
                  className={`text-xs ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Se ativo, o ganhador continua na lista
                </span>
              </div>
              <button
                onClick={() => setAllowRepeat(!allowRepeat)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  !allowRepeat ? "bg-slate-400" : ""
                }`}
                style={{
                  backgroundColor: allowRepeat ? primaryColor : undefined,
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowRepeat ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-6 border-t flex justify-end gap-3 ${
            isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-slate-50 border-slate-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 transition-colors ${
              isDarkMode
                ? "text-slate-300 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity shadow-lg"
            style={{
              backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
              boxShadow: `0 10px 15px -3px ${primaryColor}40`,
            }}
          >
            Salvar Configuração
          </button>
        </div>
      </div>
    </div>
  );
}
