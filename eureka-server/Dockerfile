FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache maven
COPY pom.xml /app/pom.xml
RUN mvn install -N -DskipTests
COPY eureka-server/pom.xml /app/eureka-server/pom.xml
COPY eureka-server/src /app/eureka-server/src
WORKDIR /app/eureka-server
RUN mvn clean package spring-boot:repackage -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/eureka-server/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-Xms128m","-Xmx256m","-jar","app.jar"]
