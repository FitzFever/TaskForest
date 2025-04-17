/**
 * 树木健康状态相关类型定义
 */
/**
 * 健康状态分类
 */
export var HealthCategory;
(function (HealthCategory) {
    HealthCategory["HEALTHY"] = "HEALTHY";
    HealthCategory["SLIGHTLY_WILTED"] = "SLIGHTLY_WILTED";
    HealthCategory["MODERATELY_WILTED"] = "MODERATELY_WILTED";
    HealthCategory["SEVERELY_WILTED"] = "SEVERELY_WILTED";
})(HealthCategory || (HealthCategory = {}));
/**
 * 健康状态趋势
 */
export var HealthTrend;
(function (HealthTrend) {
    HealthTrend["IMPROVING"] = "IMPROVING";
    HealthTrend["STABLE"] = "STABLE";
    HealthTrend["DECLINING"] = "DECLINING";
    HealthTrend["CRITICAL"] = "CRITICAL";
})(HealthTrend || (HealthTrend = {}));
//# sourceMappingURL=treeHealth.js.map