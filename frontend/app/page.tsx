"use client";

import { useState, useEffect, CSSProperties } from "react";
import ConfigModal from "@/components/ConfigModal";
import HistorySidebar from "@/components/HistorySidebar";

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

export default function Home() {
  const [participants, setParticipants] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [displayedWinner, setDisplayedWinner] = useState<string>("");
  const [mode, setMode] = useState<"names" | "numbers">("names");
  const [doubleDraw, setDoubleDraw] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [removingWinner, setRemovingWinner] = useState<string | null>(null);

  // Theme State
  const [theme, setTheme] = useState<ThemeConfig>({
    app_name: "Sorteador Premium",
    primary_color: "#9333ea",
    secondary_color: "#db2777",
    effect_color: "#3b82f6",
    is_dark_mode: true,
  });
  const [backupTheme, setBackupTheme] = useState<ThemeConfig | null>(null);

  const fetchState = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/state`)
      .then((res) => res.json())
      .then((data) => {
        setParticipants(data.participants);
        setParticipants(data.participants);
        setMode(data.mode);
        if (data.config && data.config.double_draw !== undefined) {
          setDoubleDraw(data.config.double_draw);
        }
        if (data.history) setHistory(data.history);
        // Ensure we don't accidentally revert if the backend is lagging or invalid?
        // But backend should be truth.
        if (data.theme) {
          setTheme((prev) => ({
            ...prev,
            ...data.theme,
          }));
        }
      })
      .catch((err) => console.error("Failed to fetch state", err));
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleDraw = async () => {
    setIsDrawing(true);
    setWinner(null);
    setDisplayedWinner("");

    // Simulate shuffling effect
    const shuffleDuration = 3000;
    const intervalTime = 100;
    const endTime = Date.now() + shuffleDuration;

    const shuffleInterval = setInterval(() => {
      if (participants.length > 0) {
        const randomIndex = Math.floor(Math.random() * participants.length);
        setDisplayedWinner(participants[randomIndex]);
      } else {
        setDisplayedWinner("...");
      }

      if (Date.now() >= endTime) {
        clearInterval(shuffleInterval);
        fetchWinner();
      }
    }, intervalTime);
  };

  const fetchWinner = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/draw`, {
        method: "GET",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Draw failed");
      }

      const data = await res.json();
      setWinner(data.winner);
      setDisplayedWinner(data.winner);

      // Sequence: Show winner -> Animate removal (if configured) -> Update list

      // 1. Wait for celebration (2s)
      await new Promise((r) => setTimeout(r, 2000));

      // 2. Trigger exit animation
      setRemovingWinner(data.winner);

      // 3. Wait for animation to finish (500ms)
      await new Promise((r) => setTimeout(r, 600)); // slightly longer than css transition

      // 4. Update state (actually removes item if server-side repeat is off)
      // 4. Update state (actually removes item if server-side repeat is off)
      fetchState();

      // 5. Reset local animations
      setRemovingWinner(null);
    } catch (err) {
      console.error("Failed to fetch winner", err);
      // setDisplayedWinner("Erro!"); // optional: show error in UI
    } finally {
      setIsDrawing(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = { ...theme, is_dark_mode: !theme.is_dark_mode };
    setTheme(newTheme);
    // Auto-save preference
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/theme`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTheme),
    }).catch((err) => console.error("Failed to save theme preference", err));
  };

  const handleSaveConfig = async (config: Config, newTheme: ThemeConfig) => {
    try {
      // Save Config
      const resConfig = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/config`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        }
      );

      // Save Theme
      const resTheme = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/theme`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTheme),
        }
      );

      if (resConfig.ok && resTheme.ok) {
        setWinner(null);
        setDisplayedWinner("");
        fetchState();
      }
    } catch (err) {
      console.error("Failed to save settings", err);
    }
  };

  const handleRestoreParticipants = async () => {
    if (
      !confirm(
        "Deseja restaurar a lista de participantes original? O histórico será mantido."
      )
    )
      return;
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/restore-participants`,
        { method: "POST" }
      );
      fetchState();
      setWinner(null);
      setDisplayedWinner("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetHistory = async () => {
    if (
      !confirm(
        "Deseja limpar o histórico? A lista de participantes atual será mantida."
      )
    )
      return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reset-history`, {
        method: "POST",
      });
      fetchState();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors duration-500
        ${
          theme.is_dark_mode
            ? "bg-slate-900 text-white"
            : "bg-slate-100 text-slate-900"
        }`}
      style={
        {
          "--theme-primary": theme.primary_color,
          "--theme-secondary": theme.secondary_color,
          "--theme-effect": theme.effect_color,
          "--scrollbar-track": theme.is_dark_mode
            ? "rgba(30, 41, 59, 0.5)"
            : "rgba(203, 213, 225, 0.5)",
          "--scrollbar-thumb": theme.primary_color + "80", // 50% opacity
          "--scrollbar-thumb-hover": theme.primary_color,
        } as CSSProperties
      }
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 animate-pulse"
          style={{ backgroundColor: theme.primary_color }}
        ></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 animate-pulse delay-1000"
          style={{ backgroundColor: theme.secondary_color }}
        ></div>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3 w-auto max-w-full">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full border transition-all 
            ${
              theme.is_dark_mode
                ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/50"
                : "bg-white/50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white shadow-sm"
            }`}
          title={
            theme.is_dark_mode
              ? "Mudar para Modo Claro"
              : "Mudar para Modo Escuro"
          }
        >
          {theme.is_dark_mode ? (
            // Sun Icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          ) : (
            // Moon Icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          )}
        </button>

        {/* Restore Participants Button */}
        <button
          onClick={handleRestoreParticipants}
          className={`p-3 rounded-full border transition-all 
            ${
              theme.is_dark_mode
                ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/50"
                : "bg-white/50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white shadow-sm"
            }`}
          title="Restaurar Lista de Participantes"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
        </button>

        {/* Reset History Button */}
        <button
          onClick={handleResetHistory}
          className={`p-3 rounded-full border transition-all 
            ${
              theme.is_dark_mode
                ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/50"
                : "bg-white/50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white shadow-sm"
            }`}
          title="Reiniciar Histórico (Manter Lista)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
          </svg>
        </button>

        {/* Config Button */}
        <button
          onClick={() => {
            setBackupTheme(theme); // Save current theme before editing
            setIsConfigOpen(true);
          }}
          className={`p-3 rounded-full border transition-all 
            ${
              theme.is_dark_mode
                ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/50"
                : "bg-white/50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white shadow-sm"
            }`}
          title="Configurações"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>

      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => {
          setIsConfigOpen(false);
          if (backupTheme) setTheme(backupTheme); // Revert on cancel
        }}
        onSave={(config, newTheme) => {
          setBackupTheme(newTheme); // Update backup to new confirmed theme
          handleSaveConfig(config, newTheme);
          setIsConfigOpen(false); // Close explicitly on save
        }}
        onPreview={setTheme}
        currentTheme={theme}
      />

      <HistorySidebar
        history={history}
        onClear={handleResetHistory}
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
        theme={theme}
        doubleDraw={doubleDraw}
      />

      <div
        className={`z-10 w-full flex flex-col items-center gap-12 transition-all duration-300 ${
          isHistoryOpen ? "mr-80 max-w-[calc(100vw-360px)]" : "max-w-4xl"
        }`}
      >
        <h1
          className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text drop-shadow-2xl text-center"
          style={{
            backgroundImage: `linear-gradient(to right, ${theme.primary_color}, ${theme.secondary_color})`,
          }}
        >
          {theme.app_name}
        </h1>

        <div className="relative group">
          <div
            className="absolute -inset-1 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"
            style={{
              background: `linear-gradient(to right, ${theme.primary_color}, ${theme.secondary_color})`,
            }}
          ></div>
          <button
            onClick={handleDraw}
            disabled={isDrawing || participants.length === 0}
            className={`relative px-12 py-6 rounded-2xl leading-none flex items-center divide-x transition-all duration-300
              ${
                theme.is_dark_mode
                  ? "bg-slate-900 divide-slate-600 text-white"
                  : "bg-white divide-slate-200 text-slate-900 shadow-xl border border-slate-100"
              }
              ${
                isDrawing
                  ? "opacity-80 cursor-not-allowed scale-95"
                  : "hover:scale-105 active:scale-95"
              }`}
            style={{
              boxShadow: isDrawing
                ? "none"
                : `0 0 20px ${theme.effect_color}40`,
            }}
          >
            <span
              className="text-2xl font-bold bg-clip-text text-transparent uppercase tracking-widest"
              style={{
                backgroundImage: `linear-gradient(to right, ${theme.effect_color}, ${theme.secondary_color})`,
              }}
            >
              {isDrawing ? "Sorteando..." : "Realizar Sorteio"}
            </span>
          </button>
        </div>

        {/* Winner Display Area */}
        <div
          className={`transition-all duration-500 transform ${
            displayedWinner ? "scale-100 opacity-100" : "scale-90 opacity-0 h-0"
          }`}
        >
          <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
            <p
              className="text-sm font-medium mb-6 uppercase tracking-wide"
              style={{ color: theme.effect_color }}
            >
              {winner ? "O Vencedor é" : "Sorteando..."}
            </p>
            <h2
              className={`text-4xl md:text-6xl font-black h-32 flex items-center justify-center overflow-hidden px-4 ${
                winner ? "animate-bounce" : ""
              } ${theme.is_dark_mode ? "text-white" : "text-slate-900"}`}
            >
              <span className="line-clamp-2 leading-tight">
                {displayedWinner}
              </span>
            </h2>
          </div>
        </div>

        {/* Participants List */}
        <div className="w-full mt-8">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3
              className={`text-xl font-semibold ${
                theme.is_dark_mode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {mode === "names" ? "Participantes" : "Números"} (
              {participants.length})
            </h3>
            <div
              className={`h-px flex-1 ml-4 ${
                theme.is_dark_mode ? "bg-slate-800" : "bg-slate-300"
              }`}
            ></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {participants.map((name, i) => (
              <div
                key={i}
                id={`participant-${i}`}
                className={`p-3 rounded-lg text-center text-sm font-medium transition-all duration-300 border relative overflow-hidden
                  ${
                    name === winner && name !== removingWinner
                      ? "text-white z-20 ring-2 ring-white/50 animate-pulse"
                      : ""
                  }
                  ${
                    name === removingWinner
                      ? "scale-0 opacity-0 rotate-180"
                      : ""
                  }
                  ${
                    name !== winner && name !== removingWinner
                      ? theme.is_dark_mode
                        ? "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-white hover:scale-105"
                        : "bg-white/60 border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900 hover:scale-105 shadow-sm"
                      : ""
                  }`}
                style={{
                  backgroundImage:
                    name === winner && name !== removingWinner
                      ? `linear-gradient(to right, ${theme.primary_color}, ${theme.secondary_color})`
                      : undefined,
                  borderColor:
                    name === winner && name !== removingWinner
                      ? theme.primary_color
                      : undefined,
                  boxShadow:
                    name === winner && name !== removingWinner
                      ? `0 0 30px ${theme.primary_color}80`
                      : undefined,
                }}
              >
                <span className="block truncate">{name}</span>
              </div>
            ))}
          </div>
          {participants.length === 0 && (
            <div className="text-center text-slate-500 mt-4">
              Nenhum participante. Clique no ícone de engrenagem para adicionar.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
