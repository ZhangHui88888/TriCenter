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
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.Set;
import java.util.Arrays;

@Slf4j
@Service
public class CooperationUploadServiceImpl implements CooperationUploadService {

    /** 仅允许 UUID + 可选安全扩展名，防止路径穿越 */
    private static final Pattern SAFE_STORED_NAME = Pattern.compile(
            "^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(\\.[a-z0-9]{1,20})?$");

    private final Path cooperationDir;
    private final Path quarantineDir;
    private final CityContext cityContext;
    private final CityAccessService cityAccessService;
    private final EnterpriseServiceRecordMapper serviceRecordMapper;

    private static final long MAX_FILE_SIZE = 30L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".png", ".jpg", ".jpeg");

    public CooperationUploadServiceImpl(
            @Value("${tricenter.cooperation-upload-dir:./data/cooperation-uploads}") String baseDir,
            @Value("${tricenter.upload-quarantine-dir:./data/upload-quarantine}") String quarantineDir,
            CityContext cityContext,
            CityAccessService cityAccessService,
            EnterpriseServiceRecordMapper serviceRecordMapper) {
        this.cooperationDir = Paths.get(baseDir).toAbsolutePath().normalize();
        this.quarantineDir = Paths.get(quarantineDir).toAbsolutePath().normalize();
        this.cityContext = cityContext;
        this.cityAccessService = cityAccessService;
        this.serviceRecordMapper = serviceRecordMapper;
    }

    @Override
    public Map<String, Object> store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw BusinessException.badRequest("文件为空");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw BusinessException.badRequest("上传文件不能超过 30MB");
        }
        String original = file.getOriginalFilename();
        if (original == null) {
            original = "file";
        }
        original = original.replace('\\', '/');
        original = original.substring(original.lastIndexOf('/') + 1);
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0 && dot < original.length() - 1) {
            String raw = original.substring(dot).toLowerCase(Locale.ROOT);
            if (raw.matches("^\\.[a-z0-9]{1,15}$")) {
                ext = raw;
            }
        }
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw BusinessException.badRequest("仅支持 PDF、DOC/DOCX、XLS/XLSX、PNG、JPG/JPEG");
        }
        assertMagicBytes(file, ext);
        String stored = UUID.randomUUID().toString() + ext;
        City city = cityAccessService.requireActiveCity(cityContext.requireCityId());
        Path cityDir = cooperationDir.resolve(city.getCode()).normalize();
        Path quarantineCityDir = quarantineDir.resolve(city.getCode()).normalize();
        Files.createDirectories(cityDir);
        Files.createDirectories(quarantineCityDir);
        Path target = cityDir.resolve(stored).normalize();
        Path quarantined = quarantineCityDir.resolve(stored + ".part").normalize();
        if (!target.startsWith(cityDir) || !quarantined.startsWith(quarantineCityDir)) {
            throw new BusinessException("非法路径");
        }
        // 内部系统不做病毒扫描；先写临时文件再原子移动，避免留下半截附件
        try {
            file.transferTo(quarantined.toFile());
            try {
                Files.move(quarantined, target, StandardCopyOption.ATOMIC_MOVE);
            } catch (java.nio.file.AtomicMoveNotSupportedException e) {
                Files.move(quarantined, target);
            }
        } catch (Exception e) {
            Files.deleteIfExists(quarantined);
            throw e;
        }

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("storedFileName", stored);
        meta.put("originalName", original);
        meta.put("contentType", trustedContentType(ext));
        meta.put("size", file.getSize());
        meta.put("uploadedAt", Instant.now().toString());
        return meta;
    }

    private void assertMagicBytes(MultipartFile file, String extension) throws IOException {
        byte[] header;
        try (var input = file.getInputStream()) {
            header = input.readNBytes(16);
        }
        boolean valid = switch (extension) {
            case ".pdf" -> startsWith(header, "%PDF-".getBytes(java.nio.charset.StandardCharsets.US_ASCII));
            case ".png" -> startsWith(header, new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A});
            case ".jpg", ".jpeg" -> startsWith(header, new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF});
            case ".doc", ".xls" -> startsWith(header, new byte[]{(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0, (byte) 0xA1, (byte) 0xB1, 0x1A, (byte) 0xE1});
            case ".docx", ".xlsx" -> startsWith(header, new byte[]{0x50, 0x4B, 0x03, 0x04});
            default -> false;
        };
        if (!valid) throw BusinessException.badRequest("文件内容与扩展名不匹配");
    }

    private boolean startsWith(byte[] source, byte[] prefix) {
        return source.length >= prefix.length
                && Arrays.equals(Arrays.copyOf(source, prefix.length), prefix);
    }

    private String trustedContentType(String extension) {
        return switch (extension) {
            case ".pdf" -> "application/pdf";
            case ".png" -> "image/png";
            case ".jpg", ".jpeg" -> "image/jpeg";
            case ".doc" -> "application/msword";
            case ".docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case ".xls" -> "application/vnd.ms-excel";
            case ".xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            default -> "application/octet-stream";
        };
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
