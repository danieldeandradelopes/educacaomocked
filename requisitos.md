# DOCUMENTO DE REQUISITOS

## Protótipo do Dashboard de Gestão da Educação Municipal

**Versão:** 1.0
**Tipo:** Protótipo visual / Mockup funcional
**Tecnologia prevista:** Next.js
**Dados:** 100% fictícios/mockados
**Objetivo:** Validação dos requisitos com a Dirigente Municipal de Educação

---

# 1. Objetivo do projeto

Desenvolver um protótipo de um sistema de gestão da educação municipal que permita à Dirigente Municipal de Educação visualizar, de forma rápida e organizada, os principais números, indicadores e situações da rede municipal de ensino.

Nesta primeira etapa, o sistema será desenvolvido apenas como **mockup funcional**, utilizando dados fictícios.

O objetivo principal é apresentar o conceito para a Dirigente e validar:

* quais informações são realmente necessárias;
* quais indicadores devem estar no dashboard;
* quais filtros são importantes;
* quais relatórios precisam existir;
* quais informações devem ser detalhadas;
* quais informações devem ser restritas;
* quais áreas precisam de acompanhamento;
* quais informações devem ser fornecidas por cada setor.

O protótipo não terá, nesta etapa, integração com sistemas externos ou banco de dados real.

---

# 2. Objetivo estratégico

O sistema deverá permitir que a Secretaria de Educação consiga responder rapidamente perguntas como:

* Quantos alunos temos?
* Quantas escolas temos?
* Quantos professores temos?
* Quantos funcionários temos?
* Como está distribuído o quadro de pessoal?
* Quantos funcionários são CIOP?
* Quantos alunos existem em cada escola?
* Como está a frequência escolar?
* Quantos alunos estão em situação de baixa frequência?
* Quantos alunos estão em busca ativa?
* Quantas crianças estão na lista de espera?
* Onde está concentrada a demanda por vagas?
* Quantos alunos estão no reforço escolar?
* Quantos alunos recebem acompanhamento especializado?
* Quantos alunos são transportados?
* Como está o transporte por escola?
* Quais escolas precisam de maior atenção?
* Existem acompanhamentos pendentes?
* Quantos casos estão sendo acompanhados pela rede de proteção?
* Quais relatórios precisam ser apresentados ao prefeito?

O sistema deverá transformar dados administrativos em **informação gerencial para tomada de decisão**.

---

# 3. Público principal

O usuário principal do dashboard será a:

## Dirigente Municipal de Educação

O dashboard deverá priorizar uma visão gerencial e executiva.

Posteriormente, o sistema poderá possuir outros perfis:

* Secretaria de Educação;
* direção escolar;
* coordenação;
* professores;
* funcionários administrativos;
* equipe de busca ativa;
* transporte escolar;
* profissionais da Saúde;
* CAPS;
* Conselho Tutelar;
* outros setores autorizados.

Cada perfil poderá possuir diferentes níveis de acesso.

---

# 4. Conceito geral do sistema

O sistema deverá ser estruturado em três grandes áreas:

## 4.1 Gestão da rede

Informações sobre:

* escolas;
* alunos;
* matrículas;
* professores;
* funcionários;
* quadro de pessoal;
* transporte;
* lista de espera;
* reforço escolar.

## 4.2 Acompanhamento dos alunos

Informações sobre:

* frequência;
* busca ativa;
* histórico escolar;
* educação inclusiva;
* tutores;
* documentos;
* acompanhamento individual.

## 4.3 Acompanhamento intersetorial

Informações relacionadas ao acompanhamento de alunos que necessitem da atuação de diferentes setores, como:

* Educação;
* Saúde;
* CAPS;
* Conselho Tutelar;
* Assistência Social;
* outros órgãos ou serviços.

O acesso às informações sensíveis deverá ser controlado por perfil.

---

# 5. Dashboard principal

A primeira tela deverá ser o:

# Dashboard Executivo

