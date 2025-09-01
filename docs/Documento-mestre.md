Excelente iniciativa e um documento mestre muito bem estruturado! A base que você criou é sólida, clara e cobre as áreas mais críticas de um projeto de aplicativo. Para aprimorá-lo, vou detalhar alguns pontos, adicionar seções que podem mitigar riscos futuros e refinar a linguagem para torná-la ainda mais profissional e acionável para uma equipe de desenvolvimento ou potenciais investidores.

As melhorias estão marcadas com ⭐ e buscam adicionar profundidade, clareza e previsibilidade ao seu planejamento.

---

### **Documento Mestre do Projeto: Nexo (Versão 1.1 - Revisado)**

**Versão:** 1.1
**Data:** 28 de Agosto de 2025

### **Parte 1: Visão Geral e Estratégia (O "Porquê")**

**1.1. Resumo Executivo**
O Nexo é um aplicativo móvel multiplataforma (iOS/Android) que cria comunidades locais de escambo de habilidades. A plataforma opera com um sistema de "banco de horas", onde o tempo é a moeda de troca. Isso permite que os usuários aprendam e ensinem sem transações financeiras, democratizando o acesso ao conhecimento e fortalecendo laços comunitários.

⭐ **Adição: Problema e Solução**
* **O Problema:** O acesso a novas habilidades é frequentemente caro (cursos, workshops) ou impessoal (tutoriais online genéricos). Além disso, muitos talentos locais permanecem ociosos por falta de uma plataforma para compartilhá-los de forma significativa.
* **A Solução:** O Nexo remove a barreira financeira ao aprendizado e valoriza o conhecimento individual como um ativo tangível, conectando pessoas com interesses complementares dentro de sua própria comunidade.

**1.2. Conceito Central e Proposta de Valor**
* **Missão:** Criar comunidades locais colaborativas onde o conhecimento é a principal moeda.
* **Slogan:** "Seu conhecimento é a sua moeda."
* **Para o Aprendiz:** Adquira novas competências de forma acessível e personalizada, conectando-se com especialistas em sua comunidade.
* **Para o Professor:** Compartilhe sua paixão, solidifique seu conhecimento, ganhe créditos de tempo para financiar seu próprio aprendizado e construa uma reputação local.

**1.3. Público-Alvo**
* **Primário:** Estudantes universitários, jovens profissionais (20-35 anos) e trabalhadores autônomos que buscam aprendizado contínuo com baixo custo.
* **Secundário:** Especialistas em áreas de nicho, aposentados que desejam se manter ativos e compartilhar sua vasta experiência, e pessoas em transição de carreira.

⭐ **Adição: Personas**
* ***Persona 1 (Aprendiz):*** **Ana, 22 anos, estudante de design.** Quer aprender a tocar violão para relaxar, mas os custos das aulas são proibitivos. Ela pode oferecer aulas de introdução ao Adobe Illustrator em troca.
* ***Persona 2 (Professor):*** **Carlos, 65 anos, engenheiro civil aposentado.** Adora marcenaria como hobby e gostaria de ensinar os fundamentos a jovens interessados, sentindo-se útil e conectado à comunidade. Ele poderia usar seus créditos para ter aulas de culinária.

**1.4. Modelo de Monetização (Freemium)**
* **Gratuito:** Todas as funcionalidades essenciais de troca 1-para-1, chat, agendamento e avaliação serão sempre gratuitas para garantir a missão principal.
* **"Nexo Plus" (Assinatura):** Uma assinatura mensal opcional ($R 9,90/mês) que oferecerá benefícios de conveniência e destaque:
    * Perfil em destaque nos resultados de busca.
    * Filtros de busca avançados (ex: buscar por usuários com maior avaliação, usuários novos).
    * Possibilidade de organizar e participar de "Aulas em Grupo" (1 professor para até 5 alunos, cobrando um valor fixo de horas de cada um).
    * Selo de "Membro Plus" no perfil.

⭐ **Adição: Métricas Chave de Sucesso (KPIs)**
* **Engajamento:** Número de trocas concluídas por semana/mês.
* **Retenção:** Taxa de retenção de usuários após 1, 7 e 30 dias (D1, D7, D30).
* **Aquisição:** Custo de Aquisição de Cliente (CAC) e crescimento orgânico (convites).
* **Monetização:** Taxa de conversão para o "Nexo Plus".

---

### **Parte 2: Identidade Visual (O "Look and Feel")**

**2.1. Logo: Conceito 3 - O Ponto de Encontro**
* **Simbologia:** O app é o ponto de encontro (círculo central) que possibilita as conexões (linhas) entre os usuários e suas habilidades (pontos) na comunidade.
* **Aplicação:** O círculo central laranja (`#EE9B00`) representa a energia da troca, enquanto as linhas e pontos em azul petróleo (`#005F73`) mostram a estrutura e a confiança da comunidade.

