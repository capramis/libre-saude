// Libre Glicose – widget do Scriptable
//
// Mostra a última leitura do Libre já corrigida pelo offset do Calibrar,
// a média de hoje e a glicada estimada (GMI) com todos os dados guardados,
// até os últimos 120 dias.
//
// Usa os arquivos da pasta Libre dos Atalhos:
//   config.json    (criado pelo Libre - Configurar)   só leitura
//   offset.txt     (criado pelo Libre - Calibrar)     só leitura
//   historico.csv  (criado por este script)           histórico para as médias
//
// Antes de usar: Scriptable → Configurações → Marcadores de Arquivo (File Bookmarks)
// → + → escolha a pasta Libre (a mesma do config.json) → nome: Libre

// ---------- Ajustes ----------
const MARCADOR = "Libre"     // nome do marcador de pasta no Scriptable
const DIAS_GMI = 120         // janela da glicada estimada
const DIAS_GUARDAR = 130     // o histórico mais antigo que isso é apagado
const ALVO_MIN = 70          // mg/dL
const ALVO_MAX = 180         // mg/dL
const MINUTOS_ATUALIZAR = 5  // pedido ao iOS; ele decide quando atualizar de fato
const ATALHO_AO_TOCAR = "Libre - Sincronizar Glicose"  // atalho aberto ao tocar no widget; "" desliga

// ---------- Arquivos ----------
const fm = FileManager.iCloud()
let pasta = null
try {
  pasta = fm.bookmarkedPath(MARCADOR)
} catch (e) {
  await mostrarErroFatal(`Crie o marcador de pasta "${MARCADOR}" no Scriptable (Configurações → Marcadores de Arquivo) apontando para a pasta Libre dos Atalhos.`)
}
const ARQ_CONFIG = fm.joinPath(pasta, "config.json")
const ARQ_OFFSET = fm.joinPath(pasta, "offset.txt")
const ARQ_HIST = fm.joinPath(pasta, "historico.csv")

async function lerTexto(caminho) {
  if (!fm.fileExists(caminho)) return null
  try { await fm.downloadFileFromiCloud(caminho) } catch (e) { /* arquivo local: segue */ }
  return fm.readString(caminho)
}

// "11/19/2026 2:05:00 PM" em UTC (FactoryTimestamp) -> Date
function lerDataUTC(s) {
  const m = String(s).match(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+):(\d+) (AM|PM)/)
  if (!m) return null
  let h = Number(m[4]) % 12
  if (m[7] === "PM") h += 12
  return new Date(Date.UTC(Number(m[3]), Number(m[1]) - 1, Number(m[2]), h, Number(m[5]), Number(m[6])))
}

// ---------- Configuração e offset ----------
const cfgTexto = await lerTexto(ARQ_CONFIG)
if (!cfgTexto) await mostrarErroFatal("Não achei o config.json na pasta Libre. Rode o atalho Libre - Configurar.")
const cfg = JSON.parse(cfgTexto)

let serialCalibrado = null
let offsetCalibrado = 0
const offTexto = await lerTexto(ARQ_OFFSET)
if (offTexto) {
  // Formato esperado: SERIAL;OFFSET  (ex.: MH0XXXXXXX;13)
  // Se o arquivo tiver mais de uma linha, vale a última (a calibração mais recente).
  const achados = [...offTexto.matchAll(/([A-Za-z0-9]+)\s*;\s*(-?\d+(?:[.,]\d+)?)/g)]
  const m = achados.length ? achados[achados.length - 1] : null
  if (m) {
    serialCalibrado = m[1].trim().toUpperCase()
    offsetCalibrado = Number(m[2].replace(",", ".")) || 0
  }
}

// ---------- Histórico salvo ----------
// Cada linha: dataISO_UTC;valor_bruto;valor_corrigido
const hist = new Map()
const histTexto = await lerTexto(ARQ_HIST)
if (histTexto) {
  for (const linha of histTexto.split("\n")) {
    const c = linha.trim().split(";")
    if (!(c.length >= 3)) continue
    const t = new Date(c[0])
    if (isNaN(t.getTime())) continue
    hist.set(c[0], { t, bruto: Number(c[1]), corr: Number(c[2]) })
  }
}

// ---------- Dados novos do LibreLinkUp ----------
let atual = null
let aviso = null
let diagnostico = ""

try {
  const req = new Request(`${cfg.base}/llu/connections/${cfg.patientId}/graph`)
  req.headers = {
    "product": "llu.ios",
    "version": "4.16.0",
    "Authorization": `Bearer ${cfg.token}`,
    "Account-Id": cfg.accountId
  }
  const resp = await req.loadJSON()
  if (!resp || !resp.data || !resp.data.graphData) {
    throw new Error((resp && resp.message) ? resp.message : "resposta sem dados")
  }

  const serial = String(resp.data.connection.sensor.sn || "").trim().toUpperCase()
  const calibrado = serial !== "" && serial === serialCalibrado
  diagnostico = `offset.txt: ${offTexto === null ? "(não encontrado)" : JSON.stringify(offTexto)}\n` +
    `Serial no offset.txt: ${serialCalibrado}\nSerial do sensor: ${serial}\n` +
    `Offset aplicado: ${calibrado ? offsetCalibrado : 0}`
  const offset = calibrado ? offsetCalibrado : 0
  if (!calibrado) aviso = "Sensor novo sem calibração: valor sem offset. Rode Libre - Calibrar."

  const gm = resp.data.connection.glucoseMeasurement
  atual = {
    t: lerDataUTC(gm.FactoryTimestamp),
    bruto: gm.ValueInMgPerDl,
    corr: gm.ValueInMgPerDl + offset,
    seta: gm.TrendArrow,
    offset
  }

  // Só guarda no histórico quando o sensor está calibrado, como o Sincronizar.
  if (calibrado) {
    for (const g of resp.data.graphData) {
      const t = lerDataUTC(g.FactoryTimestamp)
      if (!t) continue
      const iso = t.toISOString()
      if (!hist.has(iso)) hist.set(iso, { t, bruto: g.ValueInMgPerDl, corr: g.ValueInMgPerDl + offset })
    }
    const limite = Date.now() - DIAS_GUARDAR * 864e5
    const linhas = [...hist.entries()]
      .filter(([, v]) => v.t.getTime() >= limite)
      .sort((a, b) => a[1].t - b[1].t)
      .map(([iso, v]) => `${iso};${v.bruto};${v.corr}`)
    fm.writeString(ARQ_HIST, linhas.join("\n") + "\n")
  }
} catch (e) {
  const msg = String(e.message || e)
  aviso = /jwt|token|unauthor/i.test(msg)
    ? "Token expirado. Rode Libre - Configurar."
    : `Sem conexão com o Libre (${msg}). Mostrando dados salvos.`
}

