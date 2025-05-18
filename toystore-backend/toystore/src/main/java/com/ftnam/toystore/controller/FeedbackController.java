package com.ftnam.toystore.controller;

import com.ftnam.toystore.dto.request.FeedbackCreationRequest;
import com.ftnam.toystore.dto.request.FeedbackUpdateRequest;
import com.ftnam.toystore.dto.response.ApiResponse;
import com.ftnam.toystore.dto.response.FeedbackResponse;
import com.ftnam.toystore.dto.response.PaginationInfo;
import com.ftnam.toystore.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/feedback")
public class FeedbackController {
    private final FeedbackService feedbackService;

    @GetMapping
    public ApiResponse<List<FeedbackResponse>> getAllFeedback(Pageable pageable){
        Page<FeedbackResponse> feedbackResponsePage = feedbackService.getAllFeedback(pageable);
        return ApiResponse.<List<FeedbackResponse>>builder()
                .value(feedbackResponsePage.getContent())
                .pagination(PaginationInfo.builder()
                        .page(feedbackResponsePage.getNumber())
                        .size(feedbackResponsePage.getSize())
                        .totalElements(feedbackResponsePage.getTotalElements())
                        .build())
                .build();
    }

    @GetMapping("/{feedbackId}")
    public ApiResponse<FeedbackResponse> getFeedbackById (@PathVariable Long feedbackId){
        return ApiResponse.<FeedbackResponse>builder()
                .value(feedbackService.getFeedbackById(feedbackId))
                .build();
    }

    @PostMapping
    public ApiResponse<FeedbackResponse> createFeedback(@RequestBody FeedbackCreationRequest feedbackCreationRequest){
        return ApiResponse.<FeedbackResponse>builder()
                .value(feedbackService.createResponse(feedbackCreationRequest))
                .message("Create feedback has been successfully")
                .build();
    }

    @PutMapping("/{feedbackId}")
    public ApiResponse<FeedbackResponse> updateFeedback(@PathVariable Long feedbackId,
                                                        @RequestBody FeedbackUpdateRequest request){
        return ApiResponse.<FeedbackResponse>builder()
                .value(feedbackService.updateFeedback(feedbackId, request))
                .message("Update feedback has been successfully")
                .build();
    }

    @DeleteMapping("/{feedbackId}")
    public ApiResponse<FeedbackResponse> deleteFeedback(@PathVariable Long feedbackId){
        feedbackService.deleteFeedback(feedbackId);
        return ApiResponse.<FeedbackResponse>builder()
                .message("Delete feedback has been successfully")
                .build();
    }
}
