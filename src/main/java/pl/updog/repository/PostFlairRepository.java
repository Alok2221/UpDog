package pl.updog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.updog.domain.PostFlair;

import java.util.List;

public interface PostFlairRepository extends JpaRepository<PostFlair, Long> {

    List<PostFlair> findBySubredditIdOrderByName(Long subredditId);
}
