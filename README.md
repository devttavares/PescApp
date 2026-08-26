# 🎣 PescApp - O Guia Completo do Pescador

> **Aplicativo completo para pescadores esportivos, amadores e profissionais.**
> Acompanhe a previsão do tempo, tábua de marés, guia regional da piracema, catálogo de peixes e iscas, pontos de pesca no mapa GPS e diário de capturas com fotos e câmera em tempo real.

---

## 📖 O que é este projeto? (Para quem não é da área de TI)

Se você nunca mexeu com programação ou com o GitHub, não se preocupe! 

O **PescApp** é como um aplicativo que você instala no celular ou acessa pelo navegador do computador. Ele foi criado para ser o melhor companheiro do pescador na beira do rio, na represa ou em alto mar.

Com ele você consegue:
- ☀️ **Ver o Clima e Vento na Hora:** Saber a temperatura, velocidade do vento, pressão atmosférica e condições da água.
- 🌊 **Tábua de Marés:** Consultar a maré alta, maré baixa e fases da lua para planejar a melhor pescaria.
- 🛑 **Guia da Piracema por Região:** Saber quando a pesca está liberada ou em período de defeso no seu estado/bacia hidrográfica.
- 🐟 **Catálogo de Espécies e Iscas:** Ver detalhes de cada peixe, tamanho mínimo permitido, melhores iscas e adicionar novos peixes com fotos.
- 📍 **Mapa Interativo:** Marcar seus pontos de pesca favoritos no GPS para nunca mais esquecer o local daquele cardume.
- 📸 **Diário de Capturas (Troféus):** Registrar seus peixes, tirar fotos direto pela câmera do celular, anotar peso, comprimento e se o peixe foi solto (*Pesque e Solte*).
- ⚙️ **Painel Administrativo:** Cadastrar, editar ou excluir espécies, iscas, pontos no mapa e banners de patrocinadores.

---

## 📱 Como usar ou instalar no Celular (Passo a Passo Fácil)

Você **não precisa** programar nada para usar no celular:

### No Android (Google Chrome)
1. Abra o link do aplicativo no **Google Chrome** do seu celular.
2. Toque nos **3 pontinhos (⋮)** no topo direito da tela.
3. Escolha a opção **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
4. Pronto! O ícone do PescApp vai aparecer junto com o WhatsApp, Instagram e seus outros apps.

### No iPhone / iPad (Safari)
1. Abra o link do aplicativo no navegador **Safari**.
2. Toque no botão de **Compartilhar** (ícone quadrado com uma seta apontando para cima).
3. Role a lista e toque em **"Adicionar à Tela de Início"**.
4. Toque em **"Adicionar"**. O app ficará na sua tela inicial como um aplicativo nativo.

---

## 📦 Como gerar um arquivo `.APK` instalável (Android)

Se você precisa de um arquivo de instalação `.apk`:
1. Acesse o site gratuito [PWABuilder](https://www.pwabuilder.com).
2. Cole o link do seu aplicativo.
3. Clique em **Start** e selecione a opção **Android**.
4. Clique em **Generate / Package APK** e faça o download do arquivo direto no seu celular.

---

## 💻 Como Rodar este Projeto no seu Computador (Para Desenvolvedores)

Se você tem familiaridade com programação e quer rodar ou modificar o código no seu computador:

### 1. Pré-requisitos
- Ter o **Node.js** (versão 18 ou superior) instalado no seu computador.
- Ter o **Git** instalado.

### 2. Passo a Passo

```bash
# 1. Clone o repositório para o seu computador
git clone https://github.com/seu-usuario/pescapp.git

# 2. Entre na pasta do projeto
cd pescapp

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Abra o seu navegador e acesse: **`http://localhost:3000`**

### 3. Comandos Úteis
* `npm run dev` - Inicia o app no modo de desenvolvimento.
* `npm run build` - Gera a versão otimizada para publicação/produção na pasta `dist`.
* `npm run lint` - Verifica se há algum erro de digitação ou tipagem no código.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com ferramentas modernas, rápidas e seguras:
- **React 19 + TypeScript:** Criação de telas dinâmicas e interativas.
- **Tailwind CSS:** Design moderno com suporte a modo Claro e modo Escuro.
- **Leaflet:** Mapas interativos e geolocalização.
- **Lucide Icons:** Ícones limpos e intuitivos.
- **Canvas Confetti & Motion:** Animações comemorativas ao registrar troféus.

---

## ❓ Dúvidas Frequentes

#### O app funciona sem internet?
Sim! As capturas registradas, espécies e anotações ficam salvas no armazenamento interno do seu aparelho (*Local Storage*).

#### Preciso pagar alguma coisa?
Não, o código é livre para uso pessoal e esportivo.

---

🎣 *Boas pescarias e lembre-se: pratique o Pesque e Solte para preservar a nossa fauna aquática!*
