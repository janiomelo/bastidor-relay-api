# 🧠 Contexto Técnico: Autenticação E2EE

## Por que não "Login Social" puro agora?
Embora queiramos Google/Apple no futuro, precisamos primeiro da base de **E-mail/Senha** porque o hash da senha é o que gera a entropia para proteger a Chave Privada do usuário sem que o servidor a conheça.

## Fluxo de Recuperação
- O servidor guarda o `encryptedPrivateKey`. 
- Se o usuário trocar de celular, ele digita e-mail/senha.
- O servidor devolve o envelope da chave privada.
- O app tenta abrir com a senha. Se o usuário esquecer a senha, ele perde o acesso aos Bastidores antigos (soberania total).

## Remoção de Fakes
A partir desta fase, o estado `unauthenticated` deve redirecionar para `/login`. Nenhum dado de `Xepa` ou `usuario-demo` deve ser injetado via código.