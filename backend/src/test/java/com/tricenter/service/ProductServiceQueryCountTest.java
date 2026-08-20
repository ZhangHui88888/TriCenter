package com.tricenter.service;

import com.tricenter.entity.Category;
import com.tricenter.entity.Enterprise;
import com.tricenter.entity.EnterpriseProduct;
import com.tricenter.entity.SystemOption;
import com.tricenter.mapper.CategoryMapper;
import com.tricenter.mapper.EnterprisePatentMapper;
import com.tricenter.mapper.EnterpriseProductMapper;
import com.tricenter.mapper.SystemOptionMapper;
import com.tricenter.security.CityContext;
import com.tricenter.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProductServiceQueryCountTest {

    @Test
    void listPrefetchesCategoriesAndOptionsOnceRegardlessOfProductCount() {
        EnterpriseProductMapper productMapper = mock(EnterpriseProductMapper.class);
        EnterprisePatentMapper patentMapper = mock(EnterprisePatentMapper.class);
        SystemOptionMapper optionMapper = mock(SystemOptionMapper.class);
        CategoryMapper categoryMapper = mock(CategoryMapper.class);
        CityContext cityContext = mock(CityContext.class);
        CityAccessService cityAccessService = mock(CityAccessService.class);

        EnterpriseProduct first = product(1, 11, List.of(21, 22), List.of(31), 41, List.of(51));
        EnterpriseProduct second = product(2, 12, List.of(22), List.of(32), 42, List.of(51, 52));
        when(cityContext.requireCityId()).thenReturn(7);
        when(cityAccessService.requireEnterprise(99, 7)).thenReturn(new Enterprise());
        when(productMapper.selectList(any())).thenReturn(List.of(first, second));

        Category category11 = category(11, "品类 A");
        Category category12 = category(12, "品类 B");
        when(categoryMapper.selectBatchIds(any())).thenReturn(List.of(category11, category12));
        when(optionMapper.selectBatchIds(any())).thenReturn(List.of(
                option(21, "认证 A"), option(22, "认证 B"),
                option(31, "区域 A"), option(32, "区域 B"),
                option(41, "自动化 A"), option(42, "自动化 B"),
                option(51, "物流 A"), option(52, "物流 B")));

        ProductServiceImpl service = new ProductServiceImpl(
                productMapper, patentMapper, optionMapper, categoryMapper, cityContext, cityAccessService);

        assertThat(service.getProductsByEnterpriseId(99)).hasSize(2);
        verify(categoryMapper, times(1)).selectBatchIds(any());
        verify(optionMapper, times(1)).selectBatchIds(any());
        verify(categoryMapper, never()).selectById(any());
        verify(optionMapper, never()).selectById(any());
    }

    private EnterpriseProduct product(
            int id,
            int categoryId,
            List<Integer> certificationIds,
            List<Integer> targetRegionIds,
            int automationLevelId,
            List<Integer> logisticsPartnerIds) {
        EnterpriseProduct product = new EnterpriseProduct();
        product.setId(id);
        product.setEnterpriseId(99);
        product.setCategoryId(categoryId);
        product.setCertificationIds(certificationIds);
        product.setTargetRegionIds(targetRegionIds);
        product.setAutomationLevelId(automationLevelId);
        product.setLogisticsPartnerIds(logisticsPartnerIds);
        return product;
    }

    private Category category(int id, String name) {
        Category category = new Category();
        category.setId(id);
        category.setName(name);
        return category;
    }

    private SystemOption option(int id, String label) {
        SystemOption option = new SystemOption();
        option.setId(id);
        option.setLabel(label);
        return option;
    }
}
