package pl.updog.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.updog.domain.User;
import pl.updog.dto.*;
import pl.updog.exception.BadRequestException;
import pl.updog.exception.UnauthorizedException;
import pl.updog.repository.UserRepository;
import pl.updog.security.JwtTokenProvider;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${app.activation-code-expiration-minutes:60}")
    private int activationCodeExpirationMinutes;

    @Value("${app.password-reset-expiration-minutes:30}")
    private int passwordResetExpirationMinutes;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Base64.Encoder BASE64 = Base64.getUrlEncoder().withoutPadding();

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        User user = (User) authentication.getPrincipal();
        if (!user.isEnabled()) {
            throw new BadRequestException("Account is not activated. Check your email for activation code.");
        }
        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUsername());
        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .expiresIn(jwtExpirationMs / 1000)
            .user(userMapper.toDto(user))
            .build();
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .enabled(true)
            .activationCode(null)
            .activationCodeExpiresAt(null)
            .karma(0)
            .build();
        userRepository.save(user);
    }

    @Transactional
    public void activate(String code) {
        // Email-based activation is disabled; accounts are active immediately after registration.
    }

    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
            .orElse(null);
        if (user != null) {
            String code = generateCode();
            user.setPasswordResetCode(code);
            user.setPasswordResetExpiresAt(Instant.now().plusSeconds(passwordResetExpirationMinutes * 60L));
            userRepository.save(user);
        }
    }

    @Transactional
    public void resetPassword(String code, String newPassword) {
        User user = userRepository.findByPasswordResetCode(code)
            .orElseThrow(() -> new BadRequestException("Invalid reset code"));
        if (user.getPasswordResetExpiresAt() == null || user.getPasswordResetExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Reset code has expired");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetCode(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }
        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UnauthorizedException("User not found"));
        String accessToken = jwtTokenProvider.generateAccessToken(username);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(username);
        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(newRefreshToken)
            .expiresIn(jwtExpirationMs / 1000)
            .user(userMapper.toDto(user))
            .build();
    }

    private String generateCode() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return BASE64.encodeToString(bytes);
    }
}
