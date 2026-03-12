package pl.updog.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import pl.updog.domain.User;
import pl.updog.dto.*;
import pl.updog.service.PostService;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<PageResponse<PostDto>> list(
            @RequestParam(required = false) Long subredditId,
            @RequestParam(required = false, defaultValue = "hot") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(postService.getPosts(subredditId, sort, page, size, currentUser));
    }

    @GetMapping("/feed")
    public ResponseEntity<PageResponse<PostDto>> feed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(postService.getFeed(user, page, size));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<PostDto>> search(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(postService.search(q, page, size, currentUser));
    }

    @GetMapping("/saved")
    public ResponseEntity<PageResponse<PostDto>> saved(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(postService.getSavedPosts(user, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDto> getById(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(postService.getById(id, currentUser));
    }

    @PostMapping
    public ResponseEntity<PostDto> create(@Valid @RequestBody CreatePostRequest request, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(postService.create(request, user));
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<Void> save(@PathVariable Long id, @AuthenticationPrincipal User user) {
        postService.savePost(id, user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<Void> unSave(@PathVariable Long id, @AuthenticationPrincipal User user) {
        postService.unsavePost(id, user);
        return ResponseEntity.ok().build();
    }
}