O objetivo é permitir que a dirigente tenha uma visão geral da rede em poucos segundos.

---

## 5.1 Indicadores principais

Apresentar cards para:

### Alunos

**8.426**

* matrículas ativas;
* comparação com período anterior.

### Escolas

**18**

* escolas municipais ativas.

### Professores

**524**

* professores ativos.

### Funcionários

**324**

* funcionários ativos.

### Busca Ativa

**137**

* alunos atualmente em acompanhamento.

### Lista de Espera

**284**

* crianças aguardando vaga.

### Reforço Escolar

**642**

* alunos em acompanhamento de reforço.

### Transporte

**1.186**

* alunos transportados.

### Educação Inclusiva

**428**

* alunos acompanhados.

---

# 6. Filtros globais

O dashboard deverá possuir filtros no topo da página.

Filtros previstos:

* Ano;
* período;
* escola;
* etapa de ensino;
* série/ano;
* turno;
* bairro;
* situação do aluno.

Exemplo:

**Ano:** 2026
**Período:** 01/01/2026 a 30/09/2026
**Escola:** Todas
**Etapa:** Todas
**Turno:** Todos

Os indicadores e gráficos deverão refletir os filtros selecionados.

No mockup, os dados podem ser simulados.

---

# 7. Área de pontos de atenção

Abaixo dos indicadores principais deverá existir uma área:

# Pontos de Atenção

Exemplos:

### Baixa frequência

**137 alunos**

23 novos casos no período.

### Busca ativa

**18 casos sem atualização**

### Lista de espera

**37 crianças aguardando há mais de 60 dias**

### Educação inclusiva

**12 alunos aguardando definição de acompanhamento**

### Documentação

**23 alunos com documentação pendente**

### Acompanhamentos

**9 encaminhamentos aguardando retorno**

Cada item deverá ser clicável e levar para o respectivo detalhamento.

---

# 8. Gestão dos alunos

Criar uma seção:

# Alunos

Indicadores:

* total de alunos;
* alunos por escola;
* alunos por etapa;
* alunos por série;
* alunos por turno;
* alunos por bairro;
* alunos por faixa etária;
* novas matrículas;
* transferências;
* matrículas encerradas.

---

## 8.1 Gráfico — Alunos por escola

Exemplo:

| Escola             | Alunos |
| ------------------ | -----: |
| EMEF João XXIII    |    684 |
| EMEF Maria Silva   |    592 |
| EMEF Paulo Freire  |    541 |
| EMEF Jardim Brasil |    498 |

O gráfico deverá permitir identificar rapidamente a distribuição dos alunos.

---

# 9. Frequência escolar

Criar uma seção:

# Frequência

Indicadores:

* frequência média da rede;
* alunos com frequência regular;
* alunos com baixa frequência;
* alunos abaixo do limite definido;
* evolução da frequência;
* frequência por escola;
* frequência por série.

### Gráfico

**Evolução da frequência escolar**

Exemplo:

| Mês       | Frequência |
| --------- | ---------: |
| Janeiro   |      94,1% |
| Fevereiro |      93,7% |
| Março     |      94,3% |
| Abril     |      92,9% |
| Maio      |      93,4% |
| Junho     |      94,0% |

---

# 10. Busca Ativa

Criar uma seção específica:

# Busca Ativa

Objetivo: acompanhar alunos com baixa frequência ou risco de evasão e registrar as ações realizadas para localizá-los e acompanhá-los.

Indicadores:

* alunos em busca ativa;
* novos casos;
* casos em acompanhamento;
* casos resolvidos;
* alunos localizados;
* alunos que retornaram;
* casos encaminhados;
* casos encerrados;
* casos sem atualização.

---

## 10.1 Situação dos casos

Utilizar estados visuais:

* Em acompanhamento;
* Em investigação;
* Aguardando retorno;
* Encaminhado;
* Resolvido;
* Encerrado.

---

## 10.2 Gráfico

