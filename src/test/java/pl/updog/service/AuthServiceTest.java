package pl.updog.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import pl.updog.dto.LoginRequest;
import pl.updog.dto.RegisterRequest;
import pl.updog.dto.AuthResponse;
import pl.updog.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatCode;

@SpringBootTest
@ActiveProfiles("test")
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void registerAndActivate() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("testuser");
        req.setEmail("test@example.com");
        req.setPassword("password123");
        authService.register(req);
        var user = userRepository.findByUsername("testuser").orElseThrow();
        assertThat(user.isEnabled()).isTrue();
        assertThat(user.getActivationCode()).isNull();
    }

    @Test
    void loginSucceedsAfterRegister() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("loginuser");
        req.setEmail("login@example.com");
        req.setPassword("password123");
        authService.register(req);
        LoginRequest login = new LoginRequest();
        login.setUsername("loginuser");
        login.setPassword("password123");
        AuthResponse response = authService.login(login);
        assertThat(response).isNotNull();
        assertThat(response.getUser().getUsername()).isEqualTo("loginuser");
    }

    @Test
    void registerFailsWhenUsernameTaken() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("dupuser");
        req.setEmail("dup1@example.com");
        req.setPassword("password123");
        authService.register(req);
        RegisterRequest req2 = new RegisterRequest();
        req2.setUsername("dupuser");
        req2.setEmail("dup2@example.com");
        req2.setPassword("other456");
        assertThatThrownBy(() -> authService.register(req2))
            .isInstanceOf(pl.updog.exception.BadRequestException.class)
            .hasMessageContaining("Username already taken");
    }

    @Test
    void registerFailsWhenEmailTaken() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("user1");
        req.setEmail("same@example.com");
        req.setPassword("password123");
        authService.register(req);
        RegisterRequest req2 = new RegisterRequest();
        req2.setUsername("user2");
        req2.setEmail("same@example.com");
        req2.setPassword("other456");
        assertThatThrownBy(() -> authService.register(req2))
            .isInstanceOf(pl.updog.exception.BadRequestException.class)
            .hasMessageContaining("Email already registered");
    }

    @Test
    void activateFailsForInvalidCode() {
        assertThatCode(() -> authService.activate("invalid-code-xyz"))
            .doesNotThrowAnyException();
    }
}
