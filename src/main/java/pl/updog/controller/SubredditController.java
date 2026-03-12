package pl.updog.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import pl.updog.domain.User;
import pl.updog.dto.CreateSubredditRequest;
import pl.updog.dto.PageResponse;
import pl.updog.dto.SubredditDto;
import pl.updog.service.SubredditService;

@RestController
@RequestMapping("/subreddits")
@RequiredArgsConstructor
public class SubredditController {

    private final SubredditService subredditService;

    @GetMapping
    public ResponseEntity<PageResponse<SubredditDto>> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(subredditService.findAll(search, pageable));
    }

    @GetMapping("/{name}")
    public ResponseEntity<SubredditDto> getByName(
            @PathVariable String name,
            @AuthenticationPrincipal User currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(subredditService.getByName(name, userId));
    }

    @PostMapping
    public ResponseEntity<SubredditDto> create(
            @RequestBody CreateSubredditRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(subredditService.create(request, user));
    }

    @PostMapping("/{name}/subscribe")
    public ResponseEntity<Void> subscribe(@PathVariable String name, @AuthenticationPrincipal User user) {
        subredditService.subscribe(name, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{name}/unsubscribe")
    public ResponseEntity<Void> unsubscribe(@PathVariable String name, @AuthenticationPrincipal User user) {
        subredditService.unsubscribe(name, user);
        return ResponseEntity.ok().build();
    }
}
