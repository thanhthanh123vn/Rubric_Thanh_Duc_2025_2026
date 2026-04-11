package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.sql.Timestamp;


import jakarta.persistence.*;
import lombok.*;
import java.sql.Timestamp;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

	@Id
	@Column(name = "message_id", length = 50)
	private String messageId;

	// Gắn tin nhắn vào một Lớp học phần cụ thể
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "offering_id", nullable = false)
	private CourseOffering courseOffering;

	// ID người gửi (Student hoặc Lecturer) - trỏ về User Service
	@Column(name = "sender_id", length = 50, nullable = false)
	private String senderId;

	@Column(name = "content", columnDefinition = "TEXT")
	private String content;

	@Column(name = "created_at", nullable = false, updatable = false)
	@Builder.Default
	private Timestamp createdAt = new Timestamp(System.currentTimeMillis());


}