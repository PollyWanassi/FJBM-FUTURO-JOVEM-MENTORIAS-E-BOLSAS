const lista = document.getElementById("lista");
const form = document.getElementById("form-mentoria");
const msg = form.querySelector(".msg");
const tituloForm = document.getElementById("titulo-form");
const cancelar = document.getElementById("cancelar");
let mentorias = [];
let editando = null; // id da mentoria que esta a ser editada

function cartao(m) {
  const inscritos = m.inscritos.map(i => `
        <li>${esc(i.nome)} · ${esc(i.email)} · ${esc(i.contacto)}
          <span class="tag tag-${i.estado}">${nomeEstado[i.estado]}</span></li>`).join("") || "<li>Ainda sem inscritos.</li>";
  return `
    <article class="card">
      <div class="card-topo">
        <img class="foto" src="${esc(m.foto)}" alt="${esc(m.mentor)}">
        <div><strong>${esc(m.mentor)}</strong></div>
        <span class="tag tag-mentoria">Mentoria</span>
      </div>
      <h2>${esc(m.titulo)}</h2>
      <dl class="detalhes">
        ${campo("Data", fmtData(m.data))}${campo("Hora", m.hora)}
        ${campo("Local", m.local)}${campo("Formato", m.formato)}
        ${campo("Vagas livres", m.vagas)}${campo("Preço", preco(m.preco))}
      </dl>
      <details>
        <summary>Inscritos (${m.inscritos.length})</summary>
        <ul class="inscritos">${inscritos}</ul>
      </details>
      <div class="acoes">
        <button class="btn btn-claro" data-editar="${m.id}">Editar</button>
        <button class="btn btn-claro btn-perigo" data-apagar="${m.id}">Apagar</button>
      </div>
    </article>`;
}

async function carregar() {
  try {
    mentorias = await pedir("/mentor/mentorias");
    lista.innerHTML = mentorias.map(cartao).join("") || '<p class="vazio">Ainda não publicaste nenhuma mentoria.</p>';
  } catch (err) {
    mostrarMsg(msg, err.message, false);
  }
}

function limparForm() {
  editando = null;
  form.reset();
  tituloForm.textContent = "Nova mentoria";
  form.querySelector('button[type="submit"]').textContent = "Publicar mentoria";
  cancelar.hidden = true;
}

cancelar.addEventListener("click", () => { limparForm(); mostrarMsg(msg, "", true); });

form.addEventListener("submit", async e => {
  e.preventDefault();
  if (!form.checkValidity()) return mostrarMsg(msg, "Preenche todos os campos obrigatórios com dados válidos.", false);

  const v = n => form.elements[n].value.trim();
  const corpo = {
    titulo: v("titulo"), data: v("data"), hora: v("hora"), local: v("local"),
    formato: v("formato"), vagas: Number(v("vagas")), preco: Number(v("preco"))
  };
  try {
    await pedir(editando ? `/mentor/mentorias/${editando}` : "/mentor/mentorias", { method: editando ? "PUT" : "POST", corpo });
    mostrarMsg(msg, editando ? "Mentoria atualizada." : "Mentoria publicada.", true);
    limparForm();
    carregar();
  } catch (err) {
    mostrarMsg(msg, err.message, false);
  }
});

lista.addEventListener("click", async e => {
  const bEditar = e.target.closest("[data-editar]");
  const bApagar = e.target.closest("[data-apagar]");

  if (bEditar) {
    const m = mentorias.find(x => x.id === Number(bEditar.dataset.editar));
    ["titulo", "data", "hora", "local", "formato", "vagas", "preco"].forEach(n => { form.elements[n].value = m[n]; });
    editando = m.id;
    tituloForm.textContent = "Editar mentoria";
    form.querySelector('button[type="submit"]').textContent = "Guardar alterações";
    cancelar.hidden = false;
    form.scrollIntoView({ behavior: "smooth" });
  }

  if (bApagar && confirm("Apagar esta mentoria? As inscrições também serão apagadas.")) {
    try {
      await pedir(`/mentor/mentorias/${bApagar.dataset.apagar}`, { method: "DELETE" });
      mostrarMsg(msg, "Mentoria removida.", true);
      carregar();
    } catch (err) {
      mostrarMsg(msg, err.message, false);
    }
  }
});

if (exigirLogin("mentor")) {
  prepararMenu();
  carregar();
}
