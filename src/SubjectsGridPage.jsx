/*
"MINHAS DISCIPLINAS" — WIREFRAME + JSX (FRONT-ONLY)
================================================================================
Objetivo: grid de cards com busca, filtros e acessibilidade, focado em
neurodivergências. Cada card mostra nome, professor, progresso, sinais de
"Novo" e "Para hoje"; CTAs: "Continuar" (último tópico) e "Ver tópicos".

Header
- Título "Minhas disciplinas"
- Busca (nome/Professor) + Filtro (todas | novidades | pendências) + Ordenação (A–Z | progresso | recentes)
- Botão "Acessibilidade" (alto contraste, fonte maior, layout espaçado, reduzir animações, modo foco)

Grid
- Cards responsivos (≥44×44 clique), ícone/identidade visual SUAVE (não depende só de cor)
- Texto curto, previsível; barra de progresso objetiva
- Badges com ícone+texto ("Novo", "Para hoje")
- Ações sempre no mesmo lugar: [Continuar] primário, [Ver tópicos] secundário

Estados
- Carregando: skeleton calmo
- Vazio: mensagem empática + link ajuda
- Erro: mensagem clara + tentar novamente

Acessibilidade
- Foco visível espesso; navegação por teclado
- `aria-live` para contagem de resultados/busca
- `prefers-reduced-motion` respeitado por toggle
================================================================================
*/

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function SubjectsGridPage() {
  // Preferências de acessibilidade
  const [highContrast, setHighContrast] = useState(false);
  const [largeFont, setLargeFont] = useState(false);
  const [spacious, setSpacious] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const rootClass = useMemo(() => [
    "lp-root",
    highContrast ? "lp-contrast" : "",
    largeFont ? "lp-font-lg" : "",
    spacious ? "lp-spacious" : "",
    reduceMotion ? "lp-reduce-motion" : "",
    focusMode ? "lp-focus-mode" : "",
  ].join(" "), [highContrast, largeFont, spacious, reduceMotion, focusMode]);

  // Estado de dados (mock front-only)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subjects, setSubjects] = useState(() => sampleSubjects());

  useEffect(() => {
    const t = setTimeout(() => { setLoading(false); }, 600); // skeleton curto
    return () => clearTimeout(t);
  }, []);

  // Busca, filtro e ordenação
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("todas"); // todas | novidades | pendencias
  const [sort, setSort] = useState("az"); // az | progresso | recentes

  const filtered = useMemo(() => {
    let arr = subjects.slice();
    const query = q.trim().toLowerCase();
    if (query) {
      arr = arr.filter(s => s.name.toLowerCase().includes(query) || s.teacher.toLowerCase().includes(query));
    }
    if (filter === "novidades") arr = arr.filter(s => s.hasNew);
    if (filter === "pendencias") arr = arr.filter(s => s.progress < 100);
    if (sort === "az") arr.sort((a,b)=> a.name.localeCompare(b.name));
    if (sort === "progresso") arr.sort((a,b)=> a.progress - b.progress); // menos concluído primeiro
    if (sort === "recentes") arr.sort((a,b)=> (b.updatedAt || 0) - (a.updatedAt || 0));
    return arr;
  }, [subjects, q, filter, sort]);

  const resultsText = `${filtered.length} resultado${filtered.length===1?"":"s"}`;

  function retry() { setError(""); setLoading(true); setTimeout(()=>{ setLoading(false); setSubjects(sampleSubjects()); }, 600); }

  return (
    <div className={rootClass} role="main" aria-label="Minhas disciplinas">
      <header className="lp-header" aria-label="Cabeçalho">
        <div className="lp-brand">
          <div className="lp-logo" aria-hidden="true" />
          <span className="lp-brand-name">Escola+</span>
        </div>
        <button
          className="lp-btn-secondary"
          aria-haspopup="dialog"
          aria-controls="painel-acess"
          onClick={() => document.getElementById("painel-acess").showModal()}
        >
          Acessibilidade
        </button>
      </header>

      <section className="lp-layout">
        {!focusMode && (
          <aside className="lp-aside" aria-hidden>
            <div className="lp-illustration" />
            <p className="lp-aside-text">Escolha uma disciplina e continue de onde parou.</p>
          </aside>
        )}

        <div className="lp-card" aria-label="Minhas disciplinas">
          <div className="sgp-header">
            <h1 className="lp-title">Minhas disciplinas</h1>
            <p className="lp-subtitle">Acesse rapidamente e continue seus estudos.</p>
          </div>

          {/* Controles de busca/filtro/ordem */}
          <div className="sgp-controls" role="region" aria-label="Controles de listagem">
            <div className="sgp-search">
              <label htmlFor="q" className="lp-label">Buscar</label>
              <input id="q" className="lp-input" type="search" placeholder="Matemática, Professor Carlos…" value={q} onChange={(e)=>setQ(e.target.value)} />
            </div>
            <div className="sgp-selects">
              <div className="sgp-field">
                <label className="lp-label" htmlFor="filtro">Filtro</label>
                <select id="filtro" className="lp-input" value={filter} onChange={(e)=>setFilter(e.target.value)}>
                  <option value="todas">Todas</option>
                  <option value="novidades">Com novidades</option>
                  <option value="pendencias">Com pendências</option>
                </select>
              </div>
              <div className="sgp-field">
                <label className="lp-label" htmlFor="ordem">Ordenar</label>
                <select id="ordem" className="lp-input" value={sort} onChange={(e)=>setSort(e.target.value)}>
                  <option value="az">A–Z</option>
                  <option value="progresso">Menor progresso</option>
                  <option value="recentes">Mais recentes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contador de resultados (aria-live) */}
          <div className="sgp-results" role="status" aria-live="polite">{resultsText}</div>

          {/* Lista / estados */}
          {loading && <SkeletonGrid />}
          {!loading && !error && filtered.length === 0 && (
            <EmptyState />
          )}
          {!loading && error && (
            <ErrorState onRetry={retry} />
          )}

          {!loading && !error && filtered.length > 0 && (
            <ul className="sgp-grid" role="list">
              {filtered.map((s) => (
                <li key={s.id} className="sgp-card" role="listitem">
                  <div className="sgp-card-top">
                    <div className="sgp-avatar" aria-hidden style={{ background: s.color }} />
                    <div className="sgp-texts">
                      <h2 className="sgp-name">{s.name}</h2>
                      <p className="sgp-teacher">{s.teacher}</p>
                    </div>
                  </div>

                  <div className="sgp-badges">
                    {s.hasNew && <Badge type="info" label="Novo" />}
                    {s.dueToday && <Badge type="warn" label="Para hoje" />}
                    {s.progress === 100 && <Badge type="success" label="Concluída" />}
                  </div>

                  <Progress value={s.progress} />

                  <div className="sgp-actions">
                    <Link className="lp-btn-primary" to={`/aluno/disciplinas/${s.id}/topicos/${s.lastTopicId || ""}`}>Continuar</Link>
                    <Link className="lp-btn-secondary" to={`/aluno/disciplinas/${s.id}/topicos`}>Ver tópicos</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <footer className="lp-footer-links">
            <Link to="/termos">Termos</Link>
            <span>•</span>
            <Link to="/privacidade">Privacidade</Link>
            <span>•</span>
            <Link to="/ajuda">Ajuda</Link>
          </footer>
        </div>
      </section>

      {/* Painel de Acessibilidade */}
      <dialog id="painel-acess" className="lp-dialog" aria-label="Opções de acessibilidade">
        <form method="dialog" className="lp-dialog-card" onSubmit={(e) => e.stopPropagation()}>
          <header className="lp-dialog-header">
            <h2>Acessibilidade</h2>
            <button className="lp-btn-ghost" onClick={() => document.getElementById("painel-acess").close()} aria-label="Fechar">Fechar</button>
          </header>
          <div className="lp-dialog-grid">
            <label className="lp-check"><input type="checkbox" checked={highContrast} onChange={(e)=>setHighContrast(e.target.checked)} /><span>Alto contraste</span></label>
            <label className="lp-check"><input type="checkbox" checked={largeFont} onChange={(e)=>setLargeFont(e.target.checked)} /><span>Fonte maior</span></label>
            <label className="lp-check"><input type="checkbox" checked={spacious} onChange={(e)=>setSpacious(e.target.checked)} /><span>Layout mais espaçado</span></label>
            <label className="lp-check"><input type="checkbox" checked={reduceMotion} onChange={(e)=>setReduceMotion(e.target.checked)} /><span>Reduzir animações</span></label>
            <label className="lp-check"><input type="checkbox" checked={focusMode} onChange={(e)=>setFocusMode(e.target.checked)} /><span>Modo foco (menos distrações)</span></label>
          </div>
          <div className="lp-dialog-actions">
            <button className="lp-btn-secondary" type="button" onClick={()=>{ setHighContrast(false); setLargeFont(false); setSpacious(false); setReduceMotion(false); setFocusMode(false); }}>Redefinir</button>
            <button className="lp-btn-primary" onClick={() => document.getElementById("painel-acess").close()}>Aplicar</button>
          </div>
        </form>
      </dialog>

      <style>{css}</style>
    </div>
  );
}

function Badge({ type = "info", label = "" }){
  return (
    <span className={`sgp-badge sgp-badge-${type}`}>
      <span className="sgp-badge-dot" aria-hidden />
      {label}
    </span>
  );
}

function Progress({ value = 0 }){
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="sgp-progress" aria-label={`Progresso ${v}%`}>
      <div className="sgp-progress-fill" style={{ width: `${v}%` }} />
      <div className="sgp-progress-label">{v}% concluído</div>
    </div>
  );
}

function SkeletonGrid(){
  return (
    <ul className="sgp-grid" role="list" aria-hidden>
      {Array.from({length:6}).map((_,i)=> (
        <li key={i} className="sgp-card is-skeleton">
          <div className="sgp-card-top">
            <div className="sgp-avatar" />
            <div className="sgp-texts">
              <div className="sgp-sk-line" style={{width:"60%"}} />
              <div className="sgp-sk-line" style={{width:"40%"}} />
            </div>
          </div>
          <div className="sgp-sk-line" style={{width:"30%", marginTop:8}} />
          <div className="sgp-progress"><div className="sgp-progress-fill" style={{width:"35%"}} /></div>
          <div className="sgp-actions">
            <div className="lp-btn-primary sgp-sk-btn" />
            <div className="lp-btn-secondary sgp-sk-btn" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState(){
  return (
    <div className="sgp-empty" role="status" aria-live="polite">
      <h3>Você ainda não tem disciplinas</h3>
      <p>Quando sua escola vincular suas turmas, elas aparecerão aqui.</p>
      <Link className="lp-btn-secondary" to="/ajuda">Ver orientações</Link>
    </div>
  );
}

function ErrorState({ onRetry }){
  return (
    <div className="sgp-error" role="alert" aria-live="assertive">
      <h3>Não foi possível carregar</h3>
      <p>Tente novamente em instantes.</p>
      <button className="lp-btn-primary" onClick={onRetry}>Tentar novamente</button>
    </div>
  );
}

function sampleSubjects(){
  const now = Date.now();
  return [
    { id:"mat", name:"Matemática", teacher:"Prof. Carlos", color:"#DBEAFE", progress: 42, hasNew:true, dueToday:true, lastTopicId:"funcoes-1-grau", updatedAt: now-1000*60*60*2 },
    { id:"port", name:"Português", teacher:"Profa. Ana", color:"#FEF3C7", progress: 10, hasNew:false, dueToday:false, lastTopicId:"interpretacao-textual", updatedAt: now-1000*60*60*24*3 },
    { id:"hist", name:"História", teacher:"Prof. Davi", color:"#E5E7EB", progress: 100, hasNew:false, dueToday:false, lastTopicId:"revolucao-industrial", updatedAt: now-1000*60*30 },
    { id:"bio", name:"Biologia", teacher:"Profa. Júlia", color:"#DCFCE7", progress: 65, hasNew:true, dueToday:false, lastTopicId:"citologia-basica", updatedAt: now-1000*60*60*6 },
    { id:"fis", name:"Física", teacher:"Prof. Renan", color:"#F3E8FF", progress: 5, hasNew:false, dueToday:true, lastTopicId:"cinematica-intro", updatedAt: now-1000*60*60*14 },
    { id:"geo", name:"Geografia", teacher:"Profa. Bia", color:"#FFE4E6", progress: 77, hasNew:false, dueToday:false, lastTopicId:"climas-do-mundo", updatedAt: now-1000*60*60*48 },
  ];
}

const css = `
:root{
  --bg:#F7FAFC; --text:#374151; --muted:#6B7280; --card:#FFFFFF; --line:#E5E7EB;
  --primary:#1D4ED8; --primary-700:#1D4ED8; --primary-800:#1E40AF;
  --success:#16A34A; --warn:#D97706; --error:#DC2626;
}
.lp-contrast{ --bg:#000; --text:#fff; --muted:#E5E7EB; --card:#111827; --line:#374151; --primary:#00A3FF; --primary-700:#00A3FF; --primary-800:#0087D1; }
.lp-font-lg{ font-size: 112%; }
.lp-spacious .lp-card{ padding: 2.25rem; }
.lp-spacious .sgp-grid{ gap: 16px; }
.lp-reduce-motion *{ transition: none !important; animation: none !important; }
.lp-focus-mode .lp-aside, .lp-focus-mode .sgp-controls{ display:none !important; }

.lp-root{ min-height:100dvh; background:var(--bg); color:var(--text); font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans"; }
.lp-header{ display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid var(--line); }
.lp-brand{ display:flex; align-items:center; gap:10px; font-weight:700; }
.lp-logo{ width:28px; height:28px; border-radius:8px; background: linear-gradient(135deg, var(--primary), #60A5FA); box-shadow: 0 2px 8px rgba(0,0,0,.12); }
.lp-brand-name{ letter-spacing:.2px; }

.lp-layout{ max-width:1200px; margin:0 auto; display:grid; grid-template-columns: 1fr; gap:24px; padding:24px; }
.lp-aside{ display:none; }
@media(min-width:1024px){
  .lp-layout{ grid-template-columns: 1fr 740px; align-items:start; }
  .lp-aside{ display:block; }
  .lp-illustration{ height:280px; }
}
.lp-illustration{ height:360px; border-radius:16px; background:
  radial-gradient(1200px 300px at 0% 0%, rgba(29,78,216,.10), transparent),
  radial-gradient(600px 200px at 100% 100%, rgba(29,78,216,.10), transparent),
  linear-gradient(135deg, #EEF2FF, #F8FAFC);
  border:1px solid var(--line);
}
.lp-aside-text{ margin-top:10px; color:var(--muted); }

.lp-card{ background:var(--card); border:1px solid var(--line); border-radius:16px; padding: 1.5rem; box-shadow: 0 8px 24px rgba(0,0,0,.06); }
.lp-title{ font-size:1.4rem; font-weight:700; margin:0 0 6px; }
.lp-subtitle{ margin:0 0 14px; color:var(--muted); }

/* Controles */
.sgp-controls{ display:grid; grid-template-columns: 1fr; gap:12px; margin: 8px 0 12px; }
@media(min-width:780px){ .sgp-controls{ grid-template-columns: 1fr 280px 220px; align-items:end; } }
.sgp-search .lp-input{ }
.sgp-selects{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
.sgp-field{ }

/* Resultados */
.sgp-results{ color:var(--muted); font-size:.95rem; margin: 4px 0 8px; }

/* Grid */
.sgp-grid{ list-style:none; padding:0; margin:0; display:grid; grid-template-columns: repeat(1, minmax(0,1fr)); gap:12px; }
@media(min-width:620px){ .sgp-grid{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media(min-width:980px){ .sgp-grid{ grid-template-columns: repeat(3, minmax(0,1fr)); } }

.sgp-card{ border:1px solid var(--line); border-radius:16px; padding:14px; display:flex; flex-direction:column; gap:10px; background:var(--card); }
.sgp-card:focus-within{ outline:2px solid var(--primary); }
.sgp-card-top{ display:flex; align-items:center; gap:10px; }
.sgp-avatar{ width:44px; height:44px; border-radius:12px; border:1px solid var(--line); }
.sgp-texts{ flex:1; min-width:0; }
.sgp-name{ font-size:1.05rem; font-weight:700; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.sgp-teacher{ color:var(--muted); margin:2px 0 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

.sgp-badges{ display:flex; gap:8px; flex-wrap:wrap; }
.sgp-badge{ display:inline-flex; align-items:center; gap:8px; border-radius:999px; padding:6px 10px; font-weight:600; font-size:.9rem; border:1px solid var(--line); }
.sgp-badge .sgp-badge-dot{ width:10px; height:10px; border-radius:50%; }
.sgp-badge-info .sgp-badge-dot{ background:#60A5FA; }
.sgp-badge-warn .sgp-badge-dot{ background:#F59E0B; }
.sgp-badge-success .sgp-badge-dot{ background:#10B981; }

.sgp-progress{ position:relative; height:10px; background:#F3F4F6; border-radius:999px; border:1px solid var(--line); overflow:hidden; }
.sgp-progress-fill{ height:100%; background: linear-gradient(90deg, #93C5FD, #1D4ED8); transition: width .28s ease; }
.sgp-progress-label{ margin-top:6px; font-size:.9rem; color:var(--muted); }

.sgp-actions{ display:flex; gap:10px; flex-wrap:wrap; margin-top:6px; }

/* Skeleton */
.is-skeleton{ opacity:.85; }
.sgp-sk-line{ height:12px; background:#F3F4F6; border:1px solid var(--line); border-radius:8px; }
.sgp-sk-btn{ width:120px; height:44px; opacity:.7; }

/* Empty & Error */
.sgp-empty, .sgp-error{ text-align:center; padding: 24px 8px; color:var(--muted); }
.sgp-empty h3, .sgp-error h3{ color:var(--text); margin: 0 0 4px; }

/* Dialog */
.lp-dialog{ border:none; border-radius:16px; padding:0; }
.lp-dialog::backdrop{ background: rgba(0,0,0,.35); }
.lp-dialog-card{ background:var(--card); color:var(--text); width:min(520px, 90vw); border:1px solid var(--line); border-radius:16px; padding:16px; }
.lp-dialog-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.lp-dialog-grid{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
.lp-dialog-actions{ display:flex; justify-content:flex-end; gap:10px; margin-top:14px; }

/* Botões base herdados do design lp- */
.lp-btn-primary, .lp-btn-secondary, .lp-btn-ghost{ border-radius:10px; border:1px solid var(--line); padding:12px 14px; font-weight:600; cursor:pointer; background:#fff; color:var(--text); transition: all .14s ease; min-height:44px; text-align:center; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; }
.lp-btn-primary{ background:var(--primary-700); color:#fff; border-color:var(--primary-700); }
.lp-btn-primary:hover{ background:var(--primary-800); }
.lp-btn-secondary:hover{ background:#F3F4F6; }
`;
