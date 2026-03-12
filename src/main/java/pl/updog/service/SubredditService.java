package pl.updog.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.updog.domain.Subreddit;
import pl.updog.domain.SubredditModerator;
import pl.updog.domain.SubredditSubscription;
import pl.updog.domain.User;
import pl.updog.dto.*;
import pl.updog.exception.BadRequestException;
import pl.updog.exception.ForbiddenException;
import pl.updog.exception.NotFoundException;
import pl.updog.repository.*;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubredditService {

    private final SubredditRepository subredditRepository;
    private final SubredditSubscriptionRepository subscriptionRepository;
    private final SubredditModeratorRepository moderatorRepository;
    private final BannedUserRepository bannedUserRepository;
    private final PostFlairRepository flairRepository;
    private final SubredditRuleRepository ruleRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public PageResponse<SubredditDto> findAll(String search, Pageable pageable) {
        Page<Subreddit> page = search != null && !search.isBlank()
                ? subredditRepository.findByNameContainingIgnoreCase(search.trim(), pageable)
                : subredditRepository.findAllByOrderByCreatedAtDesc(pageable);
        List<SubredditDto> dtos = page.getContent().stream()
                .map(s -> toDto(s, null, false, false))
                .collect(Collectors.toList());
        return PageResponse.<SubredditDto>builder()
                .content(dtos)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public SubredditDto getByName(String name, Long currentUserId) {
        Subreddit sub = subredditRepository.findByName(name)
                .orElseThrow(() -> new NotFoundException("Subreddit not found: " + name));
        boolean subscribed = currentUserId != null && subscriptionRepository.existsByUserIdAndSubredditId(currentUserId, sub.getId());
        boolean isMod = currentUserId != null && (sub.getOwner().getId().equals(currentUserId)
                || moderatorRepository.existsByUserIdAndSubredditId(currentUserId, sub.getId()));
        return toDto(sub, currentUserId, subscribed, isMod);
    }

    @Transactional
    public SubredditDto create(CreateSubredditRequest request, User currentUser) {
        if (subredditRepository.existsByName(request.getName())) {
            throw new BadRequestException("Subreddit name already taken");
        }
        Subreddit sub = Subreddit.builder()
                .name(request.getName().trim().toLowerCase())
                .description(request.getDescription())
                .sidebar(request.getSidebar())
                .bannerUrl(request.getBannerUrl())
                .iconUrl(request.getIconUrl())
                .owner(currentUser)
                .isPrivate(request.isPrivate())
                .build();
        sub = subredditRepository.save(sub);
        SubredditModerator mod = SubredditModerator.builder().user(currentUser).subreddit(sub).build();
        moderatorRepository.save(mod);
        return toDto(sub, currentUser.getId(), false, true);
    }

    @Transactional
    public void subscribe(String subredditName, User user) {
        Subreddit sub = subredditRepository.findByName(subredditName)
                .orElseThrow(() -> new NotFoundException("Subreddit not found"));
        if (bannedUserRepository.existsByUserIdAndSubredditId(user.getId(), sub.getId())) {
            throw new ForbiddenException("You are banned from this subreddit");
        }
        if (subscriptionRepository.existsByUserIdAndSubredditId(user.getId(), sub.getId())) return;
        subscriptionRepository.save(SubredditSubscription.builder().user(user).subreddit(sub).build());
    }

    @Transactional
    public void unsubscribe(String subredditName, User user) {
        Subreddit sub = subredditRepository.findByName(subredditName)
                .orElseThrow(() -> new NotFoundException("Subreddit not found"));
        subscriptionRepository.deleteByUserIdAndSubredditId(user.getId(), sub.getId());
    }

    public Subreddit getEntityByName(String name) {
        return subredditRepository.findByName(name)
                .orElseThrow(() -> new NotFoundException("Subreddit not found: " + name));
    }

    public Subreddit getEntityById(Long id) {
        return subredditRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Subreddit not found"));
    }

    boolean isModerator(Long userId, Long subredditId) {
        Subreddit sub = subredditRepository.findById(subredditId).orElse(null);
        if (sub == null) return false;
        return sub.getOwner().getId().equals(userId) || moderatorRepository.existsByUserIdAndSubredditId(userId, subredditId);
    }

    boolean isBanned(Long userId, Long subredditId) {
        return bannedUserRepository.existsByUserIdAndSubredditId(userId, subredditId);
    }

    private SubredditDto toDto(Subreddit s, Long currentUserId, boolean subscribed, boolean isModerator) {
        long subscriberCount = subscriptionRepository.countBySubredditId(s.getId());
        List<SubredditRuleDto> rules = ruleRepository.findBySubredditIdOrderBySortOrder(s.getId()).stream()
                .map(r -> {
                    SubredditRuleDto dto = new SubredditRuleDto();
                    dto.setId(r.getId());
                    dto.setSortOrder(r.getSortOrder());
                    dto.setTitle(r.getTitle());
                    dto.setDescription(r.getDescription());
                    return dto;
                })
                .collect(Collectors.toList());
        List<PostFlairDto> flairs = flairRepository.findBySubredditIdOrderByName(s.getId()).stream()
                .map(f -> {
                    PostFlairDto dto = new PostFlairDto();
                    dto.setId(f.getId());
                    dto.setName(f.getName());
                    dto.setBackgroundColor(f.getBackgroundColor());
                    dto.setTextColor(f.getTextColor());
                    return dto;
                })
                .collect(Collectors.toList());
        return SubredditDto.builder()
                .id(s.getId())
                .name(s.getName())
                .description(s.getDescription())
                .sidebar(s.getSidebar())
                .bannerUrl(s.getBannerUrl())
                .iconUrl(s.getIconUrl())
                .owner(userMapper.toDto(s.getOwner()))
                .createdAt(s.getCreatedAt())
                .isPrivate(s.isPrivate())
                .subscriberCount(subscriberCount)
                .subscribed(subscribed)
                .isModerator(isModerator)
                .rules(rules)
                .flairs(flairs)
                .build();
    }
}
