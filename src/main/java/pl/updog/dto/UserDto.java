package pl.updog.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class UserDto {

    private Long id;
    private String username;
    private String email;
    private String avatarUrl;
    private String bio;
    private int karma;
    private Instant createdAt;
    private boolean enabled;
}
