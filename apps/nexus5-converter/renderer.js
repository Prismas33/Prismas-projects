document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, setting up event listeners...');
  
  // Configurar idioma
  const langSelect = document.getElementById('language-select');
  langSelect.value = localStorage.getItem('language') || 'pt';
  langSelect.addEventListener('change', (e) => {
    window.translations.setLanguage(e.target.value);
  });
  
  // Atualizar textos na inicialização
  window.translations.updateTexts();
  
  // Selecionar pasta do Next.js
  document.getElementById('select-folder').addEventListener('click', async () => {
    console.log('Select folder clicked');
    try {
      const folderPath = await window.electronAPI.selectNextjsFolder();
      console.log('Selected folder:', folderPath);
      const folderPathDiv = document.getElementById('folder-path');
      folderPathDiv.textContent = folderPath || '';
      folderPathDiv.style.display = folderPath ? 'block' : 'none';
      document.getElementById('start-convert').disabled = !folderPath;
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  });

  // Converter para APK
  document.getElementById('start-convert').addEventListener('click', async () => {
    const folderPath = document.getElementById('folder-path').textContent;
    console.log('Convert clicked for folder:', folderPath);
    const statusDiv = document.getElementById('status');
    const progressBar = document.getElementById('progress-bar');
    const progressFill = document.getElementById('progress-bar-fill');
    statusDiv.textContent = window.translations.t('converting');
    statusDiv.style.display = 'block';
    progressBar.style.display = 'block';
    progressFill.style.width = '10%'; // Inicia com 10%
    try {
      await window.electronAPI.convertNextjsToApk(folderPath);
    } catch (error) {
      console.error('Error converting:', error);
      statusDiv.textContent = 'Erro na conversão: ' + error.message;
      progressBar.style.display = 'none';
    }
  });

  // Status da conversão
  if (window.electronAPI && window.electronAPI.onConversionStatus) {
    window.electronAPI.onConversionStatus((_, status) => {
      console.log('Conversion status:', status);
      const statusDiv = document.getElementById('status');
      const progressBar = document.getElementById('progress-bar');
      const progressFill = document.getElementById('progress-bar-fill');
      statusDiv.textContent = status;
      statusDiv.style.display = 'block';
      progressBar.style.display = 'block';
      // Progresso "simulado" baseado no texto do status
      if (status.includes('Executando build do Next.js')) progressFill.style.width = '20%';
      else if (status.includes('Exportação estática obrigatória') || status.includes('exportação estática')) progressFill.style.width = '30%';
      else if (status.includes('Criando projeto Capacitor')) progressFill.style.width = '40%';
      else if (status.includes('Instalando dependências do Capacitor')) progressFill.style.width = '50%';
      else if (status.includes('Copiando build do Next.js')) progressFill.style.width = '60%';
      else if (status.includes('Sincronizando Capacitor')) progressFill.style.width = '70%';
      else if (status.includes('Adicionando plataforma Android')) progressFill.style.width = '80%';
      else if (status.includes('Gerando APK via Gradle')) progressFill.style.width = '90%';
      else if (status.includes('APK gerado com sucesso')) progressFill.style.width = '100%';
      else if (status.includes('Erro')) progressBar.style.display = 'none';
      if (status && status.includes('APK gerado com sucesso:')) {
        document.getElementById('sign-apk-section').style.display = 'block';
        window.generatedApkPath = status.split('APK gerado com sucesso:')[1].trim();
        setTimeout(() => { progressBar.style.display = 'none'; }, 1200);
      }
    });
  }

  // Assinar APK
  const signBtn = document.getElementById('sign-apk-btn');
  if (signBtn) {
    signBtn.addEventListener('click', async () => {
      const keystoreFile = document.getElementById('keystore-file').files[0];
      const keystorePassword = document.getElementById('keystore-password').value;
      const keyAlias = document.getElementById('key-alias').value;
      const keyPassword = document.getElementById('key-password').value;
      const apkPath = window.generatedApkPath;
      
      if (!keystoreFile || !keystorePassword || !keyAlias || !keyPassword || !apkPath) {
        document.getElementById('sign-apk-status').textContent = 'Preencha todos os campos e gere o APK primeiro.';
        return;
      }
      
      const keystorePath = keystoreFile.path || keystoreFile.name;
      document.getElementById('sign-apk-status').textContent = 'Assinando APK...';
      
      try {
        const result = await window.electronAPI.signApk({ 
          apkPath, keystorePath, keystorePassword, keyAlias, keyPassword 
        });
        document.getElementById('sign-apk-status').textContent = result.message;
      } catch (error) {
        document.getElementById('sign-apk-status').textContent = 'Erro ao assinar: ' + error.message;
      }
    });
  }

  // Modal de requisitos
  document.getElementById('show-requirements').addEventListener('click', async () => {
    console.log('Show requirements clicked');
    document.getElementById('requirements-modal').style.display = 'flex';
    
    try {
      const checks = await window.electronAPI.checkRequirements();
      const statusItems = [
        { name: 'Node.js', status: checks.node },
        { name: 'npm', status: checks.npm },
        { name: 'Java JDK', status: checks.java },
        { name: 'Gradle', status: checks.gradle },
        { name: 'ANDROID_HOME', status: checks.androidHome }
      ];
      
      document.getElementById('requirements-status').innerHTML = 
        statusItems.map(item => 
          `<div class="requirement-item">
            ${item.status ? '✅' : '❌'} ${item.name}
          </div>`
        ).join('');
    } catch (error) {
      console.error('Error checking requirements:', error);
    }
  });
  
  document.getElementById('close-requirements').addEventListener('click', () => {
    document.getElementById('requirements-modal').style.display = 'none';
  });

  document.getElementById('show-keystore-help').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('keystore-help-modal').style.display = 'flex';
  });
  
  document.getElementById('close-keystore-help').addEventListener('click', () => {
    document.getElementById('keystore-help-modal').style.display = 'none';
  });

  console.log('All event listeners set up successfully');
});
