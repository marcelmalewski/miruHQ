FROM gradle:9.5.1-jdk21 AS build

WORKDIR /api

COPY . .

RUN chmod +x gradlew
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre

WORKDIR /api

COPY --from=build /api/build/libs/*.jar api.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "api.jar"]
