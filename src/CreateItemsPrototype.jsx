import React, { useEffect, useMemo, useState } from "react";

/**
 * CreateItemsPrototype.jsx — Protótipo sem backend para criar Atividades e Avaliações
 * Escopos: Geral (por turma) e Individual (por aluno)
 * Persistência local: localStorage
 * Como usar: importe e renderize <CreateItemsPrototype /> em uma rota da sua app.
 * Ex.: <Route path="/prof/itens" element={<CreateItemsPrototype/>} />
 */

// ===== Util =====
const uid = () => (window.crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
const LS_ITEMS_KEY = "school.items.v1"; // itens criados (atividades/avaliacoes)
const LS_ROSTER_KEY = "school.roster.v1"; // turmas, alunos, disciplinas

// ===== Sementes (mock) =====
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

function saveItems(items) {
  localStorage.setItem(LS_ITEMS_KEY, JSON.stringify(items));
}

// ===== Componentes =====
function Section({ title, children, right }) {
  return (
    <section style={{
      background: "var(--card-bg)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      boxShadow: "var(--shadow)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
        <div>{right}</div>
      </div>
      {children}
    </section>
  );
}

function Pill({ children }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      border: "1px solid var(--border)",
      background: "var(--pill-bg)",
      fontSize: 12,
      marginRight: 6,
      marginBottom: 6,
    }}>{children}</span>
  );
}

function Checkbox({ id, label, checked, onChange, disabled }) {
  return (
    <label htmlFor={id} style={{ display: "inline-flex", alignItems: "center", gap: 8, marginRight: 16, opacity: disabled ? 0.6 : 1 }}>
      <input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={e => onChange?.(e.target.checked)} />
      {label}
    </label>
  );
}

function Radio({ name, value, checked, onChange, label }) {
  const id = `${name}_${value}`;
  return (
    <label htmlFor={id} style={{ display: "inline-flex", alignItems: "center", gap: 8, marginRight: 16 }}>
      <input id={id} type="radio" name={name} value={value} checked={checked} onChange={e => onChange?.(e.target.value)} />
      {label}
    </label>
  );
}

function TextInput({ id, label, value, onChange, type = "text", placeholder, required }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 14 }}>{label}{required ? " *" : ""}</label>
      <input id={id} type={type} placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)}
        style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
        required={required}
      />
    </div>
  );
}

function TextArea({ id, label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 14 }}>{label}</label>
      <textarea id={id} placeholder={placeholder} rows={rows} value={value} onChange={e => onChange?.(e.target.value)}
        style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
      />
    </div>
  );
}

function Select({ id, label, value, onChange, options = [], multiple = false, placeholder }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 14 }}>{label}</label>
      <select id={id} value={value} onChange={e => onChange?.(multiple ? Array.from(e.target.selectedOptions).map(o => o.value) : e.target.value)} multiple={multiple}
        style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
      >
        {!multiple && <option value="">{placeholder || "Selecione"}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function Divider() {
  return <hr style={{ borderColor: "var(--border)", margin: "16px 0" }} />;
}

function Button({ children, onClick, variant = "primary", type = "button", disabled }) {
  const styles = {
    primary: { background: "var(--accent)", color: "#000", border: "1px solid var(--accent)" },
    ghost: { background: "transparent", color: "var(--fg)", border: "1px solid var(--border)" },
    danger: { background: "#c62828", color: "#fff", border: "1px solid #b71c1c" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...styles[variant], padding: "10px 14px", borderRadius: 12, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1 }}
    >{children}</button>
  );
}