### Evolução da Busca Ativa

Mostrar quantidade de casos por mês.

---

## 10.3 Tabela

| Aluno     | Escola             | Série  | Frequência | Situação          |
| --------- | ------------------ | ------ | ---------: | ----------------- |
| Aluno 001 | EMEF João XXIII    | 5º ano |        68% | Em acompanhamento |
| Aluno 002 | EMEF Maria Silva   | 7º ano |        61% | Encaminhado       |
| Aluno 003 | EMEF Jardim Brasil | 4º ano |        72% | Em investigação   |

Todos os nomes deverão ser fictícios.

---

# 11. Lista de espera

Criar seção:

# Lista de Espera

Indicadores:

* total de crianças aguardando;
* crianças por etapa;
* crianças por escola;
* demanda por bairro;
* tempo médio de espera;
* crianças aguardando mais de 30 dias;
* crianças aguardando mais de 60 dias;
* vagas disponíveis.

---

## 11.1 Distribuição

Apresentar:

* demanda por escola;
* demanda por bairro;
* demanda por faixa etária;
* demanda por etapa.

Exemplo:

**Creche:** 96
**Educação Infantil:** 74
**Ensino Fundamental:** 114

---

# 12. Reforço escolar

Criar seção:

# Reforço Escolar

Indicadores:

* alunos em reforço;
* alunos por escola;
* alunos por série;
* alunos por disciplina;
* alunos por bimestre;
* alunos que evoluíram;
* alunos que continuam em acompanhamento.

Exemplo:

| Escola            | Total | Português | Matemática |
| ----------------- | ----: | --------: | ---------: |
| EMEF João XXIII   |    86 |        41 |         45 |
| EMEF Maria Silva  |    72 |        35 |         37 |
| EMEF Paulo Freire |    64 |        28 |         36 |

---

# 13. Educação inclusiva e tutores

Criar seção:

# Educação Inclusiva

Indicadores:

* alunos acompanhados;
* alunos com documentação;
* alunos aguardando documentação;
* alunos com tutor;
* alunos sem tutor;
* quantidade de tutores;
* alunos por escola;
* acompanhamentos atualizados;
* acompanhamentos pendentes.

Exemplo:

**428 alunos acompanhados**

**396 com acompanhamento definido**

**32 pendências**

---

# 14. Transporte escolar

Criar seção:

# Transporte Escolar

Indicadores:

* alunos transportados;
* rotas;
* veículos;
* motoristas;
* alunos por escola;
* alunos por rota.

Exemplo:

| Escola            | Total de alunos | Transportados |
| ----------------- | --------------: | ------------: |
| EMEF João XXIII   |             684 |           142 |
| EMEF Maria Silva  |             592 |           119 |
| EMEF Paulo Freire |             541 |            96 |

Posteriormente poderão ser adicionados:

* quilometragem;
* custo;
* combustível;
* manutenção;
* ocupação dos veículos.

Esses itens não são obrigatórios no primeiro protótipo.

---

# 15. Escolas

Criar seção:

# Escolas

Cada escola deverá possuir um card resumido.

Exemplo:

## EMEF João XXIII

**684 alunos**

* 42 professores;
* 26 funcionários;
* 86 alunos no reforço;
* 12 alunos em busca ativa;
* 31 alunos em acompanhamento inclusivo;
* 142 alunos transportados.

A escola deverá ser clicável.

---

# 16. Detalhamento da escola

Ao clicar em uma escola, apresentar:

## Visão geral

* alunos;
* professores;
* funcionários;
* turmas;
* frequência;
* reforço;
* busca ativa;
* inclusão;
* transporte.

### Exemplo

**Alunos:** 684
**Frequência média:** 93,2%
**Busca ativa:** 12
**Reforço:** 86
**Inclusão:** 31
**Transportados:** 142

Também deverá existir uma área de evolução histórica.

---

# 17. Quadro de professores

Criar seção:

# Professores

Indicadores:

