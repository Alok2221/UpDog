package pl.updog.dto;

import lombok.Builder;
import lombok.Data;
import pl.updog.domain.Post;

import java.time.Instant;

@Data
@Builder
public class PostDto {

    private Long id;
    private String title;
    private String content;
    private Post.PostType postType;
    private String linkUrl;
    private String imageUrl;
    private UserDto author;
    private SubredditDto subreddit;
    private PostFlairDto flair;
    private int voteCount;
    private int commentCount;
    private Instant createdAt;
    private Instant updatedAt;
    private boolean locked;
    private boolean removed;
    private Integer userVote;
    private boolean saved;
}
