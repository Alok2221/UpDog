package pl.updog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.updog.domain.BannedUser;

public interface BannedUserRepository extends JpaRepository<BannedUser, Long> {

    boolean existsByUserIdAndSubredditId(Long userId, Long subredditId);
}
