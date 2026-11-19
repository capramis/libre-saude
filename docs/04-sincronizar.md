# 4. Atalho Libre - Sincronizar Glicose

Este atalho baixa as últimas 12 horas do LibreLinkUp e confere se o sensor atual já foi calibrado. Depois grava no Saúde, com o offset somado, só as leituras posteriores à última já gravada. Rodá-lo várias vezes não duplica nada.

Como ele roda por automação, sem ninguém olhando, avisa por **notificação** e nunca por alerta, que travaria a execução.

O atalho **Libre - Converter Data** precisa existir antes, porque o passo 61 chama ele.

## Criar o atalho

Crie um atalho novo com o nome **Libre - Sincronizar Glicose** e adicione as ações abaixo, na ordem. O widget do Scriptable chama este atalho por esse nome exato.

### Ler a configuração

1. **Obter Arquivo da Pasta** (Get File from Folder). Pasta: **Atalhos**. Caminho: `Libre/config.json`. Deixe **Erro se Não Encontrado** ativado.
2. **Obter Dicionário da Entrada** (Get Dictionary from Input). Entrada: o **Arquivo** do passo 1.
3. **Definir Variável** (Set Variable). Nome: `Config`. Entrada: o **Dicionário** do passo 2.
4. **Obter Valor do Dicionário** (Get Dictionary Value). Chave: `base`. Dicionário: `[Config]`.
5. **Definir Variável**. Nome: `Base`. Entrada: o **Valor do Dicionário** do passo 4.
6. **Obter Valor do Dicionário**. Chave: `token`. Dicionário: `[Config]`.
7. **Definir Variável**. Nome: `Token`. Entrada: o Valor do Dicionário do passo 6.
8. **Obter Valor do Dicionário**. Chave: `accountId`. Dicionário: `[Config]`.
9. **Definir Variável**. Nome: `AccountId`. Entrada: o Valor do Dicionário do passo 8.
10. **Obter Valor do Dicionário**. Chave: `patientId`. Dicionário: `[Config]`.
11. **Definir Variável**. Nome: `PatientId`. Entrada: o Valor do Dicionário do passo 10.

### Baixar o histórico de 12 h

12. **Texto** (Text): `[Base]/llu/connections/[PatientId]/graph`. Insira a variável Base, escreva `/llu/connections/`, insira a variável PatientId e escreva `/graph`, tudo sem espaços.
13. **Obter Conteúdo do URL** (Get Contents of URL). URL: o **Texto** do passo 12. Toque na seta para abrir as opções. Método: **GET**. Em **Cabeçalhos**, adicione quatro:
    1. Chave `product`, valor `llu.ios`
    2. Chave `version`, valor `4.16.0`
    3. Chave `Authorization`, valor `Bearer [Token]`: digite a palavra Bearer, um espaço e insira a variável Token
    4. Chave `Account-Id`, valor `[AccountId]`
14. **Definir Variável**. Nome: `Graf`. Entrada: o **Conteúdo do URL** do passo 13.
15. **Obter Texto da Entrada** (Get Text from Input). Entrada: `[Graf]`.
16. **Definir Variável**. Nome: `GrafTexto`. Entrada: o **Texto** do passo 15.
17. **Se** (If). Entrada: `[GrafTexto]`. Condição: **não contém**. Valor: `graphData`.
18. Dentro do Se: **Mostrar Notificação** (Show Notification). Texto: `Libre: falha na API. Resposta: [GrafTexto]`
19. Dentro do Se: **Parar Este Atalho** (Stop This Shortcut).
20. **Fim Se**.
21. **Obter Valor do Dicionário**. Chave: `data.graphData`. Dicionário: `[Graf]`.
22. **Definir Variável**. Nome: `Leituras`. Entrada: o Valor do Dicionário do passo 21.

### Identificar o sensor atual

23. **Obter Valor do Dicionário**. Chave: `data.connection.sensor.sn`. Dicionário: `[Graf]`.
24. **Definir Variável**. Nome: `Serial`. Entrada: o Valor do Dicionário do passo 23.

