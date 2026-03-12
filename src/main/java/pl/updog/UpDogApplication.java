package pl.updog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration;

@SpringBootApplication(exclude = MailSenderAutoConfiguration.class)
public class UpDogApplication {

    public static void main(String[] args) {
        SpringApplication.run(UpDogApplication.class, args);
    }
}
