package com.tricenter.common.result;

import lombok.Data;
import java.util.List;

/**
 * 分页结果
 */
@Data
public class PageResult<T> {
    
    private List<T> list;
    private long total;
    private int page;
    private int pageSize;
    private int pages;

    public static <T> PageResult<T> of(List<T> list, long total, int page, int pageSize) {
        PageResult<T> result = new PageResult<>();
        result.setList(list);
        result.setTotal(total);
        result.setPage(page);
        result.setPageSize(pageSize);
        // pageSize < 1（如 -1 “全部”）时不分页，全部结果算作一页
        result.setPages(pageSize > 0 ? (int) Math.ceil((double) total / pageSize) : 1);
        return result;
    }
}
