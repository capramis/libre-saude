# 2. Atalho Libre - Configurar

Este atalho faz o login com a conta de **seguidor** (a mesma do app LibreLinkUp), descobre o paciente que você segue e salva o necessário no `config.json`. A senha não é guardada.

Rode ele uma vez na instalação e de novo quando o token expirar, o que acontece mais ou menos a cada 6 meses. Quando isso acontecer, o Calibrar, o Sincronizar e o widget avisam.

## Região

O passo 5 usa o servidor da América Latina, `https://api-la.libreview.io`, que é o certo para contas do Brasil. Para outros países:

- Comece pelo servidor global, `https://api.libreview.io`. Se a API mandar para outra região, os passos 12 a 22 refazem o login no servidor certo sozinhos.
- Se o login funcionar mas o passo 39 disser que não há paciente, troque o passo 5 por `https://api-<região>.libreview.io`, com a sigla da sua região em minúsculas (`eu`, `de`, `fr`, `au`, `ca`, `jp`, `ap`, `ae`…).

## Criar o atalho

Crie um atalho novo com o nome **Libre - Configurar** e adicione as ações abaixo, na ordem.

### Pedir os dados da conta

1. **Pedir Entrada** (Ask for Input). Tipo: **Texto**. Pergunta: `E-mail da conta LibreLinkUp (o mesmo do app LibreLinkUp)`.
2. **Definir Variável** (Set Variable). Nome: `Email`. Entrada: o **Texto Fornecido** do passo 1.
3. **Pedir Entrada**. Tipo: **Texto**. Pergunta: `Senha da conta LibreLinkUp`.
4. **Definir Variável**. Nome: `Senha`. Entrada: o Texto Fornecido do passo 3.
5. **Texto** (Text): `https://api-la.libreview.io`. Repare no `-la` depois de `api`.
6. **Definir Variável**. Nome: `Base`. Entrada: o **Texto** do passo 5.

### Fazer o login

7. **Texto**: `[Base]/llu/auth/login`. Insira a variável Base e escreva `/llu/auth/login` logo depois, sem espaço.
8. **Obter Conteúdo do URL** (Get Contents of URL). URL: o Texto do passo 7. Toque na seta para abrir as opções:
    1. Método: **POST**
    2. Em **Cabeçalhos**, adicione dois: chave `product`, valor `llu.ios`. Depois, chave `version`, valor `4.16.0`.
    3. Corpo da Solicitação: **JSON**. Adicione um campo do tipo **Texto** com chave `email` e valor `[Email]`. Depois, outro campo do tipo **Texto** com chave `password` e valor `[Senha]`.
9. **Definir Variável**. Nome: `Resp`. Entrada: o **Conteúdo do URL** do passo 8.
10. **Obter Texto da Entrada** (Get Text from Input). Entrada: `[Resp]`.
11. **Definir Variável**. Nome: `RespTexto`. Entrada: o **Texto** do passo 10.

### Se a API mandar para outra região

12. **Se** (If). Entrada: `[RespTexto]`. Condição: **contém**. Valor: `"redirect":true`.
13. Dentro do Se: **Obter Valor do Dicionário** (Get Dictionary Value). Chave: `data.region`. Dicionário: `[Resp]`.
14. Dentro do Se: **Definir Variável**. Nome: `Regiao`. Entrada: o **Valor do Dicionário** do passo 13.
15. Dentro do Se: **Texto**: `https://api-[Regiao].libreview.io`
16. Dentro do Se: **Definir Variável**. Nome: `Base`. Entrada: o Texto do passo 15.
17. Dentro do Se: **Texto**: `[Base]/llu/auth/login`
18. Dentro do Se: **Obter Conteúdo do URL**. URL: o Texto do passo 17. Método: **POST**. Cabeçalhos: `product` = `llu.ios` e `version` = `4.16.0`. Corpo: **JSON**, com `email` = `[Email]` e `password` = `[Senha]`, os dois do tipo Texto.
19. Dentro do Se: **Definir Variável**. Nome: `Resp`. Entrada: o Conteúdo do URL do passo 18.
20. Dentro do Se: **Obter Texto da Entrada**. Entrada: `[Resp]`.
21. Dentro do Se: **Definir Variável**. Nome: `RespTexto`. Entrada: o Texto do passo 20.
22. **Fim Se**.

### Conferir o login

