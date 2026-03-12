package pl.updog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateSubredditRequest {

    @NotBlank
    @Size(min = 2, max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    @Size(max = 4000)
    private String sidebar;

    private String bannerUrl;
    private String iconUrl;
    private boolean isPrivate;
}
