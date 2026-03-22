package com.tricenter.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.tricenter.entity.EnterpriseContact;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 企业联系人Mapper
 */
@Mapper
public interface EnterpriseContactMapper extends BaseMapper<EnterpriseContact> {
    
    /**
     * 获取企业的所有联系人
     */
    @Select("SELECT * FROM enterprise_contacts WHERE enterprise_id = #{enterpriseId} ORDER BY is_primary DESC, id ASC")
    List<EnterpriseContact> selectByEnterpriseId(@Param("enterpriseId") Integer enterpriseId);
    
    /**
     * 获取企业的主要联系人
     */
    @Select("SELECT * FROM enterprise_contacts WHERE enterprise_id = #{enterpriseId} AND is_primary = 1 LIMIT 1")
    EnterpriseContact selectPrimaryByEnterpriseId(@Param("enterpriseId") Integer enterpriseId);

    /**
     * 批量获取多个企业的联系人（消除 N+1）
     */
    @Select("<script>SELECT * FROM enterprise_contacts WHERE enterprise_id IN " +
            "<foreach item='id' collection='enterpriseIds' open='(' separator=',' close=')'>#{id}</foreach>" +
            " ORDER BY is_primary DESC, id ASC</script>")
    List<EnterpriseContact> selectByEnterpriseIds(@Param("enterpriseIds") List<Integer> enterpriseIds);
}
