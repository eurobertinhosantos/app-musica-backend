# Usar Debian Bullseye como base para ter acesso a ferramentas mais recentes
FROM debian:bullseye

# Instalar Node.js e Python
RUN apt-get update && apt-get install -y curl python3 make g++ \
    && curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s /usr/bin/python3 /usr/bin/python

# Definir o diretório de trabalho no contêiner
WORKDIR /app

# Copiar os arquivos de dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./

# Instalar dependências do Node.js
RUN npm cache clean --force && npm install

# Copiar o resto dos arquivos do projeto para o diretório de trabalho
COPY . .

# Expor a porta que o servidor usa
EXPOSE 5000

# Comando para rodar a aplicação
CMD ["node", "server.js"]
