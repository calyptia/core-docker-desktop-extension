FROM --platform=$BUILDPLATFORM node:17.7-alpine3.14 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY ui /ui
RUN npm run build

FROM alpine
LABEL org.opencontainers.image.title="calyptia-core-extension" \
    org.opencontainers.image.description="Calyptia Core Docker Extension" \
    org.opencontainers.image.vendor="Calyptia Inc." \
    com.docker.desktop.extension.api.version=">= 0.2.3" \
    com.docker.extension.screenshots="" \
    com.docker.extension.detailed-description="" \
    com.docker.extension.publisher-url="" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.changelog=""

RUN apk add curl
RUN curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl \
    && chmod +x ./kubectl && mv ./kubectl /usr/local/bin/kubectl \
    && curl -sSfL https://github.com/calyptia/cli/releases/download/v0.40.0/cli_0.40.0_linux_amd64.tar.gz | tar -xz \
    && chmod +x ./calyptia && mv ./calyptia /usr/local/bin/calyptia \
    && mkdir -p /linux \
    && cp /usr/local/bin/kubectl /linux/ \
    && cp /usr/local/bin/calyptia /linux/

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/amd64/kubectl" \
    && curl -sSfL https://github.com/calyptia/cli/releases/download/v0.40.0/cli_0.40.0_darwin_amd64.tar.gz | tar -xz \
    && mkdir -p /darwin \
    && chmod +x ./calyptia && mv ./calyptia /darwin/ \
    && chmod +x ./kubectl && mv ./kubectl /darwin/

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/windows/amd64/kubectl.exe" \
    && curl -sSfL https://github.com/calyptia/cli/releases/download/v0.40.0/cli_0.40.0_windows_amd64.tar.gz | tar -xz \
    && mkdir -p /windows \
    && chmod +x ./calyptia.exe && mv ./calyptia.exe /windows/ \
    && chmod +x ./kubectl.exe && mv ./kubectl.exe /windows/ 

COPY metadata.json .
COPY calyptia.svg .
COPY --from=client-builder /ui/build ui