# 3. Atalho Libre - Calibrar

Este atalho compara a glicemia de ponta de dedo com o valor que o sensor mostra naquele minuto e grava a diferença junto com o número de série do sensor. O offset de cada sensor é a **média de todas as calibrações dele**.

Regra de uso: **pelo menos uma calibração em cada sensor novo**. As outras são opcionais e deixam a média mais firme. Enquanto o sensor atual não tiver calibração, o Sincronizar não grava nada no Saúde e avisa.

Boas práticas:

- Calibre com a glicose estável (seta horizontal), de preferência em jejum.
- Evite a primeira hora do sensor, que é o aquecimento.
- Calibre em até 12 horas depois de trocar o sensor. Assim o Sincronizar recupera as leituras do período em que ficou parado.

## Criar o atalho

Crie um atalho novo com o nome **Libre - Calibrar** e adicione as ações abaixo, na ordem.

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

### Ler o valor atual do sensor

12. **Texto** (Text): `[Base]/llu/connections`. Insira a variável Base e escreva `/llu/connections` logo depois, sem espaço.
13. **Obter Conteúdo do URL** (Get Contents of URL). URL: o **Texto** do passo 12. Toque na seta para abrir as opções. Método: **GET**. Em **Cabeçalhos**, adicione quatro:
    1. Chave `product`, valor `llu.ios`
    2. Chave `version`, valor `4.16.0`
    3. Chave `Authorization`, valor `Bearer [Token]`: digite a palavra Bearer, um espaço e insira a variável Token
    4. Chave `Account-Id`, valor `[AccountId]`
14. **Definir Variável**. Nome: `Conex`. Entrada: o **Conteúdo do URL** do passo 13.
15. **Obter Texto da Entrada** (Get Text from Input). Entrada: `[Conex]`.
16. **Definir Variável**. Nome: `ConexTexto`. Entrada: o Texto do passo 15.
17. **Se** (If). Entrada: `[ConexTexto]`. Condição: **não contém**. Valor: `glucoseMeasurement`.
18. Dentro do Se: **Mostrar Alerta** (Show Alert). Texto: `Falhou: [ConexTexto]. Se falar em token ou jwt, rode Libre - Configurar.`
19. Dentro do Se: **Parar Este Atalho** (Stop This Shortcut).
20. **Fim Se**.
21. **Obter Valor do Dicionário**. Chave: `data`. Dicionário: `[Conex]`.
22. **Definir Variável**. Nome: `ListaConex`. Entrada: o Valor do Dicionário do passo 21.
23. **Obter Item da Lista** (Get Item from List). Obter: **Primeiro Item**. Lista: `[ListaConex]`.
24. **Definir Variável**. Nome: `Paciente`. Entrada: o **Item da Lista** do passo 23.
25. **Obter Valor do Dicionário**. Chave: `sensor.sn`. Dicionário: `[Paciente]`.
26. **Definir Variável**. Nome: `Serial`. Entrada: o Valor do Dicionário do passo 25.
27. **Obter Valor do Dicionário**. Chave: `glucoseMeasurement.ValueInMgPerDl`. Dicionário: `[Paciente]`.
28. **Definir Variável**. Nome: `Sensor`. Entrada: o Valor do Dicionário do passo 27.
29. **Obter Valor do Dicionário**. Chave: `glucoseMeasurement.TrendArrow`. Dicionário: `[Paciente]`.
30. **Definir Variável**. Nome: `Seta`. Entrada: o Valor do Dicionário do passo 29.
31. **Obter Valor do Dicionário**. Chave: `glucoseMeasurement.Timestamp`. Dicionário: `[Paciente]`.
32. **Definir Variável**. Nome: `HoraSensor`. Entrada: o Valor do Dicionário do passo 31.

### Conferir se a glicose está estável

33. **Texto**: `[Seta]`. Só a variável, sem mais nada. Isso transforma o número em texto para a comparação funcionar.
34. **Definir Variável**. Nome: `SetaTexto`. Entrada: o Texto do passo 33.
35. **Se**. Entrada: `[SetaTexto]`. Condição: **não é**. Valor: `3`. O 3 é a seta horizontal, glicose estável.
36. Dentro do Se: **Mostrar Alerta**. Texto: `A glicose não está estável. Calibrar agora distorce o offset. Continuar mesmo assim?` Ative **Mostrar Botão Cancelar**. Tocar em Cancelar encerra o atalho.
37. **Fim Se**.

### Pedir a medição capilar

38. **Pedir Entrada** (Ask for Input). Tipo: **Número**. Pergunta: `Glicemia capilar em mg/dL (o sensor marca [Sensor] às [HoraSensor])`.
39. **Definir Variável**. Nome: `Capilar`. Entrada: o **Número Fornecido** do passo 38.
40. **Calcular** (Calculate). Primeiro número: `[Capilar]`. Operador: **−**. Segundo número: `[Sensor]`.
41. **Definir Variável**. Nome: `Dif`. Entrada: o **Resultado do Cálculo** do passo 40.
42. **Calcular**. Primeiro número: `[Dif]`. Operador: **×**. Segundo número: `[Dif]`.
43. **Se**. Entrada: o Resultado do Cálculo do passo 42. Condição: **é maior que**. Valor: `1600`. Isso equivale a uma diferença acima de 40 mg/dL, para mais ou para menos.
44. Dentro do Se: **Mostrar Alerta**. Texto: `Diferença de [Dif] mg/dL. Pode ser erro de digitação ou sensor ainda na primeira hora. Usar mesmo assim?` Ative **Mostrar Botão Cancelar**.
45. **Fim Se**.
46. **Registrar Amostra de Saúde** (Log Health Sample). Tipo: **Glicose no Sangue**. Valor: `[Capilar]`. Unidade: **mg/dL**. Deixe a data como está (agora). Este passo grava a ponta de dedo no Saúde e é opcional.

