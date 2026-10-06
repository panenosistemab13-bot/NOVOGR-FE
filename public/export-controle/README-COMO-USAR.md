# ☕ Sistema Operacional Logístico - Café Três Corações
## Guia de Implantação e Exportação do Painel Principal (Controle Tático)

Se você exportou o arquivo anterior e percebeu que a interface não ficou idêntica ao dashboard cinematográfico principal (com o mapa do Brasil, os gráficos de ondas neon ciano e vermelho, a central de prompts e os modais interativos), é porque o arquivo anterior correspondia à aba secundária de logs de frota ("Controle").

Para reproduzir a **Página Principal do Painel de Controle Tático** com **100% de fidelidade visual e funcional**, disponibilizamos um componente **Totalmente Unificado, Autônomo e de Alta Performance** chamado `MainControleDashboard.tsx`.

---

### 📥 Links para Download dos Arquivos:
* ⚛️ **Componente Unificado Completo:** [MainControleDashboard.tsx](https://ais-dev-v24w7xmssupni7ozy3xaj3-159927963405.us-east1.run.app/export-controle/MainControleDashboard.tsx)
* 🎨 **Estilo Global de Animações:** Já incluído diretamente dentro do arquivo por meio de uma tag `<style>` nativa do React (não precisa configurar arquivos CSS externos adicionais!).

---

### 📦 1. Dependências Necessárias
No seu novo projeto React + Tailwind, instale as seguintes dependências executando o comando no terminal:
```bash
npm install lucide-react clsx tailwind-merge
```

E certifique-se de incluir a biblioteca de ícones **FontAwesome** e as fontes do Google no `<head>` do seu arquivo principal (`index.html` ou layout do Next.js):
```html
<!-- FontAwesome Icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- Google Fonts (Plus Jakarta Sans) -->
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
```

---

### 📁 2. Configurando o Componente no seu Projeto
Crie o arquivo no caminho **`src/components/MainControleDashboard.tsx`** e cole o conteúdo completo do arquivo que você baixou do link acima.

Para utilizá-lo no seu arquivo de entrada (`src/App.tsx`), basta importá-lo e renderizá-lo:
```tsx
import React from 'react';
import MainControleDashboard from './components/MainControleDashboard';

function App() {
  return (
    <MainControleDashboard />
  );
}

export default App;
```

---

### ✨ Recursos Exclusivos Integrados neste Arquivo:
1. **Mapa Interativo do Brasil:** 8 nós de cidades clicáveis com popup de telemetria meteorológica e capacidade de docas.
2. **Gráfico Neon Dual Wave 24h:** Desenho Bezier de alta definição de fluxo logístico em SVG.
3. **Distribuição Volumétrica de Ativos:** Gráfico Donut em 3D com detalhamento completo de frota ao clicar nas legendas.
4. **Despacho de Nova Rota:** Modal de formulário funcional com Placa Mercosul e validação de regras de PGR.
5. **Central de Fusão de Prompts (Canais 1, 2 e 3):** Ferramenta tática completa com geração de prompts de imagem, textos unificados e listas limpas de duplicatas em um clique.
