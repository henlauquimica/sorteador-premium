"use client";

import { useState } from "react";

// Actually I'll just define it locally to be safe and quick.

type ThemeConfig = {
  app_name: string;
  primary_color: string;
  secondary_color: string;
  effect_color: string;
  is_dark_mode: boolean;
};

interface HistorySidebarProps {
  history: string[];
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
  theme: ThemeConfig;
  doubleDraw?: boolean;
}

export default function HistorySidebar({
  history,
  onClear,
  isOpen,
  onToggle,
  theme,
  doubleDraw,
}: HistorySidebarProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Helper to group history items if DoubleDraw is active
  const renderHistoryItems = () => {
    if (history.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-slate-500">
          <span className="text-sm">Nenhum sorteio realizado</span>
        </div>
      );
    }

    let itemsToRender: React.ReactNode[] = [];

    // If double draw, we pair items: [Name, Number, Name, Number...]
    // We assume the sequence starts with Name.
    // Group (i, i+1)
    if (doubleDraw) {
      const pairs = [];
      for (let i = 0; i < history.length; i += 2) {
        const name = history[i];
        const number = history[i + 1]; // might be undefined if just drawn name
        pairs.push({ name, number, index: i });
      }

      // Reverse pairs to show newest first
      itemsToRender = pairs.reverse().map((pair, idx) => {
        // Human readable index: (Total Pairs - idx)
        const displayIndex = pairs.length - idx;

        return (
          <li
            key={pair.index}
            className={`flex flex-col p-3 rounded-lg border animate-in slide-in-from-right duration-300 ${
              theme.is_dark_mode
                ? "bg-slate-800/50 border-slate-700/50"
                : "bg-slate-100 border-slate-200"
            }`}
          >
            {/* Header: Index + Name */}
            <div className="flex items-center gap-3 mb-2">
              <span
                className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0"
                style={{
                  backgroundColor: `${theme.primary_color}20`,
                  color: theme.primary_color,
                }}
              >
                {displayIndex}
              </span>
              <span
                className={`font-medium truncate ${
                  theme.is_dark_mode ? "text-slate-200" : "text-slate-800"
                }`}
              >
                {pair.name}
              </span>
            </div>

            {/* Number Badge (if present) */}
            {pair.number && (
              <div className="flex items-center gap-2 pl-9">
                <span
                  className={`text-xs ${
                    theme.is_dark_mode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Número:
                </span>
                <span
                  className="px-2 py-0.5 rounded text-sm font-bold"
                  style={{
                    backgroundColor: theme.secondary_color + "20",
                    color: theme.secondary_color,
                  }}
                >
                  {pair.number}
                </span>
              </div>
            )}
          </li>
        );
      });
    } else {
      // Standard Rendering
      itemsToRender = history
        .slice()
        .reverse()
        .map((winner, index) => (
          <li
            key={index}
            className={`flex items-center gap-3 p-3 rounded-lg border animate-in slide-in-from-right duration-300 ${
              theme.is_dark_mode
                ? "bg-slate-800/50 border-slate-700/50"
                : "bg-slate-100 border-slate-200"
            }`}
          >
            <span
              className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
              style={{
                backgroundColor: `${theme.primary_color}20`,
                color: theme.primary_color,
              }}
            >
              {history.length - index}
            </span>
            <span
              className={`font-medium ${
                theme.is_dark_mode ? "text-slate-200" : "text-slate-800"
              }`}
            >
              {winner}
            </span>
          </li>
        ));
    }

    return <ul className="space-y-3">{itemsToRender}</ul>;
  };

  return (
    <>
      {/* Toggle Button (Fixed Right) */}
      <button
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-50 p-3 backdrop-blur-md border-l border-t border-b rounded-l-xl transition-all shadow-xl
          ${
            theme.is_dark_mode
              ? "bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700"
              : "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-50"
          }
          ${
            isOpen
              ? "translate-x-full opacity-0 pointer-events-none"
              : "translate-x-0"
          }`}
        title="Histórico de Vencedores"
      >
        <div className="flex flex-col items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20v-6M6 20V10M18 20V4" />
          </svg>
          <span
            className={`text-[10px] uppercase font-bold tracking-widest vertical-text transition-all duration-300 ${
              isHovered
                ? "h-auto opacity-100 mt-2"
                : "h-0 opacity-0 overflow-hidden"
            }`}
          >
            Histórico
          </span>
        </div>
      </button>

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] backdrop-blur-2xl border-l shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
          ${
            theme.is_dark_mode
              ? "bg-slate-900/95 border-slate-700"
              : "bg-white/95 border-slate-200"
          }
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h2
              className={`text-xl font-bold flex items-center gap-2 ${
                theme.is_dark_mode ? "text-white" : "text-slate-900"
              }`}
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
                style={{ color: theme.primary_color }}
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
              Histórico
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm("Limpar histórico?")) onClear();
                }}
                className={`p-2 rounded-lg transition-colors ${
                  theme.is_dark_mode
                    ? "text-slate-400 hover:text-red-400 hover:bg-slate-800"
                    : "text-slate-500 hover:text-red-500 hover:bg-slate-100"
                }`}
                title="Limpar Histórico"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
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
                </svg>
              </button>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {renderHistoryItems()}
          </div>
        </div>
      </div>
      {/* Overlay to close on click outside (Restored) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onToggle}
        ></div>
      )}
    </>
  );
}
