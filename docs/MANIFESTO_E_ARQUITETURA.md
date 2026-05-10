# Manifesto e Documento de Arquitetura: Projeto "Arquipélago" (Nome Provisório)

## 1. Visão Geral e Propósito
Uma plataforma focada em "Small Tech" para coletivos, estruturada não como uma rede social de engajamento, mas como uma ferramenta de gestão de vínculos, memória e curadoria. O objetivo é fornecer infraestrutura para **Apoio Mútuo** (privado) e transbordamento intencional de **Pontos de Beleza** (público), garantindo soberania de dados, redução de danos e acessibilidade radicular.

---

## 2. Conceitos Fundamentais (Definidos)

### 2.1. O Bastidor (A Raiz Privada)
*   **O que é:** O espaço seguro de um grupo. Uma ilha isolada focada em organização e acolhimento.
*   **Dinâmica:** Consumo assíncrono, sem gamificação (sem likes ou contadores de visualização).
*   **Elementos Internos:** 
    *   *Feed Interno:* Para trocas diárias e desabafos (fluxo cronológico).
    *   *O Acervo:* Agregador cultural perene e memória do grupo.
    *   *Artefatos:* Documentos editáveis laterais (painéis) para construção de conhecimento consolidado, separando a utilidade do ruído do chat.

### 2.2. A Identidade vs. O Perfil
*   **Identidade Única:** Chaves criptográficas geradas localmente + um identificador público global (`@username` como "caixa de correio").
*   **Perfis Fluídos:** A "roupa" que o usuário veste em cada Bastidor. Totalmente desvinculados uns dos outros. Um Bastidor pode exigir o nome formal e o cargo; outro pode permitir avatares lúdicos (despersonalização). O servidor não cruza essas informações.

### 2.3. A Ponte (A Vitrine Pública)
*   **O que é:** O mecanismo de exportação intencional de conteúdo do Bastidor para protocolos abertos (iniciando pelo **Bluesky / AT Protocol**).
*   **Regra de Ouro:** A exportação exige validação de acessibilidade (Alt-text obrigatório) e, em muitos casos, consenso do grupo (ex: aprovação de curadores) para evitar impulsos e ações coordenadas maliciosas.

---

## 3. Arquitetura Técnica e Engenharia

### 3.1. O Servidor "Carteiro Cego" (Conhecimento Zero)
*   **Criptografia:** End-to-End Encryption (E2EE) padrão. O servidor hospeda apenas pacotes de dados incompreensíveis. O esquema de dados (schema) é resolvido no cliente (PWA).
*   **Multi-tenant Isolado:** Cada Bastidor possui seu próprio arquivo de banco de dados (ex: SQLite). Facilita o isolamento e o êxodo (self-hosting futuro).
*   **Comunicação:** Server-Sent Events (SSE) para sincronização assíncrona leve e barata, rejeitando a sobrecarga dos WebSockets.
*   **Infraestrutura:** Containers limpos e modulares, otimizados para rodar em VPS de baixo custo, preparados para que entidades do terceiro setor possam hospedar suas próprias instâncias facilmente no futuro.

### 3.2. Descoberta, Convites e Autenticação
*   **Autenticação:** Sessão baseada em provedor padrão que libera um "Cofre Criptografado", o qual é destrancado *localmente* por uma senha ou Passkey do usuário.
*   **Convites Diretos:** Via `@username` (convite trancado com a chave pública do destinatário).
*   **Convites por Link:** Link mágico contendo a chave do Bastidor apenas no *hash* (`#chave`), garantindo que o servidor nunca veja a senha ao rotear o novato.
*   **Histórico:** Novatos, ao entrarem, recebem a chave atual e têm acesso ao Acervo e memória passada (Forward Secrecy flexibilizada em prol da construção de cultura).
*   **Recuperação:** Combinação de "Cofre no Servidor" (para o diário local) e "Recuperação Social" (o coletivo devolve o acesso a quem perdeu as chaves).

---

## 4. Caminhos Descartados (O que NÃO somos)

*   **Discord:** Descartado devido à interface pesada, gamificada e arquitetura de banco de dados centralizada e monopolista.
*   **WhatsApp:** Descartado pelo "colapso de contexto", efemeridade das conversões (Cemitério de Ideias) e falta de organização em Artefatos isolados.
*   **ActivityPub/ATProto como núcleo privado:** Descartados para a camada interna porque foram desenhados para serem praças públicas. Serão usados apenas como destinatários na "Ponte".

---

## 5. UI, UX e Acessibilidade

*   **Estética:** Minimalista, "Single-page application" (SPA/PWA). Design limpo, focado em leitura confortável e organização. 
*   **Paleta:** Cores sóbrias e calmas, com detalhes em roxo para conforto visual.
*   **Acessibilidade Radicular:** Textos alternativos descritivos não são um recurso extra, são bloqueadores de envio. A ferramenta deve promover alfabetização digital, explicando de forma amigável quando dados estão sendo trancados.

---

## 6. Governança de Segurança, Privacidade e Mitigação de Danos

