package com.tricenter.aspect;

import com.tricenter.annotation.OpLog;
import com.tricenter.security.LoginUser;
import com.tricenter.service.OperationLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

/**
 * 操作日志 AOP 切面
 * 在标注了 @OpLog 的 Controller 方法成功执行后自动记录日志
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogService operationLogService;

    @AfterReturning(pointcut = "@annotation(com.tricenter.annotation.OpLog)", returning = "result")
    public void afterReturning(JoinPoint joinPoint, Object result) {
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            OpLog opLog = method.getAnnotation(OpLog.class);

            // 获取当前用户
            Integer userId = null;
            String username = null;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof LoginUser loginUser) {
                userId = loginUser.getId();
                username = loginUser.getUsername();
            }

            // 获取 IP 地址
            String ipAddress = getClientIp();

            // 从方法参数中提取 targetId 和 targetName
            String targetId = extractTargetId(joinPoint);
            String targetName = extractTargetName(joinPoint, result);

            // 构建详情
            String detail = opLog.detail().isEmpty()
                    ? buildDefaultDetail(opLog.operation(), opLog.targetType(), targetName)
                    : opLog.detail();

            operationLogService.log(userId, username, opLog.operation(), opLog.targetType(),
                    targetId, targetName, detail, ipAddress);
        } catch (Exception e) {
            log.error("操作日志切面异常", e);
        }
    }

    private String extractTargetId(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();
        if (paramNames != null) {
            for (int i = 0; i < paramNames.length; i++) {
                if ("id".equals(paramNames[i]) || "enterpriseId".equals(paramNames[i])) {
                    return args[i] != null ? args[i].toString() : null;
                }
            }
        }
        return null;
    }

    private String extractTargetName(JoinPoint joinPoint, Object result) {
        // 尝试从返回结果中提取名称
        if (result != null) {
            try {
                Method getNameMethod = result.getClass().getMethod("getName");
                Object name = getNameMethod.invoke(result);
                if (name != null) return name.toString();
            } catch (Exception ignored) {
            }
            // 尝试从 Result.data 中提取
            try {
                Method getDataMethod = result.getClass().getMethod("getData");
                Object data = getDataMethod.invoke(result);
                if (data != null) {
                    Method nameMethod = data.getClass().getMethod("getName");
                    Object name = nameMethod.invoke(data);
                    if (name != null) return name.toString();
                }
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private String buildDefaultDetail(String operation, String targetType, String targetName) {
        String opLabel = switch (operation) {
            case "CREATE" -> "新增";
            case "UPDATE" -> "编辑";
            case "DELETE" -> "删除";
            case "IMPORT" -> "导入";
            case "EXPORT" -> "导出";
            case "STAGE_CHANGE" -> "变更阶段";
            default -> operation;
        };
        String typeLabel = switch (targetType) {
            case "ENTERPRISE" -> "企业";
            case "CONTACT" -> "联系人";
            case "PRODUCT" -> "产品";
            case "FOLLOW_UP" -> "跟进记录";
            default -> targetType;
        };
        String name = targetName != null ? "「" + targetName + "」" : "";
        return opLabel + typeLabel + name;
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String ip = request.getHeader("X-Forwarded-For");
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getHeader("X-Real-IP");
                }
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getRemoteAddr();
                }
                if (ip != null && ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
