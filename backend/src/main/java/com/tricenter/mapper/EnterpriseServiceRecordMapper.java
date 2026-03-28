package com.tricenter.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.tricenter.entity.EnterpriseServiceRecord;
import org.apache.ibatis.annotations.*;
import org.apache.ibatis.type.JdbcType;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;

import java.util.List;

@Mapper
public interface EnterpriseServiceRecordMapper extends BaseMapper<EnterpriseServiceRecord> {

    @Results(id = "serviceRecordResult", value = {
            @Result(column = "id", property = "id", id = true),
            @Result(column = "enterprise_id", property = "enterpriseId"),
            @Result(column = "provider_id", property = "providerId"),
            @Result(column = "service_type", property = "serviceType"),
            @Result(column = "service_name", property = "serviceName"),
            @Result(column = "service_date", property = "serviceDate"),
            @Result(column = "status", property = "status"),
            @Result(column = "responsible_id", property = "responsibleId"),
            @Result(column = "contract_no", property = "contractNo"),
            @Result(column = "description", property = "description"),
            @Result(column = "result", property = "result"),
            @Result(column = "stage_from", property = "stageFrom"),
            @Result(column = "stage_to", property = "stageTo"),
            @Result(column = "project_level", property = "projectLevel"),
            @Result(column = "feasibility_score", property = "feasibilityScore"),
            @Result(column = "assessment_data", property = "assessmentData", jdbcType = JdbcType.VARCHAR, typeHandler = JacksonTypeHandler.class),
            @Result(column = "attachments", property = "attachments", jdbcType = JdbcType.VARCHAR, typeHandler = JacksonTypeHandler.class),
            @Result(column = "benchmark_possibility", property = "benchmarkPossibility"),
            @Result(column = "is_deleted", property = "isDeleted"),
            @Result(column = "created_at", property = "createdAt"),
            @Result(column = "updated_at", property = "updatedAt"),
            @Result(column = "enterprise_name", property = "enterpriseName"),
            @Result(column = "provider_name", property = "providerName"),
            @Result(column = "responsible_name", property = "responsibleName"),
    })
    @Select("SELECT r.id, r.enterprise_id, r.provider_id, r.service_type, r.service_name, r.service_date, " +
            "r.status, r.responsible_id, r.contract_no, r.description, r.result, r.stage_from, r.stage_to, " +
            "r.project_level, r.feasibility_score, " +
            "CASE WHEN r.assessment_data IS NULL OR JSON_VALID(r.assessment_data) THEN r.assessment_data ELSE NULL END AS assessment_data, " +
            "CASE WHEN r.attachments IS NULL OR JSON_VALID(r.attachments) THEN r.attachments ELSE NULL END AS attachments, " +
            "r.benchmark_possibility, r.is_deleted, r.created_at, r.updated_at, " +
            "e.name AS enterprise_name, p.name AS provider_name, u.name AS responsible_name " +
            "FROM enterprise_service_records r " +
            "LEFT JOIN enterprises e ON r.enterprise_id = e.id " +
            "LEFT JOIN providers p ON r.provider_id = p.id " +
            "LEFT JOIN users u ON r.responsible_id = u.id " +
            "WHERE r.enterprise_id = #{enterpriseId} AND r.is_deleted = 0 " +
            "ORDER BY r.service_date DESC, r.created_at DESC")
    List<EnterpriseServiceRecord> selectByEnterpriseId(@Param("enterpriseId") Integer enterpriseId);

    @ResultMap("serviceRecordResult")
    @Select("<script>" +
            "SELECT r.id, r.enterprise_id, r.provider_id, r.service_type, r.service_name, r.service_date, " +
            "r.status, r.responsible_id, r.contract_no, r.description, r.result, r.stage_from, r.stage_to, " +
            "r.project_level, r.feasibility_score, " +
            "CASE WHEN r.assessment_data IS NULL OR JSON_VALID(r.assessment_data) THEN r.assessment_data ELSE NULL END AS assessment_data, " +
            "CASE WHEN r.attachments IS NULL OR JSON_VALID(r.attachments) THEN r.attachments ELSE NULL END AS attachments, " +
            "r.benchmark_possibility, r.is_deleted, r.created_at, r.updated_at, " +
            "e.name AS enterprise_name, p.name AS provider_name, u.name AS responsible_name " +
            "FROM enterprise_service_records r " +
            "LEFT JOIN enterprises e ON r.enterprise_id = e.id " +
            "LEFT JOIN providers p ON r.provider_id = p.id " +
            "LEFT JOIN users u ON r.responsible_id = u.id " +
            "WHERE r.is_deleted = 0 " +
            "<if test='enterpriseId != null'> AND r.enterprise_id = #{enterpriseId}</if>" +
            "<if test='providerId != null'> AND r.provider_id = #{providerId}</if>" +
            "<if test='serviceType != null and serviceType != \"\"'> AND r.service_type = #{serviceType}</if>" +
            "<if test='status != null and status != \"\"'> AND r.status = #{status}</if>" +
            "ORDER BY r.service_date DESC, r.created_at DESC" +
            "</script>")
    IPage<EnterpriseServiceRecord> selectGlobalPage(Page<EnterpriseServiceRecord> page,
                                                     @Param("enterpriseId") Integer enterpriseId,
                                                     @Param("providerId") Integer providerId,
                                                     @Param("serviceType") String serviceType,
                                                     @Param("status") String status);
}
