package pl.updog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import pl.updog.domain.Vote;

import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    Optional<Vote> findByUserIdAndPostId(Long userId, Long postId);

    Optional<Vote> findByUserIdAndCommentId(Long userId, Long commentId);

    @Modifying
    @Query("DELETE FROM Vote v WHERE v.user.id = :userId AND v.post.id = :postId")
    void deleteByUserIdAndPostId(Long userId, Long postId);

    @Modifying
    @Query("DELETE FROM Vote v WHERE v.user.id = :userId AND v.comment.id = :commentId")
    void deleteByUserIdAndCommentId(Long userId, Long commentId);
}
