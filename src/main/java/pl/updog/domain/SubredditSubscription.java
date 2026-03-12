package pl.updog.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "subreddit_subscriptions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "subreddit_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubredditSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subreddit_id", nullable = false)
    private Subreddit subreddit;

    @Column(name = "subscribed_at", nullable = false)
    private Instant subscribedAt;

    @PrePersist
    public void prePersist() {
        if (subscribedAt == null) subscribedAt = Instant.now();
    }
}
