package pl.updog.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.MapBindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void handleBadRequest_returnsMessage() {
        ResponseEntity<Map<String, String>> res = handler.handleBadRequest(new BadRequestException("Invalid input"));
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(res.getBody()).containsEntry("error", "Invalid input");
    }

    @Test
    void handleDisabled_returnsEnglishMessage() {
        ResponseEntity<Map<String, String>> res = handler.handleDisabled(new DisabledException("disabled"));
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(res.getBody()).containsEntry("error",
            "Account is not activated. Check your email or get the code on the activation page.");
    }

    @Test
    void handleNotFound_returnsMessage() {
        ResponseEntity<Map<String, String>> res = handler.handleNotFound(new NotFoundException("Not found"));
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(res.getBody()).containsEntry("error", "Not found");
    }

    @Test
    void handleUnauthorized_returnsMessage() {
        ResponseEntity<Map<String, String>> res = handler.handleUnauthorized(new UnauthorizedException("Unauthorized"));
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(res.getBody()).containsEntry("error", "Unauthorized");
    }

    @Test
    void handleForbidden_returnsMessage() {
        ResponseEntity<Map<String, String>> res = handler.handleForbidden(new ForbiddenException("Forbidden"));
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(res.getBody()).containsEntry("error", "Forbidden");
    }

    @Test
    void handleValidation_returnsDetails() {
        BindingResult bindingResult = new MapBindingResult(Map.of(), "obj");
        bindingResult.rejectValue("username", "required", "must not be blank");
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);
        ResponseEntity<Map<String, Object>> res = handler.handleValidation(ex);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(res.getBody()).containsKey("error").containsKey("details");
        assertThat(res.getBody().get("error")).isEqualTo("Validation failed");
    }
}
