const translations = {
  pt: {
    title: "Nexus5 Converter",
    selectProject: "Selecione a pasta do projeto Next.js para converter em APK Android:",
    selectFolder: "Selecionar Pasta",
    convertToApk: "Converter para APK",
    requirements: "Requisitos e Passo a Passo",
    requirementsTitle: "Requisitos para Gerar APK",
    stepByStep: "Passo a Passo",
    close: "Fechar",
    signApk: "Assinar APK para Distribuição",
    signHelp: "Para publicar na Play Store, o APK precisa ser assinado. Se não possui um keystore,",
    clickHere: "clique aqui para instruções",
    keystoreFile: "Arquivo Keystore (.jks ou .keystore):",
    keystorePassword: "Senha do Keystore:",
    keyAlias: "Alias da Chave:",
    keyPassword: "Senha da Chave:",
    signButton: "Assinar APK",
    keystoreTitle: "Como gerar um Keystore",
    keystoreInstructions: "Execute o comando abaixo no terminal para criar um keystore:",
    converting: "Convertendo...",
    selectLanguage: "Idioma:"
  },
  en: {
    title: "Nexus5 Converter",
    selectProject: "Select your Next.js project folder to convert to Android APK:",
    selectFolder: "Select Folder",
    convertToApk: "Convert to APK",
    requirements: "Requirements & Step by Step",
    requirementsTitle: "Requirements to Generate APK",
    stepByStep: "Step by Step",
    close: "Close",
    signApk: "Sign APK for Distribution",
    signHelp: "To publish on Play Store, the APK needs to be signed. If you don't have a keystore,",
    clickHere: "click here for instructions",
    keystoreFile: "Keystore File (.jks or .keystore):",
    keystorePassword: "Keystore Password:",
    keyAlias: "Key Alias:",
    keyPassword: "Key Password:",
    signButton: "Sign APK",
    keystoreTitle: "How to generate a Keystore",
    keystoreInstructions: "Run the command below in terminal to create a keystore:",
    converting: "Converting...",
    selectLanguage: "Language:"
  }
};

let currentLang = localStorage.getItem('language') || 'pt';

function t(key) {
  return translations[currentLang][key] || key;
}

function updateTexts() {
  document.title = t('title');
  document.querySelector('h1').textContent = t('title');
  document.querySelector('.project-description').textContent = t('selectProject');
  document.getElementById('select-folder').textContent = t('selectFolder');
  document.getElementById('start-convert').textContent = t('convertToApk');
  document.getElementById('show-requirements').textContent = t('requirements');
  document.querySelector('#requirements-modal h2').textContent = t('requirementsTitle');
  document.querySelector('#requirements-modal h3').textContent = t('stepByStep');
  document.getElementById('close-requirements').textContent = t('close');
  document.querySelector('#sign-apk-section h3').textContent = t('signApk');
  document.getElementById('sign-apk-btn').textContent = t('signButton');
  document.querySelector('#keystore-help-modal h3').textContent = t('keystoreTitle');
  document.getElementById('close-keystore-help').textContent = t('close');
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  updateTexts();
}

window.translations = { t, setLanguage, updateTexts };
