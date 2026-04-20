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


	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "offering_id", nullable = true)
	private CourseOffering courseOffering;


	@Column(name = "sender_id", length = 50, nullable = false)
	private String senderId;

	@Column(name = "content", columnDefinition = "TEXT")
	private String content;

	@Column(name = "created_at", nullable = false, updatable = false)
	@Builder.Default
	private Timestamp createdAt = new Timestamp(System.currentTimeMillis());
	@ManyToOne
	@JoinColumn(name = "conversation_id")
	private Conversation conversation;

}