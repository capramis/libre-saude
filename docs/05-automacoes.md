# 5. Automações

O Sincronizar precisa rodar sozinho algumas vezes por dia. Quatro execuções, com no máximo 8 h entre elas, cobrem as 12 h de histórico da API com folga.

## Sincronizar por horário

No app **Atalhos** → aba **Automação** → **+** → **Horário do Dia** (Time of Day):

1. Horário: `07:40`. Repetir: **Diariamente**.
2. Escolha **Executar Imediatamente** (Run Immediately) e desative **Notificar ao Executar**.
3. Ação: **Executar Atalho** → **Libre - Sincronizar Glicose**.
4. Repita para `13:40`, `19:40` e `23:40`.

## Sincronizar ao abrir um app (opcional)

Para o Saúde ficar mais em dia ao longo do dia, crie também uma automação **App** → **É Aberto** com um app que você abre bastante, como o WhatsApp. Ação: **Executar Atalho** → **Libre - Sincronizar Glicose**, com **Executar Imediatamente**. O `ultimo.txt` impede leituras duplicadas.

## Por que não a cada 10 ou 20 minutos

- As automações do iPhone não têm a opção "repetir a cada X minutos". Só existem horários fixos.
- O histórico da API traz pontos de 15 em 15 minutos e pode chegar com até 15 minutos de atraso. Rodar com mais frequência não deixa o Saúde mais atualizado.
- O LibreLinkUp bloqueia temporariamente quem faz chamadas demais (código 429).
- O iCloud às vezes entrega uma cópia antiga de um arquivo que acabou de ser gravado. Execuções muito próximas aumentam a chance de ler um `ultimo.txt` desatualizado e duplicar leituras.

Até uma vez por hora é seguro. Para ver o valor atual a qualquer momento, use o widget.

## Celular bloqueado

Com o iPhone bloqueado, o iOS protege os dados do Saúde, e a gravação pode falhar. Nada se perde: o `ultimo.txt` só avança quando a execução termina, e a próxima recupera o que faltou. Se as falhas se repetirem num horário, mude-o para um momento em que você costuma estar usando o celular.

## Calibrar à mão

A calibração não tem automação. Quando o Sincronizar avisar que entrou um sensor novo, rode o **Libre - Calibrar**. Para deixar à mão, adicione o widget do app Atalhos na tela de início com o Libre - Calibrar, ou peça à Siri: "Libre - Calibrar".

Próximo: [6. Widget no Scriptable](06-widget-scriptable.md)
