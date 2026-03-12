package pl.updog.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import pl.updog.domain.User;
import pl.updog.service.VoteService;

@RestController
@RequestMapping("/votes")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    @PostMapping("/post/{postId}")
    public ResponseEntity<Void> votePost(
            @PathVariable Long postId,
            @RequestParam int value,
            @AuthenticationPrincipal User user) {
        voteService.votePost(postId, value, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/comment/{commentId}")
    public ResponseEntity<Void> voteComment(
            @PathVariable Long commentId,
            @RequestParam int value,
            @AuthenticationPrincipal User user) {
        voteService.voteComment(commentId, value, user);
        return ResponseEntity.ok().build();
    }
}
