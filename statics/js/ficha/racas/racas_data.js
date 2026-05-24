/**
 * Banco de dados das Raças
 * bonus: Atributos que recebem bônus automático
 */
const RACAS_DATA = {
    "humano": { nome: "Humano", bonus: {}, tamanho: "Normal", creditosInicial: -5, dlc: "normalidade" },
    "vampiro": { nome: "Vampiro", bonus: {}, movimentoBonus: 1, tamanho: "Normal", dlc: "normalidade" },
    "espirito": { nome: "Espírito", bonus: { sabedoria: 1, forca: -1, constituicao: -1 }, manaBonus: 3, movimentoBonus: 8, tamanho: "Normal", dlc: "normalidade" },
    "morto_vivo": { nome: "Morto-Vivo", bonus: { constituicao: -1, carisma: -1, sabedoria: 2 }, skills: ["vontade"], skillBonus: { "intimidação": 4 }, tamanho: "Normal", dlc: "normalidade" },
    "animalia": { nome: "Animalia", bonus: {}, skills: ["misticismo"], tamanho: "Normal", dlc: "normalidade" },
    "goblin": { nome: "Goblin", bonus: { inteligencia: 2 }, pvBonus: -2, pmBonus: -2, movimentoBonus: 2, creditosInicial: 10, tamanho: "Pequeno", dlc: "normalidade" },
    "fada": { nome: "Fada", bonus: {}, movimentoBonus: 3, tamanho: "Pequeno", dlc: "normalidade" },
    "anao": { nome: "Anão", bonus: {}, tamanho: "Grande", dlc: "normalidade" },
    "elfo": { nome: "Elfo", bonus: {}, tamanho: "Normal", dlc: "normalidade" },
    "demonio": { nome: "Demônio", bonus: {}, tamanho: "Normal", dlc: "olimpo" },
    "anjo": { nome: "Anjo", bonus: {}, tamanho: "Normal", dlc: "olimpo" },
    "semideus": { nome: "Semi-Deus", bonus: {}, tamanho: "Normal", dlc: "olimpo" },
    "deus": { nome: "Deus", bonus: {}, tamanho: "Grande", dlc: "olimpo" },
    "escolhido": { nome: "Escolhido", bonus: {}, tamanho: "Normal", dlc: "olimpo" },
    "corrompido": { nome: "Corrompido", bonus: {}, tamanho: "Normal", dlc: "olimpo" },
    "hibrido": { nome: "Híbrido", bonus: {}, tamanho: "Normal", dlc: "olimpo" },
    "nenhuma": { nome: "Nenhuma", bonus: {} }
};