A premissa central da plataforma é a arquitetura de **Conhecimento Zero (Zero-Knowledge)**. O servidor atua estritamente como um "carteiro cego", armazenando e roteando pacotes criptografados. Como a moderação proativa de conteúdo é matematicamente impossível, o sistema adota diretrizes de _Privacy by Design_ para blindar a infraestrutura contra abusos, sem criar vulnerabilidades ou "portas dos fundos" (backdoors).

### 6.1. Gestão Criptográfica, Identidade e Histórico

- **Separação Identidade vs. Perfil:** A Identidade é ancorada em chaves criptográficas invisíveis e um `@username` (caixa de correio pública). O Perfil (nome, foto, cargo) é um pacote de dados criptografado que só existe _dentro_ do banco de dados isolado de cada Bastidor.
    
- **Recuperação de Acesso:** O sistema adota duas vias principais:
    
    1. _Cofre no Servidor:_ A Chave Privada do usuário é trancada por uma Senha de Recuperação forte no cliente e salva como um cofre indecifrável no servidor.
        
    2. _Recuperação Social:_ Em caso de perda total, a comunidade de um Bastidor pode remover a chave comprometida e convidar a nova Identidade do usuário, devolvendo o acesso ao ambiente coletivo.
        
- **Acesso ao Histórico (Cultura vs. Forward Secrecy):** Para preservar a memória do coletivo, membros recém-adicionados recebem a chave simétrica atual do Bastidor, permitindo descriptografar o Acervo e o histórico passado.
    
- **A Catraca Criptográfica (Despejo Seguro):** Se um membro é expulso do Bastidor, o aplicativo do administrador gera silenciosamente uma _nova_ Chave do Bastidor, tranca com os cadeados apenas dos membros remanescentes e invalida a chave antiga para postagens futuras. O membro expulso fica imediatamente cego para novas atualizações.
    

### 6.2. Armazenamento de Mídias e Arquivos (Blobs)

- **Isolamento de Arquivos Pesados:** Bancos de dados SQLite locais não armazenam vídeos ou PDFs. O cliente criptografa o arquivo inteiro antes do upload.
    
- **Hospedagem "Burra":** O arquivo é enviado como um formato incompreensível (`.enc`) para um _Object Storage_ (Bucket S3/R2). O servidor devolve a URL, que trafega no Bastidor como uma mensagem de texto normal, acompanhada da chave de descriptografia gerada pelo cliente.
    

### 6.3. Moderação e Abuso Interno (Reporte Criptográfico)

- **O Paradoxo da Moderação:** O servidor não pode varrer os Bastidores em busca de assédio ou discurso de ódio.
    
- **Reporte Assinado (Message Franking):** Se um membro sofrer abuso dentro do grupo, ele pode utilizar o botão "Denunciar". O seu cliente desencripta voluntariamente a mensagem abusiva e a envia para a administração, anexada à assinatura criptográfica original do agressor. Isso prova matematicamente a autoria e impede forjamento de provas, permitindo o banimento global da Identidade ofensora.
    
- **Análise de Metadados Ofuscados:** O servidor monitora a volumetria (não o conteúdo e desvinculado de Identidades). Bastidores com picos anômalos de upload ou disparo massivo de convites (comportamento de bot/spam ou rede de distribuição ilegal) são suspensos sumariamente pelos algoritmos de defesa da infraestrutura.
    

### 6.4. Demandas Judiciais e Policiais (O Mínimo Legal)

A plataforma responde a exigências legais baseando-se no princípio da **Minimização de Dados**. Não se pode entregar o que não se possui.

- **Cumprimento do Marco Civil:** O sistema guarda registros de acesso (IP, data, hora, fuso horário) pelo prazo legal e exato de **6 meses**. No 181º dia, um processo automatizado realiza a exclusão física e irrecuperável desses logs.
    
- **Rejeição do "Efeito Honeypot":** Logs de ações detalhadas (grafo social de quem falou com quem) não são mantidos a longo prazo para evitar a criação de mapas de relacionamento que exponham coletivos e populações vulneráveis.
    
- **Entrega de Dados:** Mediante ordem judicial, a plataforma entrega o banco de dados do Bastidor exatamente como ele existe no servidor: **totalmente criptografado e ilegível**. A arquitetura não será alterada para decodificar dados, cabendo à autoridade policial a posse estrita do conteúdo matemático.
    
- **Warrant Canary:** A plataforma manterá um "canário" público atestando a ausência de ordens de interceptação secretas.
    

### 6.5. Demandas Extrajudiciais (Direitos Autorais e DMCA)

- **Remoção Cega de URLs:** Caso haja uma notificação legal válida apontando a URL exata de um arquivo hospedado nos _buckets_ da plataforma (ex: pirataria), o arquivo será deletado fisicamente do servidor de armazenamento.
    
- **Efeito em Cadeia:** O servidor não precisa saber qual Bastidor compartilhou o arquivo. Uma vez deletado, os clientes que tentarem descriptografar aquela URL apresentarão a mensagem "Mídia Removida".
    
- **Direito de Exclusão:** Os Termos de Uso reservam o direito de excluir o arquivo SQLite de um Bastidor inteiro, a qualquer momento, caso os metadados indiquem o uso da infraestrutura como refúgio para operações criminosas estruturadas, sem necessidade de aviso prévio.
---
*Documento vivo. Versão 1.0.*