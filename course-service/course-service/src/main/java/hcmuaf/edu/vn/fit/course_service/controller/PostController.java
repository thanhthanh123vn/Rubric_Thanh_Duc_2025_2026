package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.request.PostRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.PostResponse;
import hcmuaf.edu.vn.fit.course_service.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course-service/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;


    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @RequestHeader("X-User-Id") String lecturerId,
            @RequestBody PostRequest request) {

        PostResponse response = postService.createPost(request, lecturerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    
    @GetMapping("/course/{offeringId}")
    public ResponseEntity<List<PostResponse>> getPostsForCourse(
            @PathVariable String offeringId) {

        return ResponseEntity.ok(postService.getPostsByOffering(offeringId));
    }
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable String postId) {
        return ResponseEntity.ok(postService.getPostById(postId));
    }
    @PutMapping("/{postId}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable String postId,
            @RequestHeader("X-User-Id") String userId,
            @RequestBody PostRequest request) {

        PostResponse response = postService.updatePost(postId, request, userId);
        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/{postId}")
    public ResponseEntity<String> deletePost(
            @PathVariable String postId,
            @RequestHeader("X-User-Id") String userId) {

        postService.deletePost(postId, userId);
        return ResponseEntity.ok("Xóa bài đăng thành công!");
    }
}