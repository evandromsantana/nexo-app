# nexo-app

Este é um projeto React Native desenvolvido com Expo.

## Descrição

Este aplicativo é construído com React Native e Expo, utilizando Firebase para funcionalidades de backend. Ele inclui navegação com `@react-navigation` e gerencia o estado de autenticação com `AuthContext`.

## Estrutura do Projeto

- `src/api`: Contém a lógica de integração com Firebase e Firestore, além de autenticação.
- `src/components`: Componentes reutilizáveis, divididos em `common` e `specific`.
- `src/constants`: Definições de cores, tipografia e outras constantes.
- `src/contexts`: Contextos React, como `AuthContext` para gerenciamento de autenticação.
- `src/hooks`: Hooks personalizados, como `useAuth`.
- `src/navigation`: Estrutura de navegação do aplicativo, incluindo diferentes stacks (App, Auth, Home, Profile, Proposals) e o RootNavigator.
- `src/screens`: Telas do aplicativo, organizadas por funcionalidade (ChatScreen, LoginScreen, ProfileScreen, etc.).
- `src/utils`: Funções utilitárias.
- `assets`: Contém ícones e imagens do aplicativo.

## Instalação

Para configurar o projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd nexo-app
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```

## Como Rodar

Para iniciar o aplicativo em diferentes plataformas:

-   **Web:**
    ```bash
    npm run web
    ```
-   **Android:**
    ```bash
    npm run android
    ```
-   **iOS:**
    ```bash
    npm run ios
    ```

## Dependências Principais

-   `expo`: Framework para desenvolvimento universal de aplicativos React.
-   `react-native`: Framework para construção de interfaces de usuário móveis.
-   `firebase`: Plataforma de desenvolvimento de aplicativos do Google.
-   `@react-navigation/native`: Solução de navegação para React Native.
-   `@react-native-async-storage/async-storage`: Armazenamento persistente de dados.
-   `react-native-reanimated`: Biblioteca para animações.
-   `react-native-screens`: Otimização de desempenho para navegação.

## Scripts Disponíveis

-   `npm start`: Inicia o servidor de desenvolvimento do Expo.
-   `npm run android`: Inicia o aplicativo no emulador ou dispositivo Android.
-   `npm run ios`: Inicia o aplicativo no simulador ou dispositivo iOS.
-   `npm run web`: Inicia o aplicativo no navegador web.

## Contribuição

Para contribuir com este projeto, por favor, siga as diretrizes de contribuição (a serem definidas).

## Licença

Este projeto está licenciado sob a licença MIT.
