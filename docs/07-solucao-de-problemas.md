# 7. Solução de problemas

Estes são os problemas que apareceram durante a montagem original, com a causa e a solução.

Para ver o que a API respondeu, coloque temporariamente, logo depois do **Obter Conteúdo do URL** em questão, um **Obter Texto da Entrada** e um **Mostrar Resultado**. Corte o token antes de compartilhar um print.

## Configurar

| Sintoma | Causa | O que fazer |
| --- | --- | --- |
| Alerta "Login falhou" com `status` 2 | E-mail ou senha errados | Use o e-mail e a senha da conta de **seguidor** (app LibreLinkUp) |
| "Login falhou" mencionando `step`, `tou` ou `pp` | Termos pendentes | Abra o app LibreLinkUp e aceite tudo |
| Login responde que a versão é antiga | Cabeçalho `version` desatualizado | Use a versão atual do LibreLinkUp na App Store, em todos os atalhos e no widget |
| `status` 429 ou mensagem de bloqueio | Tentativas demais | Espere uns 5 minutos |
| "Nenhum paciente encontrado" | Login feito com a conta de **paciente** (mesmo e-mail do LibreLink) | Use uma conta de seguidor, com outro e-mail. Veja [Preparação](00-preparacao.md) |
| "Nenhum paciente encontrado", com a conta de seguidor certa | Servidor da região errado | Troque o passo 5 pelo servidor da sua região, por exemplo `https://api-la.libreview.io` |
| Login funcionou, mas o "Se" barrou mesmo assim | Comparação de número com texto | Use as checagens por texto deste manual (`contém` / `não contém`), não `status é 0` |

## Calibrar e Sincronizar

| Sintoma | Causa | O que fazer |
| --- | --- | --- |
| `{"message":"missing or malformed jwt"}` | Cabeçalho `Authorization` vazio ou errado | Confira: a palavra `Bearer`, um espaço e a variável Token. Confira também as chaves do `config.json` (`token`, `accountId`) |
| "Não foi possível avaliar o caminho da chave… `data`" | A resposta da API veio vazia ou sem `data` | O `patientId` está vazio no `config.json`, ou a URL do passo 12 está errada. Rode o Configurar de novo |
| Calibrar mostra "0 calibrações" e offset vazio | O arquivo foi lido logo depois de gravado, numa cópia antiga do iCloud | Use a versão deste manual, que lê as calibrações **antes** de gravar e soma a atual pela variável |
| `offset.txt` com mais de uma linha | O passo 74 do Calibrar está com "Acrescentar ao Arquivo" ou com "Substituir se Existir" desligado | Use **Salvar Arquivo** com **Substituir se Existir**, apague o `offset.txt` e rode o Calibrar |
| Horários no Saúde com dia e mês trocados | Falha no Converter Data | Refaça o teste do [Converter Data](01-converter-data.md) |
| Leituras duplicadas no Saúde | `ultimo.txt` apagado ou editado | Apague as duplicadas no Saúde (origem Atalhos) e não mexa no arquivo |
| Sincronizar sempre diz "sensor novo" | O `offset.txt` é de outro sensor | Rode o Calibrar com o sensor atual |
| Aviso "token expirado" | O token venceu, o que acontece mais ou menos a cada 6 meses | Rode o Configurar |

## Widget

| Sintoma | Causa | O que fazer |
| --- | --- | --- |
| `SyntaxError` ao rodar | O código foi alterado ao ser colado | Salve o arquivo `.js` direto em iCloud Drive › Scriptable em vez de colar |
| "Crie o marcador de pasta Libre" | Falta o marcador de arquivo | Scriptable → engrenagem → File Bookmarks → + → pasta Libre → nome `Libre` |
| Widget mostra `offset +0` | O `offset.txt` não tem um offset válido para o sensor atual, ou o widget na tela ainda é de antes da correção | Rode o script dentro do Scriptable e leia o alerta **Diagnóstico do offset**. Depois force a atualização: Editar Widget → troque o script e volte |
| Média do dia ou glicada baixas demais | O `historico.csv` guardou leituras sem offset | Apague o `historico.csv`. Ele é recriado com o offset atual |
| Toque no widget não roda o atalho | "Ao Interagir" não está em Abrir URL, ou o nome em `ATALHO_AO_TOCAR` não bate | Ajuste as duas coisas |

## Desfazer tudo no Saúde

Saúde → Glicose no Sangue → **Mostrar Todos os Dados** → **Editar**, e apague as leituras de origem **Atalhos**. Outra opção é Saúde → Glicose no Sangue → **Fontes de Dados e Acesso** → Atalhos → **Apagar Todos os Dados**. Isso apaga tudo o que o Atalhos gravou no Saúde, inclusive as medições capilares do Calibrar.

Próximo: [8. Como funciona por dentro](08-como-funciona.md)
