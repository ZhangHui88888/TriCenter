package com.tricenter.security;

import com.tricenter.common.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
public class ClamAvScanner {

    @Value("${tricenter.clamav.host:localhost}")
    private String host;

    @Value("${tricenter.clamav.port:3310}")
    private int port;

    public void assertClean(Path file) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), 1000);
            socket.setSoTimeout(30000);
            DataOutputStream output = new DataOutputStream(socket.getOutputStream());
            try (BufferedInputStream input = new BufferedInputStream(Files.newInputStream(file))) {
                output.write("zINSTREAM\0".getBytes(StandardCharsets.US_ASCII));
                byte[] buffer = new byte[8192];
                int read;
                while ((read = input.read(buffer)) >= 0) {
                    if (read == 0) continue;
                    output.writeInt(read);
                    output.write(buffer, 0, read);
                }
                output.writeInt(0);
                output.flush();
            }

            ByteArrayOutputStream response = new ByteArrayOutputStream();
            int value;
            while ((value = socket.getInputStream().read()) > 0) response.write(value);
            String scanResult = response.toString(StandardCharsets.US_ASCII);
            if (scanResult.contains("FOUND")) {
                throw BusinessException.badRequest("文件未通过病毒扫描");
            }
            if (!scanResult.contains("OK")) {
                throw new BusinessException(503, "病毒扫描服务返回异常");
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(503, "病毒扫描服务不可用，上传已拒绝");
        }
    }
}
