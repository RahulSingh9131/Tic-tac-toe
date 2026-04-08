# Stage 1: Build the Go plugin
FROM heroiclabs/nakama-pluginbuilder:3.25.0 AS builder

ENV GO111MODULE=on
ENV CGO_ENABLED=1

WORKDIR /backend

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build --trimpath --buildmode=plugin -o ./backend.so

# Stage 2: Runtime image with compiled plugin
FROM heroiclabs/nakama:3.25.0

COPY --from=builder /backend/backend.so /nakama/data/modules/
