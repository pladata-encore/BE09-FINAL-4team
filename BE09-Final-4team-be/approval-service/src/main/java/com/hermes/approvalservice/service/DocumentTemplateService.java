package com.hermes.approvalservice.service;

import com.hermes.api.common.ApiResult;
import com.hermes.attachment.entity.AttachmentInfo;
import com.hermes.attachment.service.AttachmentClientService;
import com.hermes.approvalservice.client.UserServiceClient;
import com.hermes.approvalservice.converter.ResponseConverter;
import com.hermes.approvalservice.client.dto.UserProfile;
import com.hermes.approvalservice.dto.request.*;
import com.hermes.approvalservice.dto.response.*;
import com.hermes.approvalservice.entity.*;
import com.hermes.approvalservice.exception.NotFoundException;
import com.hermes.approvalservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentTemplateService {

    private final DocumentTemplateRepository templateRepository;
    private final TemplateCategoryRepository categoryRepository;
    private final TemplateFieldRepository fieldRepository;
    private final TemplateApprovalStageRepository stageRepository;
    private final TemplateApprovalTargetRepository targetRepository;
    private final AttachmentClientService attachmentService;
    private final ResponseConverter responseConverter;

    public List<TemplateSummaryResponse> getAllTemplates(boolean isAdmin) {
        List<DocumentTemplate> templates = isAdmin 
            ? templateRepository.findAll()
            : templateRepository.findByIsHiddenFalse();
        
        return templates.stream()
                .map(responseConverter::convertToTemplateSummaryResponse)
                .toList();
    }

    public List<TemplateSummaryResponse> getTemplatesByCategory(Long categoryId, boolean isAdmin) {
        List<DocumentTemplate> templates = isAdmin
            ? templateRepository.findByCategoryId(categoryId)
            : templateRepository.findByCategoryIdAndIsHiddenFalse(categoryId);
        
        return templates.stream()
                .map(responseConverter::convertToTemplateSummaryResponse)
                .toList();
    }

    public List<TemplatesByCategoryResponse> getTemplatesByCategory(boolean isAdmin) {
        List<DocumentTemplate> templates = isAdmin
            ? templateRepository.findAll()
            : templateRepository.findVisibleTemplatesWithCategory();

        // null category와 non-null category 분리
        Map<Boolean, List<DocumentTemplate>> partitioned = templates.stream()
                .collect(Collectors.partitioningBy(template -> template.getCategory() != null));

        List<TemplatesByCategoryResponse> result = new ArrayList<>();

        // null category 템플릿들 처리 (분류되지 않음)
        List<DocumentTemplate> uncategorizedTemplates = partitioned.get(false);
        if (!uncategorizedTemplates.isEmpty()) {
            TemplatesByCategoryResponse uncategorizedResponse = new TemplatesByCategoryResponse();
            uncategorizedResponse.setTemplates(uncategorizedTemplates.stream()
                    .map(responseConverter::convertToTemplateSummaryResponse)
                    .toList());
            result.add(uncategorizedResponse);
        }

        // non-null category 템플릿들 그룹핑
        Map<TemplateCategory, List<DocumentTemplate>> groupedTemplates = partitioned.get(true).stream()
                .collect(Collectors.groupingBy(DocumentTemplate::getCategory));

        List<TemplatesByCategoryResponse> categorizedResponses = groupedTemplates.entrySet().stream()
                .map(entry -> {
                    TemplatesByCategoryResponse response = new TemplatesByCategoryResponse();
                    response.setCategoryId(entry.getKey().getId());
                    response.setCategoryName(entry.getKey().getName());
                    response.setTemplates(entry.getValue().stream()
                            .map(responseConverter::convertToTemplateSummaryResponse)
                            .toList());
                    return response;
                })
                .toList();

        result.addAll(categorizedResponses);
        return result;
    }

    public TemplateResponse getTemplateById(Long id) {
        DocumentTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("템플릿을 찾을 수 없습니다."));
        return responseConverter.convertToTemplateResponse(template);
    }

    @Transactional
    public TemplateResponse createTemplate(CreateTemplateRequest request) {
        TemplateCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new NotFoundException("카테고리를 찾을 수 없습니다."));
        }

        // 참조 파일 검증 및 변환
        List<AttachmentInfo> referenceFiles = attachmentService.validateAndConvertAttachments(request.getReferenceFiles());

        DocumentTemplate template = DocumentTemplate.builder()
                .title(request.getTitle())
                .icon(request.getIcon())
                .color(request.getColor())
                .description(request.getDescription())
                .bodyTemplate(request.getBodyTemplate())
                .useBody(request.getUseBody())
                .useAttachment(request.getUseAttachment())
                .allowTargetChange(request.getAllowTargetChange())
                .referenceFiles(referenceFiles)
                .category(category)
                .build();

        DocumentTemplate savedTemplate = templateRepository.save(template);

        // Save fields
        if (request.getFields() != null) {
            saveTemplateFields(savedTemplate, request.getFields());
        }

        // Save approval stages
        if (request.getApprovalStages() != null) {
            saveApprovalStages(savedTemplate, request.getApprovalStages());
        }

        // Save reference targets
        if (request.getReferenceTargets() != null) {
            saveReferenceTargets(savedTemplate, request.getReferenceTargets());
        }

        return getTemplateById(savedTemplate.getId());
    }

    @Transactional
    public TemplateResponse updateTemplate(Long id, UpdateTemplateRequest request) {
        DocumentTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("템플릿을 찾을 수 없습니다."));

        TemplateCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new NotFoundException("카테고리를 찾을 수 없습니다."));
        }

        // 참조 파일 업데이트
        if (request.getReferenceFiles() != null) {
            List<AttachmentInfo> referenceFiles = attachmentService.validateAndConvertAttachments(request.getReferenceFiles());
            template.getReferenceFiles().clear();
            template.getReferenceFiles().addAll(referenceFiles);
        }

        template.setTitle(request.getTitle());
        template.setIcon(request.getIcon());
        template.setColor(request.getColor());
        template.setDescription(request.getDescription());
        template.setBodyTemplate(request.getBodyTemplate());
        template.setUseBody(request.getUseBody());
        template.setUseAttachment(request.getUseAttachment());
        template.setAllowTargetChange(request.getAllowTargetChange());
        template.setCategory(category);

        // Clear existing fields, stages, and targets using orphanRemoval
        template.getFields().clear();
        template.getApprovalStages().clear();
        template.getReferenceTargets().clear();

        // Save new fields
        if (request.getFields() != null) {
            saveTemplateFields(template, request.getFields());
        }

        // Save new approval stages
        if (request.getApprovalStages() != null) {
            saveApprovalStages(template, request.getApprovalStages());
        }

        // Save new reference targets
        if (request.getReferenceTargets() != null) {
            saveReferenceTargets(template, request.getReferenceTargets());
        }

        return getTemplateById(template.getId());
    }

    @Transactional
    public void updateTemplateVisibility(Long id, boolean isHidden) {
        DocumentTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("템플릿을 찾을 수 없습니다."));
        
        template.setIsHidden(isHidden);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        if (!templateRepository.existsById(id)) {
            throw new NotFoundException("템플릿을 찾을 수 없습니다.");
        }
        templateRepository.deleteById(id);
    }

    private void saveTemplateFields(DocumentTemplate template, List<TemplateFieldRequest> fieldRequests) {
        List<TemplateField> fields = fieldRequests.stream()
                .map(request -> TemplateField.builder()
                        .name(request.getName())
                        .fieldType(request.getFieldType())
                        .required(request.getRequired())
                        .fieldOrder(request.getFieldOrder())
                        .options(request.getOptions())
                        .template(template)
                        .build())
                .toList();
        
        template.getFields().addAll(fields);
    }

    private void saveApprovalStages(DocumentTemplate template, List<ApprovalStageRequest> stageRequests) {
        for (ApprovalStageRequest stageRequest : stageRequests) {
            TemplateApprovalStage stage = TemplateApprovalStage.builder()
                    .stageOrder(stageRequest.getStageOrder())
                    .stageName(stageRequest.getStageName())
                    .template(template)
                    .build();

            if (stageRequest.getApprovalTargets() != null) {
                List<TemplateApprovalTarget> targets = stageRequest.getApprovalTargets().stream()
                        .map(targetRequest -> TemplateApprovalTarget.builder()
                                .targetType(targetRequest.getTargetType())
                                .userId(targetRequest.getUserId())
                                .organizationId(targetRequest.getOrganizationId())
                                .managerLevel(targetRequest.getManagerLevel())
                                .isReference(targetRequest.getIsReference())
                                .template(template)
                                .approvalStage(stage)
                                .build())
                        .toList();
                
                stage.getApprovalTargets().addAll(targets);
            }
            
            template.getApprovalStages().add(stage);
        }
    }

    private void saveReferenceTargets(DocumentTemplate template, List<ApprovalTargetRequest> targetRequests) {
        List<TemplateApprovalTarget> targets = targetRequests.stream()
                .map(request -> TemplateApprovalTarget.builder()
                        .targetType(request.getTargetType())
                        .userId(request.getUserId())
                        .organizationId(request.getOrganizationId())
                        .managerLevel(request.getManagerLevel())
                        .isReference(true)
                        .template(template)
                        .build())
                .toList();
        
        template.getReferenceTargets().addAll(targets);
    }

}