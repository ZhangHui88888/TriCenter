package com.tricenter.annotation;

import java.lang.annotation.*;

/**
 * 操作日志注解 - 标记在 Controller 方法上自动记录操作日志
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface OpLog {

    /** 操作类型: CREATE/UPDATE/DELETE/IMPORT/EXPORT/STAGE_CHANGE */
    String operation();

    /** 操作对象类型: ENTERPRISE/CONTACT/PRODUCT/FOLLOW_UP */
    String targetType();

    /** 操作描述（支持 SpEL 表达式） */
    String detail() default "";
}
