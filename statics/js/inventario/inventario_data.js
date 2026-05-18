/**
 * Banco de dados e constantes do Inventário
 */

const OPTIONS_ATTR = [
    { v: "nenhum", t: "-" }, { v: "forca", t: "FOR" }, { v: "destreza", t: "DES" },
    { v: "constituicao", t: "CON" }, { v: "inteligencia", t: "INT" }, { v: "sabedoria", t: "SAB" },
    { v: "carisma", t: "CAR" }, { v: "aura", t: "AUR" }, { v: "pv_max", t: "Vida Máx" },
    { v: "pm_max", t: "Mana Máx" }, { v: "defesa", t: "Defesa" }, { v: "movimentacao", t: "Movimento" },
    { v: "sanidade", t: "Sanidade" }, { v: "status_info", t: "Status" },
    { v: "dano", t: "Arma: Dano" }, { v: "critico", t: "Arma: Crítico" }, { v: "alcance", t: "Arma: Alcance" },
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

const OPTIONS_TIPO_DANO = [
    { v: "Corte", t: "Corte" },
    { v: "Perfuração", t: "Perfuração" },
    { v: "Impacto", t: "Impacto" },
    { v: "Balistico", t: "Balistico" },
    { v: "Fogo", t: "Fogo" },
    { v: "Frio", t: "Frio" },
    { v: "Veneno", t: "Veneno" },
    { v: "Mental", t: "Mental" },
    { v: "Luz", t: "Luz" },
    { v: "Escuridão", t: "Escuridão" },
    { v: "Vida", t: "Vida" },
    { v: "Morte", t: "Morte" },
    { v: "Energia", t: "Energia" },
    { v: "Outro", t: "Outro" }
];