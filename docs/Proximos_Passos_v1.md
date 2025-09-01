Análise de Projeto e Próximos Passos - App Nexo
Este documento serve como uma análise do estado atual do projeto Nexo, detalhando o que já foi construído, o que falta para o lançamento inicial (MVP) e sugestões para o futuro.

1. Estado Atual do Projeto
O que temos pronto (Conceitual e Estrutural):

Visão e Identidade: Nome, logo, paleta de cores e propósito bem definidos.

Planeamento Completo: Documento Mestre, fluxos de utilizador (incluindo segurança), estrutura de pastas e arquitetura técnica estão documentados.

Esqueleto do App: O código inicial (nexo_initial_setup_code) já implementa a estrutura de navegação principal (RootNavigator) que separa o fluxo de autenticação do fluxo principal do app, carrega as fontes e tem um gestor de estado de autenticação (AuthContext).

Em resumo: A planta da casa está pronta e a fundação foi construída. Agora, precisamos de construir as paredes e os cómodos.

2. O que Falta Implementar (Roadmap para o MVP)
Aqui está a lista de tarefas, em ordem de prioridade, para termos a primeira versão funcional do aplicativo.

Milestone 1: Autenticação Funcional (Finalizar)
[ ] Backend: Configurar o firebase.js com as credenciais do seu projeto Firebase.

[ ] API: Implementar as funções de login, registo e logout no ficheiro src/api/auth.js.

[ ] Contexto: Conectar o AuthContext ao onAuthStateChanged real do Firebase para que o estado de login seja persistente.

[ ] Telas: Construir a UI das telas LoginScreen e RegistoScreen com formulários e integração com a API.

Milestone 2: Gestão de Perfis
[ ] Tela de Onboarding: Criar um fluxo após o registo onde o utilizador preenche o seu perfil inicial (foto, nome, e as primeiras habilidades que ensina/quer aprender).

[ ] Backend/API: Implementar as funções createUserProfile e getUserProfile no firestore.js.

[ ] Tela "Meu Perfil": Construir a UI para visualizar o próprio perfil, mostrando a foto, nome, bio, saldo de horas e as listas de habilidades.

[ ] Tela de Edição de Perfil: Permitir que o utilizador edite as suas informações.

Milestone 3: Busca e Proposta
[ ] Tela "Início" (HomeScreen): Implementar a barra de busca e a lista de sugestões.

[ ] Backend/API: Criar a função de busca no firestore.js (inicialmente, pode ser uma busca simples por habilidades).

[ ] Tela de Perfil Público: Criar a tela que mostra o perfil de outro utilizador.

[ ] Backend/API: Implementar a função createProposal no firestore.js.

[ ] Fluxo de Proposta: Criar o modal ou tela para enviar uma proposta a outro utilizador.

Milestone 4: Gerenciamento de Trocas e Chat
[ ] Tela "Propostas": Construir a UI com as abas "Recebidas" e "Enviadas", listando as propostas.

[ ] Backend/API: Implementar as funções getReceivedProposals, getSentProposals e updateProposalStatus.

[ ] Funcionalidade de Chat: Implementar a tela de chat (ChatScreen) e as funções da API (createChat, sendMessage, getMessages).

[ ] Fluxo de Agendamento Seguro: Integrar no chat os botões e modais para sugerir e confirmar pontos de encontro.

Milestone 5: Conclusão e Avaliação
[ ] Backend/API: Implementar a função transacional completeProposal e a createReview.

[ ] Fluxo de Conclusão: Criar o modal para confirmar a realização da troca e transferir as horas.

[ ] Fluxo de Avaliação: Após a conclusão, direcionar os utilizadores para uma tela onde podem avaliar a experiência.

3. Sugestões de Funcionalidades Futuras (Pós-MVP)
Para manter o app relevante e a comunidade engajada após o lançamento.

Gamificação e Medalhas:

O quê: Criar um sistema de medalhas por conquistas (ex: "Primeira Troca Concluída", "Mestre Ensinador" após 10 trocas, "Poliglota" por aprender um idioma).

Porquê: Aumenta o engajamento e dá aos utilizadores um sentimento de progresso e reconhecimento na comunidade.

Trocas em Grupo (Workshops):

O quê: Permitir que um utilizador (o "professor") crie um evento para ensinar uma habilidade a várias pessoas ao mesmo tempo. Ele ensina por 1h e ganha, por exemplo, 0.5h de crédito de cada participante.

Porquê: Otimiza o tempo dos professores e cria eventos comunitários dentro do app, fortalecendo os laços.

Mapa de Habilidades (Heatmap):

O quê: Uma visualização em mapa (respeitando a privacidade com localizações aproximadas) que mostra onde há maior concentração de pessoas dispostas a ensinar certas habilidades.

Porquê: Ajuda a visualizar a "riqueza" de conhecimento da comunidade local e incentiva a exploração de novas conexões no bairro.

Perfis para ONGs e Causas Sociais:

O quê: Permitir que ONGs se cadastrem para buscar voluntários com habilidades específicas (ex: "precisamos de um fotógrafo para cobrir nosso evento"). Em troca, a ONG pode oferecer um certificado ou a visibilidade da causa.

Porquê: Expande o propósito do app para o impacto social, atraindo um novo público e reforçando a missão de colaboração comunitária.

Este documento deve servir como o nosso guia de desenvolvimento. O caminho está claro e bem definido!