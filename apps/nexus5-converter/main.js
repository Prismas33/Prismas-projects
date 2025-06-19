const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 700,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }  });
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC para selecionar pasta do Next.js
ipcMain.handle('select-nextjs-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

// IPC para converter Next.js em APK
ipcMain.handle('convert-nextjs-to-apk', async (event, nextjsPath) => {
  // Passo 1: Build do Next.js
  event.sender.send('conversion-status', 'Executando build do Next.js...');
  try {
    await execPromise('npm run build', { cwd: nextjsPath });
    // Exportação estática obrigatória
    await execPromise('npx next export', { cwd: nextjsPath });
  } catch (e) {
    return { success: false, message: 'Erro ao fazer build/export do Next.js: ' + e.message };
  }

  // Checar se existe next.config.js e se está compatível com exportação
  const fs = require('fs');
  const nextConfigPath = path.join(nextjsPath, 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    const configContent = fs.readFileSync(nextConfigPath, 'utf-8');
    if (configContent.includes('output: "standalone"') || configContent.includes('output: "export"')) {
      // ok
    } else {
      event.sender.send('conversion-status', 'Aviso: Adicione output: "export" no next.config.js para garantir exportação estática.');
    }
  } else {
    event.sender.send('conversion-status', 'Aviso: Crie um next.config.js com output: "export" para garantir exportação estática.');
  }

  // Passo 2: Criar projeto Capacitor (se não existir)
  const capacitorPath = path.join(nextjsPath, 'android-apk');
  event.sender.send('conversion-status', 'Criando projeto Capacitor...');
  try {
    await execPromise('npx @capacitor/cli create android-apk --npm-client npm', { cwd: nextjsPath });
  } catch (e) {
    // Se já existe, ignorar
  }

  // Passo 3: Instalar dependências do Capacitor
  event.sender.send('conversion-status', 'Instalando dependências do Capacitor...');
  try {
    await execPromise('npm install @capacitor/core @capacitor/cli @capacitor/android', { cwd: capacitorPath });
  } catch (e) {}

  // Passo 4: Copiar build do Next.js para o Capacitor (www)
  event.sender.send('conversion-status', 'Copiando build do Next.js para o Capacitor...');
  const fse = require('fs-extra');
  const wwwPath = path.join(capacitorPath, 'www');
  try {
    if (fs.existsSync(wwwPath)) fse.rmSync(wwwPath, { recursive: true, force: true });
    fse.copySync(path.join(nextjsPath, 'out'), wwwPath);
  } catch (e) {
    return { success: false, message: 'Erro ao copiar build: ' + e.message };
  }

  // Passo 5: Inicializar Capacitor
  event.sender.send('conversion-status', 'Sincronizando Capacitor...');
  try {
    await execPromise('npx cap sync', { cwd: capacitorPath });
  } catch (e) {
    return { success: false, message: 'Erro ao sincronizar Capacitor: ' + e.message };
  }

  // Passo 6: Adicionar plataforma Android
  event.sender.send('conversion-status', 'Adicionando plataforma Android...');
  try {
    await execPromise('npx cap add android', { cwd: capacitorPath });
  } catch (e) {}

  // Passo 7: Build APK via Gradle
  event.sender.send('conversion-status', 'Gerando APK via Gradle...');
  const gradleCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  try {
    await execPromise(`${gradleCmd} assembleDebug`, { cwd: path.join(capacitorPath, 'android') });
  } catch (e) {
    return { success: false, message: 'Erro ao gerar APK: ' + e.message };
  }

  // APK gerado em android/app/build/outputs/apk/debug/app-debug.apk
  const apkPath = path.join(capacitorPath, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  if (fs.existsSync(apkPath)) {
    event.sender.send('conversion-status', 'APK gerado com sucesso: ' + apkPath);
    return { success: true, message: 'APK gerado com sucesso!', apk: apkPath };
  } else {
    return { success: false, message: 'APK não encontrado após build.' };
  }
});

// IPC para assinar APK
ipcMain.handle('sign-apk', async (event, { apkPath, keystorePath, keystorePassword, keyAlias, keyPassword }) => {
  event.sender.send('conversion-status', 'Assinando APK...');
  const jarsignerCmd = `jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore "${keystorePath}" -storepass ${keystorePassword} -keypass ${keyPassword} "${apkPath}" ${keyAlias}`;
  try {
    await execPromise(jarsignerCmd);
    event.sender.send('conversion-status', 'APK assinado com sucesso!');
    return { success: true, message: 'APK assinado com sucesso!' };
  } catch (e) {
    return { success: false, message: 'Erro ao assinar APK: ' + e.message };
  }
});

// IPC para checar pré-requisitos do sistema
ipcMain.handle('check-requirements', async () => {
  const checks = {};
  const { execSync } = require('child_process');
  function check(cmd) {
    try { execSync(cmd, { stdio: 'ignore' }); return true; } catch { return false; }
  }
  checks.node = check('node -v');
  checks.npm = check('npm -v');
  checks.java = check('java -version');
  checks.gradle = check('gradle -v') || check('gradlew -v');
  checks.androidHome = !!process.env.ANDROID_HOME;
  return checks;
});

function execPromise(cmd, opts) {
  return new Promise((resolve, reject) => {
    exec(cmd, opts, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}
