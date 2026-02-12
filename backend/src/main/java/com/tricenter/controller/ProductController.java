package com.tricenter.controller;

import com.tricenter.common.result.Result;
import com.tricenter.dto.request.PatentRequest;
import com.tricenter.dto.request.ProductCreateRequest;
import com.tricenter.dto.request.ProductUpdateRequest;
import com.tricenter.dto.response.PatentResponse;
import com.tricenter.dto.response.ProductResponse;
import com.tricenter.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 企业产品管理控制器
 */
@Tag(name = "企业产品管理", description = "产品和专利的CRUD操作")
@RestController
@RequestMapping("/api/enterprises/{enterpriseId}")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // ==================== 产品管理 ====================

    @Operation(summary = "获取企业产品列表", description = "获取指定企业的所有产品")
    @GetMapping("/products")
    public Result<List<ProductResponse>> getProducts(
            @Parameter(description = "企业ID") @PathVariable Integer enterpriseId) {
        List<ProductResponse> products = productService.getProductsByEnterpriseId(enterpriseId);
        return Result.success(products);
    }

    @Operation(summary = "添加企业产品", description = "为企业添加新产品")
    @PostMapping("/products")
    public Result<ProductResponse> createProduct(
            @Parameter(description = "企业ID") @PathVariable Integer enterpriseId,
            @Valid @RequestBody ProductCreateRequest request) {
        ProductResponse product = productService.createProduct(enterpriseId, request);
        return Result.success(product);
    }

    @Operation(summary = "更新企业产品", description = "更新产品信息")
    @PutMapping("/products/{productId}")
    public Result<ProductResponse> updateProduct(
            @Parameter(description = "企业ID") @PathVariable Integer enterpriseId,
            @Parameter(description = "产品ID") @PathVariable Integer productId,
            @Valid @RequestBody ProductUpdateRequest request) {
        ProductResponse product = productService.updateProduct(enterpriseId, productId, request);
        return Result.success(product);
    }

    @Operation(summary = "删除企业产品", description = "删除产品")
    @DeleteMapping("/products/{productId}")
    public Result<Void> deleteProduct(
            @Parameter(description = "企业ID") @PathVariable Integer enterpriseId,
            @Parameter(description = "产品ID") @PathVariable Integer productId) {
        productService.deleteProduct(enterpriseId, productId);
        return Result.success();
    }

    // ==================== 专利管理 ====================

    @Operation(summary = "获取企业专利列表", description = "获取指定企业的所有专利")
    @GetMapping("/patents")
    public Result<List<PatentResponse>> getPatents(
            @Parameter(description = "企业ID") @PathVariable Integer enterpriseId) {
        List<PatentResponse> patents = productService.getPatentsByEnterpriseId(enterpriseId);
        return Result.success(patents);
    }

    @Operation(summary = "添加企业专利", description = "为企业添加新专利")
    @PostMapping("/patents")
    public Result<PatentResponse> createPatent(
            @Parameter(description = "企业ID") @PathVariable Integer enterpriseId,
            @Valid @RequestBody PatentRequest request) {
        PatentResponse patent = productService.createPatent(enterpriseId, request);
        return Result.success(patent);
    }

    @Operation(summary = "更新企业专利", description = "更新专利信息")
    @PutMapping("/patents/{patentId}")
    public Result<PatentResponse> updatePatent(
            @Parameter(description = "企业ID") @PathVariable Integer enterpriseId,
            @Parameter(description = "专利ID") @PathVariable Integer patentId,
            @Valid @RequestBody PatentRequest request) {
        PatentResponse patent = productService.updatePatent(enterpriseId, patentId, request);
        return Result.success(patent);
    }

    @Operation(summary = "删除企业专利", description = "删除专利")
    @DeleteMapping("/patents/{patentId}")
    public Result<Void> deletePatent(
            @Parameter(description = "企业ID") @PathVariable Integer enterpriseId,
            @Parameter(description = "专利ID") @PathVariable Integer patentId) {
        productService.deletePatent(enterpriseId, patentId);
        return Result.success();
    }
}
