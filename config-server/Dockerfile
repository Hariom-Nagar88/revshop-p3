FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache maven
COPY pom.xml /app/pom.xml
RUN mvn install -N -DskipTests
COPY config-server/pom.xml /app/config-server/pom.xml
COPY config-server/src /app/config-server/src
WORKDIR /app/config-server
RUN mvn clean package spring-boot:repackage -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/config-server/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-Xms128m","-Xmx256m","-jar","app.jar"]
