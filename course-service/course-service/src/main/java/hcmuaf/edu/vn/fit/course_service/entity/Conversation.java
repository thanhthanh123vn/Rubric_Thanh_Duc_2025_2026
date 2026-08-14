package hcmuaf.edu.vn.fit.course_service.entity;

import hcmuaf.edu.vn.fit.course_service.entity.enums.ConversationType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conversations")
@Getter
@Setter
public class Conversation extends AbstractEntity<Conversation> {

	@Column(name = "conversation_type")
	@Enumerated(EnumType.STRING)
	private ConversationType conversationType;

	// Đổi thành TEXT để tránh lỗi khi tin nhắn cuối cùng quá dài
	@Column(name = "last_message", columnDefinition = "TEXT")
	private String lastMessage;

	// LƯU Ý: Trong Message.java bạn dùng String cho senderId, nên ở đây cũng phải là String (thay vì Long)
	@Column(name= "sender_id_last_message", length = 50)
	private String senderIdLastMessage;

	@Column(name = "sender_name_last_message")
	private String senderNameLastMessage;

	@Column(name = "conversation_name")
	private String conversationName;

	@Column(name = "conversation_avatar")
	private String conversationAvatar;

	/*
	 * ĐÃ XÓA: List<Message> messages
	 * Lý do: Message đã nằm bên MongoDB, JPA (MySQL) không thể ánh xạ được nữa.
	 * Muốn lấy Message thì gọi MessageRepository (Mongo) và query theo conversationId.
	 */

	// Quan hệ với Participant vẫn nằm ở MySQL nên giữ nguyên
	@OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<Participant> participants = new ArrayList<>();
}