### Conferir se este sensor já foi calibrado

25. **Obter Arquivo da Pasta**. Pasta: **Atalhos**. Caminho: `Libre/offset.txt`. **Desative** Erro se Não Encontrado.
26. **Definir Variável**. Nome: `ArqOffset`. Entrada: o Arquivo do passo 25.
27. **Se**. Entrada: `[ArqOffset]`. Condição: **não tem valor**.
28. Dentro do Se: **Mostrar Notificação**. Texto: `Libre: nenhum sensor calibrado. Rode Libre - Calibrar.`
29. Dentro do Se: **Parar Este Atalho**.
30. **Fim Se**.
31. **Obter Texto da Entrada**. Entrada: `[ArqOffset]`.
32. **Dividir Texto** (Split Text). Texto: o Texto do passo 31. Separador: **Novas Linhas**.
33. **Obter Item da Lista** (Get Item from List). Obter: **Último Item**. Lista: o **Texto Dividido** do passo 32. Se o arquivo tiver mais de uma linha, vale a última, que é a calibração mais recente.
34. **Dividir Texto**. Texto: o **Item da Lista** do passo 33. Separador: **Personalizado**, `;`.
35. **Definir Variável**. Nome: `Partes`. Entrada: o Texto Dividido do passo 34.
36. **Obter Item da Lista**. Obter: **Item no Índice**. Índice: `1`. Lista: `[Partes]`.
37. **Definir Variável**. Nome: `SerialCal`. Entrada: o Item da Lista do passo 36.
38. **Obter Item da Lista**. Obter: **Item no Índice**. Índice: `2`. Lista: `[Partes]`.
39. **Obter Números da Entrada** (Get Numbers from Input). Entrada: o Item da Lista do passo 38.
40. **Definir Variável**. Nome: `Offset`. Entrada: os **Números** do passo 39.
41. **Se**. Entrada: `[SerialCal]`. Condição: **não é**. Valor: `[Serial]`.
42. Dentro do Se: **Mostrar Notificação**. Texto: `Libre: sensor novo ([Serial]) sem calibração. Nada foi gravado. Rode Libre - Calibrar em até 12 h para não perder leituras.`
43. Dentro do Se: **Parar Este Atalho**.
44. **Fim Se**.

### Saber até onde já foi gravado

45. **Obter Arquivo da Pasta**. Pasta: **Atalhos**. Caminho: `Libre/ultimo.txt`. **Desative** Erro se Não Encontrado.
46. **Definir Variável**. Nome: `ArqUltimo`. Entrada: o Arquivo do passo 45.
47. **Se**. Entrada: `[ArqUltimo]`. Condição: **tem qualquer valor**.
48. Dentro do Se: **Obter Texto da Entrada**. Entrada: `[ArqUltimo]`.
49. Dentro do Se: **Obter Datas da Entrada** (Get Dates from Input). Entrada: o Texto do passo 48.
50. Dentro do Se: **Definir Variável**. Nome: `Ultimo`. Entrada: as **Datas** do passo 49.
51. **Senão** (Otherwise). Esse é o caminho da primeira execução, quando o `ultimo.txt` ainda não existe.
52. Dentro do Senão: **Data** (Date). Valor: **Data Atual**.
53. Dentro do Senão: **Ajustar Data** (Adjust Date). Operação: **Subtrair**. Valor: `13` **horas**. Data: a **Data** do passo 52.
54. Dentro do Senão: **Definir Variável**. Nome: `Ultimo`. Entrada: a **Data Ajustada** do passo 53.
55. **Fim Se**.
56. **Definir Variável**. Nome: `Novo`. Entrada: a variável `[Ultimo]`.
57. **Número** (Number): `0`.
58. **Definir Variável**. Nome: `Cont`. Entrada: o **Número** do passo 57.

### Gravar as leituras novas no Saúde

