/**
 * Banco de dados de Materiais e Seus Buffs
 * Organizado por Categorias: Geológicos, Naturais e Animais.
 */

window.MATERIALS_DATABASE = {
    geologicos: {
        comum: {
            "cobre": {
                nome: "Cobre",
                desc: "Cobre é muito comum e sua qualidade não é das melhores, usado principalmente para construir equipamentos para iniciantes ou itens tecnológicos. Pessoas que usarem itens de Cobre perdem 1 de status.",
                attributes: [{ attr: "status_info", mod: -1 }]
            },
            "ferro": {
                nome: "Ferro",
                desc: "Apenas Ferro, que pode ser usado para criações no geral, não dá nenhum bônus.",
                attributes: []
            },
            "ouro": {
                nome: "Ouro",
                desc: "Ouro é um material valioso, porém macio para combate. Em Armas: -6 de dano. Em Itens: +1 de Status. No Geral (Armaduras/Etc): +15 de CD e +1 Mod. de Carisma.",
                attributes: {
                    armas: [
                        { attr: "dano", mod: -6 },
                    ],
                    itens: [
                        { attr: "status_info", mod: 1 },
                    ],
                    geral: [
                        { attr: "cd_max", mod: 15 },
                        { attr: "carisma", mod: 1 }
                    ]
                }
            },
            "platina": {
                nome: "Platina",
                desc: "Platina é um metal nobre e extremamente denso. Em Armas: -2 no acerto. No Geral (Armaduras/Itens): +15 de CD e permite que o item seja encantado com uma magia.",
                attributes: {
                    armas: [
                        { attr: "teste", mod: -2 }
                    ],
                    geral: [
                        { attr: "cd_max", mod: 15 }
                    ]
                }
            }
        },
        marcial: {
            "diamante": {
                nome: "Diamante",
                desc: "Itens de diamante são resistentes e afiados. Em Armas: +3 no acerto e +10 de dano. Em Itens: caso usado para causar dano, o dano é aumentado em 2d6 (não crita). No Geral: +50 de CD.",
                attributes: {
                    armas: [
                        { attr: "teste", mod: 3 },
                        { attr: "dano", mod: 10 }
                    ],
                    itens: [
                        { attr: "dano", mod: "2d6" }
                    ],
                    geral: [
                        { attr: "cd_max", mod: 50 }
                    ]
                }
            },
            "esmeralda": {
                nome: "Esmeralda",
                desc: "Uma gema vibrante que exala influência. Em Armas: +3 no acerto e +14 de dano. Em Itens: ocupa -1 espaço (peso) e concede Vantagem + 1d4 em testes de convencimento ou trocas. No Geral: +60 de CD.",
                attributes: {
                    armas: [
                        { attr: "teste", mod: 3 },
                        { attr: "dano", mod: 14 }
                    ],
                    itens: [
                        { attr: "peso", mod: -1 },
                        { attr: "diplomacia", mod: "1d4", isAdv: true }
                    ],
                    geral: [
                        { attr: "cd_max", mod: 60 }
                    ]
                }
            },
            "rubi": {
                nome: "Rubi",
                desc: "O Rubi emana calor e poder bruto. Em Armas: +5 no acerto e +24 de dano. Em Itens: +8 no efeito do item (exceto paralisação). No Geral: +90 de CD e +2 de Defesa (não cumulativo).",
                attributes: {
                    armas: [
                        { attr: "teste", mod: 5 },
                        { attr: "dano", mod: 24 }
                    ],
                    itens: [
                        { attr: "nenhum", mod: 8 }
                    ],
                    geral: [
                        { attr: "cd_max", mod: 90 },
                        { attr: "defesa", mod: 2 }
                    ]
                }
            },
            "taaffeite": {
                nome: "Taaffeite",
                desc: "Uma gema de raridade lendária que distorce a percepção e o destino. Em Armas: +25 no acerto com Vantagem, +4 em Intimidação e Furtividade. Em Itens: +25 e Vantagem na perícia principal que o item afeta. No Geral: +40 de CD, +2 no Mod. de Carisma e +10 de Vida Máxima.",
                attributes: {
                    armas: [
                        { attr: "teste", mod: 25, isAdv: true },
                        { attr: "intimidação", mod: 4 },
                        { attr: "furtividade", mod: 4 }
                    ],
                    itens: [
                        { attr: "nenhum", mod: 25, isAdv: true }
                    ],
                    geral: [
                        { attr: "cd_max", mod: 40 },
                        { attr: "carisma", mod: 2 },
                        { attr: "pv_max", mod: 10 }
                    ]
                }
            },
            "perola_celestial": {
                nome: "Pérola Celestial",
                desc: "Um material místico com conexão direta com o céu. ",
                attributes: {
                    armas: [
                        { attr: "teste", mod: 25, isAdv: true },
                        { attr: "alcance", mod: 1 }
                    ],
                    itens: [
                        { attr: "nenhum", mod: 25, isAdv: true }
                    ],
                    geral: [
                        { attr: "todas", mod: 6 },
                        { attr: "aura", mod: 4 },
                        { attr: "pm_max", mod: 10 }
                    ]
                }
            },
            "plutonio_239": {
                nome: "Plutônio-239",
                desc: "É um metal pesado, cinza-prateado, radioativo, conhecido por sua capacidade de fissão nuclear, ele é extremamente raro de se encontrar naturalmente, mas tendo a chance de ser encontrado em traços minúsculos dentro de minérios de urânio. Não pode ser adicionado em nenhum tipo de item.",
                attributes: {
                    armas: [],
                    itens: [],
                    geral: []
                }
            }
        },
    },
    naturais: {
        comum: {
            "madeira": {
                nome: "Madeira",
                desc: "Madeira comum que pode ser usado para criações no geral, não dá nenhum bônus.",
                attributes: {
                    armas: [],
                    itens: [],
                    geral: []
                }
            },
            "madeira_boa": {
                nome: "Madeira Boa",
                desc: "Uma madeira tratada de boa qualidade. Em Armas: +1 no acerto. Em Itens: +1 na perícia principal. No Geral: +5 de CD.",
                attributes: {
                    armas: [
                        { attr: "teste", mod: 1 }
                    ],
                    itens: [
                        { attr: "nenhum", mod: 1 }
                    ],
                    geral: [
                        { attr: "cd_max", mod: 5 }
                    ]
                }
            },
            "madeira_excelente": {
                nome: "Madeira Excelente",
                desc: "Madeira de alta densidade e resistência. Em Armas: +3 no acerto com Vantagem. Em Itens: +3 e Vantagem na perícia principal. No Geral: +10 de CD.",
                attributes: {
                    armas: [
                        { attr: "teste", mod: 3, isAdv: true }
                    ],
                    itens: [
                        { attr: "nenhum", mod: 3, isAdv: true }
                    ],
                    geral: [
                        { attr: "cd_max", mod: 10 }
                    ]
                }
            },
            "madeira_cerejeira": {
                nome: "Madeira de Cerejeira",
                desc: "Uma madeira rosada e leve, equilibrada e silenciosa. Em Armas: +5 no acerto (Vantagem), +2 em Intimidação e +3 em Furtividade. Em Itens: +5 e Vantagem na perícia principal que afeta. No Geral: +15 de CD.",
                attributes: {
                    armas: [
                        { attr: "teste", mod: 5, isAdv: true },
                        { attr: "intimidação", mod: 2 },
                        { attr: "furtividade", mod: 3 }
                    ],
                    itens: [
                        { attr: "nenhum", mod: 5, isAdv: true }
                    ],
                    geral: [
                        { attr: "cd_max", mod: 15 }
                    ]
                }
            },
            "trepadeira_jade": {
                nome: "Trepadeira Jade",
                desc: "Uma planta mística que potencializa efeitos regenerativos. Geral: Caso adicionado à composição de itens/Kits ou artefatos, a cura de vida ou mana aumenta em 1 dado. Não conta como um material na construção. Custo: 1K por tamanho do item.",
                attributes: {
                    armas: [],
                    itens: [],
                    geral: []
                }
            },
            "pico_de_paloma": {
                nome: "Pico de Paloma",
                desc: "Uma flor de pétalas ardentes. Em Armas ou Itens que causem dano: +1d10 de dano de fogo comum. Caso consumida por um ser ou Avatar de fogo, concede +1% de maestria (funciona apenas uma vez). Custo: 2K por tamanho do item.",
                attributes: {
                    armas: [
                        { attr: "dano", mod: "1d10" }
                    ],
                    itens: [
                        { attr: "dano", mod: "1d10" }
                    ],
                    geral: []
                }
            },
            "dragon_scale": {
                nome: "Dragon Scale",
                desc: "Antigos dizem que ao consumir essa planta sua pele se tornará mais resistente, recebendo 5 de RD a danos comuns (aplica-se apenas uma vez). Esse bônus pode ser aplicado novamente se adicionado em um escudo ou armadura.",
                attributes: {
                    armas: [],
                    itens: [],
                    geral: [
                        { attr: "defesa", mod: 5 }
                    ]
                }
            },
            "raiz_mandragora": {
                nome: "Raiz de Mandrágora",
                desc: "Uma raiz mística. Itens (Apenas Mágicos): Adicionar esta raiz à composição concede a magia 'Grito de Mandrágora'. Geral: Aumenta a CD do item em 5.",
                attributes: {
                    armas: [],
                    itens: [],
                    geral: [
                        { attr: "cd_max", mod: 5 }
                    ]
                }
            }
        },
        marcial: {
            "argorwood": {
                nome: "Argorwood",
                desc: "Uma madeira rara com fragrância mística. Em Armas: +8 no acerto (Vantagem), +4 em Intimidação e Furtividade. Em Itens: +8 e Vantagem na perícia principal. No Geral: +20 de CD e +1 no Mod. de Carisma.",
                attributes: {
                    armas: [
                        { attr: "teste", mod: 8, isAdv: true },
                        { attr: "intimidação", mod: 4 },
                        { attr: "furtividade", mod: 4 }
                    ],
                    itens: [
                        { attr: "nenhum", mod: 8, isAdv: true }
                    ],
                    geral: [
                        { attr: "cd_max", mod: 20 },
                        { attr: "carisma", mod: 1 }
                    ]
                }
            },
            "palo_santo": {
                nome: "Palo Santo",
                desc: "Madeira sagrada usada em rituais. Em Armas: +8 no acerto (Vantagem), +4 em Intimidação e Furtividade. Em Itens: +8 e Vantagem na perícia principal. No Geral: +20 de CD e +1 no Mod. de Carisma.",
                attributes: {
                    armas: [
                        { attr: "teste", mod: 8, isAdv: true },
                        { attr: "intimidação", mod: 4 },
                        { attr: "furtividade", mod: 4 }
                    ],
                    itens: [
                        { attr: "nenhum", mod: 8, isAdv: true }
                    ],
                    geral: [
                        { attr: "cd_max", mod: 20 },
                        { attr: "carisma", mod: 1 }
                    ]
                }
            },
            "pau_brasil": {
                nome: "Pau Brasil",
                desc: "Madeira extremamente densa e de cor brasa. Em Armas: +15 no acerto (Vantagem), +4 em Intimidação e Furtividade. Em Itens: +15 e Vantagem na perícia principal. No Geral: +30 de CD e +2 no Mod. de Carisma.",
                attributes: {
                    armas: [
                        { attr: "teste", mod: 15, isAdv: true },
                        { attr: "intimidação", mod: 4 },
                        { attr: "furtividade", mod: 4 }
                    ],
                    itens: [
                        { attr: "nenhum", mod: 15, isAdv: true }
                    ],
                    geral: [
                        { attr: "cd_max", mod: 30 },
                        { attr: "carisma", mod: 2 }
                    ]
                }
            },
            "arvore_da_vida": {
                nome: "Árvore da Vida",
                desc: "Uma madeira ancestral que pulsa com vitalidade. Em Armas: +25 no acerto (Vantagem), +4 em Intimidação e Furtividade. Em Itens: +25 e Vantagem na perícia principal. No Geral: +40 de CD, +2 no Mod. de Carisma e +10 de Vida Máxima.",
                attributes: {
                    armas: [
                        { attr: "teste", mod: 25, isAdv: true },
                        { attr: "intimidação", mod: 4 },
                        { attr: "furtividade", mod: 4 }
                    ],
                    itens: [
                        { attr: "nenhum", mod: 25, isAdv: true }
                    ],
                    geral: [
                        { attr: "cd_max", mod: 40 },
                        { attr: "carisma", mod: 2 },
                        { attr: "pv_max", mod: 10 }
                    ]
                }
            },
            "chifres_da_natureza": {
                nome: "Chifres da Natureza",
                desc: "Chifres imponentes que canalizam a força da mãe natureza. Geral: +25 e Vantagem no acerto ou na perícia principal que afeta, +1 de Alcance (Limite Multiversal), +6 em todas as perícias. Concede o poder 'Olhos da Natureza', 'Evolução Natural', Imunidade a danos comuns e 4 Vantagens em testes na natureza.",
                attributes: {
                    armas: [
                        { attr: "teste", mod: 25, isAdv: true },
                        { attr: "alcance", mod: 1 }
                    ],
                    itens: [
                        { attr: "nenhum", mod: 25, isAdv: true }
                    ],
                    geral: [
                        { attr: "todas", mod: 6 }
                    ]
                }
            }
        }
    },
    animais: {
        comum: {
            "alma_comum": {
                nome: "Alma Comum",
                desc: "",
                attributes: {
                    armas: [],
                    itens: [],
                    geral: []
                }
            },
            "alma_de_deus": {
                nome: "Alma de Deus",
                desc: "",
                attributes: {
                    armas: [],
                    itens: [],
                    geral: []
                }
            },
            "residuo_fontes": {
                nome: "Resíduo de Fontes",
                desc: "",
                attributes: {
                    armas: [],
                    itens: [],
                    geral: []
                }
            },
            "residuo_golens": {
                nome: "Resíduo de Golens",
                desc: "",
                attributes: {
                    armas: [],
                    itens: [],
                    geral: []
                }
            },
            "sangue": {
                nome: "Sangue",
                desc: "",
                attributes: {
                    armas: [],
                    itens: [],
                    geral: []
                }
            },
            "sangue_fundido": {
                nome: "Sangue Fundido",
                desc: "",
                attributes: {
                    armas: [],
                    itens: [],
                    geral: []
                }
            },
            "goma_branca": {
                nome: "Goma Branca",
                desc: "",
                attributes: {
                    armas: [],
                    itens: [],
                    geral: []
                }
            },
            "goma_branca_melhorada": {
                nome: "Goma Branca Melhorada",
                desc: "",
                attributes: {
                    armas: [],
                    itens: [],
                    geral: []
                }
            }
        },
        marcial: {
            "alma_crianca_pura": {
                nome: "Alma de Criança Pura",
                desc: "Uma alma de pureza inabalável. No Geral: +10 de Aura e Vantagem em todas as perícias.",
                attributes: {
                    armas: [],
                    itens: [],
                    geral: [
                        { attr: "aura", mod: 10 },
                        { attr: "todas", mod: 0, isAdv: true }
                    ]
                }
            },
            "alma_escolhido": {
                nome: "Alma de Escolhido",
                desc: "",
                attributes: {
                    armas: [],
                    itens: [],
                    geral: []
                }
            },
            "alma_top_10": {
                nome: "Alma do Top 10",
                desc: "",
                attributes: {
                    armas: [],
                    itens: [],
                    geral: []
                }
            }
        }
    },
};

