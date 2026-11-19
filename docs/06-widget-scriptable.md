# 6. Widget no Scriptable

O widget mostra:

- a **última leitura, já com o offset**, colorida pela faixa (verde de 70 a 180 mg/dL, laranja acima, vermelho abaixo), com a seta de tendência;
- embaixo, a hora da leitura, o valor bruto do sensor e o offset aplicado;
- a **média de hoje**, desde a meia-noite;
- a **glicada estimada (GMI)**, calculada com todos os dados guardados, até 120 dias, e quantos dias entraram na conta.

Um toque no widget roda o atalho **Libre - Sincronizar Glicose**.

O script fica em [`scriptable/Libre Glicose.js`](../scriptable/Libre%20Glicose.js).

## Instalar

1. **Copie o script para o Scriptable.** Baixe o arquivo `Libre Glicose.js` no iPhone → compartilhar → **Salvar em Arquivos** → **iCloud Drive › Scriptable**. Ele aparece pronto no app.

    Copiar e colar o código pelo navegador também funciona. Se der erro de sintaxe, prefira salvar o arquivo: alguns apps alteram o texto colado.

2. **Dê acesso à pasta Libre.** No Scriptable, toque na **engrenagem** → **File Bookmarks** (Marcadores de Arquivo) → **+** → **Pick Folder**. Entre na pasta **Libre** (a mesma do `config.json`), toque em **Abrir** e dê o nome exato `Libre`.
3. **Teste no app.** Toque no script **Libre Glicose** dentro do Scriptable. Primeiro aparece o alerta **Diagnóstico do offset**, depois a prévia do widget.
4. **Coloque o widget.** Segure a tela de início → **+** → **Scriptable** → tamanho **pequeno** ou **médio** → Adicionar. Segure o widget → **Editar Widget**:
    1. Script: **Libre Glicose**
    2. Ao Interagir (When Interacting): **Abrir URL** (Open URL)

## Ajustes no começo do script

| Constante | Padrão | Para que serve |
| --- | --- | --- |
| `MARCADOR` | `"Libre"` | Nome do marcador de pasta criado no passo 2 |
| `DIAS_GMI` | `120` | Janela máxima da glicada estimada |
| `DIAS_GUARDAR` | `130` | O histórico mais antigo que isso é apagado |
| `ALVO_MIN`, `ALVO_MAX` | `70`, `180` | Faixa usada nas cores |
| `MINUTOS_ATUALIZAR` | `5` | Intervalo pedido ao iOS. Quem decide de fato é o sistema |
| `ATALHO_AO_TOCAR` | `"Libre - Sincronizar Glicose"` | Atalho aberto ao tocar no widget. `""` desliga |

O nome em `ATALHO_AO_TOCAR` precisa bater exatamente com o nome do atalho, incluindo espaços, hífen e letras maiúsculas.

## De onde vem cada dado

O Scriptable não tem acesso ao app Saúde. O widget não lê de lá.

| No widget | Origem |
| --- | --- |
| Valor atual e seta | API do LibreLinkUp, no momento em que o widget atualiza (valor bruto) |
| Offset somado | Última linha do `offset.txt` |
| Token, região, paciente | `config.json` |
| Média de hoje e glicada | `historico.csv`, que o próprio widget cria e vai preenchendo |

O Saúde e o widget guardam históricos separados, mas os dois usam o mesmo `offset.txt`.

## Glicada estimada (GMI)

O widget usa a fórmula do GMI (Glucose Management Indicator), de Bergenstal e colegas, 2018:

```
GMI (%) = 3,31 + 0,02392 × glicose média (mg/dL)
```

- O histórico começa no dia da instalação, porque a API só devolve 12 h. O rodapé mostra com quantos dias a conta foi feita. A estimativa fica mais confiável a partir de umas duas semanas de dados.
- O GMI não é o exame de glicada. Ele pode dar igual, mais alto ou mais baixo que o exame de laboratório. Serve para acompanhar a tendência entre um exame e outro.

## Comportamento

- **Sensor novo sem calibração:** o widget mostra o valor bruto com um aviso em vermelho e não guarda essas leituras no histórico, igual ao Sincronizar. Depois da calibração, as leituras das últimas 12 h entram com o offset.
- **Sem internet ou token expirado:** o widget mostra um aviso e continua exibindo a média e a glicada do histórico salvo.
- **Atualização:** o iOS normalmente atualiza o widget a cada 5 a 15 minutos, sem horário garantido. Como cada atualização traz 12 h, não ficam buracos no `historico.csv`.

## Recomeçar o histórico do widget

Apague o `historico.csv` na pasta Libre. Na próxima atualização, o widget recria o arquivo com as últimas 12 h, com o offset atual. Faça isso se o histórico tiver sido gravado com um offset errado.

Próximo: [7. Solução de problemas](07-solucao-de-problemas.md)
