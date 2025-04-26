package com.ftnam.toystore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;

@SpringBootApplication
@EnableFeignClients
@ComponentScan(basePackages = "com.ftnam.toystore")
public class ToystoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(ToystoreApplication.class, args);
	}

}
