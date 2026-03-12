package pl.updog.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.updog.domain.Comment;
import pl.updog.domain.Post;
import pl.updog.domain.User;
import pl.updog.domain.Vote;
import pl.updog.exception.NotFoundException;
import pl.updog.repository.CommentRepository;
import pl.updog.repository.PostRepository;
import pl.updog.repository.UserRepository;
import pl.updog.repository.VoteRepository;

@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteRepository voteRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    @Transactional
    public void votePost(Long postId, int value, User user) {
        if (value != 1 && value != -1) return;
        Post post = postRepository.findById(postId).orElseThrow(() -> new NotFoundException("Post not found"));
        var existing = voteRepository.findByUserIdAndPostId(user.getId(), postId);
        if (existing.isPresent()) {
            Vote v = existing.get();
            if (v.getValue() == value) {
                voteRepository.delete(v);
                post.setVoteCount(post.getVoteCount() - value);
                updateUserKarma(post.getAuthor().getId(), -value);
            } else {
                int oldVal = v.getValue();
                v.setValue(value);
                post.setVoteCount(post.getVoteCount() - oldVal + value);
                updateUserKarma(post.getAuthor().getId(), -oldVal + value);
            }
        } else {
            voteRepository.save(Vote.builder().user(user).post(post).value(value).build());
            post.setVoteCount(post.getVoteCount() + value);
            updateUserKarma(post.getAuthor().getId(), value);
        }
        postRepository.save(post);
    }

    @Transactional
    public void voteComment(Long commentId, int value, User user) {
        if (value != 1 && value != -1) return;
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new NotFoundException("Comment not found"));
        var existing = voteRepository.findByUserIdAndCommentId(user.getId(), commentId);
        if (existing.isPresent()) {
            Vote v = existing.get();
            if (v.getValue() == value) {
                voteRepository.delete(v);
                comment.setVoteCount(comment.getVoteCount() - value);
                updateUserKarma(comment.getAuthor().getId(), -value);
            } else {
                int oldVal = v.getValue();
                v.setValue(value);
                comment.setVoteCount(comment.getVoteCount() - oldVal + value);
                updateUserKarma(comment.getAuthor().getId(), -oldVal + value);
            }
        } else {
            voteRepository.save(Vote.builder().user(user).comment(comment).value(value).build());
            comment.setVoteCount(comment.getVoteCount() + value);
            updateUserKarma(comment.getAuthor().getId(), value);
        }
        commentRepository.save(comment);
    }

    private void updateUserKarma(Long userId, int delta) {
        userRepository.updateKarma(userId, delta);
    }
}
