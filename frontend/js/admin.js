// ---------- separadores ----------
function abrirAba(nome) {
  document.querySelectorAll("[data-aba]").forEach(b => {
    b.classList.toggle("ativo", b.dataset.aba === nome);
    b.setAttribute("aria-pressed", b.dataset.aba === nome);
  });
  document.querySelectorAll("[data-painel]").forEach(p => { p.hidden = p.dataset.painel !== nome; });
  if (nome === "candidaturas") carregarCandidaturas();
  if (nome === "utilizadores") carregarUsers();
}
document.querySelectorAll("[data-aba]").forEach(b => b.addEventListener("click", () => abrirAba(b.dataset.aba)));

// =========================================================
// BOLSAS
// =========================================================
const formBolsa = document.getElementById("form-bolsa");
const msgBolsa = document.getElementById("msg-bolsa");
const listaBolsas = document.getElementById("lista-bolsas");
const cancelarBolsa = document.getElementById("cancelar-bolsa");
const camposBolsa = ["faculdade", "sigla", "titulo", "modalidade", "cobertura", "vagas", "data", "requisitos"];
let bolsas = [];
let editandoBolsa = null;

function cartaoBolsa(b) {
  return `
    <article class="card">
      <div class="card-topo">
        <span class="sigla" aria-hidden="true">${esc(b.sigla)}</span>
        <div><strong>${esc(b.faculdade)}</strong></div>
        <span class="tag tag-bolsa">${esc(b.modalidade)}</span>
      </div>
      <h2>${esc(b.titulo)}</h2>
      <dl class="detalhes">
        ${campo("Cobertura", b.cobertura)}${campo("Vagas livres", b.vagas)}
        ${campo("Prazo", fmtData(b.data))}
      </dl>
      <p class="req"><strong>Requisitos:</strong> ${esc(b.requisitos)}</p>
      <div class="acoes">
        <button class="btn btn-claro" data-editar-bolsa="${b.id}">Editar</button>
        <button class="btn btn-claro btn-perigo" data-apagar-bolsa="${b.id}">Apagar</button>
      </div>
    </article>`;
}

async function carregarBolsas() {
  try {
    bolsas = await pedir("/bolsas");
    listaBolsas.innerHTML = bolsas.map(cartaoBolsa).join("") || '<p class="vazio">Ainda não há bolsas.</p>';
  } catch (err) {
    mostrarMsg(msgBolsa, err.message, false);
  }
}

function limparFormBolsa() {
  editandoBolsa = null;
  formBolsa.reset();
  document.getElementById("titulo-bolsa").textContent = "Nova bolsa";
  formBolsa.querySelector('button[type="submit"]').textContent = "Publicar bolsa";
  cancelarBolsa.hidden = true;
}

cancelarBolsa.addEventListener("click", () => { limparFormBolsa(); mostrarMsg(msgBolsa, "", true); });

formBolsa.addEventListener("submit", async e => {
  e.preventDefault();
  if (!formBolsa.checkValidity()) return mostrarMsg(msgBolsa, "Preenche todos os campos obrigatórios com dados válidos.", false);

  const corpo = {};
  camposBolsa.forEach(n => { corpo[n] = formBolsa.elements[n].value.trim(); });
  corpo.vagas = Number(corpo.vagas);
  try {
    await pedir(editandoBolsa ? `/bolsas/${editandoBolsa}` : "/bolsas", { method: editandoBolsa ? "PUT" : "POST", corpo });
    mostrarMsg(msgBolsa, editandoBolsa ? "Bolsa atualizada." : "Bolsa publicada.", true);
    limparFormBolsa();
    carregarBolsas();
  } catch (err) {
    mostrarMsg(msgBolsa, err.message, false);
  }
});