* total;
* professores por escola;
* professores por disciplina;
* professores por etapa;
* professores por turno;
* carga horária;
* tipo de vínculo.

Possíveis vínculos:

* efetivo;
* temporário;
* outros.

---

# 18. Quadro de funcionários

Criar seção:

# Funcionários

Indicadores:

* total de funcionários;
* funcionários por escola;
* funcionários por função;
* funcionários por turno;
* funcionários por tipo de vínculo.

Possíveis categorias:

* efetivo;
* contratado;
* CIOP;
* outros.

---

# 19. Funcionários CIOP

O **CIOP deverá ser tratado como uma categoria de vínculo/origem do funcionário**, e não como um órgão responsável pelo acompanhamento dos alunos.

Criar um indicador específico:

### Funcionários CIOP

**52**

Esse número deverá poder ser detalhado.

Exemplo:

| Funcionário     | Escola             | Função         | Turno    | Situação |
| --------------- | ------------------ | -------------- | -------- | -------- |
| Funcionário 001 | EMEF João XXIII    | Auxiliar       | Manhã    | Ativo    |
| Funcionário 002 | EMEI Jardim Brasil | Apoio          | Tarde    | Ativo    |
| Funcionário 003 | EMEF Maria Silva   | Administrativo | Integral | Ativo    |

Também deverá ser possível visualizar:

### CIOP por escola

| Escola             | Funcionários CIOP |
| ------------------ | ----------------: |
| EMEF João XXIII    |                 5 |
| EMEF Maria Silva   |                 4 |
| EMEF Paulo Freire  |                 3 |
| EMEI Jardim Brasil |                 6 |

---

# 20. Quadro geral de pessoal

Criar uma visão executiva:

# Quadro de Pessoal

Exemplo:

**324 funcionários**

Distribuição:

* 186 efetivos;
* 74 contratados;
* 52 CIOP;
* 12 outros.

Gráficos:

* funcionários por escola;
* funcionários por função;
* funcionários por vínculo;
* funcionários por turno.

Essa informação deverá permitir à dirigente visualizar rapidamente a estrutura de pessoal da rede.

---

# 21. Acompanhamento intersetorial

Criar uma área separada para os casos que envolvam atuação de diferentes setores.

Possíveis setores:

* Educação;
* Saúde;
* CAPS;
* Conselho Tutelar;
* Assistência Social;
* outros serviços autorizados.

O objetivo não é transformar o dashboard em um prontuário de saúde.

O dashboard deverá apresentar principalmente:

* quantidade de casos;
* situação;
* encaminhamentos;
* pendências;
* prazo;
* setor responsável.

---

# 22. Indicadores intersetoriais

Exibir:

* casos ativos;
* casos novos;
* casos encerrados;
* encaminhamentos realizados;
* encaminhamentos pendentes;
* casos aguardando retorno;
* casos sem atualização;
* casos por escola;
* casos por setor.

Exemplo:

**127 casos ativos**

* Educação: 51
* Saúde: 29
* Conselho Tutelar: 24
* CAPS: 15
* Outros: 8

As informações detalhadas deverão ser acessíveis somente aos usuários autorizados.

---

# 23. Perfil do aluno — Aluno 360º

Criar uma tela demonstrativa:

# Aluno 360º

O objetivo é mostrar como futuramente será possível visualizar o histórico do aluno em um único lugar.

## Dados básicos

* nome;
* nascimento;
* responsável;
* escola;
* série;
* turma;
* turno.

## Histórico escolar

* matrículas;
* escolas anteriores;
* frequência;
* reforço;
* alterações.

## Acompanhamentos

* busca ativa;
* inclusão;
* tutor;
* encaminhamentos;
* acompanhamentos autorizados.

## Documentos

* documentos escolares;
* relatórios;
* documentos anexados.

---

# 24. Linha do tempo do aluno

Exemplo:

**05/03/2026**
Matrícula realizada.