**2.2. Paleta de Cores**
* **Primária (Confiança, Estrutura):** `#005F73` (Azul Petróleo Escuro)
* **Secundária (Crescimento, Equilíbrio):** `#0A9396` (Verde Água)
* **Ação/Destaque (Energia, Motivação):** `#EE9B00` (Laranja Queimado)
* **Sucesso/Confirmação:** `#94D2BD` (Verde Menta)
* **Neutros:** `#FFFFFF` (Branco), `#F1F1F1` (Cinza Claro), `#333333` (Cinza Escuro)

**2.3. Tipografia**
* **Fonte:** Nunito Sans (Google Fonts) - escolhida por sua excelente legibilidade e aparência amigável.
* **Hierarquia:** H1 (28px, Bold), H2 (20px, Bold), Corpo (16px, Regular), Legenda (14px, Regular).

⭐ **Adição: Tom de Voz e Linguagem**
* **Tom:** Colaborativo, encorajador, confiável e comunitário.
* **Exemplos:** Em vez de "Transação Completa", usar "Troca Concluída com Sucesso!". Em vez de "Avalie o Usuário", usar "Como foi aprender com o(a) [Nome]?".

---

### **Parte 3: Arquitetura da Experiência do Usuário (O "O Quê")**

**3.1. Fluxo de Segurança e Privacidade**
* **Descoberta Pública:** Os usuários se encontram com base em localizações relativas e aproximadas (ex: "a 2km de você", "no bairro X"). Nenhuma localização exata é exposta publicamente.
* **Coordenação Privada:** A coordenação de local e horário acontece dentro de um chat privado e seguro.
* **⭐ Ferramenta de Sugestão de Locais:** O chat terá um botão para sugerir "Pontos de Encontro Seguros" (ex: bibliotecas públicas, cafés movimentados, espaços de coworking) usando uma API como a do Google Places, para evitar que encontros sejam marcados em locais privados ou inseguros.
* **⭐ Sistema de Denúncia e Bloqueio:** Usuários poderão bloquear e denunciar outros membros por comportamento inadequado. Denúncias serão revisadas por um moderador.

**3.2. Histórias de Usuário (Detalhado)**

* **Gestão de Conta:**
    * **Como um novo usuário,** eu quero me cadastrar usando meu e-mail ou conta Google/Apple, para que eu possa entrar na plataforma de forma rápida e segura.
    * **Como um membro,** eu quero editar meu perfil (foto, bio, habilidades que ensino, habilidades que busco), para que outros usuários possam me conhecer melhor.
* **Descoberta:**
    * **Como um aprendiz,** eu quero buscar por habilidades usando palavras-chave e filtros (distância, avaliação), para encontrar professores relevantes perto de mim.
    * **Como um membro,** eu quero visualizar o perfil detalhado de outro usuário (suas habilidades, avaliações, bio), para decidir se quero propor uma troca.
* **Ciclo da Troca:**
    * **Como um membro,** eu quero enviar uma proposta de troca para outro usuário, sugerindo a habilidade que quero aprender e a que posso ensinar, para iniciar uma negociação.
    * **Como um membro,** eu quero receber, aceitar ou recusar propostas de troca, para gerenciar minhas interações.
    * **Como um professor,** após a aula, eu quero confirmar a conclusão da troca e a quantidade de horas, para que os créditos de tempo sejam transferidos para o meu "banco de horas".
    * **Como um membro,** eu quero avaliar a troca (de 1 a 5 estrelas) e deixar um comentário, para construir um sistema de reputação confiável na comunidade.

**3.3. Wireframes (Estrutura das Telas)**
* **Fluxo de Autenticação:** Telas de Splash, Login, Cadastro e um fluxo de Onboarding guiado para configurar o perfil inicial (foto, 1ª habilidade a ensinar, 1ª habilidade a aprender).
* **App Principal (Navegação por Abas):**
    * **Início (Aba):** Barra de busca proeminente, listas de "Novos Membros na sua Região" e "Habilidades em Destaque".
    * **Propostas (Aba):** Gerenciador de trocas com segmentação clara: "Pendentes", "Agendadas" e "Histórico".
    * **Chat (Aba):** Lista de conversas ativas.
    * **Meu Perfil (Aba):** Visualização do próprio perfil, saldo de horas (ex: `+2h 30min`), acesso às configurações, ajuda e botão de logout.
* **Modais Críticos:**
    * **Modal de Proposta:** Formulário simples para enviar uma proposta.
    * **Modal de Agendamento Seguro:** Interface dentro do chat para sugerir e confirmar locais/horários.
    * **Modal de Conclusão de Troca:** Onde o "professor" informa a duração da aula (ex: 1h 30min) e o "aluno" confirma para a transferência de créditos ocorrer.

