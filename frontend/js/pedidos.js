const lista = document.getElementById("lista");
const aviso = document.getElementById("aviso");

function cartao(p) {
  const bolsa = p.tipo === "bolsa";
  return `
    <article class="card">
      <div class="card-topo">
        <div><strong>${esc(p.quem)}</strong><small>Pedido em ${fmtData(p.criadaEm)}</small></div>
        <span class="tag tag-${p.estado}">${nomeEstado[p.estado]}</span>
      </div>
      <h2>${esc(p.titulo)}</h2>
      <dl class="detalhes">
        ${campo("Tipo", bolsa ? "Bolsa" : "Mentoria")}${campo(bolsa ? "Prazo" : "Data", fmtData(p.data))}
        ${bolsa ? "" : campo("Preço", preco(p.preco))}
      </dl>
      ${p.estado === "por_pagar" ? `<button class="btn" data-pagar="${p.id}">Pagar ${preco(p.preco)} (simulação)</button>` : ""}
    </article>`;
}

async function carregar() {
  if (!exigirLogin("estudante")) return;
  prepararMenu();
  try {
    const pedidos = await pedir("/candidaturas/minhas");
    lista.innerHTML = pedidos.map(cartao).join("") ||
      '<p class="vazio">Ainda não fizeste nenhum pedido. <a href="feed.html">Ver bolsas e mentorias</a></p>';
  } catch (err) {
    mostrarMsg(aviso, err.message, false);
  }
}

lista.addEventListener("click", async e => {
  const b = e.target.closest("[data-pagar]");
  if (!b) return;
  b.disabled = true;
  try {
    mostrarMsg(aviso, await pedir(`/candidaturas/${b.dataset.pagar}/pagar`, { method: "POST" }), true);
    carregar();
  } catch (err) {
    b.disabled = false;
    mostrarMsg(aviso, err.message, false);
  }
});

carregar();
