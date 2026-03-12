package pl.updog.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class CommentDto {

    private Long id;
    private String content;
    private UserDto author;
    private Long postId;
    private Long parentId;
    private int voteCount;
    private Instant createdAt;
    private Instant updatedAt;
    private boolean removed;
    private int depth;
    private Integer userVote;
    private List<CommentDto> replies;
}
