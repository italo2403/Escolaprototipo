/*
WIREFRAME (FRONT-END, SEM BACK-END)
================================================================================
OBJETIVO: Tela "Criar conta" acessível para Aluno, Professor e Gestor,
com suporte a neurodivergências (alto contraste, fonte maior, layout mais
espaçado, reduzir animações), seguindo o mesmo design da tela de Login.

Fluxo em passos (Stepper)
-------------------------
[Header]
  - Logo da escola + Botão "Acessibilidade"

[Card Criar conta]
  Passo 1 — Identificação
    - (Opcional) Seletor de perfil: Automático | Aluno | Professor | Gestor
    - Campo de identificação:
       Aluno → "Matrícula ou CPF" (alternador)
       Professor/Gestor → "E-mail institucional" ou "Registro funcional"
    - CTA primário: "Continuar" / Secundário: "Já tenho conta"

  Passo 2 — Dados básicos (condicionais por perfil)
    - Comuns: Nome completo*, Data de nascimento*, E-mail*, Celular
    - Aluno: Turma*, Turno*; se <18, Responsável (Nome+E-mail)*
    - Professor: Departamento*, Disciplina/Área
    - Gestor: Unidade/Órgão*
    - Consentimento LGPD (checkbox obrigatório)
    - CTA: "Continuar" / "Voltar"

  Passo 3 — Verificação
    - Escolha do canal: E-mail (padrão) ou SMS (se celular informado)
    - Enviar código (OTP 6 dígitos) + campo para digitar
    - Reenvio com countdown e bloqueio de spam
    - CTA: "Verificar" / "Voltar"

  Passo 4 — Segurança e preferências
    - Criar senha + Confirmar (medidor de força e requisitos)
    - Opção de 2º fator (texto informativo)
    - Preferências de acessibilidade (persistem localmente)
    - CTA final:
       • Se auto-cadastro: "Concluir cadastro"
       • Se fluxo de solicitação: "Enviar solicitação"

[Sucesso]
  - Auto-cadastro: "Conta criada! Você já pode entrar" + botão "Ir para o login"
  - Solicitação: "Recebemos sua solicitação. Enviaremos e-mail quando for aprovada."

[Footer]
  - Termos • Privacidade • Ajuda

Regras de UX essenciais
-----------------------
- Labels sempre visíveis (placeholders não substituem rótulos)
- Mensagens de erro objetivas, com cor + ícone + texto e aria-live
- Alvos clicáveis ≥44×44, foco visível espesso, ordem de tabulação lógica
- Conteúdos e bordas com contraste suficiente; toggle de alto contraste
- Evitar exigir papel antes do login; aqui permitimos selecionar perfil somente
  se necessário — preferência "Automático"

Validações (cliente)
--------------------
- E-mail no formato correto e (opcional) domínio institucional
- CPF (se usado) com máscara simples
- Celular com máscara nacional
- Data de nascimento não futura; se <18 anos, obriga dados do responsável
- OTP: 6 dígitos, com bloqueio temporário em falhas repetidas
- Senha: mínimo 8, com maiúscula, minúscula, número e especial; confirmação igual
- LGPD: checkbox obrigatório

Telemetria útil (apenas front)
------------------------------
- Passo de maior abandono, campos com mais erros, uso de acessibilidade
================================================================================
*/

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function CreateAccountPage({ policy = "auto", institutionalDomain = "" }) {
  // policy: "auto" (auto-cadastro) | "solicitacao" (solicitar acesso)
  // institutionalDomain: opcional (ex.: "@escola.edu.br") para checagem simples

  // Acessibilidade / Preferências locais
  const [highContrast, setHighContrast] = useState(false);
  const [largeFont, setLargeFont] = useState(false);
  const [spacious, setSpacious] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Fluxo / papéis
  const [role, setRole] = useState("auto"); // auto | aluno | professor | gestor
  const [step, setStep] = useState(1); // 1..4, 5=sucesso

  // Passo 1 — Identificação
  const [idTypeAluno, setIdTypeAluno] = useState("matricula"); // matricula | cpf
  const [idTypeDocente, setIdTypeDocente] = useState("email"); // email | registro
  const [identifier, setIdentifier] = useState("");

  // Passo 2 — Dados básicos
  const [nome, setNome] = useState("");
  const [nascimento, setNascimento] = useState(""); // YYYY-MM-DD
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  // Aluno
  const [turma, setTurma] = useState("");
  const [turno, setTurno] = useState("");
  const [respNome, setRespNome] = useState("");
  const [respEmail, setRespEmail] = useState("");
  // Professor
  const [departamento, setDepartamento] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [registroFuncional, setRegistroFuncional] = useState("");
  // Gestor
  const [unidade, setUnidade] = useState("");

  const [lgpdOk, setLgpdOk] = useState(false);

  // Passo 3 — Verificação (OTP)
  const [verifyMethod, setVerifyMethod] = useState("email"); // email | sms
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Passo 4 — Segurança
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [twofa, setTwofa] = useState(false);

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const rootClass = useMemo(() => [
    "lp-root",
    highContrast ? "lp-contrast" : "",
    largeFont ? "lp-font-lg" : "",
    spacious ? "lp-spacious" : "",
    reduceMotion ? "lp-reduce-motion" : "",
  ].join(" "), [highContrast, largeFont, spacious, reduceMotion]);

  // Helpers --------------------------------------------------------------
  function isEmail(val) { return /.+@.+\..+/.test(val); }
  function hasInstDomain(val) { return institutionalDomain ? val.endsWith(institutionalDomain) : true; }
  function onlyDigits(s) { return (s || "").replace(/\D+/g, ""); }
  function maskCPF(s) {
    const d = onlyDigits(s).slice(0,11);
    return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  function maskPhoneBR(s) {
    const d = onlyDigits(s).slice(0,11);
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }
  function ageFrom(yyyyMMdd) {
    if (!yyyyMMdd) return null;
    const dt = new Date(yyyyMMdd);
    if (Number.isNaN(+dt)) return null;
    const now = new Date();
    let age = now.getFullYear() - dt.getFullYear();
    const m = now.getMonth() - dt.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dt.getDate())) age--;
    return age;
  }
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
        const digits = onlyDigits(identifier);
        if (digits.length !== 11) { setError("Informe um CPF válido (11 dígitos)."); return false; }
      } else {
        if (identifier.trim().length < 5) { setError("Informe sua matrícula (mín. 5 caracteres)."); return false; }
      }
    } else { // professor/gestor/auto
      if (idTypeDocente === "email") {
        if (!isEmail(identifier)) { setError("Informe um e-mail institucional válido."); return false; }
        if (!hasInstDomain(identifier)) { setError("Use seu e-mail institucional (domínio inválido)."); return false; }
      } else {
        if (identifier.trim().length < 4) { setError("Informe seu registro funcional."); return false; }
      }
    }
    return true;
  }

  function validateStep2() {
    setError("");
    if (!nome.trim()) { setError("Informe seu nome completo."); return false; }
    if (!nascimento) { setError("Informe sua data de nascimento."); return false; }
    const dt = new Date(nascimento); if (Number.isNaN(+dt) || dt > new Date()) { setError("Data de nascimento inválida."); return false; }

    // e-mail pode já ter sido usado no passo 1 (docente email)
    const needEmail = (role === "aluno") || (idTypeDocente !== "email");
    if (needEmail) {
      if (!isEmail(email)) { setError("Informe um e-mail válido."); return false; }
      if (!hasInstDomain(email) && (role !== "aluno")) { setError("Use seu e-mail institucional."); return false; }
    }

    if (celular && onlyDigits(celular).length < 10) { setError("Celular incompleto."); return false; }

    if (role === "aluno") {
      if (!turma.trim()) { setError("Selecione sua turma."); return false; }
      if (!turno.trim()) { setError("Selecione seu turno."); return false; }
      const age = ageFrom(nascimento);
      if (age !== null && age < 18) {
        if (!respNome.trim() || !isEmail(respEmail)) { setError("Informe nome e e-mail do responsável."); return false; }
      }
    }

    if (role === "professor") {
      if (!departamento.trim()) { setError("Informe seu departamento."); return false; }
    }
    if (role === "gestor") {
      if (!unidade.trim()) { setError("Informe sua unidade/órgão."); return false; }
    }

    if (!lgpdOk) { setError("É necessário concordar com a Política de Privacidade e os Termos."); return false; }

    return true;
  }

  function validateStep3() {
    setError("");
    if (!otpSent) { setError("Envie o código antes de verificar."); return false; }
    if (!/^\d{6}$/.test(otp)) { setError("Digite o código de 6 dígitos."); return false; }
    return true;
  }

  function validateStep4() {
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
    if (!validateStep4()) return;
    setLoading(true); setError("");
    setTimeout(() => {
      setLoading(false);
      if (policy === "solicitacao") {
        setSuccessMsg("Solicitação enviada! Você receberá um e-mail quando for aprovada.");
      } else {
        setSuccessMsg("Conta criada com sucesso! Você já pode entrar.");
      }
      setStep(5);
    }, 1000);
  }

  // Labels e textos ------------------------------------------------------
  const title = step <= 4 ? "Criar conta" : (policy === "solicitacao" ? "Solicitação enviada" : "Conta criada");
  const subtitle = step <= 4 ? "Leva menos de 2 minutos." : (policy === "solicitacao" ? "Aguardando aprovação da escola." : "Tudo pronto!");

  // Views ----------------------------------------------------------------
  return (
    <div className={rootClass} role="main" aria-label="Tela de criar conta">
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
          <p className="lp-aside-text">Cadastro simples, acessível e seguro.</p>
        </aside>

        {/* Card principal */}
        <div className="lp-card" aria-label="Criar conta">
          <h1 className="lp-title">{title}</h1>
          <p className="lp-subtitle">{subtitle}</p>

          {step <= 4 && (
            <Stepper step={step} steps={["Identificação", "Dados", "Verificação", "Segurança"]} />
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

              {/* Escolha de identificador por papel */}
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
                <div className="lp-grid2">
                  <div>
                    <label className="lp-label">Tipo de identificação (Docente/Gestor)</label>
                    <div className="lp-role" role="radiogroup" aria-label="Tipo de identificação do docente/gestor">
                      {(["email", "registro"]).map((t) => (
                        <label key={t} className={"lp-role-item " + (idTypeDocente === t ? "is-active" : "")}>
                          <input type="radio" name="idDoc" value={t} checked={idTypeDocente === t} onChange={()=>setIdTypeDocente(t)} aria-checked={idTypeDocente === t} />
                          <span className="lp-role-text">{t === "email" ? "E-mail institucional" : "Registro funcional"}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="lp-label" htmlFor="idDoc">{idTypeDocente === "email" ? "E-mail institucional" : "Registro funcional"}</label>
                    <input id="idDoc" className="lp-input" type="text" inputMode={idTypeDocente === "email" ? "email" : "text"} placeholder={idTypeDocente === "email" ? (institutionalDomain ? `nome${institutionalDomain}` : "nome@escola.edu.br") : "ABC123"} value={identifier} onChange={(e)=>setIdentifier(e.target.value)} aria-required="true" />
                  </div>
                </div>
              )}

              <div className="lp-actions">
                <button className="lp-btn-primary" onClick={next}>Continuar</button>
                    <Link className="lp-btn-ghost" to="/login">Já tenho conta</Link>    
                </div>
            </div>
          )}

          {step === 2 && (
            <div className="lp-form">
              <div className="lp-grid2">
                <div className="lp-field">
                  <label className="lp-label" htmlFor="nome">Nome completo</label>
                  <input id="nome" className="lp-input" type="text" value={nome} onChange={(e)=>setNome(e.target.value)} aria-required="true" />
                </div>
                <div className="lp-field">
                  <label className="lp-label" htmlFor="nasc">Data de nascimento</label>
                  <input id="nasc" className="lp-input" type="date" value={nascimento} onChange={(e)=>setNascimento(e.target.value)} aria-required="true" max={new Date().toISOString().slice(0,10)} />
                </div>
              </div>

              {/* e-mail pode ter sido inserido no Passo 1 (docente com email). Se não, pedir aqui */}
              {!(role !== "aluno" && idTypeDocente === "email") && (
                <div className="lp-field">
                  <label className="lp-label" htmlFor="mail">E-mail</label>
                  <input id="mail" className="lp-input" type="email" placeholder="voce@email.com" value={email} onChange={(e)=>setEmail(e.target.value)} aria-required="true" />
                </div>
              )}

              <div className="lp-field">
                <label className="lp-label" htmlFor="cel">Celular (opcional)</label>
                <input id="cel" className="lp-input" type="tel" placeholder="(81) 98888-8888" value={celular} onChange={(e)=>setCelular(maskPhoneBR(e.target.value))} />
              </div>

              {role === "aluno" && (
                <div className="lp-grid2">
                  <div className="lp-field">
                    <label className="lp-label" htmlFor="turma">Turma</label>
                    <input id="turma" className="lp-input" type="text" placeholder="1º A" value={turma} onChange={(e)=>setTurma(e.target.value)} aria-required="true" />
                  </div>
                  <div className="lp-field">
                    <label className="lp-label" htmlFor="turno">Turno</label>
                    <select id="turno" className="lp-input" value={turno} onChange={(e)=>setTurno(e.target.value)} aria-required="true">
                      <option value="">Selecione</option>
                      <option value="manhã">Manhã</option>
                      <option value="tarde">Tarde</option>
                      <option value="noite">Noite</option>
                    </select>
                  </div>
                </div>
              )}

              {role === "professor" && (
                <div className="lp-grid2">
                  <div className="lp-field">
                    <label className="lp-label" htmlFor="dep">Departamento</label>
                    <input id="dep" className="lp-input" type="text" placeholder="Linguagens" value={departamento} onChange={(e)=>setDepartamento(e.target.value)} aria-required="true" />
                  </div>
                  <div className="lp-field">
                    <label className="lp-label" htmlFor="disc">Disciplina/Área</label>
                    <input id="disc" className="lp-input" type="text" placeholder="Português" value={disciplina} onChange={(e)=>setDisciplina(e.target.value)} />
                  </div>
                </div>
              )}

              {role === "gestor" && (
                <div className="lp-field">
                  <label className="lp-label" htmlFor="unidade">Unidade/Órgão</label>
                  <input id="unidade" className="lp-input" type="text" placeholder="Coordenação Pedagógica" value={unidade} onChange={(e)=>setUnidade(e.target.value)} aria-required="true" />
                </div>
              )}

              {/* Se menor de idade, exigir dados do responsável */}
              {(() => { const age = ageFrom(nascimento); return age !== null && age < 18; })() && (
                <div className="lp-grid2">
                  <div className="lp-field">
                    <label className="lp-label" htmlFor="rnome">Responsável (nome)</label>
                    <input id="rnome" className="lp-input" type="text" value={respNome} onChange={(e)=>setRespNome(e.target.value)} aria-required="true" />
                  </div>
                  <div className="lp-field">
                    <label className="lp-label" htmlFor="rmail">Responsável (e-mail)</label>
                    <input id="rmail" className="lp-input" type="email" value={respEmail} onChange={(e)=>setRespEmail(e.target.value)} aria-required="true" />
                  </div>
                </div>
              )}

              {/* Registro funcional — se no passo 1 usuário escolheu registro e não e-mail */}
              {(role !== "aluno" && idTypeDocente === "registro") && (
                <div className="lp-field">
                  <label className="lp-label" htmlFor="reg">Registro funcional</label>
                  <input id="reg" className="lp-input" type="text" value={registroFuncional} onChange={(e)=>setRegistroFuncional(e.target.value)} aria-required="true" />
                </div>
              )}

              <label className="lp-check" style={{marginTop:8}}>
                <input type="checkbox" checked={lgpdOk} onChange={(e)=>setLgpdOk(e.target.checked)} />
                <span>Li e concordo com a <a className="lp-link" href="#priv" onClick={(e)=>e.preventDefault()}>Política de Privacidade</a> e os <a className="lp-link" href="#termos" onClick={(e)=>e.preventDefault()}>Termos</a>.</span>
              </label>

              <div className="lp-actions">
                <button className="lp-btn-secondary" onClick={back}>Voltar</button>
                <button className="lp-btn-primary" onClick={next}>Continuar</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="lp-form">
              <div className="lp-field">
                <label className="lp-label">Como prefere receber o código?</label>
                <div className="lp-role" role="radiogroup" aria-label="Método de verificação">
                  <label className={"lp-role-item " + (verifyMethod === "email" ? "is-active" : "")}>
                    <input type="radio" name="vmethod" value="email" checked={verifyMethod === "email"} onChange={()=>setVerifyMethod("email")} />
                    <span className="lp-role-text">E-mail</span>
                  </label>
                  <label className={"lp-role-item " + (verifyMethod === "sms" ? "is-active" : "")}>
                    <input type="radio" name="vmethod" value="sms" checked={verifyMethod === "sms"} onChange={()=>setVerifyMethod("sms")} />
                    <span className="lp-role-text">SMS</span>
                  </label>
                </div>
              </div>

              <div className="lp-field lp-grid2">
                <div>
                  <button className="lp-btn-secondary" onClick={(e)=>{e.preventDefault(); sendOtp();}} disabled={resendIn>0}>{resendIn>0?`Reenviar em ${resendIn}s`:"Enviar código"}</button>
                  {otpSent && <p className="lp-help">Código enviado. Verifique sua caixa de entrada.</p>}
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

          {step === 4 && (
            <div className="lp-form">
              <div className="lp-field">
                <label className="lp-label" htmlFor="pwd">Senha</label>
                <input id="pwd" className="lp-input" type="password" placeholder="Crie uma senha forte" value={pwd} onChange={(e)=>setPwd(e.target.value)} aria-required="true" />
                <PasswordMeter score={pwdScore} />
                <p className="lp-help">Use 8+ caracteres, misturando maiúsculas, minúsculas, números e símbolo.</p>
              </div>
              <div className="lp-field">
                <label className="lp-label" htmlFor="pwd2">Confirmar senha</label>
                <input id="pwd2" className="lp-input" type="password" placeholder="Repita a senha" value={pwd2} onChange={(e)=>setPwd2(e.target.value)} aria-required="true" />
              </div>

              <label className="lp-check" style={{marginBottom:12}}>
                <input type="checkbox" checked={twofa} onChange={(e)=>setTwofa(e.target.checked)} />
                <span>Quero ativar verificação em duas etapas depois</span>
              </label>

              <div className="lp-actions">
                <button className="lp-btn-secondary" onClick={back}>Voltar</button>
                <button className="lp-btn-primary" onClick={(e)=>{e.preventDefault(); finish();}} disabled={loading}>
                  {loading ? (policy === "solicitacao" ? "Enviando…" : "Criando…") : (policy === "solicitacao" ? "Enviar solicitação" : "Concluir cadastro")}
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="lp-success" role="status" aria-live="polite">
              <div className="lp-success-icon" aria-hidden>✓</div>
              <h2 className="lp-title" style={{marginTop:8}}>{policy === "solicitacao" ? "Solicitação enviada" : "Conta criada"}</h2>
              <p className="lp-subtitle">{successMsg}</p>
              <div className="lp-actions">
                <Link className="lp-btn-primary" to="/login">Ir para o login</Link>
                <Link className="lp-btn-ghost" to="/ajuda">Ajuda</Link>
              </div>
            </div>
          )}

          <footer className="lp-footer-links">
            <a href="#termos" onClick={(e)=>e.preventDefault()}>Termos</a>
            <span>•</span>
            <a href="#priv" onClick={(e)=>e.preventDefault()}>Privacidade</a>
            <span>•</span>
            <a href="#ajuda" onClick={(e)=>e.preventDefault()}>Ajuda</a>
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
    <div className="lp-stepper" aria-label="Progresso de cadastro">
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
