// SubjectTopicsPages.jsx
import { Link, useParams, useLocation } from "react-router-dom";

// (opcional) mapa de nomes; se não tiver, a tela usa "Disciplina"
const MAPA_DISCIPLINAS = { mat: "Matemática", por: "Português", his: "História" };
// (opcional) mock de tópicos; se não existir para o id, tratamos como lista vazia
const TOPICOS = {
  mat: [
    { id: "fra-01", titulo: "Frações — Parte 1", duracaoMin: 15, status: "feito" },
    { id: "fra-02", titulo: "Frações — Parte 2", duracaoMin: 20, status: "andamento" },
  ],
  por: [],
  his: [],
};

export default function SubjectTopicsPages() {
  const { id } = useParams();            // <-- use o MESMO nome da rota
  const loc = useLocation();

  if (!id) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Disciplina não encontrada</h1>
        <p>Verifique o endereço ou volte para a lista de disciplinas.</p>
        <Link to="/aluno/disciplinas">
          <button>Voltar para Disciplinas</button>
        </Link>
      </main>
    );
  }

  // nome vem do state do Link OU do mapa local; se nada existir, usa "Disciplina"
  const nome = loc.state?.nome || MAPA_DISCIPLINAS[id] || "Disciplina";
  const topicos = (TOPICOS && TOPICOS[id]) ?? []; // se undefined, vira lista vazia

  return (
    <main style={{ padding: 24 }}>
      <header>
        <h1>{nome} — Conteúdos</h1>
        <nav style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <Link to={`/aluno/disciplinas/${id}`} style={tab(true)}>Conteúdos</Link>
          <Link to={`/aluno/disciplinas/${id}/materiais`} style={tab()}>Materiais</Link>
          <Link to={`/aluno/disciplinas/${id}/avaliacoes`} style={tab()}>Avaliações</Link>
          <Link to={`/aluno/disciplinas/${id}/cronograma`} style={tab()}>Cronograma</Link>
        </nav>
      </header>

      {topicos.length === 0 ? (
        <section style={{ marginTop: 24 }}>
          <p>Nenhum conteúdo por aqui ainda.</p>
          <small>Sugestão: volte depois ou revise outra disciplina.</small>
        </section>
      ) : (
        <ul style={{ marginTop: 16, listStyle: "none", padding: 0 }}>
          {topicos.map((t) => (
            <li key={t.id}
                style={{ display: "flex", justifyContent: "space-between", padding: 12,
                         border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 10 }}>
              <div>
                <strong>{t.titulo}</strong>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {t.duracaoMin} min • {statusLabel(t.status)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => alert("Marcar como concluído (mock)")} style={btnSecondary}>Concluir</button>
                <button onClick={() => alert("Modo Foco (em breve)")} style={btnPrimary}>Estudar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

const tab = (active=false) => ({
  padding: "8px 12px",
  borderRadius: 8,
  textDecoration: "none",
  background: active ? "#111827" : "#f3f4f6",
  color: active ? "white" : "#111827",
});
const btnPrimary = { padding: "8px 12px", borderRadius: 8, border: "none", background: "#111827", color: "white" };
const btnSecondary = { padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white" };
function statusLabel(s){ return s==="feito"?"Concluído":s==="andamento"?"Em andamento":"A fazer"; }
