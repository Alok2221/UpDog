package pl.updog.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "subreddit_moderators", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "subreddit_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubredditModerator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subreddit_id", nullable = false)
    private Subreddit subreddit;

    @Column(name = "added_at", nullable = false)
    private Instant addedAt;

    @PrePersist
    public void prePersist() {
        if (addedAt == null) addedAt = Instant.now();
    }
}
