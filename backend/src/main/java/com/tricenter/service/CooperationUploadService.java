package com.tricenter.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

public interface CooperationUploadService {

    Map<String, Object> store(MultipartFile file) throws IOException;

    Resource loadAsResource(String storedFileName);
}
