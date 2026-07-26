package com.tricenter.service.impl;

import com.tricenter.common.exception.BusinessException;
import com.tricenter.service.CooperationUploadService;
import com.tricenter.entity.City;
import com.tricenter.entity.EnterpriseServiceRecord;
import com.tricenter.mapper.EnterpriseServiceRecordMapper;
import com.tricenter.security.CityContext;
import com.tricenter.service.CityAccessService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@Service
public class CooperationUploadServiceImpl implements CooperationUploadService {

    /** 仅允许 UUID + 可选安全扩展名，防止路径穿越 */
    private static final Pattern SAFE_STORED_NAME = Pattern.compile(
            "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(\\.[a-z0-9]{1,20})?$");

    private final Path cooperationDir;
    private final CityContext cityContext;
    private final CityAccessService cityAccessService;
    private final EnterpriseServiceRecordMapper serviceRecordMapper;

    public CooperationUploadServiceImpl(
            @Value("${tricenter.cooperation-upload-dir:./data/cooperation-uploads}") String baseDir,
            CityContext cityContext,
            CityAccessService cityAccessService,
            EnterpriseServiceRecordMapper serviceRecordMapper) {
        this.cooperationDir = Paths.get(baseDir).toAbsolutePath().normalize();
        this.cityContext = cityContext;
        this.cityAccessService = cityAccessService;
        this.serviceRecordMapper = serviceRecordMapper;
    }

    @Override
    public Map<String, Object> store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("文件为空");
        }
        String original = file.getOriginalFilename();
        if (original == null) {
            original = "file";
        }
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0 && dot < original.length() - 1) {
            String raw = original.substring(dot).toLowerCase();
            if (raw.matches("^\\.[a-z0-9]{1,15}$")) {
                ext = raw;
            }
        }
        String stored = UUID.randomUUID().toString() + ext;
        City city = cityAccessService.requireActiveCity(cityContext.requireCityId());
        Path cityDir = cooperationDir.resolve(city.getCode()).normalize();
        Files.createDirectories(cityDir);
        Path target = cityDir.resolve(stored).normalize();
        if (!target.startsWith(cityDir)) {
            throw new BusinessException("非法路径");
        }
        file.transferTo(target.toFile());

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("storedFileName", stored);
        meta.put("originalName", original);
        meta.put("contentType", file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        meta.put("size", file.getSize());
        meta.put("uploadedAt", Instant.now().toString());
        return meta;
    }

    @Override
    public Resource loadAsResource(Integer serviceRecordId, String storedFileName) {
        if (storedFileName == null || !SAFE_STORED_NAME.matcher(storedFileName).matches()) {
            throw new BusinessException("无效的文件名");
        }
        EnterpriseServiceRecord record = serviceRecordMapper.selectById(serviceRecordId);
        if (record == null || Integer.valueOf(1).equals(record.getIsDeleted())) {
            throw BusinessException.notFound("服务记录不存在");
        }
        Integer cityId = cityContext.requireCityId();
        cityAccessService.requireEnterprise(record.getEnterpriseId(), cityId);
        boolean belongsToRecord = record.getAttachments() != null
                && record.getAttachments().stream()
                .anyMatch(attachment -> storedFileName.equals(attachment.get("storedFileName")));
        if (!belongsToRecord) {
            throw BusinessException.forbidden("附件不属于该服务记录");
        }

        City city = cityAccessService.requireActiveCity(cityId);
        Path cityDir = cooperationDir.resolve(city.getCode()).normalize();
        Path target = cityDir.resolve(storedFileName).normalize();
        if (!target.startsWith(cityDir)) {
            throw new BusinessException("非法路径");
        }
        if (!Files.isReadable(target) && "changzhou".equals(city.getCode())) {
            target = cooperationDir.resolve(storedFileName).normalize();
        }
        if (!Files.isReadable(target)) {
            throw new BusinessException("文件不存在");
        }
        return new FileSystemResource(target);
    }
}
