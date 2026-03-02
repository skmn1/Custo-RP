package com.staffscheduler.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI staffSchedulerOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Staff Scheduler Pro API")
                        .description("""
                                RESTful API for **Staff Scheduler Pro** — a comprehensive workforce management platform.

                                ## Modules
                                | Module | Description |
                                |--------|-------------|
                                | **Employees** | Full CRUD for staff profiles, departments, and roles |
                                | **Shifts** | Weekly shift scheduling with drag-and-drop support |
                                | **Payroll** | Automated payroll calculations, tax breakdowns, and CSV export |
                                | **Point of Sale** | PoS location management with employee assignment and swap |

                                ## Authentication
                                This development server does **not** require authentication.
                                Production deployments should enable Spring Security with JWT tokens.

                                ## Error Handling
                                All errors return a standard envelope:
                                ```json
                                {
                                  "error": {
                                    "code": "NOT_FOUND",
                                    "message": "Employee not found with id: emp-999",
                                    "details": []
                                  }
                                }
                                ```
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Staff Scheduler Team")
                                .email("dev@staffscheduler.com")
                                .url("https://github.com/skmn1/Scheduler-pro"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .externalDocs(new ExternalDocumentation()
                        .description("Project Repository & Documentation")
                        .url("https://github.com/skmn1/Scheduler-pro"))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local development server"),
                        new Server().url("http://localhost:5173/api").description("Via Vite proxy (frontend dev)")
                ))
                .tags(List.of(
                        new Tag().name("Employees")
                                .description("Manage employee profiles — create, update, delete, filter by department/role, and sort."),
                        new Tag().name("Shifts")
                                .description("Weekly shift scheduling — CRUD operations, date-range queries, and drag-and-drop move support."),
                        new Tag().name("Payroll")
                                .description("Payroll calculations — summary, per-employee breakdown, department totals, statistics, and CSV export."),
                        new Tag().name("Point of Sale")
                                .description("PoS location management — CRUD, employee assignment, removal, and cross-location swap.")
                ))
                .components(new Components()
                        .addSchemas("TimeFormat", new StringSchema()
                                .description("24-hour time string")
                                .pattern("^([01]\\d|2[0-3]):[0-5]\\d$")
                                .example("09:00"))
                        .addSchemas("DateFormat", new StringSchema()
                                .description("ISO 8601 date string")
                                .pattern("^\\d{4}-\\d{2}-\\d{2}$")
                                .example("2025-06-09")));
    }
}
