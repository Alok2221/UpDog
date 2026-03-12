package pl.updog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import pl.updog.domain.Post;

@Data
public class CreatePostRequest {

    @NotBlank
    @Size(max = 300)
    private String title;

    private String content;

    @NotNull
    private Post.PostType postType;

    private String linkUrl;
    private String imageUrl;
    private Long flairId;

    @NotNull
    private Long subredditId;
}
