import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Login.jsx";
import CreateAccountPage from "./CreateAccountPage.jsx";
import RecoverPasswordPage from "./RecoverPasswordPage.jsx";
import SubjectsGridPage from "./SubjectsGridPage.jsx";
import SubjectTopicsPage from "./SubjectTopicsPages.jsx";
import Materiais from "./Materiais.jsx";
import Avaliacoes from "./avaliacoes.jsx";
import Cronograma from "./cronograma.jsx";
import CreateItemsPrototype from "./CreateItemsPrototype.jsx";
import Educacional from "./Educacional.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/criar-conta" element={<CreateAccountPage policy="auto" />} />
      <Route path="/solicitar-acesso" element={<CreateAccountPage policy="solicitacao" />} />
      <Route path="/recuperar-senha" element={<RecoverPasswordPage />} />

      {/* atalhos do aluno */}
      <Route path="/aluno" element={<Navigate to="/aluno/disciplinas" replace />} />
      <Route path="/aluno/disciplinas" element={<SubjectsGridPage />} />
      <Route path="/aluno/disciplinas/:id" element={<SubjectTopicsPage />} />
      <Route path="/aluno/disciplinas/:id/materiais" element={<Materiais />} />
      <Route path="/aluno/disciplinas/:id/avaliacoes" element={<Avaliacoes />} />
      <Route path="/aluno/disciplinas/:id/cronograma" element={<Cronograma />} />
      <Route path="/prof/itens" element={<CreateItemsPrototype/>} />
      {/* 404 sempre por último */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    {/* Rota dos Professores e adminstradores do sistema*/}
    <Route path="/prof/dashboard" element={<Educacional/>} />

    </Routes>
  );
}
