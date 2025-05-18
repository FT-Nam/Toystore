package com.ftnam.toystore.service.impl;

import com.ftnam.toystore.dto.request.FeedbackCreationRequest;
import com.ftnam.toystore.dto.request.FeedbackUpdateRequest;
import com.ftnam.toystore.dto.response.FeedbackResponse;
import com.ftnam.toystore.entity.Feedback;
import com.ftnam.toystore.enums.StatusFeedback;
import com.ftnam.toystore.exception.AppException;
import com.ftnam.toystore.exception.ErrorCode;
import com.ftnam.toystore.mapper.FeedbackMapper;
import com.ftnam.toystore.repository.FeedbackRepository;
import com.ftnam.toystore.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final FeedbackMapper feedbackMapper;

    @PreAuthorize("hasAuthority('FEEDBACK_CREATE')")
    @Override
    public FeedbackResponse createResponse(FeedbackCreationRequest request) {
        Feedback feedback = feedbackMapper.toFeedback(request);
        feedback.setStatusFeedback(StatusFeedback.UNRESOLVED);
        return feedbackMapper.toFeedbackResponse(feedbackRepository.save(feedback));
    }

    @PreAuthorize("hasAuthority('FEEDBACK_VIEW')")
    @Override
    public Page<FeedbackResponse> getAllFeedback(Pageable pageable) {
        return feedbackRepository.findAll(pageable).map(feedbackMapper::toFeedbackResponse);
    }

    @PreAuthorize("hasAuthority('FEEDBACK_VIEW')")
    @Override
    public FeedbackResponse getFeedbackById(Long id) {
        Feedback feedback = feedbackRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ID_NOT_EXISTED));
        return feedbackMapper.toFeedbackResponse(feedback);
    }

    @PreAuthorize("hasAuthority('FEEDBACK_UPDATE')")
    @Override
    public FeedbackResponse updateFeedback(Long id, FeedbackUpdateRequest request) {
        Feedback feedback = feedbackRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ID_NOT_EXISTED));
        feedbackMapper.updateFeedback(feedback, request);
        return feedbackMapper.toFeedbackResponse(feedbackRepository.save(feedback));
    }

    @PreAuthorize("hasAuthority('FEEDBACK_DELETE')")
    @Override
    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }
}