// ---------- Estatísticas ----------
const agora = new Date()
const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
const pontos = [...hist.values()]

const media = lista => lista.length ? lista.reduce((s, p) => s + p.corr, 0) / lista.length : null

const deHoje = pontos.filter(p => p.t >= inicioHoje)
const mediaHoje = media(deHoje)

const desde = new Date(agora.getTime() - DIAS_GMI * 864e5)
const doPeriodo = pontos.filter(p => p.t >= desde)
const mediaPeriodo = media(doPeriodo)
const gmi = mediaPeriodo === null ? null : 3.31 + 0.02392 * mediaPeriodo
const diasComDados = new Set(doPeriodo.map(p => p.t.toDateString())).size

// ---------- Widget ----------
const CINZA = Color.gray()
const TEXTO = Color.dynamic(Color.black(), Color.white())
const VERMELHO = new Color("#e5484d")
const LARANJA = new Color("#f5a524")
const VERDE = new Color("#30a46c")
const SETAS = { 1: "↓", 2: "↘", 3: "→", 4: "↗", 5: "↑" }

const corDoValor = v => (ALVO_MIN > v) ? VERMELHO : ((v > ALVO_MAX) ? LARANJA : VERDE)
const umaCasa = n => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const hora = d => d ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "--:--"

const w = new ListWidget()
w.backgroundColor = Color.dynamic(Color.white(), new Color("#1c1c1e"))
w.setPadding(12, 14, 12, 14)
w.refreshAfterDate = new Date(Date.now() + MINUTOS_ATUALIZAR * 60 * 1000)
if (ATALHO_AO_TOCAR) {
  w.url = "shortcuts://run-shortcut?name=" + encodeURIComponent(ATALHO_AO_TOCAR)
}

const titulo = w.addText("Glicose")
titulo.font = Font.semiboldSystemFont(12)
titulo.textColor = CINZA

if (atual) {
  const linha = w.addStack()
  linha.centerAlignContent()
  const valor = linha.addText(String(atual.corr))
  valor.font = Font.boldRoundedSystemFont(36)
  valor.textColor = corDoValor(atual.corr)
  linha.addSpacer(4)
  const seta = linha.addText(SETAS[atual.seta] || "")
  seta.font = Font.boldSystemFont(24)
  seta.textColor = corDoValor(atual.corr)
  linha.addSpacer(4)
  const unidade = linha.addText("mg/dL")
  unidade.font = Font.systemFont(11)
  unidade.textColor = CINZA

  const sinal = atual.offset >= 0 ? "+" : ""
  const detalhe = w.addText(`${hora(atual.t)} · sensor ${atual.bruto} · offset ${sinal}${atual.offset}`)
  detalhe.font = Font.systemFont(10)
  detalhe.textColor = CINZA
  detalhe.lineLimit = 1
  detalhe.minimumScaleFactor = 0.7
}

if (aviso) {
  const a = w.addText(aviso)
  a.font = Font.systemFont(10)
  a.textColor = VERMELHO
  a.lineLimit = 2
  a.minimumScaleFactor = 0.7
}

w.addSpacer(6)
adicionarLinha("Média hoje", mediaHoje === null ? "—" : `${Math.round(mediaHoje)} mg/dL`)
adicionarLinha("Glicada est.", gmi === null ? "—" : `${umaCasa(gmi)}%`)

const rodape = w.addText(
  `Glicada com ${diasComDados} ${diasComDados === 1 ? "dia" : "dias"} de dados (máx. ${DIAS_GMI})`
)
rodape.font = Font.systemFont(9)
rodape.textColor = CINZA

if (config.runsInWidget) {
  Script.setWidget(w)
} else {
  // Rodando dentro do app: mostra um diagnóstico do offset antes da prévia.
  const alerta = new Alert()
  alerta.title = "Diagnóstico do offset"
  alerta.message = diagnostico || aviso || "Sem dados da API."
  alerta.addAction("Ver widget")
  await alerta.present()
  await w.presentMedium()
}
Script.complete()

// ---------- Auxiliares ----------
function adicionarLinha(rotulo, valor) {
  const st = w.addStack()
  st.centerAlignContent()
  const r = st.addText(rotulo)
  r.font = Font.systemFont(12)
  r.textColor = CINZA
  st.addSpacer()
  const v = st.addText(valor)
  v.font = Font.semiboldSystemFont(12)
  v.textColor = TEXTO
}

async function mostrarErroFatal(texto) {
  const e = new ListWidget()
  const t = e.addText(texto)
  t.font = Font.systemFont(11)
  t.textColor = new Color("#e5484d")
  if (config.runsInWidget) Script.setWidget(e)
  else await e.presentMedium()
  Script.complete()
  throw new Error(texto)
}
