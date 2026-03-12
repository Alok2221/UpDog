package pl.updog.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.updog.domain.*;
import pl.updog.dto.*;
import pl.updog.exception.BadRequestException;
import pl.updog.exception.ForbiddenException;
import pl.updog.exception.NotFoundException;
import pl.updog.repository.PostFlairRepository;
import pl.updog.repository.PostRepository;
import pl.updog.repository.SavedPostRepository;
import pl.updog.repository.SubredditSubscriptionRepository;
import pl.updog.repository.VoteRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final VoteRepository voteRepository;
    private final SavedPostRepository savedPostRepository;
    private final SubredditService subredditService;
    private final SubredditSubscriptionRepository subscriptionRepository;
    private final PostFlairRepository flairRepository;
    private final UserMapper userMapper;

    private static final List<String> SORT_OPTIONS = List.of("hot", "new", "top");

    @Transactional(readOnly = true)
    public PageResponse<PostDto> getPosts(Long subredditId, String sort, int page, int size, User currentUser) {
        Pageable pageable = PageRequest.of(page, size);
        if (sort == null) sort = "hot";
        if (!SORT_OPTIONS.contains(sort)) sort = "hot";
        Page<Post> postPage;
        if (subredditId != null) {
            subredditService.getEntityById(subredditId);
            switch (sort) {
                case "new" -> postPage = postRepository.findBySubredditIdOrderByCreatedAtDesc(subredditId, pageable);
                case "top" -> postPage = postRepository.findBySubredditIdOrderByVoteCountDesc(subredditId, pageable);
                default -> postPage = postRepository.findBySubredditIdOrderByHot(subredditId, pageable);
            }
        } else {
            if (sort.equals("top")) {
                postPage = postRepository.findAllByOrderByVoteCountDesc(pageable);
            } else {
                postPage = postRepository.findAllByOrderByCreatedAtDesc(pageable);
            }
        }
        return getPostDtoPageResponse(currentUser, postPage);
    }

    private PageResponse<PostDto> getPostDtoPageResponse(User currentUser, Page<Post> postPage) {
        List<PostDto> dtos = postPage.getContent().stream()
            .map(p -> toPostDto(p, currentUser))
            .collect(Collectors.toList());
        return PageResponse.<PostDto>builder()
            .content(dtos)
            .page(postPage.getNumber())
            .size(postPage.getSize())
            .totalElements(postPage.getTotalElements())
            .totalPages(postPage.getTotalPages())
            .first(postPage.isFirst())
            .last(postPage.isLast())
            .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<PostDto> getFeed(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postPage = postRepository.findFeedByUserId(user.getId(), pageable);
        return getPostDtoPageResponse(user, postPage);
    }

    @Transactional(readOnly = true)
    public PageResponse<PostDto> search(String query, int page, int size, User currentUser) {
        if (query == null || query.isBlank()) {
            return getPosts(null, "new", page, size, currentUser);
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postPage = postRepository.search(query.trim(), pageable);
        return getPostDtoPageResponse(currentUser, postPage);
    }

    @Transactional(readOnly = true)
    public PostDto getById(Long id, User currentUser) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Post not found"));
        return toPostDto(post, currentUser);
    }

    @Transactional
    public PostDto create(CreatePostRequest request, User user) {
        Subreddit sub = subredditService.getEntityById(request.getSubredditId());
        if (subredditService.isBanned(user.getId(), sub.getId())) {
            throw new ForbiddenException("You are banned from this subreddit");
        }
        PostFlair flair = null;
        if (request.getFlairId() != null) {
            flair = flairRepository.findById(request.getFlairId())
                .filter(f -> f.getSubreddit().getId().equals(sub.getId()))
                .orElse(null);
        }
        Post post = Post.builder()
            .title(request.getTitle().trim())
            .content(request.getContent())
            .postType(request.getPostType())
            .linkUrl(request.getLinkUrl())
            .imageUrl(request.getImageUrl())
            .author(user)
            .subreddit(sub)
            .flair(flair)
            .voteCount(0)
            .commentCount(0)
            .removed(false)
            .locked(false)
            .build();
        post = postRepository.save(post);
        return toPostDto(post, user);
    }

    @Transactional
    public void savePost(Long postId, User user) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new NotFoundException("Post not found"));
        if (savedPostRepository.existsByUserIdAndPostId(user.getId(), postId)) return;
        savedPostRepository.save(SavedPost.builder().user(user).post(post).build());
    }

    @Transactional
    public void unsavePost(Long postId, User user) {
        savedPostRepository.deleteByUserIdAndPostId(user.getId(), postId);
    }

    @Transactional(readOnly = true)
    public PageResponse<PostDto> getSavedPosts(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SavedPost> savedPage = savedPostRepository.findByUserIdOrderBySavedAtDesc(user.getId(), pageable);
        List<PostDto> dtos = savedPage.getContent().stream()
            .map(sp -> toPostDto(sp.getPost(), user, true))
            .collect(Collectors.toList());
        return PageResponse.<PostDto>builder()
            .content(dtos)
            .page(savedPage.getNumber())
            .size(savedPage.getSize())
            .totalElements(savedPage.getTotalElements())
            .totalPages(savedPage.getTotalPages())
            .first(savedPage.isFirst())
            .last(savedPage.isLast())
            .build();
    }

    PostDto toPostDto(Post p, User currentUser) {
        return toPostDto(p, currentUser, false);
    }

    PostDto toPostDto(Post p, User currentUser, boolean forceSaved) {
        Integer userVote = currentUser != null
            ? voteRepository.findByUserIdAndPostId(currentUser.getId(), p.getId()).map(Vote::getValue).orElse(null)
            : null;
        boolean saved = forceSaved;
        if (currentUser != null && !forceSaved) {
            saved = savedPostRepository.existsByUserIdAndPostId(currentUser.getId(), p.getId());
        }
        SubredditDto subDto = subredditSummary(p.getSubreddit(), currentUser != null ? currentUser.getId() : null);
        PostFlairDto flairDto = null;
        if (p.getFlair() != null) {
            flairDto = new PostFlairDto();
            flairDto.setId(p.getFlair().getId());
            flairDto.setName(p.getFlair().getName());
            flairDto.setBackgroundColor(p.getFlair().getBackgroundColor());
            flairDto.setTextColor(p.getFlair().getTextColor());
        }
        return PostDto.builder()
            .id(p.getId())
            .title(p.getTitle())
            .content(p.getContent())
            .postType(p.getPostType())
            .linkUrl(p.getLinkUrl())
            .imageUrl(p.getImageUrl())
            .author(userMapper.toDto(p.getAuthor()))
            .subreddit(subDto)
            .flair(flairDto)
            .voteCount(p.getVoteCount())
            .commentCount(p.getCommentCount())
            .createdAt(p.getCreatedAt())
            .updatedAt(p.getUpdatedAt())
            .locked(p.isLocked())
            .removed(p.isRemoved())
            .userVote(userVote)
            .saved(saved)
            .build();
    }

    private SubredditDto subredditSummary(Subreddit s, Long currentUserId) {
        long subscriberCount = subscriptionRepository.countBySubredditId(s.getId());
        boolean subscribed = currentUserId != null && subscriptionRepository.existsByUserIdAndSubredditId(currentUserId, s.getId());
        return SubredditDto.builder()
            .id(s.getId())
            .name(s.getName())
            .description(s.getDescription())
            .sidebar(null)
            .iconUrl(s.getIconUrl())
            .bannerUrl(s.getBannerUrl())
            .owner(null)
            .createdAt(s.getCreatedAt())
            .isPrivate(s.isPrivate())
            .subscriberCount(subscriberCount)
            .subscribed(subscribed)
            .isModerator(false)
            .rules(List.of())
            .flairs(List.of())
            .build();
    }
}
