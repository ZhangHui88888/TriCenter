package com.tricenter.controller;

import com.tricenter.common.result.Result;
import com.tricenter.service.CooperationUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Map;

import org.springframework.core.io.FileSystemResource;

@Tag(name = "合作附件上传", description = "合作服务记录相关文件/图片")
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class CooperationUploadController {

    private final CooperationUploadService cooperationUploadService;

    @Operation(summary = "上传合作服务附件", description = "支持常见文档与图片，返回写入记录所需的元数据字段")
    @PostMapping(value = "/cooperation-attachment", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        return Result.success(cooperationUploadService.store(file));
    }

    @Operation(summary = "下载合作服务附件")
    @GetMapping("/cooperation-attachment/download/{storedFileName:.+}")
    public ResponseEntity<Resource> download(
            @PathVariable String storedFileName,
            @RequestParam(value = "name", required = false) String downloadName) {
        Resource resource = cooperationUploadService.loadAsResource(storedFileName);
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (resource instanceof FileSystemResource fsr) {
            try {
                String ct = Files.probeContentType(fsr.getFile().toPath());
                if (ct != null) {
                    mediaType = MediaType.parseMediaType(ct);
                }
            } catch (IOException ignored) {
                // keep octet-stream
            }
        }
        String encoded = URLEncoder.encode(
                downloadName != null && !downloadName.isBlank() ? downloadName : storedFileName,
                StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + encoded)
                .contentType(mediaType)
                .body(resource);
    }
}
