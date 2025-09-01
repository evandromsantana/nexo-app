# Visão Geral do Projeto: nexo-app-v1

Este documento detalha a arquitetura e os principais componentes do `nexo-app-v1`, um aplicativo móvel desenvolvido com React Native e Expo, focado em oferecer uma experiência robusta e escalável.

## 1. Objetivo do Projeto

O `nexo-app-v1` visa [**Inserir aqui o objetivo principal do aplicativo, por exemplo: conectar usuários para troca de serviços, gerenciar propostas, etc.**]. Ele é construído para ser multiplataforma, funcionando tanto em Android quanto em iOS, e aproveita o ecossistema Expo para um desenvolvimento ágil e eficiente.

## 2. Arquitetura Geral

A arquitetura do `nexo-app-v1` segue um padrão modular, facilitando a manutenção, escalabilidade e a colaboração entre desenvolvedores. Os principais pilares são:

-   **Frontend (Mobile):** Desenvolvido em React Native com Expo, utilizando TypeScript para tipagem forte e melhor manutenibilidade.
-   **Backend (Firebase):** Utiliza o Firebase como solução de backend-as-a-service (BaaS), abrangendo autenticação (Firebase Auth) e banco de dados (Firestore).
-   **Navegação:** Gerenciada pelo `@react-navigation`, permitindo uma estrutura de navegação complexa e intuitiva.
-   **Gerenciamento de Estado:** O estado de autenticação é gerenciado via React Context (`AuthContext`), com potencial para expansão para outras soluções de gerenciamento de estado conforme a complexidade do aplicativo cresce.

## 3. Estrutura de Pastas e Módulos

A organização do código é feita de forma lógica, separando as responsabilidades em módulos bem definidos:

```
src/
├── api/             # Módulos de integração com serviços externos (Firebase, Firestore)
├── components/      # Componentes de UI reutilizáveis (common, specific)
├── constants/       # Constantes globais (cores, tipografia, etc.)
├── contexts/        # Contextos React para gerenciamento de estado global
├── hooks/           # Hooks personalizados para lógica reutilizável
├── navigation/      # Definição das rotas e stacks de navegação
├── screens/         # Telas principais do aplicativo
└── utils/           # Funções utilitárias diversas
```

### 3.1. `src/api`

Contém a lógica para interagir com os serviços de backend. Os principais arquivos incluem:

-   `auth.ts`: Funções relacionadas à autenticação de usuários (login, registro, logout, etc.) usando Firebase Authentication.
-   `firebase.ts`: Inicialização e configuração do SDK do Firebase.
-   `firestore.ts`: Funções para operações CRUD (Create, Read, Update, Delete) no Firestore.

### 3.2. `src/components`

Dividido em `common` e `specific` para organizar componentes de UI:

-   `common/`: Componentes genéricos e reutilizáveis em várias partes do aplicativo (ex: botões, inputs, cards).
-   `specific/`: Componentes mais complexos e específicos de uma funcionalidade ou tela.

### 3.3. `src/constants`

Armazena valores que são usados globalmente no aplicativo, garantindo consistência e fácil modificação:

-   `colors.ts`: Paleta de cores do aplicativo.
-   `typography.ts`: Definições de estilos de texto (fontes, tamanhos, pesos).

### 3.4. `src/contexts`

Gerencia o estado global que precisa ser acessado por múltiplos componentes sem a necessidade de prop drilling:

-   `AuthContext.tsx`: Provedor de contexto para gerenciar o estado de autenticação do usuário, disponibilizando informações como usuário logado e funções de autenticação.

### 3.5. `src/hooks`

Contém hooks personalizados para encapsular lógica de componentes e torná-la reutilizável:

-   `useAuth.ts`: Hook que facilita o acesso ao `AuthContext`, permitindo que componentes consumam o estado de autenticação de forma limpa.

### 3.6. `src/navigation`

Define a estrutura de navegação do aplicativo, utilizando `@react-navigation`:

-   `RootNavigator.tsx`: O navegador principal que orquestra as diferentes stacks de navegação (autenticação, aplicativo principal).
-   `AuthStack.tsx`: Navegação para telas relacionadas à autenticação (Login, Register).
-   `AppStack.tsx`: Navegação para as telas principais do aplicativo após o login.
-   `HomeStack.tsx`, `ProfileStack.tsx`, `ProposalsStack.tsx`: Stacks específicas para módulos maiores do aplicativo, organizando suas respectivas telas.

### 3.7. `src/screens`

Contém as telas principais do aplicativo, geralmente organizadas em subpastas por funcionalidade:

-   `LoginScreen/index.tsx`, `RegisterScreen/index.tsx`: Telas de autenticação.
-   `HomeScreen/index.tsx`: Tela inicial.
-   `ProfileScreen/index.tsx`, `EditProfileScreen/index.tsx`, `UserProfileDetailScreen/index.tsx`: Telas relacionadas ao perfil do usuário.
-   `ProposalScreen/index.tsx`, `ProposalsScreen/index.tsx`, `ReceivedProposalsScreen/index.tsx`, `SentProposalsScreen/index.tsx`: Telas relacionadas a propostas.
-   `ChatScreen/index.tsx`, `ReviewScreen/index.tsx`: Outras telas de funcionalidade.

### 3.8. `src/utils`

Armazena funções auxiliares e utilitárias que não se encaixam em outras categorias específicas, mas são usadas em várias partes do aplicativo.

## 4. Dependências Chave

As principais bibliotecas e frameworks utilizados no projeto incluem:

-   **React Native:** Framework para construção de interfaces de usuário nativas.
-   **Expo:** Conjunto de ferramentas e serviços para desenvolvimento rápido de aplicativos React Native.
-   **Firebase:** Backend-as-a-Service para autenticação, banco de dados (Firestore) e outras funcionalidades.
-   **@react-navigation:** Solução de navegação robusta e flexível.
-   **TypeScript:** Linguagem de programação que adiciona tipagem estática ao JavaScript.
-   **@react-native-async-storage/async-storage:** Armazenamento persistente de dados no dispositivo.
-   **react-native-reanimated & react-native-screens:** Bibliotecas para otimização de performance e animações.

## 5. Próximos Passos e Considerações

-   **Testes:** Implementar uma suíte de testes (unitários, integração) para garantir a qualidade do código.
-   **CI/CD:** Configurar pipelines de Integração Contínua/Entrega Contínua para automatizar builds e deployments.
-   **Monitoramento:** Adicionar ferramentas de monitoramento de erros e performance (ex: Sentry, Firebase Crashlytics).
-   **Internacionalização:** Se aplicável, implementar suporte a múltiplos idiomas.

Este documento serve como um guia para entender a estrutura e o funcionamento do `nexo-app-v1`.