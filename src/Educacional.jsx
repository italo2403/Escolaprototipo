// src/Educacional.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  CalendarClock, ClipboardList, GraduationCap,
  AlertTriangle, PlusCircle, Filter, Layers, Users
} from "lucide-react";
import '../src/assets/css/dashboard.css';

/**
 * DashboardEducacional.jsx — visão do Professor/Gestor (protótipo sem backend)
 * Lê as mesmas chaves do protótipo de criação (localStorage):
 *   - school.items.v1  → itens criados (atividades/avaliações)
 *   - school.roster.v1 → turmas, alunos, disciplinas
 * Rota sugerida: /prof/dashboard
 */

const LS_ITEMS_KEY = "school.items.v1";
const LS_ROSTER_KEY = "school.roster.v1";

const seedRoster = {
  turmas: [
    { id: "1A", nome: "1º A" },
    { id: "1B", nome: "1º B" },
    { id: "2A", nome: "2º A" },
  ],
  disciplinas: [
    "Língua Portuguesa",
    "Matemática",
    "História",
    "Geografia",
    "Ciências",
    "Inglês",
    "Projeto de Vida",
  ],
  alunos: [
    { id: "s1", nome: "Ana Clara", turma: "1A" },
    { id: "s2", nome: "Bruno Lima", turma: "1A" },
    { id: "s3", nome: "Caio Souza", turma: "1B" },
    { id: "s4", nome: "Daniela Nunes", turma: "1B" },
    { id: "s5", nome: "Eduarda Melo", turma: "2A" },
    { id: "s6", nome: "Felipe Alves", turma: "2A" },
  ],
};

function loadRoster() {
  const raw = localStorage.getItem(LS_ROSTER_KEY);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(LS_ROSTER_KEY, JSON.stringify(seedRoster));
  return seedRoster;
}

function loadItems() {
  const raw = localStorage.getItem(LS_ITEMS_KEY);
  return raw ? JSON.parse(raw) : [];
}

// util simples
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

