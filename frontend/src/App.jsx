import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CircleGauge,
  Clock3,
  Cpu,
  Database,
  Gauge,
  History,
  Home,
  Info,
  Layers3,
  Menu,
  Moon,
  RefreshCw,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = "https://airsense-r0qe.onrender.com";

const defaultInputs = {
  sensor1: 1100,
  benzene: 8.2,
  sensor2: 950,
  nox: 140,
  sensor3: 900,
  no2: 95,
  sensor4: 1400,
  sensor5: 1050,
  temperature: 18.5,
  humidity: 55,
  absoluteHumidity: 1.2,
  hour: 14,
};

const inputFields = [
  {
    key: "sensor1",
    label: "CO Sensor",
    shortLabel: "PT08.S1",
    unit: "sensor",
  },
  {
    key: "benzene",
    label: "Benzene",
    shortLabel: "C6H6",
    unit: "mg/m³",
  },
  {
    key: "sensor2",
    label: "NMHC Sensor",
    shortLabel: "PT08.S2",
    unit: "sensor",
  },
  {
    key: "nox",
    label: "NOx",
    shortLabel: "NOx",
    unit: "ppb",
  },
  {
    key: "sensor3",
    label: "NOx Sensor",
    shortLabel: "PT08.S3",
    unit: "sensor",
  },
  {
    key: "no2",
    label: "NO₂",
    shortLabel: "NO₂",
    unit: "µg/m³",
  },
  {
    key: "sensor4",
    label: "NO₂ Sensor",
    shortLabel: "PT08.S4",
    unit: "sensor",
  },
  {
    key: "sensor5",
    label: "O₃ Sensor",
    shortLabel: "PT08.S5",
    unit: "sensor",
  },
  {
    key: "temperature",
    label: "Temperature",
    shortLabel: "T",
    unit: "°C",
  },
  {
    key: "humidity",
    label: "Humidity",
    shortLabel: "RH",
    unit: "%",
  },
  {
    key: "absoluteHumidity",
    label: "Absolute Humidity",
    shortLabel: "AH",
    unit: "AH",
  },
  {
    key: "hour",
    label: "Hour",
    shortLabel: "Hour",
    unit: "0–23",
  },
];

const chartData = [
  { hour: "00", value: 1.2 },
  { hour: "02", value: 1.1 },
  { hour: "04", value: 0.9 },
  { hour: "06", value: 1.4 },
  { hour: "08", value: 2.1 },
  { hour: "10", value: 2.7 },
  { hour: "12", value: 2.4 },
  { hour: "14", value: 2.9 },
  { hour: "16", value: 2.6 },
  { hour: "18", value: 3.1 },
  { hour: "20", value: 2.4 },
  { hour: "22", value: 1.8 },
];