**18/04/2026**
Frequência identificada abaixo do limite.

**22/04/2026**
Iniciado acompanhamento de busca ativa.

**03/05/2026**
Encaminhamento registrado.

**17/05/2026**
Acompanhamento atualizado.

A linha do tempo deverá respeitar as permissões de acesso.

---

# 25. Documentos

Criar seção:

# Documentos

O sistema deverá permitir futuramente armazenar e organizar documentos relacionados aos alunos e à administração da educação.

Categorias:

* documentos escolares;
* relatórios;
* laudos/documentações apresentados;
* documentos administrativos;
* outros documentos autorizados.

O protótipo deverá apenas demonstrar a organização visual.

---

# 26. Legislação e atos administrativos

Criar seção:

# Legislação e Documentos Administrativos

Categorias:

* leis;
* decretos;
* portarias;
* resoluções;
* instruções;
* comunicados;
* documentos internos.

Filtros:

* tipo;
* ano;
* assunto;
* situação.

Campo:

**Pesquisar documento...**

---

# 27. Relatórios

Criar seção:

# Relatórios

Relatórios previstos:

### Matrículas

* por escola;
* por série;
* por turno;
* por período.

### Frequência

* por escola;
* por aluno;
* por período.

### Busca Ativa

* casos;
* situação;
* escola;
* período.

### Lista de Espera

* escola;
* etapa;
* bairro;
* tempo de espera.

### Reforço

* escola;
* disciplina;
* série;
* bimestre.

### Educação Inclusiva

* escola;
* acompanhamento;
* tutor.

### Transporte

* escola;
* rota;
* veículo.

### Quadro de Pessoal

* professores;
* funcionários;
* vínculo;
* escola;
* função;
* CIOP.

No mockup, os botões de exportação poderão ser demonstrativos:

**PDF | Excel | CSV**

---

# 28. Visão executiva para apresentação ao prefeito

Criar uma visão simplificada:

# Resumo Executivo

Deverá apresentar aproximadamente 8–12 indicadores principais.

Exemplo:

### Rede

**18 escolas**

**8.426 alunos**

**524 professores**

**324 funcionários**

### Acompanhamento

**137 alunos em busca ativa**

**284 crianças na lista de espera**

**642 alunos no reforço**

**428 alunos em acompanhamento inclusivo**

### Operação

**1.186 alunos transportados**

**52 funcionários CIOP**

### Gráficos

* evolução das matrículas;
* evolução da frequência;
* busca ativa;
* lista de espera;
* alunos por etapa;
* quadro de pessoal.

Essa tela deve ser extremamente limpa e adequada para uma reunião executiva.

---

# 29. Alertas

Criar componente:

# Alertas e Pendências

Exemplos:

**18** casos de busca ativa sem atualização.

**37** crianças aguardando vaga há mais de 60 dias.

**12** alunos aguardando definição de acompanhamento.

**9** encaminhamentos aguardando retorno.

**23** registros com documentação pendente.

Cada alerta deverá permitir acesso ao respectivo detalhamento.

---

# 30. Drill-down

Um conceito fundamental do sistema será:

**Indicador → Detalhamento → Registro**

Exemplo:

Dashboard:

### Busca Ativa

**137**

↓

Usuário clica.

↓

Tela:

**137 alunos**

Filtros:

* escola;
* série;
* bairro;
* situação;
* período.

↓

Usuário seleciona um aluno.

↓

### Perfil do aluno

O usuário visualiza somente as informações permitidas para seu perfil.

Esse conceito deverá ser demonstrado no mockup.

---

# 31. Menu principal

Sugestão de navegação:

**Dashboard**

**Alunos**

* Alunos
* Matrículas
* Frequência
* Histórico

**Busca Ativa**

**Lista de Espera**

**Reforço Escolar**

**Educação Inclusiva**

**Transporte**

**Escolas**

**Professores**

**Funcionários**

**Acompanhamento Intersetorial**

**Documentos**

