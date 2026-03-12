package pl.updog.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class SubredditDto {

    private Long id;
    private String name;
    private String description;
    private String sidebar;
    private String bannerUrl;
    private String iconUrl;
    private UserDto owner;
    private Instant createdAt;
    private boolean isPrivate;
    private long subscriberCount;
    private boolean subscribed;
    private boolean isModerator;
    private List<SubredditRuleDto> rules;
    private List<PostFlairDto> flairs;
}
