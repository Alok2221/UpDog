package pl.updog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCommentRequest {

    @NotBlank
    private String content;

    @NotNull
    private Long postId;

    private Long parentId;
}
