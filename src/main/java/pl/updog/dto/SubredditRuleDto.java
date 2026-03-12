package pl.updog.dto;

import lombok.Data;

@Data
public class SubredditRuleDto {
    private Long id;
    private int sortOrder;
    private String title;
    private String description;
}
