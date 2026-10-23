// Dados de exemplo. Para acrescentar um item, copia um bloco e muda os campos.
// "dias" = há quantos dias foi publicado (serve para ordenar o feed).
const itens = [
  { tipo:"bolsa", dias:1, faculdade:"ISPTEC", sigla:"IS", titulo:"Engenharia Informática", modalidade:"Bolsa integral",
    cobertura:"100% das propinas", vagas:10, data:"2026-11-30",
    requisitos:"Média mínima de 14 valores e carta de motivação." },
  { tipo:"mentoria", dias:2, mentor:"Milonga Graciano", foto:"imagens/milonga.JPG", titulo:"Como organizar a candidatura a uma bolsa",
    data:"2026-11-07", hora:"10:00", local:"ISPTEC, Sala 12, Luanda", formato:"Presencial", vagas:20 },
  { tipo:"bolsa", dias:3, faculdade:"ISAF", sigla:"IF", titulo:"Gestão de Empresas", modalidade:"Bolsa parcial",
    cobertura:"50% das propinas", vagas:15, data:"2026-12-10",
    requisitos:"Média mínima de 13 valores e comprovativo de rendimento familiar." },
  { tipo:"mentoria", dias:4, mentor:"João Gonga", foto:"imagens/joao.JPG", titulo:"Introdução à programação para principiantes",
    data:"2026-11-14", hora:"14:30", local:"Online (Google Meet)", formato:"Online", vagas:30 },
  { tipo:"bolsa", dias:6, faculdade:"UCAN", sigla:"UC", titulo:"Direito", modalidade:"Bolsa de mérito",
    cobertura:"70% das propinas", vagas:5, data:"2026-11-25",
    requisitos:"Melhor média da turma do ensino médio." },
  { tipo:"mentoria", dias:7, mentor:"Baptista Francisco", foto:"imagens/baptista.jpeg", titulo:"Gestão do tempo no primeiro ano",
    data:"2026-11-21", hora:"09:00", local:"UCAN, Auditório, Luanda", formato:"Presencial", vagas:40 },
  { tipo:"bolsa", dias:9, faculdade:"UAN", sigla:"UA", titulo:"Engenharia Civil", modalidade:"Bolsa integral",
    cobertura:"100% das propinas", vagas:8, data:"2027-01-15",
    requisitos:"Média mínima de 15 valores e entrevista." },
  { tipo:"mentoria", dias:11, mentor:"Frederico Bernardo", foto:"imagens/frederico.JPG", titulo:"Preparar o CV e a primeira entrevista",
    data:"2026-12-05", hora:"15:00", local:"Online (Zoom)", formato:"Online", vagas:25 }
];

const lista = document.getElementById("lista");
const contagem = document.getElementById("contagem");
const busca = document.getElementById("busca");
let filtro = "todos";

const fmtData = iso => new Date(iso + "T00:00:00").toLocaleDateString("pt-PT", { day:"2-digit", month:"long", year:"numeric" });
const ha = d => d === 1 ? "Há 1 dia" : `Há ${d} dias`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
const campo = (rotulo, valor) => `<div><dt>${rotulo}</dt><dd>${esc(valor)}</dd></div>`;

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
      <button class="btn" data-acao="Pedido enviado">Candidatar-me</button>
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
        ${campo("Vagas", i.vagas)}
      </dl>
      <button class="btn" data-acao="Inscrição enviada">Inscrever-me</button>
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

lista.addEventListener("click", e => {
  const b = e.target.closest("[data-acao]");
  if (!b) return;
  // TODO: enviar o pedido ao servidor quando o backend existir
  b.textContent = b.dataset.acao;
  b.disabled = true;
});

desenhar();
