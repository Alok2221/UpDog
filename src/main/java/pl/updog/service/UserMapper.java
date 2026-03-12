package pl.updog.service;

import org.springframework.stereotype.Component;
import pl.updog.domain.User;
import pl.updog.dto.UserDto;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .avatarUrl(user.getAvatarUrl())
            .bio(user.getBio())
            .karma(user.getKarma())
            .createdAt(user.getCreatedAt())
            .enabled(user.isEnabled())
            .build();
    }
}