export default function Educacional() {
  const [contrast, setContrast] = useState(false);
  const [roster] = useState(loadRoster());
  const [items, setItems] = useState(loadItems());

  // filtros
  const [tipo, setTipo] = useState("todos"); // todos | atividade | avaliacao
  const [turma, setTurma] = useState("todas");
  const [disciplina, setDisciplina] = useState("todas");
  const [janela, setJanela] = useState("todas"); // todas|hoje|7d|30d|vencidos|semdata
  const now = new Date();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg", contrast ? "#0a0a0a" : "#f7f7fb");
    root.style.setProperty("--fg", contrast ? "#ffffff" : "#111111");
    root.style.setProperty("--card", contrast ? "#131313" : "#ffffff");
    root.style.setProperty("--muted", contrast ? "#bdbdbd" : "#555");
    root.style.setProperty("--border", contrast ? "#333" : "#e8e8ef");
    root.style.setProperty("--accent", contrast ? "#ffeb3b" : "#a7f3d0");
  }, [contrast]);

  // ===== Helpers de filtro =====
  const alunosById = useMemo(
    () => Object.fromEntries(roster.alunos.map((a) => [a.id, a])),
    [roster]
  );

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (tipo !== "todos" && it.tipo !== tipo) return false;
      if (disciplina !== "todas" && it.disciplina !== disciplina) return false;
      if (turma !== "todas") {
        if (it.escopo === "geral") {
          if (!it.turmas?.includes(turma)) return false;
        } else {
          const hasAlunoDaTurma = it.alunos?.some(
            (aid) => alunosById[aid]?.turma === turma
          );
          if (!hasAlunoDaTurma) return false;
        }
      }
      if (janela !== "todas") {
        const d = it.dataEntrega ? new Date(it.dataEntrega) : null;
        if (janela === "semdata") return d === null;
        if (!d) return false;
        if (janela === "hoje") {
          const sameDay = d.toDateString() === now.toDateString();
          return sameDay && d >= now;
        }
        if (janela === "7d") {
          const limit = new Date(now);
          limit.setDate(limit.getDate() + 7);
          return d >= now && d <= limit;
        }
        if (janela === "30d") {
          const limit = new Date(now);
          limit.setDate(limit.getDate() + 30);
          return d >= now && d <= limit;
        }
        if (janela === "vencidos") {
          return d < now;
        }
      }
      return true;
    });
  }, [items, tipo, turma, disciplina, janela, now, alunosById]);

  // ===== KPIs =====
  const kpis = useMemo(() => {
    const total = filtered.length;
    const atividades = filtered.filter((i) => i.tipo === "atividade").length;
    const avaliacoes = filtered.filter((i) => i.tipo === "avaliacao").length;
    const geral = filtered.filter((i) => i.escopo === "geral").length;
    const individual = filtered.filter((i) => i.escopo === "individual").length;
    const atrasados = filtered.filter(
      (i) => i.dataEntrega && new Date(i.dataEntrega) < now
    ).length;
    return { total, atividades, avaliacoes, geral, individual, atrasados };
  }, [filtered, now]);

  // ===== Próximos prazos =====
  const proximos = useMemo(() => {
    const future = filtered.filter(
      (i) => i.dataEntrega && new Date(i.dataEntrega) >= now
    );
    return future
      .sort((a, b) => new Date(a.dataEntrega) - new Date(b.dataEntrega))
      .slice(0, 6);
  }, [filtered, now]);

  // ===== Gráficos =====
  const byDisciplina = useMemo(() => {
    const map = new Map();
    filtered.forEach((i) => map.set(i.disciplina, (map.get(i.disciplina) || 0) + 1));
    return Array.from(map.entries()).map(([name, qt]) => ({ name, qt }));
  }, [filtered]);

  const byTurma = useMemo(() => {
    const map = new Map();
    roster.turmas.forEach((t) => map.set(t.id, 0));
    filtered.forEach((i) => {
      if (i.escopo === "geral") {
        (i.turmas || []).forEach((tid) => map.set(tid, (map.get(tid) || 0) + 1));
      } else {
        (i.alunos || []).forEach((aid) => {
          const t = alunosById[aid]?.turma;
          if (t) map.set(t, (map.get(t) || 0) + 1);
        });
      }
    });
    return roster.turmas.map((t) => ({ name: t.nome, qt: map.get(t.id) || 0 }));
  }, [filtered, roster, alunosById]);

  const pieEscopo = useMemo(
    () => [
      { name: "Geral", value: filtered.filter((i) => i.escopo === "geral").length },
      { name: "Individual", value: filtered.filter((i) => i.escopo === "individual").length },
    ],
    [filtered]
  );

  const pieColors = ["#34d399", "#60a5fa", "#fbbf24", "#f87171", "#a78bfa", "#f472b6"];

  // ===== Ações =====
  function goToCreate() {
    window.location.assign("/prof/itens");
  }

  function refresh() {
    setItems(loadItems());
  }

  return (
    <div className="min-h-screen p-4" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard — Professor/Gestor</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Visão geral das <strong>Atividades</strong> e <strong>Avaliações</strong> criadas • protótipo sem backend (localStorage)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setContrast((v) => !v)} className="px-3 py-2 rounded-xl border" style={{ borderColor: "var(--border)" }}>
            Alto contraste: <strong>{contrast ? "ON" : "OFF"}</strong>
          </button>
          <button onClick={refresh} className="px-3 py-2 rounded-xl border" style={{ borderColor: "var(--border)" }}>
            Recarregar
          </button>
          <button onClick={goToCreate} className="px-3 py-2 rounded-xl" style={{ background: "var(--accent)" }}>
            <span className="inline-flex items-center gap-2"><PlusCircle size={18}/> Criar item</span>
          </button>
        </div>
      </header>

      {/* Filtros */}
      <section className="mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16 }}>
        <div className="p-3 flex items-center gap-2 border-b" style={{ borderColor: "var(--border)" }}>
          <Filter size={18}/>
          <h2 className="text-base font-medium m-0">Filtros</h2>
        </div>
        <div className="grid md:grid-cols-5 grid-cols-1 gap-3 p-3">
          <div>
            <label className="text-sm">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full px-3 py-2 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <option value="todos">Todos</option>
              <option value="atividade">Atividade</option>
              <option value="avaliacao">Avaliação</option>
            </select>
          </div>
          <div>
            <label className="text-sm">Turma</label>
            <select value={turma} onChange={(e) => setTurma(e.target.value)} className="w-full px-3 py-2 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <option value="todas">Todas</option>
              {roster.turmas.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm">Disciplina</label>
            <select value={disciplina} onChange={(e) => setDisciplina(e.target.value)} className="w-full px-3 py-2 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <option value="todas">Todas</option>
              {roster.disciplinas.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm">Janela de data</label>
            <select value={janela} onChange={(e) => setJanela(e.target.value)} className="w-full px-3 py-2 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              <option value="todas">Todas</option>
              <option value="hoje">Hoje</option>
              <option value="7d">Próx. 7 dias</option>
              <option value="30d">Próx. 30 dias</option>
              <option value="vencidos">Vencidos</option>
              <option value="semdata">Sem data</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              {filtered.length} item(ns) após filtros
            </div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid lg:grid-cols-6 md:grid-cols-3 grid-cols-2 gap-3 mb-4">
        <KpiCard icon={<ClipboardList size={18}/>} label="Total" value={kpis.total} />
        <KpiCard icon={<GraduationCap size={18}/>} label="Atividades" value={kpis.atividades} />
        <KpiCard icon={<Layers size={18}/>} label="Avaliações" value={kpis.avaliacoes} />
        <KpiCard icon={<Users size={18}/>} label="Geral" value={kpis.geral} />
        <KpiCard icon={<Users size={18}/>} label="Individual" value={kpis.individual} />
        <KpiCard icon={<AlertTriangle size={18}/>} label="Vencidos" value={kpis.atrasados} />
      </section>

      {/* Charts & lists */}
      <section className="grid lg:grid-cols-3 grid-cols-1 gap-4">
        <Card title="Itens por Disciplina">
          {byDisciplina.length === 0 ? (
            <Empty>Sem dados para exibir.</Empty>
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={byDisciplina} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-10} height={50} textAnchor="end" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="qt" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Distribuição por Turma">
          {byTurma.every((d) => d.qt === 0) ? (
            <Empty>Sem dados para exibir.</Empty>
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={byTurma} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="qt" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Escopo (Geral vs Individual)">
          {pieEscopo.every((p) => p.value === 0) ? (
            <Empty>Sem dados para exibir.</Empty>
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieEscopo} dataKey="value" nameKey="name" outerRadius={90} label>
                    {pieEscopo.map((entry, idx) => (
                      <Cell key={`c-${idx}`} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </section>

      {/* Upcoming list */}
      <section className="mt-4 grid lg:grid-cols-2 grid-cols-1 gap-4">
        <Card title="Próximos prazos (até 6)">
          {proximos.length === 0 ? (
            <Empty>Sem próximos prazos.</Empty>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
              {proximos.map((item) => (
                <li key={item.id} className="py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{item.titulo}</div>
                      <div className="text-sm" style={{ color: "var(--muted)" }}>
                        {item.tipo === "avaliacao" ? "Avaliação" : "Atividade"} • {item.disciplina}
                      </div>
                    </div>
                    <div className="text-sm inline-flex items-center gap-2">
                      <CalendarClock size={16} />
                      {fmtDate(item.dataEntrega)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Dicas de leitura dos dados">
          <ul className="text-sm list-disc pl-5" style={{ color: "var(--muted)" }}>
            <li>Use os filtros para comparar turmas e disciplinas rapidamente.</li>
            <li>O gráfico por turma soma itens gerais e individuais (contando o aluno na turma de origem).</li>
            <li>Itens sem data não entram em "próximos" nem "vencidos"; use a janela "Sem data".</li>
            <li>Atalho: "Criar item" abre a tela de criação para agir em cima do insight.</li>
          </ul>
        </Card>
      </section>

      <footer className="text-center mt-6" style={{ color: "var(--muted)" }}>
        <small>Protótipo — pensado para teste rápido de UX antes do backend.</small>
      </footer>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16 }}>
      <div className="p-3 flex items-center gap-2 border-b" style={{ borderColor: "var(--border)" }}>
        <h3 className="m-0 text-base font-medium">{title}</h3>
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

function KpiCard({ icon, label, value }) {
  return (
    <div className="p-3 rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <div className="flex items-center justify-between">
        <div className="text-sm" style={{ color: "var(--muted)" }}>{label}</div>
        <span className="opacity-70">{icon}</span>
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Empty({ children }) {
  return <div className="text-sm" style={{ color: "var(--muted)" }}>{children}</div>;
}
const css =`
/* dash.css — estilos complementares para DashboardEducacional */

/* =========================
   Tokens de tema (CSS vars)
   ========================= */
:root {
  --bg: #f7f7fb;
  --fg: #111111;
  --card: #ffffff;
  --muted: #555555;
  --border: #e8e8ef;
  --accent: #a7f3d0;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-2xl: 20px;

  --shadow-card: 0 1px 2px rgba(0,0,0,.04), 0 4px 14px rgba(0,0,0,.06);
  --shadow-elev: 0 6px 26px rgba(0,0,0,.08);

  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI",
               Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans",
               sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
}

/* Opcional: modo alto contraste via classe (além do toggle via JS que você já usa) */
.contrast-high, [data-contrast="high"] {
  --bg: #0a0a0a;
  --fg: #ffffff;
  --card: #131313;
  --muted: #bdbdbd;
  --border: #333333;
  --accent: #ffeb3b;
}

/* =========================
   Base do dashboard
   ========================= */
.dash-root {
  min-height: 100vh;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.muted { color: var(--muted); }
.divider {
  height: 1px;
  background: var(--border);
  width: 100%;
}

/* Acessibilidade: foco visível */
:where(button, a, input, select, textarea):focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* =========================
   Cards (sections, painéis)
   ========================= */
.dash-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.dash-card__header {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .75rem .9rem;
  border-bottom: 1px solid var(--border);
}

.dash-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.dash-card__body {
  padding: .9rem;
}

/* =========================
   Botões
   ========================= */
.btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .5rem .9rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--fg);
  cursor: pointer;
  transition: transform .04s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
}

.btn:hover {
  box-shadow: var(--shadow-card);
}

.btn:active {
  transform: translateY(1px);
}

.btn--accent {
  background: var(--accent);
  border-color: transparent;
}

.btn--ghost {
  background: transparent;
}

.btn--danger {
  color: #7f1d1d;
  background: #fee2e2;
  border-color: #fecaca;
}

/* =========================
   KPIs
   ========================= */
.kpi {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-2xl);
  padding: .75rem;
}

.kpi__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi__label {
  font-size: .875rem;
  color: var(--muted);
}

.kpi__value {
  margin-top: .25rem;
  font-size: 1.5rem;
  font-weight: 700;
}

/* =========================
   Form controls
   ========================= */
.dash-field {
  display: grid;
  gap: .35rem;
}

.dash-label {
  font-size: .875rem;
}

.dash-select,
.dash-input {
  width: 100%;
  padding: .55rem .75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--fg);
  transition: border-color .2s ease, box-shadow .2s ease;
}

.dash-select:hover,
.dash-input:hover {
  border-color: #cfd3e1;
}

.dash-select:focus,
.dash-input:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 4px rgba(147, 197, 253, .25);
  outline: none;
}

/* =========================
   Listas “Próximos prazos”
   ========================= */
.dash-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dash-list li + li {
  border-top: 1px solid var(--border);
}

.dash-list__item {
  padding: .6rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
}

.dash-list__meta {
  font-size: .875rem;
  color: var(--muted);
}

/* =========================
   Tipografia auxiliar
   ========================= */
.h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.subtle {
  font-size: .875rem;
  color: var(--muted);
}

/* =========================
   Recharts (ajustes visuais)
   ========================= */
.recharts-default-tooltip {
  background: var(--card) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius-md) !important;
  color: var(--fg) !important;
  box-shadow: var(--shadow-card) !important;
}

.recharts-cartesian-grid-horizontal line,
.recharts-cartesian-grid-vertical line {
  stroke: #dfe3f1;
  stroke-opacity: .7;
}

.recharts-xAxis text,
.recharts-yAxis text {
  fill: var(--fg);
  opacity: .9;
  font-size: 12px;
}

.recharts-legend-item-text {
  fill: var(--fg) !important;
}

/* =========================
   Utilidades sutis
   ========================= */
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-2xl { border-radius: var(--radius-2xl); }

.border { border: 1px solid var(--border); }
.border-b { border-bottom: 1px solid var(--border); }

.shadow-card { box-shadow: var(--shadow-card); }
.shadow-elev { box-shadow: var(--shadow-elev); }

.text-muted { color: var(--muted); }
`