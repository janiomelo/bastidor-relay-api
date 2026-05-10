# 🏗️ Infraestrutura e Distribuição: Bastidor

Este documento detalha as decisões de hospedagem, segurança e entrega da aplicação, priorizando baixa latência, soberania de dados e resiliência.

## 1. Topologia da Rede

A infraestrutura é dividida em dois eixos principais: o **Santuário (Frontend PWA)** e o **Relay (Backend de Sincronização)**.

### 🌐 Frontend & Edge: Cloudflare Pages

O frontend é distribuído como uma aplicação estática (Vite Build) via Cloudflare.

- **Por que Cloudflare Pages:**
    
    - **Controle de Headers:** Essencial para habilitar `SharedArrayBuffer` via cabeçalhos **COOP** (_Cross-Origin-Opener-Policy_) e **COEP** (_Cross-Origin-Embedder-Policy_), garantindo performance máxima para o **SQLite WASM**.
        
    - **Global Edge:** O JS e o WASM são servidos de servidores em São Paulo e outras capitais brasileiras, reduzindo o tempo de "Primeira Pintura" (FCP).
        
    - **Segurança (WAF):** Proteção nativa contra ataques DDoS e injeção de scripts que poderiam comprometer as chaves locais.
        

### 🚀 Backend Relay: Railway (Docker)

O servidor de sincronização e metadados reside em containers no Railway.

- **Por que Railway + Docker:**
    
    - **Portabilidade:** O uso de **Docker** garante que o Relay possa ser movido para qualquer VPS ou provedor Cloud sem reescrita de código.
        
    - **Segurança de Dados:** O banco de dados PostgreSQL gerido pelo Railway armazena apenas hashes de senhas e envelopes criptografados.
        
    - **Auto-deploy:** Integração nativa com o GitHub para CI/CD simplificado.
        

---

## 2. Comunicação e Mensageria

### 📧 E-mail Transacional: Resend

- **Função:** Validação de identidade e alertas de segurança.
    
- **Decisão:** Escolhido pela alta taxa de entregabilidade e suporte a **React Email**, permitindo que os e-mails transacionais mantenham a identidade visual (serifada/editorial) do app.
    

### 📡 DNS e Domínio: Cloudflare

- **Email Routing:** Gerenciamento de caixas de entrada `@bastidor.digital` (ou similar) sem custo de servidor de e-mail.
    
- **SSL/TLS:** Criptografia de transporte (HTTPS) forçada em toda a rede.
    

---

## 3. Fluxo de Distribuição (CI/CD)

1. **Push para GitHub:** O gatilho inicial.
    
2. **Lint & Security Check:** O CI verifica se há "dados fake" ou strings proibidas no diretório `src/`.
    
3. **Build Automático:**
    
    - O **Cloudflare Pages** gera o bundle do frontend e aplica os cabeçalhos do arquivo `_headers`.
        
    - O **Railway** constrói a imagem Docker e sobe a nova versão do Relay.
        
4. **Health Check:** Verificação de integridade da conexão entre Frontend e API.
    

---

## 4. Configuração de Headers (Exemplo `public/_headers`)

Para garantir que o SQLite funcione no topo da performance, o arquivo de configuração no Cloudflare Pages deve conter:

HTTP

```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
```

---

## 5. Custos e Escalabilidade

A arquitetura foi desenhada para o **Nível Gratuito/Hobby** inicial, permitindo validar o produto com custo próximo de zero, escalando apenas conforme o volume de usuários (armazenamento de Blobs no S3/Railway) aumentar.