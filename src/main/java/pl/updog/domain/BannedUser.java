package pl.updog.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "banned_users", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "subreddit_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannedUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subreddit_id", nullable = false)
    private Subreddit subreddit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "banned_by_id", nullable = false)
    private User bannedBy;

    @Column(length = 500)
    private String reason;

    @Column(name = "banned_at", nullable = false)
    private Instant bannedAt;

    @PrePersist
    public void prePersist() {
        if (bannedAt == null) bannedAt = Instant.now();
    }
}