listaBolsas.addEventListener("click", async e => {
  const bEditar = e.target.closest("[data-editar-bolsa]");
  const bApagar = e.target.closest("[data-apagar-bolsa]");

  if (bEditar) {
    const b = bolsas.find(x => x.id === Number(bEditar.dataset.editarBolsa));
    camposBolsa.forEach(n => { formBolsa.elements[n].value = b[n]; });
    editandoBolsa = b.id;
    document.getElementById("titulo-bolsa").textContent = "Editar bolsa";
    formBolsa.querySelector('button[type="submit"]').textContent = "Guardar alterações";
    cancelarBolsa.hidden = false;
    formBolsa.scrollIntoView({ behavior: "smooth" });
  }

  if (bApagar && confirm("Apagar esta bolsa? As candidaturas também serão apagadas.")) {
    try {
      await pedir(`/bolsas/${bApagar.dataset.apagarBolsa}`, { method: "DELETE" });
      mostrarMsg(msgBolsa, "Bolsa removida.", true);
      carregarBolsas();
    } catch (err) {
      mostrarMsg(msgBolsa, err.message, false);
    }
  }
});

// =========================================================
// CANDIDATURAS A BOLSAS
// =========================================================
const listaCandidaturas = document.getElementById("lista-candidaturas");
const msgCandidaturas = document.getElementById("msg-candidaturas");

function cartaoCandidatura(c) {
  return `
    <article class="card">
      <div class="card-topo">
        <div><strong>${esc(c.nome)}</strong><small>${esc(c.email)} · ${esc(c.contacto)}</small></div>
        <span class="tag tag-${c.estado}">${nomeEstado[c.estado]}</span>
      </div>
      <h2>${esc(c.bolsa)}</h2>
      <dl class="detalhes">
        ${campo("Curso", c.curso)}${campo("Média do ensino médio", c.media_ensinomedio)}
        ${campo("Pedido em", fmtData(c.criadaEm))}
      </dl>
      ${c.estado === "pendente" ? `
      <div class="acoes">
        <button class="btn" data-decidir="aprovada" data-id="${c.id}">Aprovar</button>
        <button class="btn btn-claro btn-perigo" data-decidir="rejeitada" data-id="${c.id}">Rejeitar</button>
      </div>` : ""}
    </article>`;
}

async function carregarCandidaturas() {
  try {
    const candidaturas = await pedir("/admin/candidaturas");
    listaCandidaturas.innerHTML = candidaturas.map(cartaoCandidatura).join("") ||
      '<p class="vazio">Ainda não há candidaturas a bolsas.</p>';
  } catch (err) {
    mostrarMsg(msgCandidaturas, err.message, false);
  }
}

listaCandidaturas.addEventListener("click", async e => {
  const b = e.target.closest("[data-decidir]");
  if (!b) return;
  b.disabled = true;
  try {
    mostrarMsg(msgCandidaturas, await pedir(`/admin/candidaturas/${b.dataset.id}`, { method: "PUT", corpo: { estado: b.dataset.decidir } }), true);
    carregarCandidaturas();
    carregarBolsas(); // as vagas mudaram
  } catch (err) {
    b.disabled = false;
    mostrarMsg(msgCandidaturas, err.message, false);
  }
});

// =========================================================
// UTILIZADORES
// =========================================================
const formUser = document.getElementById("form-user");
const msgUser = document.getElementById("msg-user");
const listaUsers = document.getElementById("lista-users");
const cancelarUser = document.getElementById("cancelar-user");
const campoPassword = document.getElementById("campo-password");
let users = [];
let editandoUser = null;

// mostra os campos de estudante ou de mentor conforme o tipo
function mostrarGrupos() {
  document.querySelectorAll("#form-user [data-grupo]").forEach(g => {
    const ativo = g.dataset.grupo === formUser.elements["tipo"].value;
    g.hidden = !ativo;
    g.querySelectorAll("input").forEach(i => { i.disabled = !ativo; });
  });
}
formUser.elements["tipo"].addEventListener("change", mostrarGrupos);
mostrarGrupos();

