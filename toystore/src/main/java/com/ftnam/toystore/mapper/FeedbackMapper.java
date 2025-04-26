package com.ftnam.toystore.mapper;

import com.ftnam.toystore.dto.request.FeedbackCreationRequest;
import com.ftnam.toystore.dto.request.FeedbackUpdateRequest;
import com.ftnam.toystore.dto.response.FeedbackResponse;
import com.ftnam.toystore.entity.Feedback;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface FeedbackMapper {
    Feedback toFeedback(FeedbackCreationRequest request);

    @Mapping(target = "id", source = "feedback.id")
    FeedbackResponse toFeedbackResponse(Feedback feedback);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFeedback(@MappingTarget Feedback feedback, FeedbackUpdateRequest feedbackUpdateRequest);
}
