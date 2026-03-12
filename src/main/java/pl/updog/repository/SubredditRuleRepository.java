package pl.updog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.updog.domain.SubredditRule;

import java.util.List;

public interface SubredditRuleRepository extends JpaRepository<SubredditRule, Long> {

    List<SubredditRule> findBySubredditIdOrderBySortOrder(Long subredditId);
}