23. **Se**. Entrada: `[RespTexto]`. Condição: **não contém**. Valor: `authTicket`.
24. Dentro do Se: **Mostrar Alerta** (Show Alert). Texto: `Login falhou: [RespTexto]`.
25. Dentro do Se: **Parar Este Atalho** (Stop This Shortcut).
26. **Fim Se**.

### Token e Account-Id

27. **Obter Valor do Dicionário**. Chave: `data.authTicket.token`. Dicionário: `[Resp]`.
28. **Definir Variável**. Nome: `Token`. Entrada: o Valor do Dicionário do passo 27.
29. **Obter Valor do Dicionário**. Chave: `data.user.id`. Dicionário: `[Resp]`.
30. **Definir Variável**. Nome: `UserId`. Entrada: o Valor do Dicionário do passo 29.
31. **Gerar Hash** (Generate Hash). Tipo: **SHA256**. Entrada: `[UserId]`.
32. **Definir Variável**. Nome: `AccountId`. Entrada: o **Hash** do passo 31.

### Buscar o paciente que você segue

33. **Texto**: `[Base]/llu/connections`
34. **Obter Conteúdo do URL**. URL: o Texto do passo 33. Método: **GET**. Em **Cabeçalhos**, adicione quatro:
    1. Chave `product`, valor `llu.ios`
    2. Chave `version`, valor `4.16.0`
    3. Chave `Authorization`, valor `Bearer [Token]`: digite a palavra Bearer, um espaço e insira a variável Token
    4. Chave `Account-Id`, valor `[AccountId]`
35. **Definir Variável**. Nome: `Conex`. Entrada: o Conteúdo do URL do passo 34.
36. **Obter Texto da Entrada**. Entrada: `[Conex]`.
37. **Definir Variável**. Nome: `ConexTexto`. Entrada: o Texto do passo 36.
38. **Se**. Entrada: `[ConexTexto]`. Condição: **não contém**. Valor: `patientId`.
39. Dentro do Se: **Mostrar Alerta**. Texto: `Nenhum paciente encontrado. Resposta da API: [ConexTexto]`.
40. Dentro do Se: **Parar Este Atalho**.
41. **Fim Se**.
42. **Obter Valor do Dicionário**. Chave: `data`. Dicionário: `[Conex]`.
43. **Definir Variável**. Nome: `ListaConex`. Entrada: o Valor do Dicionário do passo 42.
44. **Obter Item da Lista** (Get Item from List). Obter: **Primeiro Item**. Lista: `[ListaConex]`.
45. **Definir Variável**. Nome: `Paciente`. Entrada: o **Item da Lista** do passo 44.
46. **Obter Valor do Dicionário**. Chave: `patientId`. Dicionário: `[Paciente]`.
47. **Definir Variável**. Nome: `PatientId`. Entrada: o Valor do Dicionário do passo 46.
48. **Obter Valor do Dicionário**. Chave: `firstName`. Dicionário: `[Paciente]`.
49. **Definir Variável**. Nome: `Nome`. Entrada: o Valor do Dicionário do passo 48.

### Salvar a configuração

50. **Dicionário** (Dictionary). Toque em **Adicionar novo item** quatro vezes, sempre escolhendo **Texto**:
    1. Chave `base`, valor `[Base]`
    2. Chave `token`, valor `[Token]`
    3. Chave `accountId`, valor `[AccountId]`
    4. Chave `patientId`, valor `[PatientId]`
51. **Salvar Arquivo** (Save File). Entrada: o **Dicionário** do passo 50. Desative **Perguntar Onde Salvar**. Pasta: **Atalhos**. Subcaminho: `Libre/config.json`. Ative **Substituir se Existir**.
52. **Mostrar Notificação** (Show Notification). Texto: `Conectado ao Libre de [Nome].`

As chaves do passo 50 têm que estar escritas exatamente assim: `base`, `token`, `accountId` (com o I maiúsculo) e `patientId`. Os outros atalhos e o widget procuram esses nomes.

## Testar

Rode o atalho. Na primeira vez, o Atalhos pergunta se pode acessar `api-la.libreview.io`: toque em **Permitir**.

Deu certo se aparecer a notificação com o nome da pessoa seguida. Para conferir o arquivo, crie um atalho temporário com **Obter Arquivo da Pasta** (Atalhos, `Libre/config.json`) → **Obter Texto da Entrada** → **Mostrar Resultado**. Os quatro campos precisam estar preenchidos. Esse texto contém o token: não compartilhe.

Próximo: [3. Libre - Calibrar](03-calibrar.md)
