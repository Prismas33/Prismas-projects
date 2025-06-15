#!/bin/bash

# Script para atualizar versão do PWA automaticamente no build
echo "Updating PWA cache version..."

# Atualiza a versão no Service Worker com timestamp
TIMESTAMP=$(date +%s)
sed -i "s/const CACHE_VERSION = 'linkmind-v' + Date.now();/const CACHE_VERSION = 'linkmind-v$TIMESTAMP';/" public/sw.js

echo "Cache version updated to: linkmind-v$TIMESTAMP"

# Continue with normal build
npm run build
