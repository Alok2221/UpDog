package pl.updog.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import pl.updog.domain.SavedPost;

public interface SavedPostRepository extends JpaRepository<SavedPost, Long> {

    Page<SavedPost> findByUserIdOrderBySavedAtDesc(Long userId, Pageable pageable);

    boolean existsByUserIdAndPostId(Long userId, Long postId);

    void deleteByUserIdAndPostId(Long userId, Long postId);
}
