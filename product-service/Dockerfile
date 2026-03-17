FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache maven
COPY pom.xml /app/pom.xml
RUN mvn install -N -DskipTests
COPY product-service/pom.xml /app/product-service/pom.xml
COPY product-service/src /app/product-service/src
WORKDIR /app/product-service
RUN mvn clean package spring-boot:repackage -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/product-service/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-Xms128m","-Xmx256m","-jar","app.jar"]
