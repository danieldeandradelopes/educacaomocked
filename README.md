# Dashboard — Secretaria Municipal de Educação

Protótipo com frontend Next.js + backend simulado (`db/db.json`).

## Rodar

```bash
cd edu
npm install
npm run dev
```

- App: http://localhost:3000  
- JSON Server (REST): http://localhost:4000  

Só o frontend (API embutida via rotas `/api/*` do Next):

```bash
npm run dev:web
```

Regenerar a base mockada:

```bash
npm run db:generate
```

## Telas

| Rota | Tela |
|------|------|
| `/` | Dashboard |
| `/students` | Alunos |
| `/students/[id]` | Aluno 360º |
| `/enrollments` | Matrículas |
| `/attendance` | Frequência |
| `/history` | Histórico |
| `/active-search` | Busca Ativa |
| `/waitlist` | Lista de Espera |
| `/tutoring` | Reforço Escolar |
| `/inclusive` | Educação Inclusiva |
| `/transport` | Transporte |
| `/schools` | Escolas |
| `/teachers` | Professores |
| `/employees` | Funcionários |
| `/staff` | Quadro de Pessoal |
| `/intersectoral` | Intersetorial |
| `/documents` | Documentos |
| `/reports` | Relatórios |
| `/settings` | Configurações |

Código em inglês; interface em português. Dados 100% fictícios.
