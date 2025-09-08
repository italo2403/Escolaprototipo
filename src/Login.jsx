/*
WIREFRAME (FRONT-END, SEM BACK-END)
================================================================================
OBJETIVO: Tela de Login acessível para Aluno, Professor e Gestor, com suporte 
a neurodivergências (alto contraste, fonte maior, layout mais espaçado, reduzir 
animações) e fluxo claro de entrada.

Breakpoints
-----------
Mobile (≤640px)
  [Header]
    - Logo (pequena) • Botão "Acessibilidade"
  [Main]
    - Cartão central
      - Título: "Entrar na plataforma"
      - Subtítulo: "Use seu e-mail institucional ou matrícula."
      - (Opcional) Seletor de perfil (Aluno | Professor | Gestor) —
        preferencialmente manter "Automático" por padrão
      - Campo de identificação
        - Aluno: "Matrícula ou CPF"
        - Professor/Gestor: "E-mail institucional"
      - Campo de senha + [Mostrar senha]
      - [Lembrar meu acesso]
      - [Entrar]
      - Links: [Esqueci minha senha] • [Criar conta/Solicitar acesso]
      - Área de erro/sucesso (aria-live)
  [Footer]
    - Termos • Privacidade • Ajuda

Desktop (≥1024px)
  [Layout 2 colunas]
    Coluna esquerda: ilustração suave (sem excesso de estímulo)
    Coluna direita: cartão de login (igual ao mobile)

Estados e feedbacks
-------------------
- Loading: botão exibe "Entrando…" com spinner discreto
- Erro: mensagem textual objetiva + ícone, com cor + ícone + texto
- Tentativas excessivas: bloquear por 30s com contagem e link para recuperar
- Acessibilidade: painel com toggles (alto contraste, fonte maior, espaçamento,
  reduzir animações)

Decisões de UX
--------------
- Evitar exigir papel antes do login (detectar no servidor), mas permitir
  seleção quando necessário (ícone + texto, nunca só cor)
- Microcopy simples e empática
- Tamanhos de alvo clicável ≥44x44px
- Foco visível para navegação por teclado

================================================================================
*/
import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  // Acessibilidade / Preferências locais (aplicadas via classes utilitárias)
  const [highContrast, setHighContrast] = useState(false);
  const [largeFont, setLargeFont] = useState(false);
  const [spacious, setSpacious] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const nav = useNavigate();

  // UI/Fluxo
  const [role, setRole] = useState("auto"); // auto | aluno | professor | gestor
  const [identifier, setIdentifier] = useState(""); // email ou matrícula/CPF
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);

  // Mensagens de interface
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const rootClass = useMemo(
    () =>
      [
        "lp-root",
        highContrast ? "lp-contrast" : "",
        largeFont ? "lp-font-lg" : "",
        spacious ? "lp-spacious" : "",
        reduceMotion ? "lp-reduce-motion" : "",
      ].join(" "),
    [highContrast, largeFont, spacious, reduceMotion]
  );

  const labelId = role === "aluno" ? "Matrícula ou CPF" : "E-mail institucional";

  function onSubmit(e) {
    e.preventDefault();
    setError("");

    const idOk = identifier.trim().length >= 5;
    const pwdOk = password.trim().length >= 6;
    if (!idOk || !pwdOk) {
      setError("Preencha os campos corretamente (identificação e senha).");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // sucesso mockado: leva para a grade de disciplinas
      nav("/aluno/disciplinas", { replace: true });
    }, 400);
  }

  // Simulação opcional de erro quando loading fica true (será limpo ao voltar para false)
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
      setError("Exemplo: usuário não encontrado ou senha inválida.");
    }, 1200);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div className={rootClass} role="main" aria-label="Tela de login">
      <header className="lp-header" aria-label="Cabeçalho">
        <div className="lp-brand">
          <div className="lp-logo" aria-hidden="true" />
          <span className="lp-brand-name">Escola+</span>
        </div>
        <button
          type="button"
          className="lp-btn-secondary"
          aria-haspopup="dialog"
          aria-controls="painel-acess"
          onClick={() => document.getElementById("painel-acess").showModal()}
        >
          Acessibilidade
        </button>
      </header>

      <section className="lp-layout">
        {/* Coluna ilustrativa (desktop) */}
        <aside className="lp-aside" aria-hidden="true">
          <div className="lp-illustration" />
          <p className="lp-aside-text">Aprender com conforto e acessibilidade.</p>
        </aside>

        {/* Cartão de login */}
        <div className="lp-card" aria-label="Cartão de login">
          <h1 className="lp-title">Entrar na plataforma</h1>
          <p className="lp-subtitle">Use seu e-mail institucional ou matrícula.</p>

          {/* Seletor de papel (opcional) */}
          <div className="lp-role" role="radiogroup" aria-label="Selecione seu perfil (opcional)">
            {["auto", "aluno", "professor", "gestor"].map((r) => (
              <label key={r} className={"lp-role-item " + (role === r ? "is-active" : "")}>
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  aria-checked={role === r}
                />
                <span className="lp-role-text">
                  {r === "auto" ? "Automático" : r.charAt(0).toUpperCase() + r.slice(1)}
                </span>
              </label>
            ))}
          </div>

          <form className="lp-form" onSubmit={onSubmit} noValidate>
            <div className="lp-field">
              <label className="lp-label" htmlFor="idField">
                {labelId}
              </label>
              <input
                id="idField"
                className="lp-input"
                type="text"
                inputMode={role === "aluno" ? "numeric" : "email"}
                autoComplete="username"
                placeholder={role === "aluno" ? "00012345 ou 000.000.000-00" : "nome@escola.edu.br"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                aria-required="true"
                aria-invalid={error ? "true" : "false"}
              />
            </div>

            <div className="lp-field">
              <label className="lp-label" htmlFor="pwdField">
                Senha
              </label>
              <div className="lp-input-group">
                <input
                  id="pwdField"
                  className="lp-input lp-input-hasbtn"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-required="true"
                  aria-invalid={error ? "true" : "false"}
                />
                <button
                  type="button"
                  className="lp-btn-tertiary lp-btn-show"
                  aria-pressed={showPwd}
                  onClick={() => setShowPwd((v) => !v)}
                >
                  {showPwd ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <div className="lp-row-between">
              <label className="lp-check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Lembrar meu acesso</span>
              </label>
              <Link className="lp-btn-secondary" to="/recuperar-senha">
                Esqueci minha senha
              </Link>
            </div>

            {error && (
              <div className="lp-alert" role="alert" aria-live="polite">
                <span className="lp-alert-icon" aria-hidden="true">
                  !
                </span>
                <span className="lp-alert-text">{error}</span>
              </div>
            )}

            <button className="lp-btn-primary" type="submit" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </button>

            <div className="lp-sep" role="separator" aria-hidden="true" />

            <div className="lp-actions-secondary">
              <Link className="lp-btn-secondary" to="/criar-conta">
                Criar conta
              </Link>
              <Link className="lp-btn-ghost" to="/solicitar-acesso">
                Solicitar acesso
              </Link>
            </div>
          </form>

          <footer className="lp-footer-links">
            <a href="#termos" onClick={(e) => e.preventDefault()}>
              Termos
            </a>
            <span>•</span>
            <a href="#priv" onClick={(e) => e.preventDefault()}>
              Privacidade
            </a>
            <span>•</span>
            <a href="#ajuda" onClick={(e) => e.preventDefault()}>
              Ajuda
            </a>
          </footer>
        </div>
      </section>

      {/* Painel de Acessibilidade */}
      <dialog id="painel-acess" className="lp-dialog" aria-label="Opções de acessibilidade">
        <form method="dialog" className="lp-dialog-card" onSubmit={(e) => e.stopPropagation()}>
          <header className="lp-dialog-header">
            <h2>Acessibilidade</h2>
            <button
              type="button"
              className="lp-btn-ghost"
              onClick={() => document.getElementById("painel-acess").close()}
              aria-label="Fechar"
            >
              Fechar
            </button>
          </header>
          <div className="lp-dialog-grid">
            <label className="lp-check">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
              />
              <span>Alto contraste</span>
            </label>
            <label className="lp-check">
              <input
                type="checkbox"
                checked={largeFont}
                onChange={(e) => setLargeFont(e.target.checked)}
              />
              <span>Fonte maior</span>
            </label>
            <label className="lp-check">
              <input
                type="checkbox"
                checked={spacious}
                onChange={(e) => setSpacious(e.target.checked)}
              />
              <span>Layout mais espaçado</span>
            </label>
            <label className="lp-check">
              <input
                type="checkbox"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
              />
              <span>Reduzir animações</span>
            </label>
          </div>
          <div className="lp-dialog-actions">
            <button
              type="button"
              className="lp-btn-secondary"
              onClick={() => {
                setHighContrast(false);
                setLargeFont(false);
                setSpacious(false);
                setReduceMotion(false);
              }}
            >
              Redefinir
            </button>
            <button
              type="button"
              className="lp-btn-primary"
              onClick={() => document.getElementById("painel-acess").close()}
            >
              Aplicar
            </button>
          </div>
        </form>
      </dialog>

      <style>{css}</style>
    </div>
  );
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
.lp-spacious .lp-field{ margin-bottom: 1.1rem; }
.lp-reduce-motion *{ transition: none !important; animation: none !important; }

.lp-root{ min-height:100dvh; background:var(--bg); color:var(--text); font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"; }
.lp-header{ display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid var(--line); }
.lp-brand{ display:flex; align-items:center; gap:10px; font-weight:700; }
.lp-logo{ width:28px; height:28px; border-radius:8px; background: linear-gradient(135deg, var(--primary), #60A5FA); box-shadow: 0 2px 8px rgba(0,0,0,.12); }
.lp-brand-name{ letter-spacing:.2px; }

.lp-layout{ max-width:1100px; margin:0 auto; display:grid; grid-template-columns: 1fr; gap:24px; padding:24px; }
.lp-aside{ display:none; }
@media(min-width:1024px){
  .lp-layout{ grid-template-columns: 1fr 520px; align-items:center; }
  .lp-aside{ display:block; }
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

.lp-role{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
.lp-role-item{ display:flex; align-items:center; gap:8px; border:1px solid var(--line); padding:8px 10px; border-radius:10px; cursor:pointer; user-select:none; }
.lp-role-item.is-active{ outline:2px solid var(--primary); border-color:transparent; }
.lp-role-item input{ appearance:none; width:14px; height:14px; border-radius:50%; border:2px solid var(--primary); display:inline-block; position:relative; }
.lp-role-item.is-active input{ background: var(--primary); }
.lp-role-text{ font-size:.95rem; }

.lp-form{ display:block; }
.lp-field{ margin-bottom: .9rem; }
.lp-label{ display:block; margin-bottom:6px; font-weight:600; }
.lp-input{ width:100%; border:1px solid var(--line); border-radius:10px; padding:12px 12px; font-size:1rem; background:var(--card); color:var(--text); }
.lp-input:focus{ outline:2px solid var(--primary); border-color:transparent; }
.lp-input-group{ position:relative; }
.lp-input-hasbtn{ padding-right:92px; }
.lp-btn-show{ position:absolute; right:6px; top:6px; height:36px; padding:0 10px; }

.lp-row-between{ display:flex; justify-content:space-between; align-items:center; margin:6px 0 10px; gap:10px; }
.lp-check{ display:flex; align-items:center; gap:8px; cursor:pointer; }
.lp-link{ color:var(--primary); text-decoration:none; }
.lp-link:hover{ text-decoration:underline; }

.lp-alert{ display:flex; align-items:flex-start; gap:10px; border:1px solid #FCA5A5; background:#FEF2F2; color:#B91C1C; border-radius:10px; padding:10px 12px; margin:10px 0; }
.lp-alert-icon{ display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; background:#FCA5A5; font-weight:700; }

.lp-btn-primary, .lp-btn-secondary, .lp-btn-ghost, .lp-btn-tertiary{ border-radius:10px; border:1px solid var(--line); padding:12px 14px; font-weight:600; cursor:pointer; background:#fff; color:var(--text); transition: all .14s ease; min-height:44px; }
.lp-btn-primary{ background:var(--primary-700); color:#fff; border-color:var(--primary-700); }
.lp-btn-primary:hover{ background:var(--primary-800); }
.lp-btn-primary:disabled{ opacity:.7; cursor:not-allowed; }
.lp-btn-secondary:hover{ background:#F3F4F6; }
.lp-btn-ghost{ background:transparent; border-color:transparent; }
.lp-btn-ghost:hover{ background:#F3F4F6; }
.lp-btn-tertiary{ background:#F9FAFB; }

.lp-sep{ height:1px; background:var(--line); margin:12px 0; }
.lp-actions-secondary{ display:flex; gap:10px; flex-wrap:wrap; }

.lp-footer-links{ display:flex; gap:10px; justify-content:center; align-items:center; color:var(--muted); margin-top:12px; }
.lp-footer-links a{ color:var(--muted); text-decoration:none; }
.lp-footer-links a:hover{ text-decoration:underline; }

/* Dialog */
.lp-dialog{ border:none; border-radius:16px; padding:0; }
.lp-dialog::backdrop{ background: rgba(0,0,0,.35); }
.lp-dialog-card{ background:var(--card); color:var(--text); width:min(520px, 90vw); border:1px solid var(--line); border-radius:16px; padding:16px; }
.lp-dialog-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.lp-dialog-grid{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
.lp-dialog-actions{ display:flex; justify-content:flex-end; gap:10px; margin-top:14px; }
`;