**Relatórios**

**Configurações**

---

# 32. Dados mockados

O protótipo deverá utilizar exclusivamente dados fictícios.

Criar aproximadamente:

* 15–20 escolas;
* centenas de alunos;
* dezenas de professores;
* funcionários;
* funcionários CIOP;
* casos de busca ativa;
* lista de espera;
* alunos em reforço;
* alunos acompanhados pela educação inclusiva;
* alunos transportados;
* acompanhamentos intersetoriais;
* documentos.

Os nomes dos alunos e demais informações pessoais deverão ser fictícios.

---

# 33. Requisitos visuais

O sistema deverá apresentar aparência profissional de uma plataforma de gestão municipal.

Características:

* sidebar;
* header;
* cards;
* gráficos;
* tabelas;
* filtros;
* badges de status;
* indicadores;
* busca;
* navegação entre telas;
* responsividade.

A interface deverá evitar excesso de elementos.

A prioridade visual deverá ser:

1. números;
2. situações que exigem atenção;
3. tendências;
4. filtros;
5. detalhamento.

---

# 34. Identidade visual

A identidade visual deverá transmitir:

* educação;
* gestão;
* organização;
* confiança;
* modernidade;
* simplicidade.

Evitar uma aparência excessivamente "sistema governamental antigo".

O objetivo é que a dirigente olhe para o protótipo e consiga imaginar o sistema sendo utilizado diariamente.

---

# 35. Controle de acesso

A versão real deverá possuir diferentes níveis de acesso.

Exemplos:

### Dirigente

Visão geral da Secretaria e indicadores da rede.

### Secretaria de Educação

Acesso administrativo aos dados autorizados.

### Gestor escolar

Acesso à própria escola.

### Professor

Acesso aos alunos e turmas autorizados.

### Saúde

Acesso aos acompanhamentos de sua área.

### CAPS

Acesso aos casos autorizados.

### Conselho Tutelar

Acesso aos casos encaminhados/autorizados.

### Administrador

Configuração e administração do sistema.

---

# 36. Segurança e LGPD

Como o sistema poderá armazenar dados de crianças e adolescentes e informações potencialmente sensíveis, a versão real deverá considerar:

* autenticação;
* autorização;
* controle de acesso por perfil;
* menor privilégio;
* auditoria;
* histórico de alterações;
* proteção de documentos;
* controle de acesso a informações sensíveis;
* registro de acessos;
* políticas de retenção;
* adequação à LGPD.

Esses recursos não precisam ser implementados no mockup, mas devem ser considerados na arquitetura do produto.

---

# 37. Futuras fontes de dados

O sistema deverá ser projetado para futuramente receber dados de diferentes fontes.

Possibilidades:

* sistema escolar;
* Secretaria de Educação;
* cadastro manual;
* importação de Excel/CSV;
* APIs;
* Saúde;
* CAPS;
* Conselho Tutelar;
* transporte;
* outros sistemas municipais.

Não será definida neste momento a forma definitiva de integração.

---

# 38. Regra fundamental dos indicadores

Todo indicador deverá possuir uma definição.

Por exemplo:

### 137 alunos em busca ativa

O sistema real deverá saber:

* qual período;
* quais alunos foram considerados;
* qual regra caracteriza busca ativa;
* qual escola;
* qual situação;
* data da atualização.

O objetivo é evitar indicadores que mostrem apenas um número sem explicar sua origem.

---

# 39. Primeira versão do mockup

Para a primeira apresentação, não será necessário desenvolver todas as funcionalidades.

Priorizar as seguintes telas:

## Tela 1 — Dashboard Executivo

Mostrar:

* alunos;
* escolas;
* professores;
* funcionários;
* CIOP;
* busca ativa;
* lista de espera;
* reforço;
* inclusão;
* transporte;
* alertas.

---

## Tela 2 — Escolas

Mostrar:

* lista de escolas;
* número de alunos;
* professores;
* funcionários;
* frequência;
* busca ativa;
* reforço;
* inclusão;
* transporte.

