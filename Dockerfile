# Usamos la imagen base de Node.js con Alpine
FROM node:18-alpine

# Establecemos el directorio de trabajo
WORKDIR /app

COPY prisma ./

# Copiamos los archivos de paquetes
COPY package.json pnpm-lock.yaml ./

# Instalamos las dependencias del proyecto
RUN apk add -q --update --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    npm

# Configuramos las variables de entorno para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN npm install -g pnpm
# Instalamos las dependencias del proyecto
RUN pnpm install

# Copiamos el resto de los archivos del proyecto
COPY . .

# Construimos la aplicación
RUN pnpm run build

# Exponemos el puerto 3000
EXPOSE 3000

# Ejecutamos la aplicación
CMD ["pnpm", "start"]

#FROM zenika/alpine-chrome:with-node

#ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
#ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

#WORKDIR /usr/src/app

#COPY prisma ./

#COPY --chown=chrome package.json pnpm-lock.yaml ./

#USER root
#RUN npm install -g pnpm

#USER chrome
#RUN pnpm install
#RUN pnpm postinstall

#COPY --chown=chrome . ./

#RUN pnpm build

#EXPOSE 3000

#ENTRYPOINT ["tini", "--"]
#CMD [ "pnpm", "start" ]
