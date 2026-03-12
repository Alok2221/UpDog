package pl.updog.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pl.updog.domain.Subreddit;

import java.util.Optional;

public interface SubredditRepository extends JpaRepository<Subreddit, Long> {

    Optional<Subreddit> findByName(String name);

    boolean existsByName(String name);

    Page<Subreddit> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("SELECT s FROM Subreddit s ORDER BY s.createdAt DESC")
    Page<Subreddit> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
