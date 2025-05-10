# Frequent Code

Este é um projeto React Native desenvolvido com Expo.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)
- [Git](https://git-scm.com/)

## Instalação

1. Clone o repositório:
```bash
git clone ...
cd frequent-code
```

2. Instale as dependências:
```bash
npm install
```

## Executando o Projeto

Para iniciar o projeto, você pode usar um dos seguintes comandos:

- Para iniciar o servidor de desenvolvimento:
```bash
npm start
```

- Para executar no Android:
```bash
npm run android
```

- Para executar no iOS:
```bash
npm run ios
```

- Para executar na web:
```bash
npm run web
```

Após executar `npm start`, você verá um QR code no terminal. Você pode:
- Escanear o QR code com o aplicativo Expo Go (Android) ou a câmera (iOS)
- Pressionar 'a' para abrir no emulador Android
- Pressionar 'i' para abrir no simulador iOS
- Pressionar 'w' para abrir na versão web

## Para gerar um APK:

- Instalar o EAS CLI
npm install ```-g eas-cli```

- Fazer login
```eas login```

- Configurar o build
```eas build:configure```

- Gerar o APK
```eas build -p android --profile preview```

## Estrutura do Projeto

- `/src` - Código fonte do projeto
- `/assets` - Recursos estáticos (imagens, fontes, etc.)
- `App.tsx` - Componente principal da aplicação
- `app.json` - Configurações do Expo
- `package.json` - Dependências e scripts do projeto

## Tecnologias Principais

- React Native
- Expo
- TypeScript
- Firebase
- React Navigation 