function getAirLevel(value) {
  if (value < 1.5) {
    return {
      label: "Low",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    };
  }

  if (value < 3) {
    return {
      label: "Moderate",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    };
  }

  return {
    label: "High",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  };
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function SectionTitle({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-500">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helper, accent = "cyan" }) {
  const accents = {
    cyan: "bg-cyan-500/10 text-cyan-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    violet: "bg-violet-500/10 text-violet-500",
    amber: "bg-amber-500/10 text-amber-500",
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${accents[accent]}`}
        >
          <Icon size={19} />
        </div>
        <Activity size={16} className="text-slate-300 dark:text-slate-700" />
      </div>

      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{helper}</p>
    </div>
  );
}

function EmptyHistory() {
  return (
    <div className="flex min-h-[230px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 text-center dark:border-slate-700">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <History size={22} />
      </div>
      <h3 className="mt-4 font-semibold">No predictions yet</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Run a prediction from the Predict page and your recent results will
        appear here automatically.
      </p>
    </div>
  );
}

function HistoryList({ history, onClear }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div>
          <h3 className="font-semibold">Recent Predictions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your latest model results
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-500"
          >
            <Trash2 size={14} />
            Clear
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {history.length === 0 ? (
          <div className="p-5">
            <EmptyHistory />
          </div>
        ) : (
          history.slice(0, 6).map((item) => {
            const level = getAirLevel(item.prediction);

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${level.bg} ${level.color}`}
                  >
                    <Gauge size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium">
                      {Number(item.prediction).toFixed(2)} mg/m³
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(item.timestamp)} · {formatTime(item.timestamp)}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${level.bg} ${level.border} ${level.color}`}
                >
                  {level.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Sidebar({
  activePage,
  setActivePage,
  mobileOpen,
  setMobileOpen,
}) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "predict", label: "Predict", icon: CircleGauge },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "model", label: "Model", icon: BrainCircuit },
  ];

  const bottomItems = [
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleNavigate = (page) => {
    setActivePage(page);
    setMobileOpen(false);
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => handleNavigate("dashboard")}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/20">
              <WindIcon />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight">AirSense</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                Intelligence
              </p>
            </div>
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-10">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Workspace
          </p>

          <nav className="mt-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto">
          <nav className="space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-5 rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 p-4">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-cyan-500" />
              <span className="text-xs font-semibold">AirSense AI</span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Neural air-quality prediction powered by your trained model.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

function WindIcon() {
  return (
    <div className="relative h-5 w-5">
      <div className="absolute left-0 top-1 h-1 w-5 rounded-full bg-white" />
      <div className="absolute left-2 top-3 h-1 w-3 rounded-full bg-white/80" />
      <div className="absolute left-1 top-5 h-1 w-4 rounded-full bg-white/60" />
    </div>
  );
}

function Topbar({
  activePage,
  setMobileOpen,
  darkMode,
  setDarkMode,
}) {
  const titles = {
    dashboard: "Dashboard",
    predict: "Prediction Studio",
    analytics: "Analytics",
    model: "Model Intelligence",
    settings: "Settings",
  };

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-lg font-bold tracking-tight">
            {titles[activePage]}
          </h1>
          <p className="hidden text-xs text-slate-400 sm:block">
            Air-quality intelligence workspace
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          System online
        </div>

        <button className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-900">
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-500" />
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-900"
          title="Toggle theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}

function DashboardPage({
  predictionHistory,
  setActivePage,
  onClearHistory,
}) {
  const latestPrediction = predictionHistory[0]?.prediction ?? null;

  const historyChartData = useMemo(() => {
    return [...predictionHistory]
      .reverse()
      .map((item, index) => ({
        label:
          predictionHistory.length <= 8
            ? formatTime(item.timestamp)
            : `#${index + 1}`,
        value: Number(item.prediction),
      }));
  }, [predictionHistory]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl shadow-slate-950/10 sm:p-9">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-cyan-300">
            <Sparkles size={13} />
            Neural air-quality intelligence
          </div>

          <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Understand the air.
            <br />
            <span className="text-cyan-300">Predict what comes next.</span>
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
            AirSense turns environmental sensor readings into a machine-learning
            prediction for carbon monoxide concentration.
          </p>

          <button
            onClick={() => setActivePage("predict")}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50"
          >
            Run a prediction
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Gauge}
          label="Latest CO estimate"
          value={
            latestPrediction !== null
              ? `${Number(latestPrediction).toFixed(2)}`
              : "—"
          }
          helper={
            latestPrediction !== null ? "mg/m³ · latest prediction" : "No prediction yet"
          }
          accent="cyan"
        />

        <StatCard
          icon={Activity}
          label="Model MAE"
          value="0.4101"
          helper="Validation error"
          accent="emerald"
        />

        <StatCard
          icon={Layers3}
          label="Neural layers"
          value="3"
          helper="16 → 8 → 1 neurons"
          accent="violet"
        />

        <StatCard
          icon={Database}
          label="Features analyzed"
          value="24"
          helper="12 values + 12 indicators"
          accent="amber"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <SectionTitle
            eyebrow="Prediction history"
            title="Recent model output"
            description="Actual predictions generated by your trained model."
            action={
              <button
                onClick={() => setActivePage("predict")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400"
              >
                New prediction
                <ChevronRight size={14} />
              </button>
            }
          />

          {historyChartData.length > 0 ? (
            <div className="h-[270px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyChartData}>
                  <defs>
                    <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                  />

                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    className="fill-slate-400"
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    className="fill-slate-400"
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid rgba(148,163,184,0.2)",
                      background: "rgba(15,23,42,0.95)",
                      color: "white",
                    }}
                    formatter={(value) => [
                      `${Number(value).toFixed(2)} mg/m³`,
                      "Prediction",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fill="url(#predictionGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyHistory />
          )}
        </div>

        <HistoryList history={predictionHistory} onClear={onClearHistory} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
            <BrainCircuit size={19} />
          </div>
          <h3 className="mt-5 font-semibold">Trained neural network</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            A compact feed-forward network designed for the environmental sensor
            feature set.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <Zap size={19} />
          </div>
          <h3 className="mt-5 font-semibold">Fast predictions</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Your React interface communicates directly with the FastAPI model
            service for live inference.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
            <ShieldCheck size={19} />
          </div>
          <h3 className="mt-5 font-semibold">Missing-data aware</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            The backend preserves missing-feature indicators when sensor values
            are unavailable.
          </p>
        </div>
      </div>
    </div>
  );
}

