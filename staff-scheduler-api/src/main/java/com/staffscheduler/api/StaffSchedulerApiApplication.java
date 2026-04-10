package com.staffscheduler.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class StaffSchedulerApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(StaffSchedulerApiApplication.class, args);
    }
}
