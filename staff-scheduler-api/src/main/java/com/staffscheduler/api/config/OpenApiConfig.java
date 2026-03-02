package com.staffscheduler.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI staffSchedulerOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Staff Scheduler Pro API")
                        .description("RESTful API for Staff Scheduler Pro — employee management, shift scheduling, payroll, and point-of-sale operations")
                        .version("1.0.0")
                        .contact(new Contact().name("Staff Scheduler Team")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Development server")
                ));
    }
}
