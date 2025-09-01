Estrutura de Pastas do Projeto - App Nexo
Este documento descreve a arquitetura de pastas para o frontend do aplicativo Nexo, desenvolvido com React Native e Expo. A estrutura foi projetada para ser modular, escalável e intuitiva.

Visão Geral da Estrutura
A estrutura principal do código-fonte residirá dentro da pasta src/, mantendo a raiz do projeto limpa e organizada.

nexo-app/
├── assets/              # Fontes, imagens e ícones
├── src/
│   ├── api/             # Lógica de comunicação com o backend (Firebase)
│   ├── components/      # Componentes de UI reutilizáveis
│   ├── constants/       # Constantes globais (cores, estilos)
│   ├── contexts/        # Context API para gestão de estado global
│   ├── hooks/           # Hooks customizados
│   ├── navigation/      # Configuração de rotas e navegadores
│   ├── screens/         # Telas principais da aplicação
│   └── utils/           # Funções utilitárias
├── .env                 # Variáveis de ambiente (chaves do Firebase)
├── App.js               # Ponto de entrada principal da aplicação
└── package.json         # Dependências e scripts do projeto

Detalhe de Cada Pasta
assets/
Propósito: Armazenar todos os recursos estáticos.

Conteúdo:

fonts/: Arquivos de fontes customizadas (ex: NunitoSans-Regular.ttf).

images/: Imagens e ilustrações (ex: logo.png, onboarding-illustration.png).

icons/: Ícones específicos da aplicação.

src/api/
Propósito: Centralizar toda a lógica de comunicação com o Firebase. Isso isola a camada de dados do resto da aplicação.

Conteúdo:

firebase.js: Inicialização e configuração da conexão com o Firebase.

auth.js: Funções relacionadas à autenticação (login, registo, logout).

firestore.js: Funções para interagir com o Firestore (ex: getUserProfile, createProposal).

src/components/
Propósito: Armazenar componentes de UI reutilizáveis em toda a aplicação. A regra é: se um componente é usado em mais de um ecrã, ele deve vir para aqui.

Conteúdo:

common/: Componentes genéricos (ex: Button.js, TextInput.js, Card.js).

specific/: Componentes mais complexos e específicos do Nexo (ex: ProfileCard.js, ProposalItem.js).

src/constants/
Propósito: Definir valores constantes para manter a consistência visual e de dados.

Conteúdo:

colors.js: Exporta a nossa paleta de cores (PRIMARY, ACTION, etc.).

typography.js: Define os estilos de fonte (tamanhos, pesos).

index.js: Exporta todas as constantes para fácil importação.

src/contexts/
Propósito: Gerir o estado global da aplicação usando a Context API do React.

Conteúdo:

AuthContext.js: Fornece informações sobre o utilizador autenticado para toda a aplicação, controlando se o AuthStack ou o AppStack é exibido.

src/hooks/
Propósito: Criar hooks customizados para encapsular lógicas reutilizáveis.

Conteúdo:

useAuth.js: Um hook para aceder facilmente aos dados do AuthContext.

src/navigation/
Propósito: Definir toda a estrutura de navegação e rotas do app, utilizando o React Navigation.

Conteúdo:

-   `RootNavigator.tsx`: O navegador principal que decide qual stack (Auth ou App) deve ser renderizado com base no estado de autenticação do usuário.
-   `AuthStack.tsx`: Define a pilha de navegação para os ecrãs de autenticação (`LoginScreen`, `RegisterScreen`).
-   `AppStack.tsx`: Define o fluxo principal da aplicação. Condicionalmente renderiza o `OnboardingScreen` (se o perfil do usuário estiver incompleto) ou o `MainTabNavigator`.
-   `MainTabNavigator.tsx`: Contém as abas principais da aplicação (`Início`, `Propostas`, `Meu Perfil`), cada uma com sua própria pilha de navegação.
    -   `HomeStack.tsx`: Pilha de navegação para a aba "Início", incluindo `HomeScreen`, `UserProfileDetailScreen` e `ProposalScreen`.
    -   `ProposalsStack.tsx`: Pilha de navegação para a aba "Propostas", incluindo `ProposalsScreen`, `ChatScreen` e `ReviewScreen`.
    -   `ProfileStack.tsx`: Pilha de navegação para a aba "Meu Perfil", incluindo `ProfileScreen` e `EditProfileScreen`.

src/screens/
Propósito: Armazenar os ecrãs completos da aplicação. Cada ecrã reside em sua própria pasta, seguindo a convenção de ter um arquivo `index.tsx` como ponto de entrada principal do componente de tela.

Conteúdo (exemplos):

-   `ChatScreen/index.tsx`
-   `EditProfileScreen/index.tsx`
-   `HomeScreen/index.tsx`
-   `LoginScreen/index.tsx`
-   `OnboardingScreen/index.tsx`
-   `ProfileScreen/index.tsx`
-   `ProposalScreen/index.tsx`
-   `ProposalsScreen/index.tsx`
-   `ReceivedProposalsScreen/index.tsx`
-   `RegisterScreen/index.tsx`
-   `ReviewScreen/index.tsx`
-   `SentProposalsScreen/index.tsx`
-   `UserProfileDetailScreen/index.tsx`

src/utils/
Propósito: Funções auxiliares que não se encaixam em nenhuma outra categoria.

Conteúdo:

formatters.js: Funções para formatar datas, horas, etc.

validators.js: Funções para validar formulários (ex: validar email).

App.js (Raiz do Projeto)
Propósito: É o ponto de entrada da aplicação. A sua principal responsabilidade é carregar as fontes, os contextos e renderizar o RootNavigator.