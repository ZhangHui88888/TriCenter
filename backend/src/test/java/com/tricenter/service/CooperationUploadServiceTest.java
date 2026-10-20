package com.tricenter.service;

import com.tricenter.common.exception.BusinessException;
import com.tricenter.entity.City;
import com.tricenter.mapper.EnterpriseServiceRecordMapper;
import com.tricenter.security.CityContext;
import com.tricenter.service.impl.CooperationUploadServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CooperationUploadServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void validMagicBytesArePersistedWithoutLeavingStagingFile() throws Exception {
        CooperationUploadServiceImpl service = service();
        byte[] png = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 1};

        var result = service.store(new MockMultipartFile("file", "proof.png", "text/plain", png));

        assertThat(result.get("contentType")).isEqualTo("image/png");
        assertThat(tempDir.resolve("uploads/changzhou").resolve((String) result.get("storedFileName"))).exists();
        assertThat(tempDir.resolve("quarantine/changzhou").toFile().listFiles()).isEmpty();
    }

    @Test
    void mismatchedMagicBytesRejectUploadAndLeaveNoPersistentFile() {
        CooperationUploadServiceImpl service = service();
        byte[] notPdf = "plain text".getBytes(java.nio.charset.StandardCharsets.US_ASCII);

        assertThatThrownBy(() -> service.store(
                new MockMultipartFile("file", "proof.pdf", "application/pdf", notPdf)))
                .isInstanceOf(BusinessException.class);
        assertThat(tempDir.resolve("uploads/changzhou")).doesNotExist();
    }

    private CooperationUploadServiceImpl service() {
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
                mock(EnterpriseServiceRecordMapper.class));
    }
}
