package pl.updog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    @NotBlank
    private String code;

    @NotBlank
    @Size(min = 8, max = 100)
    private String newPassword;
}
