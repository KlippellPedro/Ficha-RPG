/**
 * Banco de dados das Raças
 * bonus: Atributos que recebem bônus automático
 */
const RACAS_DATA = {
    "humano": { nome: "Humano", bonus: {}, tamanho: "Normal", creditosInicial: -5 },
    "vampiro": { nome: "Vampiro", bonus: {}, movimentoBonus: 1, tamanho: "Normal" },
    "espirito": { nome: "Espírito", bonus: { sabedoria: 1, forca: -1, constituicao: -1 }, manaBonus: 3, movimentoBonus: 8, tamanho: "Normal" },
    "morto_vivo": { nome: "Morto-Vivo", bonus: { constituicao: -1, carisma: -1, sabedoria: 2 }, skills: ["vontade"], skillBonus: { "intimidação": 4 }, tamanho: "Normal" },
    "animalia": { nome: "Animalia", bonus: {}, skills: ["misticismo"], tamanho: "Normal" },
    "fada": { nome: "Fada", bonus: {}, movimentoBonus: 3, tamanho: "Pequeno" },
    "goblin": { nome: "Goblin", bonus: { inteligencia: 2 }, pvBonus: -2, pmBonus: -2, movimentoBonus: 2, creditosInicial: 10, tamanho: "Pequeno" },
    "anao": { nome: "Anão", bonus: {}, tamanho: "Grande" },
    "elfo": { nome: "Elfo", bonus: {}, tamanho: "Normal" },
    "povo_ceu": { nome: "Povo do Céu", bonus: {}, tamanho: "Normal" },
    "demonio": { nome: "Demônio", bonus: {}, tamanho: "Grande" },
    "anjo": { nome: "Anjo", bonus: {}, tamanho: "Normal" },
    "semi_deus": { nome: "Semi-Deus", bonus: {}, tamanho: "Normal" },
    "deus": { nome: "Deus", bonus: {}, tamanho: "Grande" },
    "escolhido": { nome: "Escolhido", bonus: {}, tamanho: "Normal" },
    "corrompido": { nome: "Corrompido", bonus: {}, tamanho: "Normal" },
    "hibrido": { nome: "Híbrido", bonus: {}, tamanho: "Normal" },
    "nenhuma": { nome: "Nenhuma", bonus: {} }
};