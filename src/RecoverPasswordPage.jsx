/*
RECUPERAR SENHA (FRONT-END, SEM BACK-END)
================================================================================
Objetivo: fluxo acessível em 3 passos — Identificação → Código → Nova senha —
coerente com as telas de Login e Criar Conta. Mantém painel de acessibilidade
(alto contraste, fonte maior, layout espaçado, reduzir animações) e design lp-*
================================================================================
*/

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RecoverPasswordPage() {
  // Acessibilidade / Preferências locais
  const [highContrast, setHighContrast] = useState(false);
  const [largeFont, setLargeFont] = useState(false);
  const [spacious, setSpacious] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Fluxo e papéis
  const [role, setRole] = useState("auto"); // auto | aluno | professor | gestor
  const [step, setStep] = useState(1); // 1 Identificação, 2 Código, 3 Nova senha, 4 Sucesso

  // Passo 1 — Identificação
  const [idTypeAluno, setIdTypeAluno] = useState("matricula"); // matricula | cpf
  const [idTypeDocente, setIdTypeDocente] = useState("email"); // email
  const [identifier, setIdentifier] = useState("");

  // Passo 2 — Código (OTP)
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Passo 3 — Nova senha
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  const rootClass = useMemo(() => [
    "lp-root",
    highContrast ? "lp-contrast" : "",
    largeFont ? "lp-font-lg" : "",
    spacious ? "lp-spacious" : "",
    reduceMotion ? "lp-reduce-motion" : "",
  ].join(" "), [highContrast, largeFont, spacious, reduceMotion]);

  // Helpers --------------------------------------------------------------
  function onlyDigits(s) { return (s || "").replace(/\D+/g, ""); }
  function maskCPF(s) {
    const d = onlyDigits(s).slice(0,11);
    return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  function isEmail(val) { return /.+@.+\..+/.test(val); }
  function passwordScore(p) {
    let score = 0; if (!p) return 0;
    if (p.length >= 8) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^\w\s]/.test(p)) score++;
    return Math.min(score, 5);
  }
  const pwdScore = passwordScore(pwd);

  // OTP resend countdown
  useEffect(() => {
    if (resendIn <= 0) return; 
    const t = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // Validations ----------------------------------------------------------
  function validateStep1() {
    setError("");
    if (role === "aluno") {
      if (idTypeAluno === "cpf") {
        if (onlyDigits(identifier).length !== 11) { setError("Informe um CPF válido (11 dígitos)."); return false; }
      } else {
        if (identifier.trim().length < 5) { setError("Informe sua matrícula (mín. 5 caracteres)."); return false; }
      }
    } else { // professor/gestor/auto → email institucional
      if (!isEmail(identifier)) { setError("Informe seu e-mail institucional válido."); return false; }
    }
    return true;
  }

  function validateStep2() {
    setError("");
    if (!otpSent) { setError("Envie o código antes de verificar."); return false; }
    if (!/^\d{6}$/.test(otp)) { setError("Digite o código de 6 dígitos."); return false; }
    return true;
  }

  function validateStep3() {
    setError("");
    if (pwdScore < 4) { setError("Senha fraca: use 8+ caracteres, maiúscula, minúscula, número e especial."); return false; }
    if (pwd !== pwd2) { setError("As senhas não coincidem."); return false; }
    return true;
  }

  // Actions --------------------------------------------------------------
  function next() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep(step + 1);
    setError("");
  }
  function back() { if (step > 1) { setStep(step - 1); setError(""); } }

  function sendOtp() {
    if (resendIn > 0) return;
    setOtpSent(true); setResendIn(30); // 30s para reenviar
  }

  function finish() {
    setLoading(true); setError("");
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg("Senha atualizada! Você já pode entrar.");
      setStep(4);
    }, 1000);
  }

  // Labels e textos ------------------------------------------------------
  const title = step <= 3 ? "Recuperar senha" : "Senha atualizada";
  const subtitle = step <= 3 ? "Enviaremos um código de verificação." : "Tudo pronto!";

  return (
    <div className={rootClass} role="main" aria-label="Tela de recuperar senha">
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
        {/* Lado ilustrativo (desktop) */}
        <aside className="lp-aside" aria-hidden>
          <div className="lp-illustration" />
          <p className="lp-aside-text">Vamos te ajudar a redefinir a senha.</p>
        </aside>

        {/* Card principal */}
        <div className="lp-card" aria-label="Recuperar senha">
          <h1 className="lp-title">{title}</h1>
          <p className="lp-subtitle">{subtitle}</p>

          {step <= 3 && (
            <Stepper step={step} steps={["Identificação", "Código", "Nova senha"]} />
          )}

          {error && (
            <div className="lp-alert" role="alert" aria-live="polite">
              <span className="lp-alert-icon" aria-hidden>!</span>
              <span className="lp-alert-text">{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="lp-form">
              <div className="lp-role" role="radiogroup" aria-label="Selecione seu perfil (opcional)">
                {(["auto", "aluno", "professor", "gestor"]).map((r) => (
                  <label key={r} className={"lp-role-item " + (role === r ? "is-active" : "")}>
                    <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} aria-checked={role === r} />
                    <span className="lp-role-text">{r === "auto" ? "Automático" : r.charAt(0).toUpperCase() + r.slice(1)}</span>
                  </label>
                ))}
              </div>

              {role === "aluno" ? (
                <div className="lp-grid2">
                  <div>
                    <label className="lp-label">Tipo de identificação (Aluno)</label>
                    <div className="lp-role" role="radiogroup" aria-label="Tipo de identificação do aluno">
                      {(["matricula", "cpf"]).map((t) => (
                        <label key={t} className={"lp-role-item " + (idTypeAluno === t ? "is-active" : "")}>
                          <input type="radio" name="idAluno" value={t} checked={idTypeAluno === t} onChange={()=>setIdTypeAluno(t)} aria-checked={idTypeAluno === t} />
                          <span className="lp-role-text">{t === "matricula" ? "Matrícula" : "CPF"}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="lp-label" htmlFor="idAluno">{idTypeAluno === "cpf" ? "CPF" : "Matrícula"}</label>
                    <input id="idAluno" className="lp-input" type="text" placeholder={idTypeAluno === "cpf" ? "000.000.000-00" : "00012345"} value={idTypeAluno === "cpf" ? maskCPF(identifier) : identifier} onChange={(e)=>setIdentifier(e.target.value)} aria-required="true" />
                  </div>
                </div>
              ) : (
                <div className="lp-field">
                  <label className="lp-label" htmlFor="idDoc">E-mail institucional</label>
                  <input id="idDoc" className="lp-input" type="email" placeholder="nome@escola.edu.br" value={identifier} onChange={(e)=>setIdentifier(e.target.value)} aria-required="true" />
                </div>
              )}

              <div className="lp-actions">
                <button className="lp-btn-primary" onClick={next}>Enviar código</button>
                <Link className="lp-btn-ghost" to="/login">Voltar ao login</Link>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="lp-form">
              <div className="lp-grid2">
                <div>
                  <button className="lp-btn-secondary" onClick={(e)=>{e.preventDefault(); sendOtp();}} disabled={resendIn>0}>{resendIn>0?`Reenviar em ${resendIn}s`:"Reenviar código"}</button>
                  {otpSent ? <p className="lp-help">Código reenviado. Verifique seu e-mail/SMS.</p> : <p className="lp-help">Enviamos um código de 6 dígitos para você.</p>}
                </div>
                <div>
                  <label className="lp-label" htmlFor="otp">Código (6 dígitos)</label>
                  <input id="otp" className="lp-input" type="text" inputMode="numeric" placeholder="••••••" value={otp} onChange={(e)=>setOtp(onlyDigits(e.target.value).slice(0,6))} aria-required="true" />
                </div>
              </div>

              <div className="lp-actions">
                <button className="lp-btn-secondary" onClick={back}>Voltar</button>
                <button className="lp-btn-primary" onClick={next}>Verificar</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="lp-form">
              <div className="lp-field">
                <label className="lp-label" htmlFor="pwd">Nova senha</label>
                <input id="pwd" className="lp-input" type="password" placeholder="Crie uma senha forte" value={pwd} onChange={(e)=>setPwd(e.target.value)} aria-required="true" />
                <PasswordMeter score={pwdScore} />
                <p className="lp-help">Use 8+ caracteres, misturando maiúsculas, minúsculas, números e símbolo.</p>
              </div>
              <div className="lp-field">
                <label className="lp-label" htmlFor="pwd2">Confirmar nova senha</label>
                <input id="pwd2" className="lp-input" type="password" placeholder="Repita a senha" value={pwd2} onChange={(e)=>setPwd2(e.target.value)} aria-required="true" />
              </div>

              <div className="lp-actions">
                <button className="lp-btn-secondary" onClick={back}>Voltar</button>
                <button className="lp-btn-primary" onClick={(e)=>{e.preventDefault(); finish();}} disabled={loading}>{loading?"Salvando…":"Definir nova senha"}</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="lp-success" role="status" aria-live="polite">
              <div className="lp-success-icon" aria-hidden>✓</div>
              <h2 className="lp-title" style={{marginTop:8}}>Senha atualizada</h2>
              <p className="lp-subtitle">{successMsg}</p>
              <div className="lp-actions">
                <Link className="lp-btn-primary" to="/login">Ir para o login</Link>
                <Link className="lp-btn-ghost" to="/ajuda">Ajuda</Link>
              </div>
            </div>
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
          </div>
          <div className="lp-dialog-actions">
            <button className="lp-btn-secondary" type="button" onClick={()=>{ setHighContrast(false); setLargeFont(false); setSpacious(false); setReduceMotion(false); }}>Redefinir</button>
            <button className="lp-btn-primary" onClick={() => document.getElementById("painel-acess").close()}>Aplicar</button>
          </div>
        </form>
      </dialog>

      <style>{css}</style>
    </div>
  );
}

function Stepper({ step, steps }){
  return (
    <div className="lp-stepper" aria-label="Progresso de recuperação">
      {steps.map((txt, idx) => {
        const n = idx + 1; const isActive = n === step; const isDone = n < step;
        return (
          <div key={n} className={"lp-step " + (isActive ? "is-active" : isDone ? "is-done" : "") }>
            <div className="lp-step-dot" aria-hidden>{isDone ? "✓" : n}</div>
            <div className="lp-step-label">{txt}</div>
          </div>
        );
      })}
    </div>
  );
}

function PasswordMeter({ score }){
  const percent = (score / 5) * 100;
  const label = ["Muito fraca","Fraca","Ok","Forte","Excelente"][Math.max(0, score-1)] || "";
  return (
    <div className="lp-pw">
      <div className="lp-pw-bar"><div className="lp-pw-fill" style={{width: `${percent}%`}} /></div>
      <div className="lp-pw-label">Força: {label}</div>
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

.lp-root{ min-height:100dvh; background:var(--bg); color:var(--text); font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans"; }
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

.lp-form{ display:block; }
.lp-field{ margin-bottom: .9rem; }
.lp-label{ display:block; margin-bottom:6px; font-weight:600; }
.lp-input{ width:100%; border:1px solid var(--line); border-radius:10px; padding:12px 12px; font-size:1rem; background:var(--card); color:var(--text); }
.lp-input:focus{ outline:2px solid var(--primary); border-color:transparent; }
.lp-grid2{ display:grid; grid-template-columns: 1fr; gap:12px; }
@media(min-width:720px){ .lp-grid2{ grid-template-columns: 1fr 1fr; } }

.lp-role{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
.lp-role-item{ display:flex; align-items:center; gap:8px; border:1px solid var(--line); padding:8px 10px; border-radius:10px; cursor:pointer; user-select:none; }
.lp-role-item.is-active{ outline:2px solid var(--primary); border-color:transparent; }
.lp-role-item input{ appearance:none; width:14px; height:14px; border-radius:50%; border:2px solid var(--primary); display:inline-block; position:relative; }
.lp-role-item.is-active input{ background: var(--primary); }
.lp-role-text{ font-size:.95rem; }

.lp-check{ display:flex; align-items:center; gap:8px; cursor:pointer; }
.lp-help{ color:var(--muted); font-size:.92rem; margin:6px 2px; }

.lp-actions{ display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end; margin-top:10px; }
.lp-btn-primary, .lp-btn-secondary, .lp-btn-ghost{ border-radius:10px; border:1px solid var(--line); padding:12px 14px; font-weight:600; cursor:pointer; background:#fff; color:var(--text); transition: all .14s ease; min-height:44px; }
.lp-btn-primary{ background:var(--primary-700); color:#fff; border-color:var(--primary-700); }
.lp-btn-primary:hover{ background:var(--primary-800); }
.lp-btn-primary:disabled{ opacity:.7; cursor:not-allowed; }
.lp-btn-secondary:hover{ background:#F3F4F6; }
.lp-btn-ghost{ background:transparent; border-color:transparent; }
.lp-btn-ghost:hover{ background:#F3F4F6; }

.lp-alert{ display:flex; align-items:flex-start; gap:10px; border:1px solid #FCA5A5; background:#FEF2F2; color:#B91C1C; border-radius:10px; padding:10px 12px; margin:10px 0; }
.lp-alert-icon{ display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; background:#FCA5A5; font-weight:700; }

/* Stepper */
.lp-stepper{ display:flex; gap:12px; align-items:center; margin: 10px 0 16px; flex-wrap:wrap; }
.lp-step{ display:flex; align-items:center; gap:8px; color:var(--muted); }
.lp-step-dot{ width:26px; height:26px; border-radius:50%; border:2px solid var(--line); display:flex; align-items:center; justify-content:center; font-size:.9rem; }
.lp-step.is-active .lp-step-dot{ border-color: var(--primary); color: var(--primary); }
.lp-step.is-done .lp-step-dot{ background: var(--success); color:#fff; border-color: var(--success); }
.lp-step-label{ font-weight:600; font-size:.95rem; }

/* Password meter */
.lp-pw{ margin-top:6px; }
.lp-pw-bar{ height:8px; background:#F3F4F6; border-radius:999px; overflow:hidden; border:1px solid var(--line); }
.lp-pw-fill{ height:100%; background: linear-gradient(90deg, #F59E0B, #10B981); }
.lp-pw-label{ font-size:.92rem; color:var(--muted); margin-top:6px; }

/* Sucesso */
.lp-success{ text-align:center; padding: 18px 8px; }
.lp-success-icon{ width:56px; height:56px; border-radius:50%; background: #ECFDF5; color:#065F46; border:2px solid #A7F3D0; display:flex; align-items:center; justify-content:center; font-size:1.4rem; margin: 0 auto; }

/* Footer links */
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