// ===== Main =====
export default function CreateItemsPrototype() {
  const [contrast, setContrast] = useState(false);
  const [roster, setRoster] = useState(loadRoster());
  const [items, setItems] = useState(loadItems());

  // Filtros/listagem
  const [tab, setTab] = useState("nova");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEscopo, setFilterEscopo] = useState("todos");
  const [q, setQ] = useState("");

  // Formulário
  const [tipo, setTipo] = useState("atividade"); // atividade | avaliacao
  const [escopo, setEscopo] = useState("geral"); // geral | individual
  const [turmasSelecionadas, setTurmasSelecionadas] = useState([]); // para geral e individual
  const [alunosSelecionados, setAlunosSelecionados] = useState([]); // para individual
  const [disciplina, setDisciplina] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [pontos, setPontos] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");

  // Acessibilidade/adaptações
  const [fonteMaior, setFonteMaior] = useState(false);
  const [tempoExtra, setTempoExtra] = useState(false);
  const [materialAlternativo, setMaterialAlternativo] = useState("");

  useEffect(() => {
    // Tema/contraste — define CSS vars
    const root = document.documentElement;
    root.style.setProperty("--bg", contrast ? "#0a0a0a" : "#f7f7fb");
    root.style.setProperty("--fg", contrast ? "#ffffff" : "#111111");
    root.style.setProperty("--card-bg", contrast ? "#121212" : "#ffffff");
    root.style.setProperty("--input-bg", contrast ? "#1a1a1a" : "#ffffff");
    root.style.setProperty("--border", contrast ? "#444" : "#e1e1e7");
    root.style.setProperty("--pill-bg", contrast ? "#1b1b1b" : "#fafafa");
    root.style.setProperty("--shadow", contrast ? "none" : "0 2px 8px rgba(0,0,0,.06)");
    root.style.setProperty("--accent", contrast ? "#ffeb3b" : "#a7f3d0");
  }, [contrast]);

  // Helpers
  const turmaOptions = useMemo(() => roster.turmas.map(t => ({ value: t.id, label: t.nome })), [roster]);
  const disciplinaOptions = useMemo(() => roster.disciplinas.map(d => ({ value: d, label: d })), [roster]);
  const alunosPorTurma = useMemo(() => {
    const map = Object.fromEntries(roster.turmas.map(t => [t.id, []]));
    roster.alunos.forEach(a => map[a.turma]?.push(a));
    return map;
  }, [roster]);

  const itensFiltrados = useMemo(() => {
    return items.filter(it => {
      if (filterTipo !== "todos" && it.tipo !== filterTipo) return false;
      if (filterEscopo !== "todos" && it.escopo !== filterEscopo) return false;
      if (q) {
        const text = `${it.titulo} ${it.descricao} ${it.disciplina}`.toLowerCase();
        if (!text.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [items, filterTipo, filterEscopo, q]);

  function resetForm() {
    setTipo("atividade");
    setEscopo("geral");
    setTurmasSelecionadas([]);
    setAlunosSelecionados([]);
    setDisciplina("");
    setTitulo("");
    setDescricao("");
    setPontos("");
    setDataEntrega("");
    setFonteMaior(false);
    setTempoExtra(false);
    setMaterialAlternativo("");
  }

  function toggleTurma(id, checked) {
    setTurmasSelecionadas(prev => checked ? [...new Set([...prev, id])] : prev.filter(t => t !== id));
    if (!checked) {
      // Remover alunos daquela turma se escopo individual
      setAlunosSelecionados(prev => prev.filter(aid => roster.alunos.find(a => a.id === aid)?.turma !== id));
    }
  }

  function toggleAluno(id, checked) {
    setAlunosSelecionados(prev => checked ? [...new Set([...prev, id])] : prev.filter(a => a !== id));
  }

  function handleSalvar(e) {
    e.preventDefault();
    // Validações simples
    if (!titulo.trim()) return alert("Informe um título.");
    if (!disciplina) return alert("Selecione a disciplina.");
    if (escopo === "geral" && turmasSelecionadas.length === 0) return alert("Selecione pelo menos uma turma.");
    if (escopo === "individual" && alunosSelecionados.length === 0) return alert("Selecione pelo menos um aluno.");

    const novo = {
      id: uid(),
      tipo, // "atividade" | "avaliacao"
      escopo, // "geral" | "individual"
      turmas: [...turmasSelecionadas],
      alunos: [...alunosSelecionados],
      disciplina,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      pontos: pontos ? Number(pontos) : null,
      dataEntrega: dataEntrega || null,
      adaptacoes: { fonteMaior, tempoExtra, materialAlternativo: materialAlternativo.trim() || null },
      criadoEm: new Date().toISOString(),
      status: "aberta", // futura evolução: rascunho, aberta, encerrada
    };

    const next = [novo, ...items];
    setItems(next);
    saveItems(next);
    setTab("lista");
    resetForm();
  }

  function handleExcluir(id) {
    if (!confirm("Excluir este item?")) return;
    const next = items.filter(it => it.id !== id);
    setItems(next);
    saveItems(next);
  }

  function handleLimparTudo() {
    if (!confirm("Apagar TODAS as atividades/avaliações?")) return;
    setItems([]);
    saveItems([]);
  }

  function handleResetarSementes() {
    if (!confirm("Resetar turmas/alunos/disciplinas para as sementes?")) return;
    localStorage.removeItem(LS_ROSTER_KEY);
    setRoster(loadRoster());
    // também limpa seleção dependente
    setTurmasSelecionadas([]);
    setAlunosSelecionados([]);
  }

  // Layout
  return (
    <div style={{ background: "var(--bg)", color: "var(--fg)", minHeight: "100vh", padding: 16 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>Atividades & Avaliações — Protótipo</h1>
          <p style={{ margin: 0, opacity: 0.8 }}>Sem banco de dados (localStorage) • Acessível • Teste rápido</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Checkbox id="ck_contraste" label="Alto contraste" checked={contrast} onChange={setContrast} />
          <Button variant="ghost" onClick={() => setTab("nova")}>
            Nova
          </Button>
          <Button variant="ghost" onClick={() => setTab("lista")}>
            Lista
          </Button>
        </div>
      </header>

      {tab === "nova" && (
        <form onSubmit={handleSalvar} style={{ display: "grid", gap: 16, maxWidth: 940, margin: "0 auto" }}>
          <Section title="Tipo e Escopo">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Radio name="tipo" value="atividade" checked={tipo === "atividade"} onChange={setTipo} label="Atividade" />
              <Radio name="tipo" value="avaliacao" checked={tipo === "avaliacao"} onChange={setTipo} label="Avaliação" />
              <Divider />
              <Radio name="escopo" value="geral" checked={escopo === "geral"} onChange={setEscopo} label="Geral (por turma)" />
              <Radio name="escopo" value="individual" checked={escopo === "individual"} onChange={setEscopo} label="Individual (por aluno)" />
            </div>
          </Section>

          <Section title="Contexto e Público" right={<small style={{ opacity: .7 }}>Defina quem recebe</small>}>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <p style={{ margin: "0 0 8px" }}><strong>Turmas</strong></p>
                {turmaOptions.map(t => (
                  <Checkbox key={t.value} id={`turma_${t.value}`} label={t.label}
                    checked={turmasSelecionadas.includes(t.value)}
                    onChange={(c) => toggleTurma(t.value, c)}
                  />
                ))}
              </div>

              {escopo === "individual" && (
                <div>
                  <p style={{ margin: "8px 0" }}><strong>Alunos</strong> {turmasSelecionadas.length === 0 && <em style={{ opacity: .7 }}>(selecione ao menos uma turma)</em>}</p>
                  {turmasSelecionadas.map(tid => (
                    <div key={tid} style={{ marginBottom: 8, padding: 8, border: "1px dashed var(--border)", borderRadius: 8 }}>
                      <p style={{ margin: 0, fontWeight: 600 }}>Turma {roster.turmas.find(t => t.id === tid)?.nome}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                        {alunosPorTurma[tid].map(a => (
                          <Checkbox key={a.id} id={`al_${a.id}`} label={a.nome}
                            checked={alunosSelecionados.includes(a.id)}
                            onChange={(c) => toggleAluno(a.id, c)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Select id="disciplina" label="Disciplina" value={disciplina} onChange={setDisciplina} options={disciplinaOptions} placeholder="Selecione a disciplina" />
            </div>
          </Section>

          <Section title={tipo === "avaliacao" ? "Detalhes da Avaliação" : "Detalhes da Atividade"}>
            <div style={{ display: "grid", gap: 12 }}>
              <TextInput id="titulo" label="Título" required value={titulo} onChange={setTitulo} placeholder={tipo === "avaliacao" ? "Prova de Matemática - Unidade 2" : "Lista de exercícios de frações"} />
              <TextArea id="descricao" label="Descrição" value={descricao} onChange={setDescricao} placeholder={tipo === "avaliacao" ? "Conteúdos: fracções, MMC, problemas. Tempo: 50 min." : "Resolva as questões 1-10, entregue em PDF ou no caderno."} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <TextInput id="pontos" type="number" label={tipo === "avaliacao" ? "Pontuação Máxima" : "Valor (opcional)"} value={pontos} onChange={setPontos} placeholder={tipo === "avaliacao" ? "10" : "2"} />
                <TextInput id="data" type="datetime-local" label="Data de entrega / aplicação" value={dataEntrega} onChange={setDataEntrega} />
              </div>
            </div>
          </Section>

          <Section title="Acessibilidade e Adaptações">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <Checkbox id="fonteMaior" label="Fonte maior" checked={fonteMaior} onChange={setFonteMaior} />
              <Checkbox id="tempoExtra" label="Tempo extra" checked={tempoExtra} onChange={setTempoExtra} />
            </div>
            <div style={{ marginTop: 12 }}>
              <TextArea id="materialAlt" label="Material alternativo (opcional)" value={materialAlternativo} onChange={setMaterialAlternativo} placeholder="Ex.: versão com pictogramas, vídeo explicativo, alternativa sem desenho muito carregado, etc." />
            </div>
          </Section>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button type="submit">Salvar</Button>
            <Button type="button" variant="ghost" onClick={resetForm}>Limpar</Button>
          </div>
        </form>
      )}

      {tab === "lista" && (
        <div style={{ display: "grid", gap: 16, maxWidth: 1100, margin: "0 auto" }}>
          <Section title="Filtros">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 12 }}>
              <Select id="ftipo" label="Tipo" value={filterTipo} onChange={setFilterTipo} options={[{ value: "todos", label: "Todos" }, { value: "atividade", label: "Atividade" }, { value: "avaliacao", label: "Avaliação" }]} />
              <Select id="fescopo" label="Escopo" value={filterEscopo} onChange={setFilterEscopo} options={[{ value: "todos", label: "Todos" }, { value: "geral", label: "Geral" }, { value: "individual", label: "Individual" }]} />
              <TextInput id="q" label="Busca" value={q} onChange={setQ} placeholder="Título, descrição ou disciplina" />
            </div>
          </Section>

          <Section title={`Itens (${itensFiltrados.length})`} right={<Button variant="danger" onClick={handleLimparTudo}>Apagar tudo</Button>}>
            {itensFiltrados.length === 0 && <p style={{ opacity: .7 }}>Nenhum item encontrado.</p>}
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
              {itensFiltrados.map(it => (
                <li key={it.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, background: "var(--card-bg)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px" }}>{it.titulo}</h3>
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        <Pill>{it.tipo === "avaliacao" ? "Avaliação" : "Atividade"}</Pill>
                        <Pill>{it.escopo === "geral" ? "Geral" : "Individual"}</Pill>
                        <Pill>{it.disciplina}</Pill>
                        {it.pontos != null && <Pill>{it.pontos} pts</Pill>}
                        {it.dataEntrega && <Pill>{new Date(it.dataEntrega).toLocaleString()}</Pill>}
                      </div>
                      {it.descricao && <p style={{ margin: "8px 0 0", opacity: .9 }}>{it.descricao}</p>}
                      <div style={{ marginTop: 8 }}>
                        {it.escopo === "geral" && (
                          <small style={{ opacity: .8 }}>
                            Turmas: {it.turmas.map(tid => roster.turmas.find(t => t.id === tid)?.nome || tid).join(", ")}
                          </small>
                        )}
                        {it.escopo === "individual" && (
                          <small style={{ opacity: .8 }}>
                            Alunos: {it.alunos.map(aid => roster.alunos.find(a => a.id === aid)?.nome || aid).join(", ")}
                          </small>
                        )}
                      </div>
                      {(it.adaptacoes?.fonteMaior || it.adaptacoes?.tempoExtra || it.adaptacoes?.materialAlternativo) && (
                        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap" }}>
                          {it.adaptacoes.fonteMaior && <Pill>Fonte maior</Pill>}
                          {it.adaptacoes.tempoExtra && <Pill>Tempo extra</Pill>}
                          {it.adaptacoes.materialAlternativo && <Pill>Material alternativo</Pill>}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Button variant="danger" onClick={() => handleExcluir(it.id)}>Excluir</Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Admin (apenas para teste)">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button variant="ghost" onClick={handleResetarSementes}>Resetar turmas/alunos/disciplinas</Button>
              <Button variant="ghost" onClick={() => alert(JSON.stringify(roster, null, 2))}>Ver roster (JSON)</Button>
              <Button variant="ghost" onClick={() => alert(JSON.stringify(items, null, 2))}>Exportar itens (JSON)</Button>
            </div>
          </Section>
        </div>
      )}

      <footer style={{ opacity: .7, textAlign: "center", marginTop: 24 }}>
        <small>Protótipo localStorage • Ideal para testes de UX e fluxo antes do backend.</small>
      </footer>
    </div>
  );
}
