package pl.updog.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import pl.updog.domain.Post;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findBySubredditIdOrderByCreatedAtDesc(Long subredditId, Pageable pageable);

    Page<Post> findBySubredditIdOrderByVoteCountDesc(Long subredditId, Pageable pageable);

    @Query(value = "SELECT * FROM posts WHERE subreddit_id = :subredditId AND is_removed = false ORDER BY (vote_count + 1) / POWER(GREATEST(EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 + 2, 2), 1.5) DESC",
        countQuery = "SELECT COUNT(*) FROM posts WHERE subreddit_id = :subredditId AND is_removed = false",
        nativeQuery = true)
    Page<Post> findBySubredditIdOrderByHot(@org.springframework.data.repository.query.Param("subredditId") Long subredditId, Pageable pageable);

    Page<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.removed = false ORDER BY p.createdAt DESC")
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.removed = false ORDER BY p.voteCount DESC")
    Page<Post> findAllByOrderByVoteCountDesc(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Post> search(String query, Pageable pageable);

    @Query("SELECT p FROM Post p JOIN SubredditSubscription s ON s.subreddit.id = p.subreddit.id WHERE s.user.id = :userId AND p.removed = false ORDER BY p.createdAt DESC")
    Page<Post> findFeedByUserId(Long userId, Pageable pageable);

    @Modifying
    @Query("UPDATE Post p SET p.commentCount = p.commentCount + :delta WHERE p.id = :postId")
    void updateCommentCount(Long postId, int delta);
}
