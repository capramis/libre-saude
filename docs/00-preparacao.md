# 0. Preparação

Antes de montar os atalhos, prepare a conta de seguidor, a pasta onde os atalhos guardam os arquivos e conheça as convenções deste manual.

## Conta LibreLinkUp de seguidor

Os atalhos leem os dados pela nuvem do **LibreLinkUp**, o app de quem acompanha outra pessoa. Por isso você precisa de uma conta de **seguidor** que siga você mesmo.

1. No app **FreeStyle LibreLink**, vá em Menu → **Apps Conectados** → **LibreLinkUp** e envie um convite para um e-mail seu **diferente** do que você usa no LibreLink. Pode ser um Gmail secundário.
2. Instale o app **LibreLinkUp**, crie a conta com esse segundo e-mail e aceite o convite.
3. Aceite todos os termos e a política de privacidade que o app pedir.
4. Confira se a sua glicose aparece no LibreLinkUp.

> Com o mesmo e-mail do LibreLink, a conta entra como **paciente** e a API não devolve nenhuma conexão. É o erro mais comum.

## Pasta Libre

No app **Arquivos**, abra **iCloud Drive** → pasta do Atalhos e crie uma pasta chamada `Libre`.

A pasta do Atalhos pode aparecer como **Shortcuts** ou como **Atalhos**, dependendo do iPhone. Se o iCloud Drive estiver desligado para o Atalhos, ela fica em **No Meu iPhone** → Atalhos.

Os atalhos e o widget usam estes arquivos dentro dela:

| Arquivo | Criado por | Conteúdo |
| --- | --- | --- |
| `config.json` | Configurar | URL da região, token, Account-Id e patientId. A senha não é guardada |
| `offset.txt` | Calibrar | Uma linha: número de série do sensor e offset, por exemplo `MH0XXXXXXX;14` |
| `calibracoes.txt` | Calibrar | Uma linha por calibração: `data;serial;sensor;capilar;diferença` |
| `ultimo.txt` | Sincronizar | Data e hora da última leitura gravada no Saúde |
| `historico.csv` | Widget | Histórico das leituras para a média do dia e a glicada |

## Convenções deste manual

- **Uma ação por passo.** O nome da ação está em **negrito**, como aparece no iPhone em português, com o nome em inglês entre parênteses na primeira vez que aparece. Use a busca de ações do Atalhos para achar cada uma.
- **`[Nome]`** quer dizer: toque no campo e insira a variável com esse nome. Variáveis aparecem como "pílulas" azuis no Atalhos.
- **"o Texto do passo 12"** quer dizer a saída daquela ação. No Atalhos, ela aparece como uma variável mágica com o nome da ação.
- **Se, Senão e Fim Se.** Quando você adiciona um **Se** (If), o Atalhos coloca sozinho um **Senão** (Otherwise) e um **Fim Se** (End If). Deixe o Senão vazio, a não ser quando o passo diz para usar.
- **Chaves com ponto.** Em **Obter Valor do Dicionário** (Get Dictionary Value), uma chave como `data.authTicket.token` funciona: o Atalhos entende o ponto como caminho dentro do JSON.
- **Não compare números com texto num Se.** O Atalhos nem sempre trata o número 0 e o texto "0" como iguais. Por isso os atalhos convertem a resposta da API em texto e procuram uma palavra nela.

## Cabeçalhos da API

Toda chamada ao LibreLinkUp leva estes cabeçalhos, em **Obter Conteúdo do URL** → Cabeçalhos:

| Cabeçalho | Valor | Em quais chamadas |
| --- | --- | --- |
| `product` | `llu.ios` | Todas |
| `version` | `4.16.0` | Todas |
| `Authorization` | `Bearer [Token]` (a palavra Bearer, um espaço e a variável Token) | Todas, menos o login |
| `Account-Id` | `[AccountId]` (SHA-256 do ID do usuário) | Todas, menos o login |

Desde outubro de 2025 a API exige a versão 4.16.0 ou mais nova e o cabeçalho `Account-Id`. Se um dia o login responder que a versão é antiga, troque `4.16.0` pela versão atual do LibreLinkUp na App Store, em todos os atalhos e no widget.

Próximo: [1. Libre - Converter Data](01-converter-data.md)