function PredictPage({
  inputs,
  setInputs,
  prediction,
  loading,
  error,
  onPredict,
  onReset,
  predictionHistory,
  onClearHistory,
}) {
  const level = prediction !== null ? getAirLevel(prediction) : null;

  const updateInput = (key, value) => {
    setInputs((previous) => ({
      ...previous,
      [key]: value === "" ? "" : Number(value),
    }));
  };

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Live inference"
        title="Prediction Studio"
        description="Enter environmental sensor readings and send them to the trained AirQualityNet model."
        action={
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw size={14} />
            Reset inputs
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
              <Activity size={19} />
            </div>

            <div>
              <h3 className="font-semibold">Sensor inputs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                12 visible model features
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inputFields.map((field) => (
              <label key={field.key} className="block">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {field.label}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    {field.unit}
                  </span>
                </div>

                <input
                  type="number"
                  step="any"
                  value={inputs[field.key]}
                  onChange={(event) =>
                    updateInput(field.key, event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-900"
                />

                <p className="mt-1.5 text-[10px] text-slate-400">
                  {field.shortLabel}
                </p>
              </label>
            ))}
          </div>

          <button
            onClick={onPredict}
            disabled={loading}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
          >
            {loading ? (
              <>
                <RefreshCw size={17} className="animate-spin" />
                Running neural network...
              </>
            ) : (
              <>
                <Zap size={17} />
                Generate prediction
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-500">
                Model output
              </p>
            </div>

            <div className="p-6">
              {prediction !== null ? (
                <>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Predicted CO concentration
                  </p>

                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-5xl font-bold tracking-tight">
                      {Number(prediction).toFixed(2)}
                    </span>
                    <span className="mb-1.5 text-sm text-slate-400">
                      mg/m³
                    </span>
                  </div>

                  <div
                    className={`mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${level.bg} ${level.border} ${level.color}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {level.label} band
                  </div>

                  <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    This label is an application-defined interpretation band,
                    not an official AQI classification.
                  </p>
                </>
              ) : (
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <Gauge size={25} />
                  </div>
                  <h3 className="mt-4 font-semibold">Awaiting prediction</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Run the model to see the predicted concentration.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Cpu size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold">AirQualityNet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  24 → 16 → 8 → 1
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HistoryList history={predictionHistory} onClear={onClearHistory} />
    </div>
  );
}

function AnalyticsPage({ predictionHistory }) {
  const evaluationData = [
    {
      name: "Baseline",
      mae: 1.1345,
      rmse: 1.4762,
    },
    {
      name: "Neural Network",
      mae: 0.4101,
      rmse: 0.61,
    },
    {
      name: "Final",
      mae: 0.586,
      rmse: 0.7666,
    },
    {
      name: "Time-based",
      mae: 0.7471,
      rmse: 0.9672,
    },
    {
      name: "Missing indicators",
      mae: 0.4794,
      rmse: 0.6736,
    },
  ];

  const baselineMae = 1.1345;
  const baselineRmse = 1.4762;
  const neuralNetworkMae = 0.4101;
  const neuralNetworkRmse = 0.61;

  const maeReduction =
    ((baselineMae - neuralNetworkMae) / baselineMae) * 100;

  const rmseReduction =
    ((baselineRmse - neuralNetworkRmse) / baselineRmse) * 100;

  const averagePrediction =
    predictionHistory.length > 0
      ? predictionHistory.reduce(
          (sum, item) => sum + Number(item.prediction),
          0
        ) / predictionHistory.length
      : null;

  const highestPrediction =
    predictionHistory.length > 0
      ? Math.max(
          ...predictionHistory.map((item) => Number(item.prediction))
        )
      : null;

  const lowestPrediction =
    predictionHistory.length > 0
      ? Math.min(
          ...predictionHistory.map((item) => Number(item.prediction))
        )
      : null;

  const historyData = [...predictionHistory]
    .reverse()
    .map((item, index) => ({
      index: index + 1,
      prediction: Number(item.prediction),
    }));

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Model analytics"
        title="Evaluation & Prediction Analytics"
        description="Review recorded model performance alongside predictions generated from the dashboard."
      />

      {/* Evaluation overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BarChart3}
          label="Baseline MAE"
          value={baselineMae.toFixed(4)}
          helper="Mean absolute error"
          accent="cyan"
        />

        <StatCard
          icon={BrainCircuit}
          label="NN MAE"
          value={neuralNetworkMae.toFixed(4)}
          helper="Mean absolute error"
          accent="emerald"
        />

        <StatCard
          icon={Gauge}
          label="Baseline RMSE"
          value={baselineRmse.toFixed(4)}
          helper="Root mean squared error"
          accent="violet"
        />

        <StatCard
          icon={Activity}
          label="NN RMSE"
          value={neuralNetworkRmse.toFixed(4)}
          helper="Root mean squared error"
          accent="cyan"
        />
      </div>

      {/* Model performance chart */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <SectionTitle
          eyebrow="Recorded evaluation"
          title="Model Error Comparison"
          description="Lower MAE and RMSE indicate smaller prediction errors on the evaluated data."
        />

        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={evaluationData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 10,
              }}
            >
              <defs>
                <linearGradient
                  id="maeGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#06b6d4"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="#06b6d4"
                    stopOpacity={0}
                  />
                </linearGradient>

                <linearGradient
                  id="rmseGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#8b5cf6"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="100%"
                    stopColor="#8b5cf6"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
              />

              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                className="fill-slate-400"
                interval={0}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                className="fill-slate-400"
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(148,163,184,0.2)",
                  background: "rgba(15,23,42,0.95)",
                  color: "white",
                }}
                formatter={(value, name) => [
                  Number(value).toFixed(4),
                  name === "mae" ? "MAE" : "RMSE",
                ]}
              />

              <Area
                type="monotone"
                dataKey="mae"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fill="url(#maeGradient)"
              />

              <Area
                type="monotone"
                dataKey="rmse"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fill="url(#rmseGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap gap-5 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
            <span className="text-slate-600 dark:text-slate-300">
              MAE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
            <span className="text-slate-600 dark:text-slate-300">
              RMSE
            </span>
          </div>
        </div>
      </div>

      {/* Evaluation details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-500">
                Baseline comparison
              </p>

              <h3 className="mt-2 text-lg font-semibold">
                Error reduction
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Relative reduction of the recorded neural-network error
                compared with the baseline evaluation.
              </p>
            </div>

            <CheckCircle2
              size={22}
              className="shrink-0 text-emerald-500"
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                MAE reduction
              </p>

              <p className="mt-1 text-2xl font-bold">
                {maeReduction.toFixed(2)}%
              </p>

              <p className="mt-1 text-xs text-slate-400">
                1.1345 → 0.4101
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                RMSE reduction
              </p>

              <p className="mt-1 text-2xl font-bold">
                {rmseReduction.toFixed(2)}%
              </p>

              <p className="mt-1 text-xs text-slate-400">
                1.4762 → 0.6100
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <Database
              size={21}
              className="mt-0.5 text-violet-500"
            />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
                Dataset context
              </p>

              <h3 className="mt-2 text-lg font-semibold">
                Target distribution
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Summary statistics recorded from the CO target used during
                model development.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs text-slate-400">Samples</p>
              <p className="mt-1 text-xl font-bold">9,357</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs text-slate-400">Mean</p>
              <p className="mt-1 text-xl font-bold">2.1306</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs text-slate-400">Median</p>
              <p className="mt-1 text-xl font-bold">1.8000</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs text-slate-400">Std. deviation</p>
              <p className="mt-1 text-xl font-bold">1.4317</p>
            </div>

            <div className="col-span-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-xs text-slate-400">Observed range</p>
              <p className="mt-1 text-xl font-bold">
                0.1 — 11.9
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <SectionTitle
          eyebrow="Evaluation runs"
          title="Recorded Metrics"
          description="The values below come from the project's saved evaluation results."
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-3 py-3 font-semibold text-slate-500">
                  Evaluation
                </th>

                <th className="px-3 py-3 font-semibold text-slate-500">
                  MAE
                </th>

                <th className="px-3 py-3 font-semibold text-slate-500">
                  RMSE
                </th>

                <th className="px-3 py-3 font-semibold text-slate-500">
                  Description
                </th>
              </tr>
            </thead>

            <tbody>
              {evaluationData.map((item) => (
                <tr
                  key={item.name}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800/70"
                >
                  <td className="px-3 py-4 font-medium">
                    {item.name}
                  </td>

                  <td className="px-3 py-4 font-mono text-slate-600 dark:text-slate-300">
                    {item.mae.toFixed(4)}
                  </td>

                  <td className="px-3 py-4 font-mono text-slate-600 dark:text-slate-300">
                    {item.rmse.toFixed(4)}
                  </td>

                  <td className="px-3 py-4 text-slate-500 dark:text-slate-400">
                    {item.name === "Baseline"
                      ? "Reference model"
                      : item.name === "Neural Network"
                        ? "Neural network evaluation"
                        : item.name === "Final"
                          ? "Final recorded evaluation"
                          : item.name === "Time-based"
                            ? "Time-based evaluation"
                            : "Evaluation with missing-feature indicators"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Browser prediction history */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <SectionTitle
          eyebrow="Live session history"
          title="Your Prediction Activity"
          description="These values are predictions generated through the dashboard and stored locally in your browser."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={History}
            label="Predictions"
            value={predictionHistory.length}
            helper="Stored locally"
            accent="cyan"
          />

          <StatCard
            icon={BarChart3}
            label="Average"
            value={
              averagePrediction !== null
                ? averagePrediction.toFixed(2)
                : "—"
            }
            helper="mg/m³"
            accent="emerald"
          />

          <StatCard
            icon={Gauge}
            label="Observed range"
            value={
              lowestPrediction !== null
                ? `${lowestPrediction.toFixed(2)}–${highestPrediction.toFixed(2)}`
                : "—"
            }
            helper="Lowest to highest"
            accent="violet"
          />
        </div>

        <div className="mt-6">
          {historyData.length > 0 ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient
                      id="historyGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#10b981"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="#10b981"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                  />

                  <XAxis
                    dataKey="index"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    className="fill-slate-400"
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    className="fill-slate-400"
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid rgba(148,163,184,0.2)",
                      background: "rgba(15,23,42,0.95)",
                      color: "white",
                    }}
                    formatter={(value) => [
                      `${Number(value).toFixed(2)} mg/m³`,
                      "Prediction",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="prediction"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#historyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyHistory />
          )}
        </div>
      </div>

      {/* Explanation */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <Info
            className="mt-0.5 shrink-0 text-slate-400"
            size={18}
          />

          <div>
            <h3 className="font-semibold">
              How to interpret this page
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              The upper sections describe recorded model evaluation results
              from the project. The final section describes predictions you
              have generated through the web application. These are separate
              sources of information: evaluation metrics measure model error,
              while prediction history shows individual outputs from your
              current browser session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelPage() {
  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Model intelligence"
        title="Inside AirQualityNet"
        description="A compact feed-forward neural network trained for carbon monoxide prediction."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Database}
          label="Input features"
          value="24"
          helper="12 original + 12 missing indicators"
          accent="cyan"
        />

        <StatCard
          icon={Layers3}
          label="Hidden layer 1"
          value="16"
          helper="ReLU activation"
          accent="violet"
        />

        <StatCard
          icon={Layers3}
          label="Hidden layer 2"
          value="8"
          helper="ReLU activation"
          accent="emerald"
        />

        <StatCard
          icon={CircleGauge}
          label="Output"
          value="1"
          helper="CO prediction"
          accent="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
              <BrainCircuit size={19} />
            </div>
            <div>
              <h3 className="font-semibold">Architecture</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fully connected neural network
              </p>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {[
              ["24", "Inputs"],
              ["16", "Dense"],
              ["8", "Dense"],
              ["1", "Output"],
            ].map(([value, label], index) => (
              <div key={label} className="flex items-center gap-2">
                <div className="min-w-[76px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-xl font-bold">{value}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {label}
                  </p>
                </div>

                {index < 3 && (
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-slate-300 dark:text-slate-700"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Activation
              </span>
              <span className="font-semibold">ReLU</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <BarChart3 size={19} />
            </div>
            <div>
              <h3 className="font-semibold">Evaluation metrics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recorded during model evaluation
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {[
              ["Neural Network MAE", "0.4101"],
              ["Neural Network RMSE", "0.6100"],
              ["Final MAE", "0.5860"],
              ["Final RMSE", "0.7666"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 dark:border-slate-800"
              >
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {label}
                </span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
            <Clock3 size={19} />
          </div>
          <div>
            <h3 className="font-semibold">Time-aware evaluation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Additional recorded evaluation result
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Time-based MAE
            </p>
            <p className="mt-2 text-2xl font-bold">0.7471</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-950">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Time-based RMSE
            </p>
            <p className="mt-2 text-2xl font-bold">0.9672</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({
  darkMode,
  setDarkMode,
  predictionHistory,
  onClearHistory,
}) {
  const [apiStatus, setApiStatus] = useState("checking");

  const checkApi = async () => {
    setApiStatus("checking");

    try {
      const response = await fetch(`${API_URL}/health`);

      if (!response.ok) {
        throw new Error("API unavailable");
      }

      const data = await response.json();
      setApiStatus(data.status === "healthy" ? "online" : "offline");
    } catch {
      setApiStatus("offline");
    }
  };

  useEffect(() => {
    checkApi();
  }, []);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Application settings"
        title="Settings"
        description="Manage the AirSense interface, connection status, and locally stored prediction history."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              {darkMode ? <Moon size={19} /> : <Sun size={19} />}
            </div>

            <div>
              <h3 className="font-semibold">Appearance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose how AirSense looks
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => setDarkMode(false)}
              className={`rounded-xl border px-4 py-4 text-left transition ${
                !darkMode
                  ? "border-cyan-500 bg-cyan-500/5"
                  : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              <Sun size={18} className="text-amber-500" />
              <p className="mt-3 text-sm font-semibold">Light</p>
              <p className="mt-1 text-xs text-slate-400">
                Bright interface
              </p>
            </button>

            <button
              onClick={() => setDarkMode(true)}
              className={`rounded-xl border px-4 py-4 text-left transition ${
                darkMode
                  ? "border-cyan-500 bg-cyan-500/5"
                  : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              <Moon size={18} className="text-cyan-500" />
              <p className="mt-3 text-sm font-semibold">Dark</p>
              <p className="mt-1 text-xs text-slate-400">
                Low-light interface
              </p>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck size={19} />
            </div>

            <div>
              <h3 className="font-semibold">API connection</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                FastAPI prediction service
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  apiStatus === "online"
                    ? "bg-emerald-500"
                    : apiStatus === "checking"
                    ? "animate-pulse bg-amber-500"
                    : "bg-rose-500"
                }`}
              />

              <div>
                <p className="text-sm font-semibold">
                  {apiStatus === "online"
                    ? "Connected"
                    : apiStatus === "checking"
                    ? "Checking..."
                    : "Offline"}
                </p>
                <p className="text-xs text-slate-400">
                  127.0.0.1:8000
                </p>
              </div>
            </div>

            <button
              onClick={checkApi}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
              title="Check connection"
            >
              <RefreshCw
                size={16}
                className={apiStatus === "checking" ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
              <BrainCircuit size={19} />
            </div>

            <div>
              <h3 className="font-semibold">Model information</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current inference configuration
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <SettingRow label="Model" value="AirQualityNet" />
            <SettingRow label="Architecture" value="24 → 16 → 8 → 1" />
            <SettingRow label="Framework" value="PyTorch" />
            <SettingRow label="Backend" value="FastAPI" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <Trash2 size={19} />
            </div>

            <div>
              <h3 className="font-semibold">Prediction history</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stored in your browser
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm">
              <span className="font-semibold">{predictionHistory.length}</span>{" "}
              predictions currently stored.
            </p>

            <button
              onClick={onClearHistory}
              disabled={predictionHistory.length === 0}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-2.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={14} />
              Clear all history
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 text-slate-400" size={18} />
          <div>
            <h3 className="font-semibold">About AirSense</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              AirSense is an interactive machine-learning application for
              predicting carbon monoxide concentration from environmental sensor
              readings. The frontend is built with React and Vite, while the
              trained PyTorch model is served through FastAPI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 dark:border-slate-800">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const [inputs, setInputs] = useState(defaultInputs);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [predictionHistory, setPredictionHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("airsense_prediction_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "airsense_prediction_history",
      JSON.stringify(predictionHistory)
    );
  }, [predictionHistory]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const runPrediction = async () => {
    setLoading(true);
    setPrediction(null);
    setError("");

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      if (typeof data.prediction !== "number") {
        throw new Error("Invalid prediction returned by API");
      }

      setPrediction(data.prediction);

      const record = {
        id: Date.now(),
        prediction: data.prediction,
        timestamp: new Date().toISOString(),
        inputs: { ...inputs },
      };

      setPredictionHistory((previous) => [record, ...previous].slice(0, 20));
    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to the AirSense prediction server. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetInputs = () => {
    setInputs(defaultInputs);
    setPrediction(null);
    setError("");
  };

  const clearHistory = () => {
    setPredictionHistory([]);
    setPrediction(null);
  };

  const renderPage = () => {
    switch (activePage) {
      case "predict":
        return (
          <PredictPage
            inputs={inputs}
            setInputs={setInputs}
            prediction={prediction}
            loading={loading}
            error={error}
            onPredict={runPrediction}
            onReset={resetInputs}
            predictionHistory={predictionHistory}
            onClearHistory={clearHistory}
          />
        );

      case "analytics":
        return <AnalyticsPage predictionHistory={predictionHistory} />;

      case "model":
        return <ModelPage />;

      case "settings":
        return (
          <SettingsPage
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            predictionHistory={predictionHistory}
            onClearHistory={clearHistory}
          />
        );

      case "dashboard":
      default:
        return (
          <DashboardPage
            predictionHistory={predictionHistory}
            setActivePage={setActivePage}
            onClearHistory={clearHistory}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="lg:pl-[260px]">
        <Topbar
          activePage={activePage}
          setMobileOpen={setMobileOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}