---

### **Parte 4: Arquitetura Técnica (O "Como")**

**4.1. Stack Tecnológico**
* **Frontend:** React Native com Expo (para agilidade no desenvolvimento e deploy).
* **Backend:** Google Firebase (Authentication, Firestore, Storage, Cloud Functions).
* **Navegação:** React Navigation.
* **⭐ APIs e Serviços de Terceiros:**
    * **Google Places API:** Para a sugestão de "Pontos de Encontro Seguros".
    * **OneSignal ou Firebase Cloud Messaging:** Para notificações push (novas propostas, mensagens no chat).

**4.2. Estrutura do Backend (Cloud Firestore)**
* `Coleção users`: Armazena perfis de usuário.
    * `uid`, `displayName`, `photoURL`, `bio`, `skillsToTeach` (array de strings), `skillsToLearn` (array de strings), `timeBalance` (number, em minutos), `region` (geohash para buscas por proximidade).
* `Coleção proposals`: Gerencia o ciclo de vida de uma troca.
    * `fromUserId`, `toUserId`, `skillOffered`, `skillRequested`, `status` ('pending', 'accepted', 'declined', 'scheduled', 'completed', 'cancelled'), `scheduledTime` (timestamp), `scheduledLocation` (objeto com nome e coordenadas).
* `Coleção reviews`: Armazena as avaliações.
    * `reviewerId`, `reviewedId`, `proposalId`, `rating` (number 1-5), `comment` (string).
* `Coleção chats`: Armazena as conversas (`chats/{chatId}/messages/{messageId}`).

**4.3. ⭐ Lógica Crítica e Segurança**
* **Transação de Horas:** A conclusão da troca e a transferência de horas **NÃO** deve ser feita no cliente via Transação Atômica. Isso é uma falha de segurança, pois o código do cliente pode ser manipulado.
    * **Solução Correta:** O cliente atualiza o status de uma `proposal` para `completed` e informa as horas. Isso aciona uma **Cloud Function (`onProposalComplete`)** no backend. A função, em um ambiente seguro, verifica a validade da requisição e realiza a transação atômica: subtrai o tempo do aluno e adiciona ao professor na coleção `users`.
* **Regras de Segurança do Firestore:** Implementar regras rígidas para garantir que um usuário só possa ler/escrever seus próprios dados (perfil, propostas) e dados públicos (perfis de outros).

---

### **Parte 5: Plano de Execução (O "Quando")**

O desenvolvimento será dividido em 5 Sprints de 2 semanas cada, focando em entregar valor de forma incremental.

* **Sprint 1: Fundação e Autenticação**
    * Configuração do projeto (React Native, Expo, Firebase).
    * Design System básico (cores, fontes, botões).
    * Implementação das telas e fluxo de Cadastro, Login e Onboarding.
* **Sprint 2: Perfis e Descoberta**
    * Criação, visualização e edição dos perfis de usuário.
    * Implementação da tela "Início" com busca de habilidades e listagem de usuários.
    * Configuração da busca por proximidade usando geohash.
* **Sprint 3: O Coração da Troca**
    * Implementação do fluxo de envio de propostas.
    * Desenvolvimento da tela "Propostas" para gerenciar convites.
    * Criação da estrutura básica do chat.
* **Sprint 4: Comunicação e Segurança**
    * Implementação completa do chat em tempo real (mensagens de texto).
    * Integração com a API do Google Places para o agendamento seguro.
    * Desenvolvimento do sistema de denúncia e bloqueio.
* **Sprint 5: Fechamento do Ciclo e Polimento**
    * Implementação do fluxo de conclusão da troca.
    * Criação da Cloud Function para a transação segura de horas.
    * Implementação do sistema de avaliação.
    * Testes de ponta a ponta e preparação para o lançamento (MVP).

⭐ **Adição: Análise de Riscos e Mitigações**
* **Risco 1: Baixa Adoção Inicial (O problema do "ovo e a galinha").**
    * **Mitigação:** Estratégia de lançamento hiperlocal (focar em um bairro ou campus universitário específico) para garantir a densidade de usuários necessária para as trocas funcionarem.
* **Risco 2: Questões de Segurança em Encontros Presenciais.**
    * **Mitigação:** Enfatizar a ferramenta de "Pontos de Encontro Seguros", exibir avisos de segurança no app e ter um sistema de denúncia ágil e visível.
* **Risco 3: Abuso do Sistema (perfis falsos, spam).**
    * **Mitigação:** Verificação de e-mail obrigatória no cadastro, sistema de denúncia e, futuramente, verificação de identidade opcional para membros que queiram um selo de "Perfil Verificado".

---

