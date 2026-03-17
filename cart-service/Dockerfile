FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache maven
COPY pom.xml /app/pom.xml
RUN mvn install -N -DskipTests
COPY cart-service/pom.xml /app/cart-service/pom.xml
COPY cart-service/src /app/cart-service/src
WORKDIR /app/cart-service
RUN mvn clean package spring-boot:repackage -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/cart-service/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-Xms128m","-Xmx256m","-jar","app.jar"]
