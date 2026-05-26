/**
 * Banco de dados e constantes do Inventário
 */

const OPTIONS_ATTR = [
    { v: "nenhum", t: "-" }, { v: "forca", t: "FOR" }, { v: "destreza", t: "DES" },
    { v: "constituicao", t: "CON" }, { v: "inteligencia", t: "INT" }, { v: "sabedoria", t: "SAB" },
    { v: "carisma", t: "CAR" }, { v: "aura", t: "AUR" }, { v: "pv_max", t: "Vida Máx" },
    { v: "pm_max", t: "Mana Máx" }, { v: "defesa", t: "Defesa" }, { v: "movimentacao", t: "Movimento" },
    { v: "sanidade_max", t: "Sanidade Máx" }, { v: "status_info", t: "Status" },
    { v: "dano", t: "Arma: Dano" }, { v: "critico", t: "Arma: Crítico" }, { v: "alcance", t: "Arma: Alcance" },
    { v: "cd_max", t: "Durabilidade (CD)" },
    { v: "teste", t: "Arma: Acerto" },
    { v: "todas", t: "P: TODAS as Perícias" },
    { v: "acrobacia", t: "P: Acrobacia" }, { v: "adestramento", t: "P: Adestramento" },
    { v: "atuação", t: "P: Atuação" }, { v: "bloquear", t: "P: Bloquear" },
    { v: "conhecimento", t: "P: Conhecimento" }, { v: "corrompimento", t: "P: Corrompimento" },
    { v: "cura", t: "P: Cura" }, { v: "diplomacia", t: "P: Diplomacia" },
    { v: "enganação", t: "P: Enganação" }, { v: "fortitude", t: "P: Fortitude" },
    { v: "furtividade", t: "P: Furtividade" }, { v: "guerra", t: "P: Guerra" },
    { v: "iniciativa", t: "P: Iniciativa" }, { v: "intimidação", t: "P: Intimidação" },
    { v: "investigação", t: "P: Investigação" }, { v: "luta", t: "P: Luta" },
    { v: "manipulação", t: "P: Manipulação" }, { v: "misticismo", t: "P: Misticismo" },
    { v: "percepção", t: "P: Percepção" }, { v: "pilotagem", t: "P: Pilotagem" },
    { v: "pontaria", t: "P: Pontaria" }, { v: "reflexos", t: "P: Reflexos" },
    { v: "religião", t: "P: Religião" }, { v: "sobrevivência", t: "P: Sobrevivência" },
    { v: "vontade", t: "P: Vontade" }
];

const OPTIONS_ALCANCE = [
    { v: "toque", t: "Toque (0m)" }, { v: "curto", t: "Curto (5m)" },
    { v: "medio", t: "Médio (15m)" }, { v: "longo", t: "Longo (30m)" },
    { v: "longo_plus", t: "Longo+ (45m)" }, { v: "planetario", t: "Planetário (95m)" },
    { v: "estelar", t: "Estelar (150m)" }, { v: "universal", t: "Universal (360m)" },
    { v: "multiversal", t: "Multiversal (1km)" }
];

const OPTIONS_RARIDADE = [
    { v: "comum", t: "Comum" },
    { v: "incomum", t: "Incomum" },
    { v: "raro", t: "Raro" },
    { v: "epico", t: "Épico" },
    { v: "mitico", t: "Mítico" },
    { v: "especial", t: "Relíquia" }
];

const OPTIONS_ATK_TIPO = [
    { v: "Corpo-a-Corpo", t: "Corpo-a-Corpo" },
    { v: "À Distância", t: "À Distância" },
    { v: "Arremesso", t: "Arremesso" },
    { v: "Magia", t: "Magia" },
    { v: "Outro", t: "Outro" }
];

const OPTIONS_TAMANHO = [
    { v: "Minúsculo", t: "Minúsculo" },
    { v: "Pequeno", t: "Pequeno" },
    { v: "Normal", t: "Normal" },
    { v: "Grande", t: "Grande" },
    { v: "Enorme", t: "Enorme" }
];

const OPTIONS_TIPO_DANO_CATEGORIZADO = {
    comum: [
        { v: "Corte", t: "Corte" }, { v: "Perfuração", t: "Perfuração" },
        { v: "Impacto", t: "Impacto" }, { v: "Balistico", t: "Balistico" }
    ],
    elemental: [
        { v: "Fogo", t: "Fogo" }, { v: "Fogo Verdadeiro", t: "Fogo Verdadeiro" }, { v: "Fumaça", t: "Fumaça" }, { v: "Lava", t: "Lava" },
        { v: "Água", t: "Água" }, { v: "Água (SubElemento)", t: "Água (SubElemento)" }, { v: "Gelo", t: "Gelo" }, { v: "Sangue", t: "Sangue" },
        { v: "Ar", t: "Ar" }, { v: "Ar (SubElemento)", t: "Ar (SubElemento)" }, { v: "Gás", t: "Gás" }, { v: "ATM", t: "ATM" },
        { v: "Terra", t: "Terra" }, { v: "Terra (SubElemento)", t: "Terra (SubElemento)" }, { v: "Metal", t: "Metal" }, { v: "Cristal", t: "Cristal" },
        { v: "Vida", t: "Vida" }, { v: "Morte", t: "Morte " },
        { v: "Luz", t: "Luz" }, { v: "Escuridão", t: "Escuridão" },
        { v: "Raio", t: "Raio" }, { v: "Energia", t: "Energia" }
    ],
    outros: [
        { v: "Calor", t: "Calor" }, { v: "Frio", t: "Frio" },
        { v: "Mágico", t: "Mágico" }, { v: "Veneno", t: "Veneno" }, { v: "Mental", t: "Mental" },
        { v: "Explosivo", t: "Explosivo" }, { v: "Sangramento", t: "Sangramento" },
        { v: "Outro", t: "Outro" }
    ]
};

// Mantém a lista plana para compatibilidade em outros lugares do sistema
const OPTIONS_TIPO_DANO = [
    ...OPTIONS_TIPO_DANO_CATEGORIZADO.comum,
    ...OPTIONS_TIPO_DANO_CATEGORIZADO.elemental,
    ...OPTIONS_TIPO_DANO_CATEGORIZADO.outros
];