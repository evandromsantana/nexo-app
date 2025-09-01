# Documentação da API

Este documento descreve as funções e métodos da API utilizados no `nexo-app-v1` para interagir com o backend (Firebase/Firestore).

## Visão Geral

A camada de API do aplicativo é responsável por abstrair as interações com o Firebase, fornecendo funções limpas para autenticação, operações de banco de dados e outras funcionalidades de backend.

## Módulos da API

### `src/api/auth.ts`

Este módulo lida com todas as operações relacionadas à autenticação de usuários, interagindo diretamente com o Firebase Authentication.

**Funções:**

-   `register(email: string, password: string)`
    -   **Descrição:** Registra um novo usuário no Firebase Authentication com o email e senha fornecidos.
    -   **Parâmetros:**
        -   `email` (string): O endereço de e-mail do novo usuário.
        -   `password` (string): A senha do novo usuário (mínimo de 6 caracteres).
    -   **Retorno:** `Promise<UserCredential>`: Uma Promise que resolve com um objeto `UserCredential` do Firebase em caso de sucesso. Este objeto contém informações sobre o usuário recém-criado.
    -   **Possíveis Erros/Exceções:**
        -   `auth/email-already-in-use`: O e-mail fornecido já está em uso por outra conta.
        -   `auth/invalid-email`: O formato do e-mail é inválido.
        -   `auth/weak-password`: A senha fornecida é muito fraca (deve ter pelo menos 6 caracteres).
        -   Outros erros do Firebase Authentication.
    -   **Exemplo de Uso:**
        ```typescript
        import { register } from './auth';

        try {
          const userCredential = await register('novo.usuario@example.com', 'senhaSegura123');
          console.log('Usuário registrado com sucesso:', userCredential.user.uid);
        } catch (error: any) {
          console.error('Erro ao registrar:', error.code, error.message);
        }
        ```

-   `login(email: string, password: string)`
    -   **Descrição:** Autentica um usuário existente no Firebase Authentication com o email e senha fornecidos.
    -   **Parâmetros:**
        -   `email` (string): O endereço de e-mail do usuário.
        -   `password` (string): A senha do usuário.
    -   **Retorno:** `Promise<UserCredential>`: Uma Promise que resolve com um objeto `UserCredential` do Firebase em caso de sucesso.
    -   **Possíveis Erros/Exceções:**
        -   `auth/invalid-email`: O formato do e-mail é inválido.
        -   `auth/user-disabled`: A conta do usuário foi desativada.
        -   `auth/user-not-found`: Não há registro de usuário correspondente ao e-mail fornecido.
        -   `auth/wrong-password`: A senha é inválida ou o usuário não tem uma senha.
        -   Outros erros do Firebase Authentication.
    -   **Exemplo de Uso:**
        ```typescript
        import { login } from './auth';

        try {
          const userCredential = await login('usuario.existente@example.com', 'minhaSenha');
          console.log('Usuário logado com sucesso:', userCredential.user.uid);
        } catch (error: any) {
          console.error('Erro ao fazer login:', error.code, error.message);
        }
        ```

-   `logout()`
    -   **Descrição:** Desconecta o usuário atualmente autenticado do Firebase.
    -   **Parâmetros:** Nenhum.
    -   **Retorno:** `Promise<void>`: Uma Promise que resolve quando o usuário é desconectado com sucesso.
    -   **Possíveis Erros/Exceções:** Erros de rede ou problemas de comunicação com o Firebase.
    -   **Exemplo de Uso:**
        ```typescript
        import { logout } from './auth';

        try {
          await logout();
          console.log('Usuário desconectado com sucesso.');
        } catch (error: any) {
          console.error('Erro ao fazer logout:', error.message);
        }
        ```

-   `getCurrentUser()`
    -   **Descrição:** Retorna o objeto `User` do Firebase para o usuário atualmente autenticado.
    -   **Parâmetros:** Nenhum.
    -   **Retorno:** `User | null`: O objeto `User` se um usuário estiver logado, ou `null` caso contrário.
    -   **Possíveis Erros/Exceções:** Nenhum erro direto, pois apenas retorna o estado atual.
    -   **Exemplo de Uso:**
        ```typescript
        import { getCurrentUser } from './auth';

        const user = getCurrentUser();
        if (user) {
          console.log('Usuário atual:', user.email);
        } else {
          console.log('Nenhum usuário logado.');
        }
        ```

