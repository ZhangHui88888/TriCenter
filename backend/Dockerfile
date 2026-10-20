# syntax=docker/dockerfile:1.7
FROM eclipse-temurin:25-jdk-jammy AS build
WORKDIR /workspace/backend

COPY backend/.mvn .mvn
COPY backend/mvnw backend/pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -ntp dependency:go-offline

COPY migrations /workspace/migrations
COPY backend/src src
RUN ./mvnw -B -ntp clean package -DskipTests

FROM eclipse-temurin:25-jre-jammy AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system tricenter \
    && useradd --system --gid tricenter --home-dir /opt/tricenter --shell /usr/sbin/nologin tricenter

WORKDIR /opt/tricenter
COPY --from=build /workspace/backend/target/tricenter-backend-*.jar app.jar
RUN mkdir -p /var/lib/tricenter/uploads /var/lib/tricenter/quarantine \
    && chown -R tricenter:tricenter /opt/tricenter /var/lib/tricenter

USER tricenter
EXPOSE 8081
VOLUME ["/var/lib/tricenter/uploads", "/var/lib/tricenter/quarantine"]
HEALTHCHECK --interval=15s --timeout=3s --start-period=60s --retries=5 \
  CMD curl --fail --silent http://127.0.0.1:8082/actuator/health/readiness || exit 1
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-Dspring.profiles.active=prod", "-jar", "/opt/tricenter/app.jar"]
