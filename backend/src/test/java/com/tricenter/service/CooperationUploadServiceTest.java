package com.tricenter.service;

import com.tricenter.common.exception.BusinessException;
import com.tricenter.entity.City;
import com.tricenter.mapper.EnterpriseServiceRecordMapper;
import com.tricenter.security.CityContext;
import com.tricenter.security.ClamAvScanner;
import com.tricenter.service.impl.CooperationUploadServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CooperationUploadServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void validMagicBytesAreScannedBeforePersistence() throws Exception {
        ClamAvScanner scanner = mock(ClamAvScanner.class);
        CooperationUploadServiceImpl service = service(scanner);
        byte[] png = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 1};

        var result = service.store(new MockMultipartFile("file", "proof.png", "text/plain", png));

        assertThat(result.get("contentType")).isEqualTo("image/png");
        verify(scanner).assertClean(org.mockito.ArgumentMatchers.any(Path.class));
    }

    @Test
    void scannerFailureRejectsUploadAndLeavesNoPersistentFile() {
        ClamAvScanner scanner = mock(ClamAvScanner.class);
        doThrow(new BusinessException(503, "scanner down"))
                .when(scanner).assertClean(org.mockito.ArgumentMatchers.any(Path.class));
        CooperationUploadServiceImpl service = service(scanner);
        byte[] pdf = "%PDF-1.7".getBytes(java.nio.charset.StandardCharsets.US_ASCII);

        assertThatThrownBy(() -> service.store(
                new MockMultipartFile("file", "proof.pdf", "application/pdf", pdf)))
                .isInstanceOf(BusinessException.class)
                .hasMessage("scanner down");
        assertThat(tempDir.resolve("uploads/changzhou").toFile().listFiles()).isEmpty();
    }

    private CooperationUploadServiceImpl service(ClamAvScanner scanner) {
        CityContext cityContext = mock(CityContext.class);
        CityAccessService cityAccessService = mock(CityAccessService.class);
        City city = new City();
        city.setCode("changzhou");
        when(cityContext.requireCityId()).thenReturn(1);
        when(cityAccessService.requireActiveCity(1)).thenReturn(city);
        return new CooperationUploadServiceImpl(
                tempDir.resolve("uploads").toString(),
                tempDir.resolve("quarantine").toString(),
                cityContext,
                cityAccessService,
                mock(EnterpriseServiceRecordMapper.class),
                scanner);
    }
}
