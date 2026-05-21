FROM gradle:8.7-jdk21 AS build

WORKDIR /api

COPY . .

RUN gradle bootJar --no-daemon

FROM eclipse-temurin:21-jre

WORKDIR /api

COPY --from=build /api/build/libs/*.jar api.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "api.jar"]
