# 1. Atalho Libre - Converter Data

A API manda o horário de cada leitura no formato americano, por exemplo `11/19/2026 8:05:00 AM`. Um iPhone em português leria `11/5` como 11 de maio. Este atalho auxiliar remonta o texto como `2026-11-19T08:05:00` e devolve uma data do iPhone.

Monte este atalho primeiro, porque o **Libre - Sincronizar Glicose** chama ele para cada leitura.

## Criar o atalho

Crie um atalho novo com o nome **Libre - Converter Data**. Em ⓘ (Detalhes), deixe "Recebe" como **Texto**. Se aparecer a opção "Se não houver entrada", escolha **Parar e Responder**.

## Ações

1. **Corresponder Texto** (Match Text). Padrão: `(\d+)/(\d+)/(\d+) (\d+):(\d+):(\d+) (AM|PM)`. Texto: **Entrada do Atalho**.
2. **Obter Grupo no Índice** (Get Group at Index). Índice: `1`. Entrada: as **Correspondências** do passo 1.
3. **Definir Variável** (Set Variable). Nome: `Mes`. Entrada: o **Grupo** do passo 2.
4. **Obter Grupo no Índice**. Índice: `2`. Entrada: as Correspondências do passo 1.
5. **Definir Variável**. Nome: `Dia`. Entrada: o Grupo do passo 4.
6. **Obter Grupo no Índice**. Índice: `3`. Entrada: as Correspondências do passo 1.
7. **Definir Variável**. Nome: `Ano`. Entrada: o Grupo do passo 6.
8. **Obter Grupo no Índice**. Índice: `4`. Entrada: as Correspondências do passo 1.
9. **Definir Variável**. Nome: `Hora`. Entrada: o Grupo do passo 8.
10. **Obter Grupo no Índice**. Índice: `5`. Entrada: as Correspondências do passo 1.
11. **Definir Variável**. Nome: `Min`. Entrada: o Grupo do passo 10.
12. **Obter Grupo no Índice**. Índice: `6`. Entrada: as Correspondências do passo 1.
13. **Definir Variável**. Nome: `Seg`. Entrada: o Grupo do passo 12.
14. **Obter Grupo no Índice**. Índice: `7`. Entrada: as Correspondências do passo 1.
15. **Definir Variável**. Nome: `AMPM`. Entrada: o Grupo do passo 14.
16. **Calcular** (Calculate). Primeiro número: `[Hora]`. Operador: **módulo** (fica no botão "…" da lista de operadores). Segundo número: `12`. Isso transforma 12 AM e 12 PM em 0, antes do ajuste do passo 18.
17. **Definir Variável**. Nome: `H`. Entrada: o **Resultado do Cálculo** do passo 16.
18. **Se** (If). Entrada: `[AMPM]`. Condição: **é**. Valor: `PM`.
19. Dentro do Se: **Calcular**. Primeiro número: `[H]`. Operador: **+**. Segundo número: `12`.
20. Dentro do Se: **Definir Variável**. Nome: `H`. Entrada: o Resultado do Cálculo do passo 19.
21. **Fim Se**.
22. **Texto** (Text): `[Ano]-[Mes]-[Dia]T[H]:[Min]:[Seg]`. Os hifens, o `T` e os dois-pontos são digitados; o resto são variáveis.
23. **Substituir Texto** (Replace Text). Texto: o **Texto** do passo 22. Ative **Expressão Regular**. Encontrar: `(?<!\d)(\d)(?!\d)`. Substituir por: `0$1`. Isso coloca zero à esquerda no mês, no dia e na hora com um dígito só.
24. **Obter Datas da Entrada** (Get Dates from Input). Entrada: o **Texto Atualizado** do passo 23.
25. **Parar e Gerar Saída** (Stop and Output). Saída: as **Datas** do passo 24.

## Testar

Crie um atalho temporário com estas três ações:

1. **Texto**: `11/5/2026 12:07:30 PM`
2. **Executar Atalho** (Run Shortcut): **Libre - Converter Data**, com o Texto do passo 1 como entrada
3. **Formatar Data** (Format Date): formato personalizado `dd/MM/yyyy HH:mm:ss` → **Mostrar Resultado** (Show Result)

O resultado tem que ser **05/11/2026 12:07:30**. Troque o texto por `11/5/2026 12:07:30 AM`: o resultado tem que ser **05/11/2026 00:07:30**. Depois apague o atalho de teste.

Próximo: [2. Libre - Configurar](02-configurar.md)
