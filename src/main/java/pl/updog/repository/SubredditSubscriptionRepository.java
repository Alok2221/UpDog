package pl.updog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.updog.domain.SubredditSubscription;

import java.util.List;
import java.util.Optional;

public interface SubredditSubscriptionRepository extends JpaRepository<SubredditSubscription, Long> {

    Optional<SubredditSubscription> findByUserIdAndSubredditId(Long userId, Long subredditId);

    boolean existsByUserIdAndSubredditId(Long userId, Long subredditId);

    List<SubredditSubscription> findByUserId(Long userId);

    List<SubredditSubscription> findBySubredditId(Long subredditId);

    long countBySubredditId(Long subredditId);

    void deleteByUserIdAndSubredditId(Long userId, Long subredditId);
}
