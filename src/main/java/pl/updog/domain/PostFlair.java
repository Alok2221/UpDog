package pl.updog.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "post_flairs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostFlair {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subreddit_id", nullable = false)
    private Subreddit subreddit;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "background_color", length = 7)
    private String backgroundColor;

    @Column(name = "text_color", length = 7)
    private String textColor;
}
