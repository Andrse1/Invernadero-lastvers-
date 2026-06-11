import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Target, LogIn, LogOut } from 'lucide-react';
import type { TodoItem } from '../types/todo';
import { THEMES, type Theme } from '../types/theme';

type Mode = 'timer' | 'stopwatch' | 'pomodoro';

interface ControlPanelProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  setTotalTimeMs: (ms: number) => void;
  isRunning: boolean;
  isCompleted: boolean;
  elapsedMs: number;
  timeLeftMs: number;
  onToggleRunning: () => void;
  activeTodo: TodoItem | null;
  theme: Theme;
  setTheme: (t: Theme) => void;
  density: number;
  setDensity: (v: number) => void;
  turbulence: number;
  setTurbulence: (v: number) => void;
  hueShift: number;
  setHueShift: (v: number) => void;
  breathSpeed: number;
  setBreathSpeed: (v: number) => void;
  isAuthenticated: boolean;
  userName: string | null;
  onLogin: () => void;
  onLogout: () => void;
}

const PRESETS: Record<string, { label: string; ms: number }[]> = {
  timer: [
    { label: '05:00', ms: 5 * 60 * 1000 },
    { label: '15:00', ms: 15 * 60 * 1000 },
    { label: '25:00', ms: 25 * 60 * 1000 },
    { label: '45:00', ms: 45 * 60 * 1000 },
  ],
  pomodoro: [
    { label: 'FOCUS 25', ms: 25 * 60 * 1000 },
    { label: 'SHORT 5', ms: 5 * 60 * 1000 },
    { label: 'LONG 15', ms: 15 * 60 * 1000 },
  ],
};

function pad2(n: number) { return String(n).padStart(2, '0'); }

