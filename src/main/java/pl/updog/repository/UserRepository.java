package pl.updog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import pl.updog.domain.User;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    List<User> findByUsernameIn(Collection<String> usernames);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<User> findByActivationCode(String activationCode);

    Optional<User> findByPasswordResetCode(String passwordResetCode);

    @Modifying
    @Query("UPDATE User u SET u.karma = u.karma + :delta WHERE u.id = :userId")
    void updateKarma(Long userId, int delta);
}