---

## Tela 3 — Busca Ativa

Mostrar:

* indicadores;
* gráfico de evolução;
* distribuição por escola;
* tabela;
* filtros.

---

## Tela 4 — Lista de Espera

Mostrar:

* total;
* distribuição por escola;
* distribuição por etapa;
* tempo de espera;
* tabela.

---

## Tela 5 — Quadro de Pessoal

Mostrar:

* professores;
* funcionários;
* efetivos;
* contratados;
* CIOP;
* distribuição por escola;
* funções.

---

## Tela 6 — Aluno 360º

Mostrar:

* dados básicos;
* escola;
* frequência;
* histórico;
* busca ativa;
* reforço;
* inclusão;
* documentos;
* linha do tempo.

---

# 40. Objetivo da apresentação

O protótipo não deve ser apresentado como o sistema definitivo.

Ele deverá ser apresentado como:

> **"Uma proposta visual de como a Secretaria poderia acompanhar os principais indicadores da educação municipal em um único lugar."**

A reunião deverá servir para descobrir e validar requisitos.

A dirigente deverá poder apontar:

* indicadores que estão faltando;
* indicadores que não são necessários;
* filtros que precisam ser adicionados;
* relatórios que precisam ser criados;
* informações que precisam ser separadas;
* informações que precisam ser protegidas;
* informações que precisam ser atualizadas diariamente, semanalmente ou mensalmente.

---

# 41. Perguntas para validação com a dirigente

Ao final da apresentação, deverão ser feitas perguntas objetivas.

### Gestão

1. Quais são os 10 números que a senhora mais precisa saber toda semana?
2. Quais números precisa apresentar ao prefeito?
3. Quais informações hoje são difíceis de conseguir?
4. Quais relatórios são feitos manualmente?

### Alunos

5. Quais informações do aluno são indispensáveis?
6. Quais filtros são mais importantes?
7. Que situações devem gerar alerta?

### Busca ativa

8. Qual regra define um aluno como caso de busca ativa?
9. Quais etapas devem ser registradas?
10. Quando um caso é considerado encerrado?

### Lista de espera

11. Quais tipos de vaga precisam ser controlados?
12. É necessário controlar tempo de espera?
13. Quais informações determinam a prioridade?

### Pessoal

14. Quais tipos de vínculo precisam aparecer?
15. Quais informações sobre funcionários CIOP são necessárias?
16. É necessário controlar lotação, função e carga horária?

### Inclusão

17. Quais informações precisam ser acompanhadas?
18. Como funciona atualmente o acompanhamento pelos tutores?

### Intersetorial

19. Quais informações precisam ser compartilhadas entre Educação, Saúde, CAPS e Conselho Tutelar?
20. Quais informações são restritas?
21. Quais encaminhamentos precisam ser acompanhados?

### Relatórios

22. Quais relatórios precisam ser gerados automaticamente?
23. Quais relatórios são apresentados ao prefeito?
24. Quais relatórios são enviados para outros órgãos?

---

# 42. Resultado esperado da primeira reunião

Ao final da apresentação, deverá ser possível transformar o protótipo em uma lista definitiva de:

* indicadores;
* telas;
* filtros;
* relatórios;
* usuários;
* permissões;
* regras de negócio;
* fontes de dados;
* periodicidade de atualização;
* integrações.

A partir disso será criada a especificação da primeira versão real do sistema.

---

# 43. Princípio central do produto

O sistema não deverá ser apenas um cadastro escolar.

O objetivo é criar uma:

> **Plataforma de Gestão e Acompanhamento da Educação Municipal**

que permita transformar os dados da rede em informação gerencial.

O princípio central será:

> **"A Secretaria deve conseguir enxergar a situação da rede, identificar onde estão os problemas e chegar rapidamente ao detalhe que explica aquele número."**

O dashboard será a principal porta de entrada para essa visão.