async function carregarUsers() {
  try {
    users = await pedir("/admin/utilizadores");
    listaUsers.innerHTML = users.map(u => `
      <tr>
        <td>${esc(u.nome)}</td><td>${esc(u.email)}</td><td>${esc(u.tipo)}</td><td>${esc(u.contacto)}</td>
        <td>
          ${u.tipo === "admin" ? "" : `<button class="btn btn-claro" data-editar-user="${u.id}">Editar</button>`}
          <button class="btn btn-claro btn-perigo" data-apagar-user="${u.id}">Remover</button>
        </td>
      </tr>`).join("");
  } catch (err) {
    mostrarMsg(msgUser, err.message, false);
  }
}

function limparFormUser() {
  editandoUser = null;
  formUser.reset();
  ["email", "tipo", "password"].forEach(n => { formUser.elements[n].disabled = false; });
  campoPassword.hidden = false;
  mostrarGrupos();
  document.getElementById("titulo-user").textContent = "Novo utilizador";
  formUser.querySelector('button[type="submit"]').textContent = "Criar utilizador";
  cancelarUser.hidden = true;
}

cancelarUser.addEventListener("click", () => { limparFormUser(); mostrarMsg(msgUser, "", true); });

formUser.addEventListener("submit", async e => {
  e.preventDefault();
  if (!formUser.checkValidity()) return mostrarMsg(msgUser, "Preenche todos os campos obrigatórios com dados válidos.", false);

  const v = n => formUser.elements[n].value.trim();
  const corpo = { nome: v("nome"), contacto: v("contacto") };
  if (v("curso")) corpo.curso = v("curso");
  if (v("media_ensinomedio")) corpo.media_ensinomedio = Number(v("media_ensinomedio"));
  if (v("formacao")) corpo.formacao = v("formacao");

  try {
    if (editandoUser) {
      await pedir(`/admin/utilizadores/${editandoUser}`, { method: "PUT", corpo });
      mostrarMsg(msgUser, "Utilizador atualizado.", true);
    } else {
      Object.assign(corpo, { email: v("email"), tipo: v("tipo"), password: formUser.elements["password"].value });
      mostrarMsg(msgUser, await pedir("/admin/utilizadores", { method: "POST", corpo }), true);
    }
    limparFormUser();
    carregarUsers();
  } catch (err) {
    mostrarMsg(msgUser, err.message, false);
  }
});

listaUsers.addEventListener("click", async e => {
  const bEditar = e.target.closest("[data-editar-user]");
  const bApagar = e.target.closest("[data-apagar-user]");

  if (bEditar) {
    const u = users.find(x => x.id === Number(bEditar.dataset.editarUser));
    formUser.reset();
    ["nome", "email", "contacto", "tipo", "curso", "media_ensinomedio", "formacao"].forEach(n => { formUser.elements[n].value = u[n] ?? ""; });
    editandoUser = u.id;
    mostrarGrupos();
    // o email, o tipo e a password nao se alteram aqui
    ["email", "tipo", "password"].forEach(n => { formUser.elements[n].disabled = true; });
    campoPassword.hidden = true;
    document.getElementById("titulo-user").textContent = "Editar utilizador";
    formUser.querySelector('button[type="submit"]').textContent = "Guardar alterações";
    cancelarUser.hidden = false;
    formUser.scrollIntoView({ behavior: "smooth" });
  }

  if (bApagar && confirm("Remover este utilizador? Os pedidos e mentorias dele também serão apagados.")) {
    try {
      await pedir(`/admin/utilizadores/${bApagar.dataset.apagarUser}`, { method: "DELETE" });
      mostrarMsg(msgUser, "Utilizador removido.", true);
      carregarUsers();
    } catch (err) {
      mostrarMsg(msgUser, err.message, false);
    }
  }
});

if (exigirLogin("admin")) {
  prepararMenu();
  carregarBolsas();
}
