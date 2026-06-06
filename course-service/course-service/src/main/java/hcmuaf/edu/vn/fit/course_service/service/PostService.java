package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.PostRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.*;
import hcmuaf.edu.vn.fit.course_service.entity.Post;
import hcmuaf.edu.vn.fit.course_service.entity.SyllabusFile;
import hcmuaf.edu.vn.fit.course_service.mapper.SyllabusFileMapper;
import hcmuaf.edu.vn.fit.course_service.mapper.SyllarbusMapper;
import hcmuaf.edu.vn.fit.course_service.repository.PostRepository;
import hcmuaf.edu.vn.fit.course_service.repository.SyllabusFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final SyllabusFileRepository syllabusFileRepository;
    private final SyllabusFileMapper syllabusFileMapper;
    private final UserClient  userClient;
    private final S3Service s3Service;

    public PostResponse createPost(PostRequest request, String authorId) {
        Post post = Post.builder()
                .offeringId(request.getOfferingId())
                .authorId(authorId)
                .title(request.getTitle())
                .content(request.getContent())
                .fileIds(request.getFileIds())

                .build();

        Post savedPost = postRepository.save(post);
        return mapToResponse(savedPost);
    }

    public List<PostResponse> getPostsByOffering(String offeringId) {
        List<Post> posts = postRepository.findByOfferingIdOrderByCreatedAtDesc(offeringId);
        return posts.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public PostResponse getPostById(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng!"));




        return mapToResponse(post);
    }

    public PostResponse updatePost(String postId, PostRequest request, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng!"));


        if (!post.getAuthorId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa bài đăng này!");
        }


        post.setTitle(request.getTitle());
        post.setContent(request.getContent());


        if (request.getFileIds() != null) {
            post.setFileIds(request.getFileIds());
        }

        Post updatedPost = postRepository.save(post);
        return mapToResponse(updatedPost);
    }


    public void deletePost(String postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng!"));


        if (!post.getAuthorId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa bài đăng này!");
        }


        if (post.getFileIds() != null && !post.getFileIds().isEmpty()) {

            List<SyllabusFile> filesToDelete = syllabusFileRepository.findAllById(post.getFileIds());


            for (SyllabusFile file : filesToDelete) {
                s3Service.deleteFile(file.getFileUrl());
            }


            syllabusFileRepository.deleteAll(filesToDelete);
        }


        postRepository.delete(post);
    }
    private PostResponse mapToResponse(Post post) {
        List<SyllabusFileDTO> fileDTOs = new ArrayList<>();


        if (post.getFileIds() != null && !post.getFileIds().isEmpty()) {
            List<SyllabusFile> files = syllabusFileRepository.findAllById(post.getFileIds());
            fileDTOs = syllabusFileMapper.toResponseList(files);
        }

        String authorName = "Giảng viên";
        try {

            LecturerResponse user = userClient.getLecturerByUserId(post.getAuthorId());

            if (user != null) {
                authorName = user.getFullName();
            }else{
                SinhVienResponse sinhVienResponse = userClient.getSinhVien(post.getAuthorId());
                authorName = sinhVienResponse.getFullName();
            }
        } catch (Exception e) {

            System.out.println("Lỗi gọi sang User Service: " + e.getMessage());
        }

        return PostResponse.builder()
                .id(post.getId())
                .offeringId(post.getOfferingId())
                .authorId(post.getAuthorId())
                .title(post.getTitle())
                .content(post.getContent())
                .createdAt(post.getCreatedAt())
                .files(fileDTOs)

                .authorName(authorName)
                .build();
    }
}