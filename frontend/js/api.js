// Funcoes partilhadas pelas paginas que falam com o servidor.
// Se o site for aberto noutra porta (ex.: Live Server), os pedidos vao para o servidor na 8080.
const API = location.port === "8080" ? "" : "http://localhost:8080";

// ---------- sessao (o token fica guardado no browser) ----------
const CHAVES = ["token", "nome", "tipo"];
const sessao = {
  get token() { return localStorage.getItem("fjmb_token") || sessionStorage.getItem("fjmb_token"); },
  get nome() { return localStorage.getItem("fjmb_nome") || sessionStorage.getItem("fjmb_nome"); },
  get tipo() { return localStorage.getItem("fjmb_tipo") || sessionStorage.getItem("fjmb_tipo"); },
  guardar(dados, lembrar) {
    this.limpar();
    const s = lembrar ? localStorage : sessionStorage;
    CHAVES.forEach(k => s.setItem("fjmb_" + k, dados[k] ?? ""));
  },
  limpar() {
    [localStorage, sessionStorage].forEach(s => CHAVES.forEach(k => s.removeItem("fjmb_" + k)));
  }
};

// ---------- pedidos ao servidor ----------
// pedir("/bolsas")  |  pedir("/bolsas", { method: "POST", corpo: { ... } })
async function pedir(url, { method = "GET", corpo } = {}) {
  const headers = {};
  if (corpo) headers["Content-Type"] = "application/json";
  if (sessao.token) headers.Authorization = "Bearer " + sessao.token;

  let r;
  try {
    r = await fetch(API + url, { method, headers, body: corpo ? JSON.stringify(corpo) : undefined });
  } catch {
    throw new Error("Não foi possível ligar ao servidor. Verifica se está a correr.");
  }

  const dados = (r.headers.get("content-type") || "").includes("json") ? await r.json() : await r.text();
  if (!r.ok) {
    if (r.status === 401 && sessao.token && url !== "/loginUser") { // sessao expirada
      sessao.limpar();
      location.replace("login.html");
    }
    throw new Error(typeof dados === "string" && dados ? dados : "Erro no servidor");
  }
  return dados;
}

// ---------- paginas com login ----------
// exigirLogin() = qualquer utilizador | exigirLogin("admin") = so esse tipo
function exigirLogin(...tipos) {
  if (!sessao.token) { location.replace("login.html"); return false; }
  if (tipos.length && !tipos.includes(sessao.tipo)) { location.replace("feed.html"); return false; }
  return true;
}

// mostra no menu so as ligacoes do tipo de utilizador e liga o botao "Sair"
function prepararMenu() {
  document.querySelectorAll("[data-so]").forEach(a => { a.hidden = a.dataset.so !== sessao.tipo; });
  document.querySelector("[data-sair]")?.addEventListener("click", () => sessao.limpar());
}

// ---------- utilitarios de texto ----------
const fmtData = iso => new Date(iso.slice(0, 10) + "T00:00:00").toLocaleDateString("pt-PT", { day:"2-digit", month:"long", year:"numeric" });
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
const campo = (rotulo, valor) => `<div><dt>${rotulo}</dt><dd>${esc(valor)}</dd></div>`;
const preco = p => p > 0 ? `${Number(p).toLocaleString("pt-PT")} Kz` : "Gratuita";

const nomeEstado = {
  pendente: "Pendente", aprovada: "Aprovada", rejeitada: "Rejeitada",
  por_pagar: "Por pagar", paga: "Paga", inscrita: "Inscrito"
};

// mensagem de ok/erro num elemento .msg
function mostrarMsg(el, texto, ok) {
  el.textContent = texto;
  el.classList.remove("ok", "erro");
  el.classList.add(ok ? "ok" : "erro");
}
