/**
 * Banco de dados das Classes
 * pv_lvl: Vida ganha por nível (+ Modificador de Constituição)
 * pm_lvl: Mana ganha por nível (+ Modificador de Int/Sab se aplicável)
 */
const CLASSES_DATA = {
    "lobo_solitario": { nome: "Lobo Solitário", pv_lvl: 5, pm_lvl: 2, skills: ["sobrevivência"] },
    "atirador_elite": { nome: "Atirador de Elite", pv_lvl: 3, pm_lvl: 2, skills: ["pontaria"] },
    "militar": { nome: "Militar", pv_lvl: 7, pm_lvl: 1, skills: ["luta", "guerra"] },
    "assassino": { nome: "Assassino", pv_lvl: 3, pm_lvl: 3, skills: ["furtividade", "enganação"] },
    "lutador_nato": { nome: "Lutador Nato", pv_lvl: 5, pm_lvl: 3, skills: ["luta", "fortitude"], showLutador: true },
    "cientista": { nome: "Cientista", pv_lvl: 2, pm_lvl: 2, skills: ["investigação", "misticismo"] },
    "especialista_medico": { nome: "Especialista Médico", pv_lvl: 2, pm_lvl: 3, skills: ["cura"], pv_attr: "sabedoria" },
    "amante_oculto": { nome: "Amante do Oculto", pv_lvl: 2, pm_lvl: 6, showAmante: true, skills: ["misticismo", "religião"] },
    "deus_acima": { nome: "Deus Acima de tudo", pv_lvl: 3, pm_lvl: 4, skills: ["vontade", "diplomacia"], showDeus: true },
    "diplomata": { nome: "Diplomata", pv_lvl: 2, pm_lvl: 3, skills: ["diplomacia", "atuação"], showDiplomata: true },
    "mestre_cuca": { nome: "Mestre Cuca", pv_lvl: 2, pm_lvl: 4, skills: ["percepção"], pv_mod_half: true },
    "amigo_animais": { nome: "Amigo dos Animais", pv_lvl: 4, pm_lvl: 5, skills: ["adestramento", "sobrevivência"], showAmigo: true },
    "astro_rock": { nome: "Astro do Rock", pv_lvl: 2, pm_lvl: 2, skills: ["atuação"], pv_no_mod: true },
    "contrabandista": { nome: "Contrabandista", pv_lvl: 2, pm_lvl: 2, skills: ["enganação", "furtividade"], showContrabandista: true, pv_attr: "destreza" },
    "caca_recompensas": { nome: "Caça Recompensas", pv_lvl: 4, pm_lvl: 2, skills: ["investigação", "pontaria"] },
    "multiclasse": { nome: "Multiclasse", pv_lvl: 1, pm_lvl: 1, skills: [], pm_attr: "sabedoria" },
    // Classes Especiais
    "avatar": { nome: "Avatar", pv_lvl: 4, pm_lvl: 4, isSpecial: true, showAvatar: true, skills: ["vontade"] },
    "ceifeiro_almas": { nome: "Ceifeiro de almas", pv_lvl: 0.5, pm_lvl: 8, isSpecial: true, skills: ["intimidação"], showCeifeiro: true, pv_mod_half: true },
    "demonio": { nome: "Demônio", pv_lvl: 5, pm_lvl: 5, isSpecial: true, skills: ["corrompimento", "intimidação"], showDemonio: true },
    "anjo": { nome: "Anjo", pv_lvl: 5, pm_lvl: 5, isSpecial: true, skills: ["diplomacia", "religião"], showAnjo: true }
};