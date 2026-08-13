package hcmuaf.edu.vn.fit.course_service.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "messages")
@CompoundIndex(name = "offering_time_idx", def = "{'offeringId': 1, 'createdAt': -1}")
@CompoundIndex(name = "conversation_time_idx", def = "{'conversationId': 1, 'createdAt': -1}")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

	@Id
	private String id; // ID tự động của MongoDB

	@Indexed
	private String offeringId;

	@Indexed
	private String conversationId;

	private String senderId;

	private String content;

	// BẮT BUỘC PHẢI CÓ TRƯỜNG NÀY ĐỂ REPOSITORY KHÔNG BÁO LỖI
	@CreatedDate
	private Date createdAt;
}