# ⚓ Bastidor: Sistema de Identidade e Relay

Este repositório contém a lógica de Identidade Transparente e o contrato de comunicação com o Backend.

## 🔐 O Protocolo de Login
No Bastidor, o login não é apenas uma autenticação; é o **desbloqueio do cofre**.

1. **Derivação Local:** A senha do usuário nunca é enviada pura. O app deriva uma `MasterKey` localmente.
2. **Cofre:** A Chave Privada global é guardada no servidor de forma `Zero-Knowledge` (criptografada com a `MasterKey`).
3. **Sessão:** Utilizamos JWT para persistência de conexão, mas o acesso aos dados exige a chave privada descriptografada em memória.

## 🛠️ Stack do Relay
- **API:** Node.js (Fastify) ou Go.
- **DB:** PostgreSQL.
- **Auth:** JWT + Argon2/BCrypt (no servidor).