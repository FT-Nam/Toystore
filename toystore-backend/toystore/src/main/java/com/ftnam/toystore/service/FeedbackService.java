package com.ftnam.toystore.service;

import com.ftnam.toystore.dto.request.FeedbackCreationRequest;
import com.ftnam.toystore.dto.request.FeedbackUpdateRequest;
import com.ftnam.toystore.dto.response.FeedbackResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FeedbackService {
    public FeedbackResponse createResponse(FeedbackCreationRequest request);

    public Page<FeedbackResponse> getAllFeedback(Pageable pageable);

    public FeedbackResponse getFeedbackById(Long id);

    public FeedbackResponse updateFeedback(Long id, FeedbackUpdateRequest request);

    public void deleteFeedback(Long id);
}
