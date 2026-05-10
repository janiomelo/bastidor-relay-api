# 📡 Contrato do Backend (Relay)

O servidor deve ser minimalista e focado em alta disponibilidade e integridade de entrega.

## 🏗️ Responsabilidades do Servidor
1. **Roteamento de Pacotes:** Receber o envelope criptografado e distribuir para os outros membros do Bastidor.
2. **Persistência de Longo Prazo:** Guardar os envelopes (mensagens e objetos) para que novos membros ou membros offline possam sincronizar.
3. **Gestão de Retenção:** Cumprir a regra de 6 meses de logs de acesso (IP/Timestamp) sem vincular ao conteúdo.

## 🛠️ Endpoints Principais (API)
- `POST /sync`: Recebe um lote de novas intervenções da `sync_queue` do cliente.
- `GET /stream`: Conexão (WebSockets ou SSE) para receber atualizações em tempo real.
- `POST /vault`: Upload de blobs criptografados (imagens/arquivos).
- `GET /vault/:id`: Download de blobs criptografados.

## 📋 Schema do Banco do Servidor (Minimalista)
- **Tabela `envelopes`:**
    - `id_envelope` (UUID)
    - `id_bastidor` (UUID)
    - `payload_encriptado` (TEXT/BLOB)
    - `assinatura_autor` (TEXT)
    - `timestamp_servidor` (Para ordem de chegada)