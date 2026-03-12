package pl.updog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.updog.domain.SubredditModerator;

import java.util.List;
import java.util.Optional;

public interface SubredditModeratorRepository extends JpaRepository<SubredditModerator, Long> {

    Optional<SubredditModerator> findByUserIdAndSubredditId(Long userId, Long subredditId);

    boolean existsByUserIdAndSubredditId(Long userId, Long subredditId);

    List<SubredditModerator> findBySubredditId(Long subredditId);

    void deleteByUserIdAndSubredditId(Long userId, Long subredditId);
}
