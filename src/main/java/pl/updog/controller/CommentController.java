package pl.updog.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import pl.updog.domain.User;
import pl.updog.dto.CommentDto;
import pl.updog.dto.CreateCommentRequest;
import pl.updog.service.CommentService;

import java.util.List;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDto>> getByPost(@PathVariable Long postId, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(commentService.getCommentsForPost(postId, currentUser));
    }

    @PostMapping
    public ResponseEntity<CommentDto> create(@Valid @RequestBody CreateCommentRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(commentService.create(request, user));
    }
}
