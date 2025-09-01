# Guia de Contribuição para nexo-app

Bem-vindo(a) ao guia de contribuição do `nexo-app`! Agradecemos o seu interesse em contribuir para este projeto. Para garantir um processo de colaboração eficiente e manter a qualidade do código, por favor, siga as diretrizes abaixo.

## Como Contribuir

### 1. Reportar Bugs

Se você encontrar um bug, por favor, abra uma issue no nosso rastreador de issues. Ao reportar um bug, inclua o máximo de detalhes possível:

-   **Passos para reproduzir:** Descreva os passos exatos para reproduzir o bug.
-   **Comportamento esperado:** O que você esperava que acontecesse.
-   **Comportamento atual:** O que realmente aconteceu.
-   **Capturas de tela/vídeos:** Se possível, inclua imagens ou vídeos que demonstrem o problema.
-   **Ambiente:** Informações sobre seu dispositivo, sistema operacional, versão do aplicativo, etc.

### 2. Sugerir Novas Funcionalidades

Novas ideias são sempre bem-vindas! Se você tiver uma sugestão de funcionalidade:

-   Abra uma issue descrevendo a funcionalidade.
-   Explique o problema que a funcionalidade resolveria ou o benefício que traria.
-   Descreva como você imagina que a funcionalidade funcionaria.

### 3. Contribuir com Código

Para contribuir com código, siga os passos abaixo:

1.  **Faça um Fork** do repositório.
2.  **Clone** o seu fork localmente:
    ```bash
    git clone https://github.com/seu-usuario/nexo-app-v1.git
    cd nexo-app-v1
    ```
3.  **Crie uma nova branch** para a sua funcionalidade ou correção de bug:
    ```bash
    git checkout -b feature/minha-nova-funcionalidade
    # ou
    git checkout -b bugfix/correcao-do-bug-x
    ```
4.  **Faça suas alterações** no código.
5.  **Teste suas alterações** para garantir que tudo funciona como esperado e que não introduziu novos bugs.
6.  **Commit suas alterações** com uma mensagem clara e concisa. Use o imperativo e siga o padrão de commits do projeto (se houver).
    ```bash
    git commit -m "feat: adiciona nova funcionalidade X"
    # ou
    git commit -m "fix: corrige bug de login"
    ```
7.  **Envie suas alterações** para o seu fork:
    ```bash
    git push origin feature/minha-nova-funcionalidade
    ```
8.  **Abra um Pull Request (PR)** para a branch `main` do repositório original.
    -   Descreva suas alterações detalhadamente.
    -   Mencione as issues que o PR resolve (ex: `Closes #123`).
    -   Certifique-se de que todos os testes passaram.

## Padrões de Código

-   **Formatação:** Utilize o Prettier (se configurado) para formatar o código automaticamente.
-   **Linting:** Siga as regras do ESLint (se configurado) para manter a qualidade do código.
-   **TypeScript:** Utilize TypeScript sempre que possível para garantir a tipagem forte.
-   **Comentários:** Adicione comentários onde a lógica não for autoexplicativa.

## Revisão de Pull Requests

Todos os Pull Requests serão revisados pela equipe do projeto. Poderemos solicitar alterações ou esclarecimentos antes de mesclar suas contribuições.

Obrigado por contribuir para o `nexo-app-v1`!