export default function ControlPanel(props: ControlPanelProps) {
  const {
    mode, setMode, setTotalTimeMs, isRunning, isCompleted,
    elapsedMs, timeLeftMs,
    onToggleRunning, activeTodo,
    theme, setTheme,
    density, setDensity, turbulence, setTurbulence,
    hueShift, setHueShift, breathSpeed, setBreathSpeed,
    isAuthenticated, userName, onLogin, onLogout,
  } = props;

  const [inputMinutes, setInputMinutes] = useState('25');
  const [inputSeconds, setInputSeconds] = useState('00');
  const [shake, setShake] = useState(false);
  const prevCompleted = useRef(false);

  // Sync inputs when active todo changes
  useEffect(() => {
    if (activeTodo) {
      const totalSeconds = Math.floor(activeTodo.durationMs / 1000);
      setInputMinutes(pad2(Math.floor(totalSeconds / 60)));
      setInputSeconds(pad2(totalSeconds % 60));
    }
  }, [activeTodo]);

  useEffect(() => {
    if (isCompleted && !prevCompleted.current) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
    prevCompleted.current = isCompleted;
  }, [isCompleted]);

  const applyPreset = useCallback((ms: number) => {
    setTotalTimeMs(ms);
    const totalSeconds = Math.floor(ms / 1000);
    setInputMinutes(pad2(Math.floor(totalSeconds / 60)));
    setInputSeconds(pad2(totalSeconds % 60));
  }, [setTotalTimeMs]);

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 2) v = v.slice(0, 2);
    if (v && parseInt(v) > 99) v = '99';
    setInputMinutes(v);
  };
  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 2) v = v.slice(0, 2);
    if (v && parseInt(v) > 59) v = '59';
    setInputSeconds(v);
  };
  const handleBlur = () => {
    const m = parseInt(inputMinutes) || 0;
    const s = parseInt(inputSeconds) || 0;
    const ms = (m * 60 + s) * 1000;
    setTotalTimeMs(ms);
    setInputMinutes(pad2(m));
    setInputSeconds(pad2(s));
  };

  const handleModeChange = (m: Mode) => {
    setMode(m);
    if (m === 'stopwatch') { setInputMinutes('00'); setInputSeconds('00'); }
    else if (m === 'pomodoro') applyPreset(25 * 60 * 1000);
    else applyPreset(25 * 60 * 1000);
  };

  const modeLabels: Record<Mode, string> = {
    timer: 'TIMER', stopwatch: 'STOPWATCH', pomodoro: 'POMODORO',
  };

  const displayMs = mode === 'stopwatch' ? elapsedMs : timeLeftMs;
  const mins = pad2(Math.floor(displayMs / 60000));
  const secs = pad2(Math.floor((displayMs % 60000) / 1000));
  const ms2 = pad2(Math.floor((displayMs % 1000) / 10));
  const presets = mode === 'pomodoro' ? PRESETS.pomodoro : PRESETS.timer;

  return (
    <div className="h-full flex flex-col bg-[var(--panel-dark)] text-white">
      {/* ====== TITLE ROW ====== */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight leading-[0.95]">
              CHRONOS
            </h1>
            <p className="text-[10px] font-semibold text-[var(--panel-light)] tracking-[0.2em] mt-1.5">
              TIME &amp; TASK MANAGEMENT
            </p>
          </div>
          {/* Theme picker */}
          <div className="flex gap-1 mt-1">
            {THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t)}
                title={t.name}
                className={`w-5 h-5 transition-all ${
                  theme.name === t.name ? 'scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: t.color1 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hair line */}
      <div className="h-px bg-[var(--panel-mid)]" />

      {/* ====== MODE SWITCHER ====== */}
      <div className="px-5 py-3 flex gap-1">
        {(['timer', 'stopwatch', 'pomodoro'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`px-3 py-1.5 text-[9px] font-bold tracking-[0.15em] border transition-colors ${
              mode === m
                ? 'border-white bg-white text-[var(--panel-dark)]'
                : 'border-[var(--panel-mid)] text-[var(--panel-light)] hover:border-[var(--accent)] hover:text-white'
            }`}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      <div className="h-px bg-[var(--panel-mid)]" />

      {/* ====== TIME DISPLAY ====== */}
      <div className={`px-5 py-4 ${shake ? 'shake-animation' : ''}`}>
        <div className="mb-1">
          <span className="text-[9px] font-bold text-[var(--panel-light)] tracking-[0.2em]">
            {isCompleted ? 'COMPLETE' : isRunning ? 'ACTIVE' : 'STANDBY'}
          </span>
        </div>

        {/* Active todo label */}
        {activeTodo && (
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={10} className="text-[var(--accent-soft)] shrink-0" />
            <span className={`text-[10px] font-semibold truncate ${activeTodo.completedAt ? 'line-through text-[var(--text-muted)]' : 'text-[var(--accent-soft)]'}`}>
              {activeTodo.title}
            </span>
          </div>
        )}

        {/* Big time */}
        <div className="flex items-baseline justify-center gap-0">
          {mode === 'stopwatch' && isRunning ? (
            <span className="text-5xl font-black tabular-nums tracking-tighter">
              {mins}:{secs}<span className="text-2xl font-medium text-[var(--accent)]">.{ms2}</span>
            </span>
          ) : (
            <>
              <input
                type="text"
                value={isRunning ? mins : inputMinutes}
                onChange={handleMinutesChange}
                onBlur={handleBlur}
                disabled={isRunning}
                className="w-[76px] text-center text-5xl font-black tabular-nums bg-transparent border-none outline-none tracking-tighter disabled:cursor-default"
                placeholder="00"
              />
              <span className="text-3xl font-light text-[var(--panel-mid)] -translate-y-1">:</span>
              <input
                type="text"
                value={isRunning ? secs : inputSeconds}
                onChange={handleSecondsChange}
                onBlur={handleBlur}
                disabled={isRunning}
                className="w-[76px] text-center text-5xl font-black tabular-nums bg-transparent border-none outline-none tracking-tighter disabled:cursor-default"
                placeholder="00"
              />
            </>
          )}
        </div>

        {/* Presets */}
        {mode !== 'stopwatch' && (
          <div className="flex gap-1.5 mt-2 justify-center">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => { if (!isRunning) applyPreset(p.ms); }}
                disabled={isRunning}
                className={`px-2 py-0.5 text-[9px] font-bold tracking-wider border transition-colors ${
                  isRunning
                    ? 'border-[var(--panel-mid)] text-[var(--panel-mid)] cursor-not-allowed'
                    : 'border-[var(--accent)] text-[var(--accent-soft)] hover:border-white hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-[var(--panel-mid)]" />

      {/* ====== PARAMETERS 2x2 GRID ====== */}
      <div className="grid grid-cols-2">
        {/* Density */}
        <div className="border-r border-b border-[var(--panel-mid)] p-4">
          <p className="text-[9px] font-bold text-[var(--panel-light)] tracking-[0.2em] mb-1">
            FLUID DENSITY
          </p>
          <p className="text-3xl font-black tabular-nums mb-3">
            {(density / 2.5 * 100).toFixed(1)}<span className="text-lg font-medium text-[var(--accent)]">%</span>
          </p>
          <input
            type="range" min="0.2" max="2.5" step="0.05" value={density}
            onChange={(e) => setDensity(parseFloat(e.target.value))}
            className="control-slider"
          />
        </div>

        {/* Turbulence */}
        <div className="border-b border-[var(--panel-mid)] p-4">
          <p className="text-[9px] font-bold text-[var(--panel-light)] tracking-[0.2em] mb-1">
            TURBULENCE
          </p>
          <p className="text-3xl font-black tabular-nums mb-3">
            +{turbulence.toFixed(2)}<span className="text-lg font-medium text-[var(--accent)]">°</span>
          </p>
          <input
            type="range" min="0" max="1.5" step="0.05" value={turbulence}
            onChange={(e) => setTurbulence(parseFloat(e.target.value))}
            className="control-slider"
          />
        </div>

        {/* Hue */}
        <div className="border-r border-b border-[var(--panel-mid)] p-4">
          <p className="text-[9px] font-bold text-[var(--panel-light)] tracking-[0.2em] mb-1">
            HUE SHIFT
          </p>
          <p className="text-3xl font-black tabular-nums mb-3">
            {(hueShift * 360).toFixed(0)}<span className="text-lg font-medium text-[var(--accent)]">°</span>
          </p>
          <input
            type="range" min="0" max="1" step="0.01" value={hueShift}
            onChange={(e) => setHueShift(parseFloat(e.target.value))}
            className="control-slider"
          />
        </div>

        {/* Breath */}
        <div className="border-b border-[var(--panel-mid)] p-4">
          <p className="text-[9px] font-bold text-[var(--panel-light)] tracking-[0.2em] mb-1">
            BREATH RATE
          </p>
          <p className="text-3xl font-black tabular-nums mb-3">
            {breathSpeed.toFixed(1)}<span className="text-lg font-medium text-[var(--accent)]">x</span>
          </p>
          <input
            type="range" min="0.3" max="2.5" step="0.1" value={breathSpeed}
            onChange={(e) => setBreathSpeed(parseFloat(e.target.value))}
            className="control-slider"
          />
        </div>
      </div>

      {/* Hair line */}
      <div className="h-px bg-[var(--panel-mid)]" />

      {/* ====== ACTION ROW ====== */}
      <div className="px-4 py-3">
        <button
          onClick={onToggleRunning}
          className="w-full h-11 border border-white flex items-center justify-center gap-2 transition-all hover:bg-white hover:text-[var(--panel-dark)]"
        >
          {isRunning ? (
            <>
              <Pause size={15} strokeWidth={2.5} />
              <span className="text-[10px] font-black tracking-[0.2em]">PAUSE</span>
            </>
          ) : (
            <>
              <Play size={15} strokeWidth={2.5} className="ml-0.5" />
              <span className="text-[10px] font-black tracking-[0.2em]">START</span>
            </>
          )}
        </button>
      </div>

      {/* ====== BOTTOM STATUS BAR ====== */}
      <div className="mt-auto">
        <div className="h-px bg-[var(--panel-mid)]" />
        <div className="px-4 flex items-center justify-between h-[46px]">
          <span className="text-[11px] font-bold text-[var(--panel-light)] tracking-[0.15em]">SYS // 60 FPS</span>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-[var(--panel-light)] truncate max-w-[120px]">{userName || 'User'}</span>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--panel-light)] hover:text-white transition-colors tracking-[0.1em]"
              >
                <LogOut size={12} />
                <span>SIGN OUT</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--accent)] hover:text-white transition-colors tracking-[0.1em]"
            >
              <LogIn size={12} />
              <span>SIGN IN</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
