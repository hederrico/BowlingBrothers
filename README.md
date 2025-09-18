# Bowling Brothers

Uma Single Page Application (SPA) moderna e minimalista para registrar e exibir estatísticas de partidas de boliche entre três irmãos.

## 🎳 Características

- **Design Dark Theme**: Interface moderna com tema escuro e estilo limpo
- **Tipografia Personalizada**: 
  - Lexend para textos longos e conteúdo geral
  - JetBrains Mono para dados, métricas e números
- **Cálculo Automático**: Pontuação calculada automaticamente seguindo regras oficiais do boliche
- **Estatísticas Detalhadas**: Análise completa por jogador, partida e período
- **Visualizações Gráficas**: Charts interativos usando Chart.js
- **Persistência Local**: Dados salvos no localStorage do navegador

## 🚀 Funcionalidades

### Registro de Partidas
- Interface intuitiva para inserir pinos derrubados
- Validação automática de jogadas
- Cálculo em tempo real de strikes, spares e pontuação total
- Suporte para até 3 jogadores simultâneos

### Dashboard
- Visão geral das estatísticas principais
- Melhor partida individual e coletiva
- Total de partidas e strikes
- Gráfico de evolução dos scores

### Estatísticas
- **Global**: Distribuição de scores e strikes vs spares
- **Comparação**: Performance entre os irmãos
- **Linha do Tempo**: Evolução ao longo do tempo

### Perfis dos Jogadores
- Estatísticas individuais detalhadas
- Melhor score, média, strikes e spares
- Histórico de performance

## 🛠️ Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Design responsivo com custom properties
- **JavaScript ES6+**: Lógica da aplicação
- **jQuery**: Manipulação do DOM
- **Chart.js**: Visualizações de dados
- **Google Fonts**: Lexend e JetBrains Mono

## 📁 Estrutura do Projeto

```
├── index.html              # Página principal
├── styles/
│   ├── main.css            # Estilos base e tema
│   ├── components.css      # Componentes da interface
│   └── charts.css          # Estilos dos gráficos
├── js/
│   ├── app.js              # Aplicação principal
│   ├── bowling-calculator.js  # Lógica de pontuação
│   ├── data-manager.js     # Gerenciamento de dados
│   ├── chart-manager.js    # Gerenciamento de gráficos
│   └── game-manager.js     # Interface de jogo
└── libs/
    ├── jquery.min.js       # jQuery library
    └── chart.min.js        # Chart.js library

```

## 🎮 Como Usar

1. **Abra o arquivo `index.html`** em qualquer navegador moderno
2. **Navegue pelas seções** usando o menu superior
3. **Registre uma partida**:
   - Vá para "Nova Partida"
   - Selecione os jogadores ativos
   - Insira os pinos derrubados em cada lance
   - Clique em "Salvar Partida"
4. **Visualize estatísticas** nas seções Dashboard, Estatísticas e Jogadores

## 🔧 Funcionalidades de Desenvolvimento

### Debugging
- `addSampleData()`: Adiciona dados de exemplo
- `exportData()`: Exporta todos os dados
- `clearData()`: Limpa todos os dados

### Dados de Exemplo
Execute no console do navegador:
```javascript
addSampleData();
```

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (até 767px)

## 🎯 Regras do Boliche

O sistema implementa as regras oficiais do boliche:
- **Strike**: Todos os 10 pinos derrubados no primeiro lance
- **Spare**: Todos os 10 pinos derrubados em dois lances
- **10º Frame**: Regras especiais com até 3 lances
- **Pontuação Máxima**: 300 pontos (jogo perfeito)

## 🔄 Persistência de Dados

- Todos os dados são salvos automaticamente no localStorage
- Os dados persistem entre sessões do navegador
- Funcionalidade de exportar/importar dados (planejada)

## 📈 Métricas Calculadas

- Pontuação total por partida
- Strikes e spares por jogador
- Médias e tendências
- Melhores performances
- Estatísticas comparativas

---

Desenvolvido para a família Bowling Brothers 🎳