-   `onAuthStateChanged(callback: (user: User | null) => void)`
    -   **Descrição:** Configura um observador para detectar mudanças no estado de autenticação do usuário (login, logout). O `callback` é invocado sempre que o estado de autenticação muda.
    -   **Parâmetros:**
        -   `callback` (function): Uma função que será chamada com o objeto `User` (se o usuário estiver logado) ou `null` (se o usuário estiver deslogado).
    -   **Retorno:** `firebase.Unsubscribe`: Uma função que, quando chamada, remove o observador de estado de autenticação.
    -   **Possíveis Erros/Exceções:** Nenhum erro direto, pois é um observador.
    -   **Exemplo de Uso:**
        ```typescript
        import { onAuthStateChanged } from './auth';

        const unsubscribe = onAuthStateChanged((user) => {
          if (user) {
            console.log('Estado de autenticação mudou: Usuário logado', user.uid);
          } else {
            console.log('Estado de autenticação mudou: Usuário deslogado');
          }
        });

        // Para parar de observar:
        // unsubscribe();
        ```

### `src/api/firestore.ts`

Este módulo contém funções para interagir com o Firestore (banco de dados NoSQL do Firebase), focando em operações específicas do domínio da aplicação.

**Funções:**

-   `createUserProfile(userId: string, profileData: object)`: Cria um documento de perfil de usuário no Firestore. Retorna uma Promise<void>.
-   `getUserProfile(userId: string)`: Recupera um documento de perfil de usuário do Firestore. Retorna uma Promise<object|null>.
-   `getUsersByIds(userIds: Array<string>)`: Recupera múltiplos perfis de usuário a partir de uma lista de IDs. Retorna um `Map` onde a chave é o ID do usuário e o valor são os dados do perfil.
-   `updateUserProfile(userId: string, profileData: object)`: Atualiza um documento de perfil de usuário no Firestore. Retorna uma Promise<void>.
-   `searchUsers(queryString: string)`: Busca usuários com base em uma string de consulta (prefixo de email). Retorna uma Promise<Array<object>>.
-   `createProposal(senderId: string, receiverId: string, skillOffered: string, skillRequested: string, message: string)`: Cria uma nova proposta de troca de habilidades. Retorna uma Promise<DocumentReference>.
-   `getSentProposals(userId: string)`: Busca propostas enviadas por um usuário específico. Retorna uma Promise<Array<object>>.
-   `getReceivedProposals(userId: string)`: Busca propostas recebidas por um usuário específico. Retorna uma Promise<Array<object>>.
-   `updateProposalStatus(proposalId: string, newStatus: string)`: Atualiza o status de uma proposta específica. Retorna uma Promise<void>.
-   `createChat(user1Id: string, user2Id: string)`: Cria ou obtém um documento de chat entre dois usuários. Retorna uma Promise<string> (o ID do chat).
-   `sendMessage(chatId: string, senderId: string, text: string)`: Envia uma mensagem em um chat específico. Retorna uma Promise<DocumentReference>.
-   `getMessages(chatId: string, callback: (messages: Array<object>) => void)`: Ouve atualizações em tempo real para mensagens em um chat. Retorna uma função de unsubscribe.
-   `completeProposal(proposalId: string, studentId: string, teacherId: string, hours: number)`: Conclui uma proposta e atualiza os saldos de horas de forma atômica (usando uma transação). Debita as horas do `studentId` e credita ao `teacherId`. Lança um erro se a proposta não estiver no estado 'accepted' ou 'scheduled', se os usuários não existirem, ou se o aluno não tiver saldo suficiente.
-   `createReview(proposalId: string, reviewerId: string, revieweeId: string, rating: number, comment: string)`: Cria uma nova avaliação para uma proposta concluída. Retorna uma Promise<DocumentReference>.

### `src/api/firebase.ts`

Este módulo é responsável pela inicialização e configuração do Firebase.

**Funções:**

-   `initializeFirebase()`: Inicializa o aplicativo Firebase com as credenciais configuradas.

