# 8. Como funciona por dentro

Referência técnica para quem quer adaptar o projeto.

## API do LibreLinkUp

Não é uma API oficial. Os detalhes vêm de documentação comunitária ([gist](https://gist.github.com/khskekec/6c13ba01b10d3018d816706a32ae8ab2)) e podem mudar.

| Chamada | Método | Uso |
| --- | --- | --- |
| `/llu/auth/login` | POST, corpo `{"email","password"}` | Devolve `data.authTicket.token`, `data.user.id` e, às vezes, `data.redirect` + `data.region` |
| `/llu/connections` | GET | Lista quem a conta segue. Cada item tem `patientId`, `sensor.sn` e `glucoseMeasurement`, a leitura atual, atualizada mais ou menos a cada minuto |
| `/llu/connections/{patientId}/graph` | GET | `data.connection` (com a leitura atual e o sensor) e `data.graphData`, o histórico das últimas ~12 h |

Servidores: o global é `https://api.libreview.io`; os regionais seguem o padrão `https://api-<região>.libreview.io`, por exemplo `la` para a América Latina e `eu` para a Europa.

Cabeçalhos: `product: llu.ios`, `version: 4.16.0`, `Authorization: Bearer <token>`, `Account-Id: <sha256 do user.id>`. A versão e o `Account-Id` são exigidos desde outubro de 2025 ([fonte](https://glama.ai/mcp/servers/@sedoglia/librelink-mcp-server/blob/f12292176ed6a30a7be61024b47e8074edcb5629/README.en.md)).

Campos de cada leitura:

| Campo | Exemplo | Observação |
| --- | --- | --- |
| `ValueInMgPerDl` | `98` | Valor em mg/dL |
| `TrendArrow` | `3` | 1 ↓, 2 ↘, 3 →, 4 ↗, 5 ↑ |
| `Timestamp` | `11/19/2026 8:05:00 AM` | Hora local do celular que envia os dados. Usada pelos atalhos |
| `FactoryTimestamp` | `11/19/2026 11:05:00 AM` | Hora UTC. Usada pelo widget |

O token dura cerca de 6 meses (`authTicket.duration`) e não pode ser revogado pelo usuário.

## Formato dos arquivos

Todos ficam na pasta `Libre`, dentro da pasta do Atalhos no iCloud Drive.

```text
config.json
{"base":"https://api-la.libreview.io","token":"…","accountId":"…64 caracteres hex…","patientId":"…uuid…"}

offset.txt  (uma linha)
MH0XXXXXXX;14

calibracoes.txt  (uma linha por calibração)
2026-11-19 14:12;MH0XXXXXXX;86;102;16
data;serial;valor do sensor;glicemia capilar;diferença

ultimo.txt
2026-11-19T15:20:00

historico.csv  (criado pelo widget; uma linha por leitura)
2026-11-19T18:20:00.000Z;85;99
data UTC;valor bruto;valor corrigido
```

## Offset

Para cada sensor (identificado por `sensor.sn`):

```
diferença = glicemia capilar − leitura do sensor no mesmo minuto
offset    = média de todas as diferenças daquele sensor, arredondada
corrigido = leitura do sensor + offset
```

Um offset fixo corrige um viés constante. Se o erro do sensor muda conforme a faixa (por exemplo, lê mais baixo só nas hipoglicemias), um offset único melhora uma parte da curva e piora outra. Calibrações em glicemias diferentes ajudam a perceber isso.

## Fluxo do Sincronizar

1. Lê `config.json`.
2. Baixa `/graph`. Se a resposta não tiver `graphData`, notifica e para.
3. Compara `data.connection.sensor.sn` com o serial do `offset.txt`. Se forem diferentes, notifica "sensor novo" e para sem gravar.
4. Lê `ultimo.txt`. Na primeira vez, usa agora − 13 h.
5. Para cada leitura de `graphData` mais nova que o `ultimo.txt`, converte o `Timestamp`, soma o offset e grava no Saúde.
6. Salva no `ultimo.txt` o horário mais recente gravado.

## Limitações conhecidas

- **Só as últimas 12 h** estão disponíveis pela API. O histórico anterior à instalação não entra, nem no Saúde nem no widget. Ele existe no LibreView, que tem exportação em CSV.
- **O Atalhos não altera nem apaga** amostras no Saúde, só acrescenta.
- **O iOS decide** quando atualizar o widget e pode atrasar automações.
- **Integração não oficial:** uma mudança da Abbott pode parar tudo sem aviso. O primeiro suspeito é o cabeçalho `version`.
- **Não use para decisões de tratamento.** Os valores corrigidos ficam no Saúde como se fossem medições; o LibreLinkUp e o LibreView continuam com os valores originais.

[Voltar ao início](../README.md)
