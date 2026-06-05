# Supremacia do Protesto - Digital Character Sheet

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-green)
![Tech](https://img.shields.io/badge/Tech-Vanilla%20JS-yellow)
![Layout](https://img.shields.io/badge/Layout-Responsive-blue)

Uma aplicação web robusta para gerenciamento de fichas de RPG, focada em automação de cálculos e uma experiência de usuário (UX) imersiva. O projeto foi construído para ser leve, rápido e totalmente funcional offline.

## Funcionalidades Principais

- **Motor de Cálculo Automático (Core Engine):** Sincronização em tempo real de atributos, modificadores, pontos de vida (PV), mana (PM) e defesa, considerando bônus de raça, classe e itens equipados.
- **Sistema de Inventário Inteligente:** Gerenciamento de peso, carga máxima e aplicação automática de status de armas e armaduras ao serem marcadas como "equipadas".
- **Arquitetura Modular de Classes:** Carregamento dinâmico de módulos de classe (Cientista, Ceifeiro de Almas, etc.) via `class_loader.js`, permitindo fácil expansão do sistema.
- **Persistência de Dados e Backup:** Utiliza `LocalStorage` para salvamento automático, com sistema interno de backup silencioso a cada 10 minutos para evitar perda de progresso.
- **UI Dinâmica e Tematização:** Sistema de temas que altera variáveis CSS (`--primary-color`) em tempo real, permitindo personalização total da interface pelo usuário.
- **Responsividade Mobile-First:** Interface adaptada para smartphones com menus hambúrguer e cards otimizados para telas pequenas.

## Tecnologias Utilizadas

- **HTML5:** Estrutura semântica e acessível.
- **CSS3 (Moderno):** Uso intensivo de **CSS Grid**, **Flexbox** e **CSS Variables** para layout e tematização.
- **JavaScript (ES6+):** Lógica de estado, manipulação de DOM, tratamento de eventos e persistência.

## Destaques Técnicos

### Sincronização de Estado Único

O sistema utiliza uma função central `atualizarTudo()` que atua como um "Single Source of Truth". Qualquer alteração em um input de perícia ou item de inventário dispara um ciclo de atualização que recalcula toda a ficha, garantindo que os dados nunca fiquem dessincronizados.

### Gestão Dinâmica de Modais

Em vez de poluir o HTML, o projeto utiliza um sistema de injeção de modais globais (`global_modals.js`), permitindo que diálogos de confirmação, histórico de conjuração e detalhes de habilidades sejam reutilizados em todas as páginas.

### Algoritmo de Carga e Inventário

Implementação de lógica de carga baseada em atributos (Força), com alertas visuais e redução automática de movimentação caso o peso exceda o limite do personagem.

## Estrutura de Pastas

```text
├── statics/
│   ├── css/           # Estilos modulares (ficha, inventário, responsividade)
│   └── js/
│       ├── ficha/     # Lógica específica de classes e dados
│       ├── global.js  # Core Engine e persistência
│       └── menu.js    # Lógica de navegação
├── templates/         # Páginas da aplicação
└── index.html         # Ponto de entrada
```

## Como Executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/KlippellPedro/Ficha-Supremacia-do-Protesto.git
   ```
2. Instale as dependências de desenvolvimento:
   ```bash
   npm install
   ```
3. Inicie o servidor local:
   ```bash
   npm start
   ```

---

Desenvolvido por **Pedro Nadalon Klippel** como parte de um estudo avançado em Vanilla JavaScript e Sistemas de RPG.

```

```
