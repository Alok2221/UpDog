package pl.updog.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.updog.domain.Comment;
import pl.updog.domain.Post;
import pl.updog.domain.User;
import pl.updog.dto.CommentDto;
import pl.updog.dto.CreateCommentRequest;
import pl.updog.exception.BadRequestException;
import pl.updog.exception.ForbiddenException;
import pl.updog.exception.NotFoundException;
import pl.updog.repository.CommentRepository;
import pl.updog.repository.PostRepository;
import pl.updog.repository.VoteRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final VoteRepository voteRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public List<CommentDto> getCommentsForPost(Long postId, User currentUser) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new NotFoundException("Post not found"));
        List<Comment> roots = commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtAsc(postId);
        return roots.stream()
            .map(c -> toCommentDto(c, currentUser))
            .collect(Collectors.toList());
    }

    @Transactional
    public CommentDto create(CreateCommentRequest request, User user) {
        Post post = postRepository.findById(request.getPostId())
            .orElseThrow(() -> new NotFoundException("Post not found"));
        if (post.isLocked()) {
            throw new ForbiddenException("Post is locked");
        }
        Comment parent = null;
        if (request.getParentId() != null) {
            parent = commentRepository.findById(request.getParentId())
                .orElseThrow(() -> new NotFoundException("Parent comment not found"));
            if (!parent.getPost().getId().equals(post.getId())) {
                throw new BadRequestException("Parent comment does not belong to this post");
            }
        }
        Comment comment = Comment.builder()
            .content(request.getContent().trim())
            .author(user)
            .post(post)
            .parent(parent)
            .voteCount(0)
            .removed(false)
            .depth(parent == null ? 0 : parent.getDepth() + 1)
            .build();
        comment = commentRepository.save(comment);
        postRepository.updateCommentCount(post.getId(), 1);
        return toCommentDto(comment, user);
    }

    CommentDto toCommentDto(Comment c, User currentUser) {
        Integer userVote = null;
        if (currentUser != null) {
            var v = voteRepository.findByUserIdAndCommentId(currentUser.getId(), c.getId());
            if (v.isPresent()) userVote = v.get().getValue();
        }
        List<Comment> replyList = commentRepository.findByParentIdOrderByCreatedAtAsc(c.getId());
        List<CommentDto> replies = replyList.stream()
            .map(r -> toCommentDto(r, currentUser))
            .collect(Collectors.toList());
        return CommentDto.builder()
            .id(c.getId())
            .content(c.getContent())
            .author(userMapper.toDto(c.getAuthor()))
            .postId(c.getPost().getId())
            .parentId(c.getParent() != null ? c.getParent().getId() : null)
            .voteCount(c.getVoteCount())
            .createdAt(c.getCreatedAt())
            .updatedAt(c.getUpdatedAt())
            .removed(c.isRemoved())
            .depth(c.getDepth())
            .userVote(userVote)
            .replies(replies)
            .build();
    }
}
