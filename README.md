# Projeto Escolar — Protótipo (React + Vite)

Plataforma educacional focada em acessibilidade e simplicidade cognitiva para alunos, professores e gestores. Este repositório contém um **protótipo front‑end** (sem backend) com rotas para visão do aluno e do professor/gestor, uso de **localStorage** para persistência simples e componentes de UI com **Recharts** e **lucide‑react**.

> **Status:** MVP pedagógico em evolução. Orientado a testes rápidos de usabilidade para públicos neurodivergentes.

---

## 📌 Sumário

* [Visão Geral](#-visão-geral)
* [Requisitos](#-requisitos)
* [Instalação](#-instalação)
* [Execução (dev)](#-execução-dev)
* [Build e Preview](#-build-e-preview)
* [Stack e Dependências](#-stack-e-dependências)
* [Estrutura de Pastas](#-estrutura-de-pastas)
* [Rotas e Navegação](#-rotas-e-navegação)
* [Dados Locais (localStorage)](#-dados-locais-localstorage)
* [Estilo e Acessibilidade](#-estilo-e-acessibilidade)
* [Fluxos Principais](#-fluxos-principais)
* [Boas Práticas](#-boas-práticas)
* [Solução de Problemas](#-solução-de-problemas)
* [Roadmap](#-roadmap)
* [Licença](#-licença)

---

## 🔎 Visão Geral

* **Objetivo:** oferecer uma base reutilizável para aulas, avaliações, materiais e acompanhamento, com foco em UX acessível.
* **Públicos:** Aluno, Professor, Gestor.
* **Persistência:** `localStorage` (sem backend). Chaves: `school.items.v1` e `school.roster.v1`.
* **Gráficos e ícones:** `recharts` e `lucide-react`.
* **Roteamento:** `react-router-dom`.

---

## ✅ Requisitos

* **Node.js**: 18 ou 20+ (recomendado LTS)
* **npm** (ou **pnpm**/**yarn**)
* **Git** (opcional para clonar o repositório)

> Verifique sua versão: `node -v` e `npm -v`.

---

## ⬇️ Instalação

Clonando o projeto e instalando dependências:

```bash
# 1) Clone
git clone <URL-do-repositorio>
cd <pasta-do-projeto>

# 2) Instale dependências
npm install

# 3) (Opcional) Caso deseje iniciar um projeto novo com Vite
# npm create vite@latest escola-prototipo -- --template react
# cd escola-prototipo && npm install
```

Dependências sugeridas (se ainda não constarem no package.json):

```bash
npm install react-router-dom recharts lucide-react
# Dev tooling
npm install -D eslint prettier
```

---

## ▶️ Execução (dev)

```bash
npm run dev
```

Acesse: **[http://localhost:5173](http://localhost:5173)**

---

## 📦 Build e Preview

```bash
npm run build
npm run preview
```

`preview` sobe um servidor local para inspecionar os arquivos gerados em `dist/`.

---

## 🧰 Stack e Dependências

* **Core:** React 18 + Vite
* **Roteamento:** `react-router-dom`
* **Gráficos:** `recharts`
* **Ícones:** `lucide-react`
* **Estilos:** CSS global + arquivo `dash.css` (pode evoluir para CSS Modules/Tailwind se necessário)
* **Qualidade:** ESLint + Prettier (opcional)

> Caso utilize TypeScript: iniciar com template `--template react-ts` e garantir tipagens das libs.

---

## 🗂️ Estrutura de Pastas

Estrutura sugerida (ajuste conforme seu contexto):

```
src/
  assets/
  components/
    Header.jsx
    Footer.jsx
    CardDisciplina.jsx
  pages/
    auth/
      Login.jsx
      CriarConta.jsx
    aluno/
      Disciplinas.jsx
      Materiais.jsx
      Avaliacoes.jsx
      Cronograma.jsx
      SubjectTopics.jsx
    prof/
      DashboardEducacional.jsx
  routes/
    AppRoutes.jsx
  styles/
    dash.css
  lib/
    storage.js         # helpers para localStorage
    seed.js            # (opcional) util para semear dados
  App.jsx
  main.jsx
index.html
```

---

## 🧭 Rotas e Navegação

Exemplo de configuração com `react-router-dom`:

```jsx
// src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import CriarConta from '../pages/auth/CriarConta';
import Disciplinas from '../pages/aluno/Disciplinas';
import Materiais from '../pages/aluno/Materiais';
import Avaliacoes from '../pages/aluno/Avaliacoes';
import Cronograma from '../pages/aluno/Cronograma';
import SubjectTopics from '../pages/aluno/SubjectTopics';
import DashboardEducacional from '../pages/prof/DashboardEducacional';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/criar-conta" element={<CriarConta />} />

        {/* Aluno */}
        <Route path="/aluno/disciplinas" element={<Disciplinas />} />
        <Route path="/aluno/materiais" element={<Materiais />} />
        <Route path="/aluno/avaliacoes" element={<Avaliacoes />} />
        <Route path="/aluno/cronograma" element={<Cronograma />} />
        <Route path="/aluno/disciplinas/:id/topicos" element={<SubjectTopics />} />

        {/* Professor/Gestor */}
        <Route path="/prof/dashboard" element={<DashboardEducacional />} />

        {/* Fallback */}
        <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
```

No `main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRoutes from './routes/AppRoutes'
import './styles/dash.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
)
```

---

## 💾 Dados Locais (localStorage)

O protótipo utiliza `localStorage` com as chaves:

* `school.roster.v1` → **turmas, alunos, disciplinas**
* `school.items.v1` → **itens criados** (atividades/avaliações)

### Esquemas sugeridos

```json
// school.roster.v1
{
  "turmas": [
    {
      "id": "1A",
      "nome": "1º A",
      "disciplinas": [
        { "id": "mat", "nome": "Matemática" },
        { "id": "por", "nome": "Língua Portuguesa" }
      ],
      "alunos": [
        { "id": "a01", "nome": "Ana Silva" },
        { "id": "a02", "nome": "Bruno Souza" }
      ]
    }
  ]
}
```

```json
// school.items.v1
{
  "itens": [
    {
      "id": "item-001",
      "tipo": "atividade",          // atividade | avaliacao | material
      "titulo": "AV1 - Frações",
      "descricao": "Exercícios introdutórios de frações.",
      "turmaId": "1A",
      "disciplinaId": "mat",
      "data": "2025-09-10",
      "status": "publicado"
    }
  ]
}
```

### Como semear rapidamente (Console do navegador)

Abra o DevTools (F12) → Console e cole:

```js
localStorage.setItem('school.roster.v1', JSON.stringify({
  turmas: [
    { id: '1A', nome: '1º A',
      disciplinas: [ { id: 'mat', nome: 'Matemática' }, { id: 'por', nome: 'Língua Portuguesa' } ],
      alunos: [ { id: 'a01', nome: 'Ana Silva' }, { id: 'a02', nome: 'Bruno Souza' } ]
    }
  ]
}))

localStorage.setItem('school.items.v1', JSON.stringify({
  itens: [
    { id: 'item-001', tipo: 'atividade', titulo: 'AV1 - Frações', descricao: 'Exercícios', turmaId: '1A', disciplinaId: 'mat', data: '2025-09-10', status: 'publicado' }
  ]
}))
```

> Crie helpers em `src/lib/storage.js` para ler/escrever de forma segura e validar estruturas.

---

## 🎨 Estilo e Acessibilidade

* **CSS:** arquivo `src/styles/dash.css` para estilos globais.
* **Acessibilidade cognitiva:**

  * Tipografia legível, espaçamento generoso, botões grandes.
  * **Alto contraste** opcional (classe `.hc-mode` no `body`).
  * **Reduzir animações** quando `prefers-reduced-motion` estiver ativo.
  * **Teclado**: todos os elementos acionáveis devem ter `:focus` visível.

Exemplo inicial do `dash.css`:

```css
:root { --radius: 14px; --gap: 12px; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, Arial, sans-serif; background: #f7f9fc; color: #111; }
.hc-mode body { background: #000; color: #fff; }

.container { max-width: 1080px; margin: 0 auto; padding: 24px; }
.card { background: #fff; border-radius: var(--radius); padding: 16px; box-shadow: 0 6px 24px rgba(0,0,0,.06); }
.btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 999px; border: 1px solid #e5e7eb; cursor: pointer; }
.btn:focus { outline: 3px solid #2563eb55; outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

---

## 🧭 Fluxos Principais

**Aluno**

* `/aluno/disciplinas` → cartões de disciplinas.
* `/aluno/materiais` → materiais listados; estados vazios claros.
* `/aluno/avaliacoes` → avaliações/atividades; marcar concluída/entregue.
* `/aluno/cronograma` → visão de datas.
* `/aluno/disciplinas/:id/topicos` → tópicos/assuntos.

**Professor/Gestor**

* `/prof/dashboard` → gráficos (Recharts) e KPIs com base em `localStorage`.
* (Evoluções possíveis: CRUD de itens, filtros por turma/periodicidade.)

---

## 🌟 Boas Práticas

* Componentizar cartões, listas e estados vazios.
* Manter **imports únicos** (evite importar a mesma lib duas vezes no mesmo arquivo).
* Centralizar helpers de `localStorage` em `src/lib/` com validação simples.
* Nomear rotas de forma descritiva e consistente.
* Aderir a **Conventional Commits** (ex.: `feat:`, `fix:`, `docs:`).

---

## 🧯 Solução de Problemas

**1) Navegação não funciona ao clicar em botões**

* Garanta que o app esteja dentro de `<BrowserRouter>`.
* Use `<Link to="/caminho">` ou `useNavigate()` ao invés de `window.location`.

**2) Erro de import duplicado (ex.: Recharts)**

* Evite duplicar imports no mesmo arquivo. Prefira **um bloco**:

  ```jsx
  import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
  ```

**3) Porta 5173 ocupada**

* Rode `npm run dev -- --port 5174` ou encerre o processo que está usando 5173.

**4) Git: `error: remote origin already exists`**

```bash
git remote -v              # ver remotes
git remote remove origin   # remover antigo
git remote add origin https://github.com/<user>/<repo>.git
```

**5) Imagens e assets não aparecem**

* Coloque arquivos em `src/assets` e importe via `import img from '@/assets/…'` (ou relativo). Ajuste alias no `vite.config.js` se usar `@`.

---

## 🗺️ Roadmap

* [ ] CRUD de itens (materiais/atividades/avaliações) no front com validação.
* [ ] Filtros por turma/disciplinas, busca e paginação simples.
* [ ] Modo Alto Contraste com toggle visível no Header.
* [ ] Estado offline‑first (sincronização futura com backend).
* [ ] Testes de usabilidade com alunos neurodivergentes (checklists de acessibilidade).
* [ ] Integração futura com backend (Node/Express, MySQL) e autenticação.

---

## 🪪 Licença

Defina a licença do projeto (MIT, Apache‑2.0, etc.).

---

### ✉️ Contato

Para dúvidas e sugestões, abra uma issue ou entre em contato com a manutenção do