59. **Repetir com Cada** (Repeat with Each). Entrada: `[Leituras]`.
60. Dentro do Repetir: **Obter Valor do Dicionário**. Chave: `Timestamp`. Dicionário: **Item da Repetição**.
61. Dentro do Repetir: **Executar Atalho** (Run Shortcut). Atalho: **Libre - Converter Data**. Entrada: o Valor do Dicionário do passo 60. Desative **Mostrar ao Executar**.
62. Dentro do Repetir: **Definir Variável**. Nome: `DataLeitura`. Entrada: o **Resultado do Atalho** do passo 61.
63. Dentro do Repetir: **Se**. Entrada: `[DataLeitura]`. Condição: **é depois de**. Valor: `[Ultimo]`. Se "é depois de" não aparecer, toque em DataLeitura no campo de entrada → **Tipo** → **Data**.
64. Dentro deste Se: **Obter Valor do Dicionário**. Chave: `ValueInMgPerDl`. Dicionário: **Item da Repetição**.
65. Dentro deste Se: **Calcular** (Calculate). Primeiro número: o Valor do Dicionário do passo 64. Operador: **+**. Segundo número: `[Offset]`.
66. Dentro deste Se: **Definir Variável**. Nome: `Corrigido`. Entrada: o **Resultado do Cálculo** do passo 65.
67. Dentro deste Se: **Registrar Amostra de Saúde** (Log Health Sample). Tipo: **Glicose no Sangue**. Valor: `[Corrigido]`. Unidade: **mg/dL**. Toque na seta das opções e, em **Data**, ponha `[DataLeitura]`.
68. Dentro deste Se: **Calcular**. Primeiro número: `[Cont]`. Operador: **+**. Segundo número: `1`.
69. Dentro deste Se: **Definir Variável**. Nome: `Cont`. Entrada: o Resultado do Cálculo do passo 68.
70. Dentro deste Se: um segundo **Se**. Entrada: `[DataLeitura]`. Condição: **é depois de**. Valor: `[Novo]`.
71. Dentro do segundo Se: **Definir Variável**. Nome: `Novo`. Entrada: a variável `[DataLeitura]`.
72. **Fim Se** do segundo Se.
73. **Fim Se** do Se do passo 63.
74. **Fim Repetir** (End Repeat).

### Salvar o ponto de parada e avisar

75. **Formatar Data** (Format Date). Data: `[Novo]`. Formato: **Personalizado**, `yyyy-MM-dd'T'HH:mm:ss`.
76. **Salvar Arquivo** (Save File). Entrada: a **Data Formatada** do passo 75. Desative **Perguntar Onde Salvar**. Pasta: **Atalhos**. Subcaminho: `Libre/ultimo.txt`. Ative **Substituir se Existir**.
77. **Se**. Entrada: `[Cont]`. Condição: **é maior que**. Valor: `0`.
78. Dentro do Se: **Mostrar Notificação**. Texto: `Libre: [Cont] leituras gravadas no Saúde (offset [Offset] mg/dL).`
79. **Fim Se**.

## Testar

Rode o atalho à mão uma vez, antes de criar as automações. Na primeira execução, o iOS pede permissão para o Atalhos gravar **Glicose no Sangue** no Saúde: toque em **Permitir**.

Deu certo se:

1. aparecer a notificação com algumas dezenas de leituras;
2. as leituras estiverem em Saúde → Glicose no Sangue → **Mostrar Todos os Dados**, com origem **Atalhos**;
3. rodando de novo logo em seguida, nenhuma leitura nova for gravada.

## Como ele lida com repetições

- Cada execução baixa as 12 h inteiras, mas grava só o que for mais novo que o `ultimo.txt`. A parte repetida é ignorada.
- O atalho **nunca apaga** nada no Saúde. O histórico vai se acumulando.
- Não há buracos desde que duas execuções nunca fiquem mais de 12 h separadas.
- Para regravar as últimas 12 h com outro offset: apague no Saúde as leituras de origem Atalhos desse período, apague o `ultimo.txt` e rode o atalho. Leituras de mais de 12 h atrás não podem ser regravadas, porque a API não as devolve mais.

Próximo: [5. Automações](05-automacoes.md)
