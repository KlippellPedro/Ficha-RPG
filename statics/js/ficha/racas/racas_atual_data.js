/**
 * Banco de dados das Raças
 * bonus: Atributos que recebem bônus automático
 */
window.RACAS_DATA = {
    "humano": { nome: "Humano", bonus: {}, tamanho: "Normal", creditosInicial: -5, dlc: "atual" },
    "vampiro": { nome: "Vampiro", bonus: {}, movimentoBonus: 1, tamanho: "Normal", dlc: "atual" },
    "espirito": { nome: "Espírito", bonus: { sabedoria: 1, forca: -1, constituicao: -1 }, manaBonus: 3, movimentoBonus: 8, tamanho: "Normal", dlc: "atual" },
    "morto_vivo": { nome: "Morto-Vivo", bonus: { constituicao: -1, carisma: -1, sabedoria: 2 }, skills: ["vontade"], skillBonus: { "intimidação": 4 }, tamanho: "Normal", dlc: "atual" },
    "animalia": { nome: "Animalia", bonus: {}, skills: ["misticismo"], tamanho: "Normal", dlc: "atual" },
    "goblin": { nome: "Goblin", bonus: { inteligencia: 2 }, pvBonus: -2, pmBonus: -2, movimentoBonus: 2, creditosInicial: 10, tamanho: "Pequeno", dlc: "atual" },
    "fada": { nome: "Fada", bonus: {}, movimentoBonus: 3, tamanho: "Pequeno", dlc: "atual" },
    "anao": { nome: "Anão", bonus: {}, tamanho: "Grande", dlc: "atual" },
    "elfo": { nome: "Elfo", bonus: {}, tamanho: "Normal", dlc: "atual" },
    "demonio": { nome: "Demônio", bonus: {}, tamanho: "Normal", dlc: "atual" },
    "anjo": { nome: "Anjo", bonus: {}, tamanho: "Normal", dlc: "atual" },
    "semideus": { nome: "Semi-Deus", bonus: {}, tamanho: "Normal", dlc: "atual" },
    "deus": { nome: "Deus", bonus: {}, tamanho: "Grande", dlc: "atual" },
    "escolhido": { nome: "Escolhido", bonus: {}, tamanho: "Normal", dlc: "atual" },
    "corrompido": { nome: "Corrompido", bonus: {}, tamanho: "Normal", dlc: "atual" },
    "hibrido": { nome: "Híbrido", bonus: {}, tamanho: "Normal", dlc: "atual" }
};