# ── Stage 1: Build stellar-cli ────────────────────────────────────────────
# Etapa separada para que Railway cachee el build de stellar-cli
# independientemente de cambios en el código de la API.
FROM rust:1.78 AS stellar-builder

RUN apt-get update \
    && apt-get install -y --no-install-recommends pkg-config libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN cargo install --locked stellar-cli --features opt

# ── Stage 2: Build censo-api ──────────────────────────────────────────────
FROM rust:1.78 AS api-builder

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends pkg-config libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Cachear dependencias: compilar un stub antes de copiar el source real.
# Invalida solo cuando cambia Cargo.toml o Cargo.lock.
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo 'fn main(){}' > src/main.rs \
    && cargo build --release --locked \
    && rm -rf src

# Build real
COPY src ./src
COPY migrations ./migrations
RUN touch src/main.rs && cargo build --release --locked

# ── Stage 3: Runtime ─────────────────────────────────────────────────────
FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends libssl3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=stellar-builder /usr/local/cargo/bin/stellar /usr/local/bin/stellar
COPY --from=api-builder /app/target/release/censo-api /usr/local/bin/censo-api
COPY --from=api-builder /app/migrations /migrations

ENV API_PORT=8080
ENV STELLAR_BIN=/usr/local/bin/stellar

EXPOSE 8080

CMD ["/usr/local/bin/censo-api"]
