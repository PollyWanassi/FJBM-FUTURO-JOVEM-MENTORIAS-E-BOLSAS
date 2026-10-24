// Os dados vêm do servidor (bolsas e mentorias).
// "dias" = há quantos dias foi publicado (serve para ordenar o feed).
let itens = [];
const pedidos = new Set(); // pedidos ja feitos pelo estudante, ex.: "bolsa:1"
const podePedir = sessao.tipo === "estudante"; // so estudantes se candidatam

const lista = document.getElementById("lista");
const contagem = document.getElementById("contagem");
const aviso = document.getElementById("aviso");
const busca = document.getElementById("busca");
let filtro = "todos";

const ha = d => d === 1 ? "Há 1 dia" : `Há ${d} dias`;
const diasDesde = iso => Math.max(0, Math.round((Date.now() - new Date(iso)) / 864e5));

function botao(i, texto, feito) {
  if (!podePedir) return "";
  const ja = pedidos.has(`${i.tipo}:${i.id}`);
  return `<button class="btn" data-id="${i.id}" data-tipo="${i.tipo}" data-acao="${feito}"${ja ? " disabled" : ""}>${ja ? feito : texto}</button>`;
}

function cartao(i) {
  if (i.tipo === "bolsa") return `
    <article class="card">
      <div class="card-topo">
        <span class="sigla" aria-hidden="true">${esc(i.sigla)}</span>
        <div><strong>${esc(i.faculdade)}</strong><small>${ha(i.dias)}</small></div>
        <span class="tag tag-bolsa">${esc(i.modalidade)}</span>
      </div>
      <h2>${esc(i.titulo)}</h2>
      <dl class="detalhes">
        ${campo("Cobertura", i.cobertura)}${campo("Vagas", i.vagas)}
        ${campo("Prazo", fmtData(i.data))}
      </dl>
      <p class="req"><strong>Requisitos:</strong> ${esc(i.requisitos)}</p>
      ${botao(i, "Candidatar-me", "Pedido enviado")}
    </article>`;
  return `
    <article class="card">
      <div class="card-topo">
        <img class="foto" src="${esc(i.foto)}" alt="${esc(i.mentor)}">
        <div><strong>${esc(i.mentor)}</strong><small>${ha(i.dias)}</small></div>
        <span class="tag tag-mentoria">Mentoria</span>
      </div>
      <h2>${esc(i.titulo)}</h2>
      <dl class="detalhes">
        ${campo("Data", fmtData(i.data))}${campo("Hora", i.hora)}
        ${campo("Local", i.local)}${campo("Formato", i.formato)}
        ${campo("Vagas", i.vagas)}${campo("Preço", preco(i.preco))}
      </dl>
      ${botao(i, "Inscrever-me", "Inscrição enviada")}
    </article>`;
}

function desenhar() {
  const q = busca.value.trim().toLowerCase();
  const visiveis = itens
    .filter(i => filtro === "todos" || i.tipo === filtro)
    .filter(i => !q || JSON.stringify(i).toLowerCase().includes(q))
    .sort((a, b) => a.dias - b.dias);
  lista.innerHTML = visiveis.map(cartao).join("") || '<p class="vazio">Nada encontrado. Tenta outra pesquisa.</p>';
  contagem.textContent = `${visiveis.length} ${visiveis.length === 1 ? "resultado" : "resultados"}`;
}

document.querySelectorAll("[data-filtro]").forEach(b => b.addEventListener("click", () => {
  filtro = b.dataset.filtro;
  document.querySelectorAll("[data-filtro]").forEach(x => {
    x.classList.toggle("ativo", x === b);
    x.setAttribute("aria-pressed", x === b);
  });
  desenhar();
}));
busca.addEventListener("input", desenhar);

lista.addEventListener("click", async e => {
  const b = e.target.closest("[data-acao]");
  if (!b) return;
  b.disabled = true;
  try {
    const r = await pedir("/candidaturas", { method: "POST", corpo: { tipo: b.dataset.tipo, itemId: Number(b.dataset.id) } });
    pedidos.add(`${b.dataset.tipo}:${b.dataset.id}`);
    b.textContent = b.dataset.acao;
    mostrarMsg(aviso, r.mensagem, true);
  } catch (err) {
    b.disabled = false;
    mostrarMsg(aviso, err.message, false);
  }
});

async function carregar() {
  if (!exigirLogin()) return;
  prepararMenu();
  contagem.textContent = "A carregar…";
  try {
    const [bolsas, mentorias] = await Promise.all([pedir("/bolsas"), pedir("/mentorias")]);
    itens = [...bolsas.map(b => ({ ...b, tipo: "bolsa" })), ...mentorias.map(m => ({ ...m, tipo: "mentoria" }))]
      .map(i => ({ ...i, dias: diasDesde(i.publicadoEm) }));
    if (podePedir) (await pedir("/candidaturas/minhas")).forEach(c => pedidos.add(`${c.tipo}:${c.itemId}`));
  } catch (err) {
    contagem.textContent = err.message;
    return;
  }
  desenhar();
}

carregar();