### Somar as calibrações anteriores deste sensor

O atalho lê o arquivo de calibrações **antes** de gravar a nova. Ler logo depois de gravar pode pegar uma cópia do iCloud ainda sem a linha nova. A calibração de agora entra direto pela variável `Dif`, nos passos 66 a 69.

47. **Obter Arquivo da Pasta**. Pasta: **Atalhos**. Caminho: `Libre/calibracoes.txt`. **Desative** Erro se Não Encontrado.
48. **Obter Texto da Entrada**. Entrada: o Arquivo do passo 47.
49. **Dividir Texto** (Split Text). Texto: o Texto do passo 48. Separador: **Novas Linhas**.
50. **Definir Variável**. Nome: `Linhas`. Entrada: o **Texto Dividido** do passo 49.
51. **Número** (Number): `0`.
52. **Definir Variável**. Nome: `Soma`. Entrada: o **Número** do passo 51.
53. **Número**: `0`.
54. **Definir Variável**. Nome: `N`. Entrada: o Número do passo 53.
55. **Repetir com Cada** (Repeat with Each). Entrada: `[Linhas]`.
56. Dentro do Repetir: **Se**. Entrada: **Item da Repetição**. Condição: **contém**. Valor: `[Serial]`. Assim entram só as calibrações deste sensor, e as linhas vazias ficam de fora.
57. Dentro do Se: **Dividir Texto**. Texto: **Item da Repetição**. Separador: **Personalizado**, `;`.
58. Dentro do Se: **Obter Item da Lista**. Obter: **Item no Índice**. Índice: `5`. Lista: o Texto Dividido do passo 57.
59. Dentro do Se: **Obter Números da Entrada** (Get Numbers from Input). Entrada: o Item da Lista do passo 58.
60. Dentro do Se: **Calcular**. Primeiro número: `[Soma]`. Operador: **+**. Segundo número: os **Números** do passo 59.
61. Dentro do Se: **Definir Variável**. Nome: `Soma`. Entrada: o Resultado do Cálculo do passo 60.
62. Dentro do Se: **Calcular**. Primeiro número: `[N]`. Operador: **+**. Segundo número: `1`.
63. Dentro do Se: **Definir Variável**. Nome: `N`. Entrada: o Resultado do Cálculo do passo 62.
64. **Fim Se**.
65. **Fim Repetir** (End Repeat).

### Juntar a calibração de agora e calcular o offset

66. **Calcular**. Primeiro número: `[Soma]`. Operador: **+**. Segundo número: `[Dif]`.
67. **Definir Variável**. Nome: `Soma`. Entrada: o Resultado do Cálculo do passo 66.
68. **Calcular**. Primeiro número: `[N]`. Operador: **+**. Segundo número: `1`.
69. **Definir Variável**. Nome: `N`. Entrada: o Resultado do Cálculo do passo 68.
70. **Calcular**. Primeiro número: `[Soma]`. Operador: **÷**. Segundo número: `[N]`.
71. **Arredondar Número** (Round Number). Entrada: o Resultado do Cálculo do passo 70. Arredondar para: **Unidades**.
72. **Definir Variável**. Nome: `Offset`. Entrada: o **Número Arredondado** do passo 71.
73. **Texto**: `[Serial];[Offset]`
74. **Salvar Arquivo** (Save File). Entrada: o Texto do passo 73. Desative **Perguntar Onde Salvar**. Pasta: **Atalhos**. Subcaminho: `Libre/offset.txt`. Ative **Substituir se Existir**.

> No passo 74 a ação é **Salvar Arquivo** com **Substituir se Existir** ativado, nunca "Acrescentar ao Arquivo". O `offset.txt` precisa ter **uma linha só**. A única ação que acrescenta é a do passo 79.

### Gravar a calibração no histórico e mostrar o resultado

75. **Data** (Date). Valor: **Data Atual**.
76. **Formatar Data** (Format Date). Data: a **Data** do passo 75. Formato: **Personalizado**, `yyyy-MM-dd HH:mm`.
77. **Definir Variável**. Nome: `Agora`. Entrada: a **Data Formatada** do passo 76.
78. **Texto**: `[Agora];[Serial];[Sensor];[Capilar];[Dif]`. Ponto e vírgula entre as variáveis, sem espaços.
79. **Acrescentar ao Arquivo** (Append to File). Entrada: o Texto do passo 78. Pasta: **Atalhos**. Caminho: `Libre/calibracoes.txt`. Ative **Criar Nova Linha**. Se o arquivo não existir, a ação cria.
80. **Mostrar Resultado** (Show Result). Texto: `Sensor [Serial]: leitura [Sensor], capilar [Capilar], diferença [Dif]. Offset deste sensor: [Offset] mg/dL ([N] calibrações).`

## Testar

Meça a glicemia capilar e rode o atalho. A mensagem final tem que mostrar um número no offset e pelo menos **1 calibração**. Abra o `offset.txt` no app Arquivos: ele deve ter uma única linha, como `MH0XXXXXXX;14`.

## Sensor novo

As calibrações são separadas pelo número de série, então não é preciso apagar nada ao trocar de sensor. Para descartar todas as calibrações e recomeçar do zero, apague `calibracoes.txt` e `offset.txt` no app Arquivos e rode o Calibrar de novo.

Próximo: [4. Libre - Sincronizar Glicose](04-sincronizar.md)
