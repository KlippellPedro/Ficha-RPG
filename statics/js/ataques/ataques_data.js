/**
 * Banco de dados e constantes de Ataques
 */
const TIPOS_ATAQUE = ["Corpo-a-Corpo", "À Distância", "Arremesso", "Magia", "Outro"];

// Mapeamento de tipos de arma do inventário para tipos de ataque
const INVENTORY_WEAPON_TYPE_TO_ATTACK_TYPE = {
    "simples_uma_mao": "Corpo-a-Corpo",
    "simples_duas_maos": "Corpo-a-Corpo",
    "marcial_uma_mao": "Corpo-a-Corpo",
    "marcial_duas_maos": "Corpo-a-Corpo",
    "arco_curto": "À Distância",
    "arco_longo": "À Distância",
    "besta_leve": "À Distância",
    "besta_pesada": "À Distância",
    "arremesso": "Arremesso",
};