/**
 * Helper para buscar um material em qualquer categoria
 * @param {string} nomeBusca 
 * @returns {Object|null}
 */
function buscarMaterial(nomeBusca) {
    if (!nomeBusca || typeof nomeBusca !== 'string') return null;

    const termo = nomeBusca.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    for (const cat in window.MATERIALS_DATABASE) {
        for (const sub in window.MATERIALS_DATABASE[cat]) {
            for (const key in window.MATERIALS_DATABASE[cat][sub]) {
                const mat = window.MATERIALS_DATABASE[cat][sub][key];
                if (!mat || typeof mat.nome !== 'string') {
                    continue; // Pula se o objeto material ou sua propriedade 'nome' for inválida
                }
                const nomeMatNormalizado = mat.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                if (nomeMatNormalizado === termo) return mat;
            }
        }
    }
    return null;
}

/**
 * Helper para buscar informações de categoria e subcategoria de um material.
 * @param {string} nomeBusca 
 * @returns {{category: string, subcategory: string}|null}
 */
function getMaterialCategoryInfo(nomeBusca) {
    if (!nomeBusca || typeof nomeBusca !== 'string') return null;
    const termo = nomeBusca.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    for (const catKey in window.MATERIALS_DATABASE) {
        for (const subKey in window.MATERIALS_DATABASE[catKey]) {
            for (const matKey in window.MATERIALS_DATABASE[catKey][subKey]) {
                const mat = window.MATERIALS_DATABASE[catKey][subKey][matKey];
                if (mat && typeof mat.nome === 'string') {
                    const nomeMatNormalizado = mat.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    if (nomeMatNormalizado === termo) {
                        return { category: catKey, subcategory: subKey };
                    }
                }
            }
        }
    }
    return null;
}

/**
 * Retorna uma lista de materiais filtrada por categoria e subcategoria.
 * @param {string} categoryKey - 'geologicos', 'naturais', 'animais'
 * @param {string} subcategoryKey - 'comum', 'marcial'
 * @returns {Array<Object>} Lista de objetos de material.
 */
function getMaterialsByCategoryAndSubcategory(categoryKey, subcategoryKey) {
    if (!categoryKey || !subcategoryKey) return [];
    const category = window.MATERIALS_DATABASE[categoryKey];
    if (!category) return [];
    const subcategory = category[subcategoryKey];
    if (!subcategory) return [];
    return Object.values(subcategory).filter(m => m && typeof m.nome === 'string');
}

/**
 * Retorna uma lista plana de todos os nomes de materiais para selects
 */
function getListaTodosMateriais() {
    let lista = [];
    for (const cat in window.MATERIALS_DATABASE) {
        for (const sub in window.MATERIALS_DATABASE[cat]) {
            Object.values(window.MATERIALS_DATABASE[cat][sub]).forEach(m => {
                if (m && typeof m.nome === 'string') lista.push(m.nome);
            });
        }
    }
    return lista.sort();
}