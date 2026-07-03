-- ============================================================
-- jc-club 数据库完整建库建表脚本
-- 基于项目实体类扫描 + 原 init.sql 整合修正
-- 生成日期: 2026-06-22
-- MySQL 5.7+ / 8.0+
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 1. 创建数据库
-- ----------------------------
CREATE DATABASE IF NOT EXISTS `jc_club`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_general_ci;

USE `jc_club`;

-- ============================================================
-- 模块一: 认证授权 (auth) — 5 张表
-- ============================================================

-- ----------------------------
-- Table: auth_user (用户信息表)
-- ----------------------------
DROP TABLE IF EXISTS `auth_user`;
CREATE TABLE `auth_user`
(
    `id`           BIGINT(20)   NOT NULL AUTO_INCREMENT COMMENT '主键',
    `user_name`    VARCHAR(32)  DEFAULT NULL COMMENT '用户名称/账号',
    `nick_name`    VARCHAR(32)  DEFAULT NULL COMMENT '昵称',
    `email`        VARCHAR(64)  DEFAULT NULL COMMENT '邮箱',
    `phone`        VARCHAR(32)  DEFAULT NULL COMMENT '手机号',
    `password`     VARCHAR(128) DEFAULT NULL COMMENT '密码',
    `sex`          TINYINT(2)   DEFAULT NULL COMMENT '性别 0未知 1男 2女',
    `avatar`       VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `status`       TINYINT(2)   DEFAULT 0 COMMENT '状态 0启用 1禁用',
    `introduce`    VARCHAR(255) DEFAULT NULL COMMENT '个人介绍',
    `ext_json`     VARCHAR(512) DEFAULT NULL COMMENT '扩展字段(JSON)',
    `created_by`   VARCHAR(32)  DEFAULT NULL COMMENT '创建人(openId)',
    `created_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`    VARCHAR(32)  DEFAULT NULL COMMENT '更新人',
    `update_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`   INT(11)      DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_name` (`user_name`),
    KEY `idx_phone` (`phone`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='用户信息表';

-- ----------------------------
-- Table: auth_role (角色表)
-- ----------------------------
DROP TABLE IF EXISTS `auth_role`;
CREATE TABLE `auth_role`
(
    `id`           BIGINT(20)  NOT NULL AUTO_INCREMENT,
    `role_name`    VARCHAR(32) DEFAULT NULL COMMENT '角色名称',
    `role_key`     VARCHAR(64) DEFAULT NULL COMMENT '角色唯一标识',
    `created_by`   VARCHAR(32) DEFAULT NULL COMMENT '创建人',
    `created_time` DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`    VARCHAR(32) DEFAULT NULL COMMENT '更新人',
    `update_time`  DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`   INT(11)     DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_key` (`role_key`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='角色表';

-- ----------------------------
-- Table: auth_permission (权限表)
-- ----------------------------
DROP TABLE IF EXISTS `auth_permission`;
CREATE TABLE `auth_permission`
(
    `id`             BIGINT(20)   NOT NULL AUTO_INCREMENT,
    `name`           VARCHAR(64)  DEFAULT NULL COMMENT '权限名称',
    `parent_id`      BIGINT(20)   DEFAULT 0 COMMENT '父级ID',
    `type`           TINYINT(4)   DEFAULT NULL COMMENT '权限类型 0菜单 1操作',
    `menu_url`       VARCHAR(255) DEFAULT NULL COMMENT '菜单路由',
    `status`         TINYINT(2)   DEFAULT 0 COMMENT '状态 0启用 1禁用',
    `show`           TINYINT(2)   DEFAULT 0 COMMENT '展示状态 0展示 1隐藏',
    `icon`           VARCHAR(128) DEFAULT NULL COMMENT '图标',
    `permission_key` VARCHAR(64)  DEFAULT NULL COMMENT '权限唯一标识',
    `created_by`     VARCHAR(32)  DEFAULT NULL COMMENT '创建人',
    `created_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`      VARCHAR(32)  DEFAULT NULL COMMENT '更新人',
    `update_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`     INT(11)      DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_permission_key` (`permission_key`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='权限表';

-- ----------------------------
-- Table: auth_user_role (用户角色关联表)
-- ----------------------------
DROP TABLE IF EXISTS `auth_user_role`;
CREATE TABLE `auth_user_role`
(
    `id`           BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `user_id`      BIGINT(20) DEFAULT NULL COMMENT '用户ID',
    `role_id`      BIGINT(20) DEFAULT NULL COMMENT '角色ID',
    `created_by`   VARCHAR(32) DEFAULT NULL COMMENT '创建人',
    `created_time` DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`    VARCHAR(32) DEFAULT NULL COMMENT '更新人',
    `update_time`  DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`   INT(11)     DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_role_id` (`role_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='用户角色关联表';

-- ----------------------------
-- Table: auth_role_permission (角色权限关联表)
-- ----------------------------
DROP TABLE IF EXISTS `auth_role_permission`;
CREATE TABLE `auth_role_permission`
(
    `id`            BIGINT(20) NOT NULL AUTO_INCREMENT,
    `role_id`       BIGINT(20) DEFAULT NULL COMMENT '角色ID',
    `permission_id` BIGINT(20) DEFAULT NULL COMMENT '权限ID',
    `created_by`    VARCHAR(32) DEFAULT NULL COMMENT '创建人',
    `created_time`  DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`     VARCHAR(32) DEFAULT NULL COMMENT '更新人',
    `update_time`   DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`    INT(11)     DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_role_id` (`role_id`),
    KEY `idx_permission_id` (`permission_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='角色权限关联表';

-- ============================================================
-- 模块二: 题目/科目 (subject) — 9 张表
-- ============================================================

-- ----------------------------
-- Table: subject_category (题目分类表)
-- ----------------------------
DROP TABLE IF EXISTS `subject_category`;
CREATE TABLE `subject_category`
(
    `id`            BIGINT(20)  NOT NULL AUTO_INCREMENT COMMENT '主键',
    `category_name` VARCHAR(32) DEFAULT NULL COMMENT '分类名称',
    `category_type` TINYINT(2)  DEFAULT NULL COMMENT '分类类型 1大类 2小类',
    `image_url`     VARCHAR(255) DEFAULT NULL COMMENT '图标链接',
    `parent_id`     BIGINT(20)  DEFAULT 0 COMMENT '父级ID',
    `created_by`    VARCHAR(32) DEFAULT NULL COMMENT '创建人',
    `created_time`  DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`     VARCHAR(32) DEFAULT NULL COMMENT '更新人',
    `update_time`   DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`    TINYINT(1)  DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='题目分类表';

-- ----------------------------
-- Table: subject_label (题目标签表)
-- 注意: category_id 在原SQL中是 VARCHAR(50), 但实体类为 Long,
--       此处修正为 BIGINT(20) 以与实体匹配
-- ----------------------------
DROP TABLE IF EXISTS `subject_label`;
CREATE TABLE `subject_label`
(
    `id`           BIGINT(20)  NOT NULL AUTO_INCREMENT COMMENT '主键',
    `label_name`   VARCHAR(64) DEFAULT NULL COMMENT '标签名称',
    `sort_num`     INT(11)     DEFAULT 0 COMMENT '排序号',
    `category_id`  BIGINT(20)  DEFAULT NULL COMMENT '所属分类ID',
    `created_by`   VARCHAR(32) DEFAULT NULL COMMENT '创建人',
    `created_time` DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`    VARCHAR(32) DEFAULT NULL COMMENT '更新人',
    `update_time`  DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`   INT(11)     DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_category_id` (`category_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='题目标签表';

-- ----------------------------
-- Table: subject_info (题目信息表)
-- 注意: 相比原SQL新增了 subject_count 字段
-- ----------------------------
DROP TABLE IF EXISTS `subject_info`;
CREATE TABLE `subject_info`
(
    `id`                BIGINT(20)   NOT NULL AUTO_INCREMENT COMMENT '主键',
    `subject_name`      VARCHAR(256) DEFAULT NULL COMMENT '题目名称',
    `subject_difficult` TINYINT(4)   DEFAULT 1 COMMENT '题目难度 1简单 2中等 3困难',
    `settle_name`       VARCHAR(32)  DEFAULT NULL COMMENT '出题人名',
    `subject_type`      TINYINT(4)   DEFAULT NULL COMMENT '题目类型 1单选 2多选 3判断 4简答',
    `subject_score`     TINYINT(4)   DEFAULT 1 COMMENT '题目分数',
    `subject_parse`     VARCHAR(1024) DEFAULT NULL COMMENT '题目解析',
    `subject_count`     INT(11)      DEFAULT 0 COMMENT '答题次数',
    `created_by`        VARCHAR(32)  DEFAULT NULL COMMENT '创建人',
    `created_time`      DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`         VARCHAR(32)  DEFAULT NULL COMMENT '修改人',
    `update_time`       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `is_deleted`        INT(11)      DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_subject_type` (`subject_type`),
    KEY `idx_subject_difficult` (`subject_difficult`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='题目信息表';

-- ----------------------------
-- Table: subject_brief (简答题答案表)
-- ----------------------------
DROP TABLE IF EXISTS `subject_brief`;
CREATE TABLE `subject_brief`
(
    `id`             BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `subject_id`     BIGINT(20) DEFAULT NULL COMMENT '题目ID',
    `subject_answer` MEDIUMTEXT COMMENT '题目答案(富文本)',
    `created_by`     VARCHAR(32) DEFAULT NULL COMMENT '创建人',
    `created_time`   DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`      VARCHAR(32) DEFAULT NULL COMMENT '更新人',
    `update_time`    DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`     INT(11)     DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_subject_id` (`subject_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='简答题答案表';

-- ----------------------------
-- Table: subject_radio (单选题选项表)
-- ----------------------------
DROP TABLE IF EXISTS `subject_radio`;
CREATE TABLE `subject_radio`
(
    `id`             BIGINT(20)   NOT NULL AUTO_INCREMENT COMMENT '主键',
    `subject_id`     BIGINT(20)   DEFAULT NULL COMMENT '题目ID',
    `option_type`    TINYINT(4)   DEFAULT NULL COMMENT '选项标识 1=A 2=B 3=C 4=D',
    `option_content` VARCHAR(256) DEFAULT NULL COMMENT '选项内容',
    `is_correct`     TINYINT(2)   DEFAULT 0 COMMENT '是否正确答案 0否 1是',
    `created_by`     VARCHAR(32)  DEFAULT NULL COMMENT '创建人',
    `created_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`      VARCHAR(32)  DEFAULT NULL COMMENT '修改人',
    `update_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `is_deleted`     INT(11)      DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_subject_id` (`subject_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='单选题选项表';

-- ----------------------------
-- Table: subject_multiple (多选题选项表)
-- ----------------------------
DROP TABLE IF EXISTS `subject_multiple`;
CREATE TABLE `subject_multiple`
(
    `id`             BIGINT(20)   NOT NULL AUTO_INCREMENT COMMENT '主键',
    `subject_id`     BIGINT(20)   DEFAULT NULL COMMENT '题目ID',
    `option_type`    BIGINT(4)    DEFAULT NULL COMMENT '选项标识',
    `option_content` VARCHAR(256) DEFAULT NULL COMMENT '选项内容',
    `is_correct`     TINYINT(2)   DEFAULT 0 COMMENT '是否正确答案 0否 1是',
    `created_by`     VARCHAR(32)  DEFAULT NULL COMMENT '创建人',
    `created_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`      VARCHAR(32)  DEFAULT NULL COMMENT '更新人',
    `update_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`     INT(11)      DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_subject_id` (`subject_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='多选题选项表';

-- ----------------------------
-- Table: subject_judge (判断题答案表)
-- ----------------------------
DROP TABLE IF EXISTS `subject_judge`;
CREATE TABLE `subject_judge`
(
    `id`           BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `subject_id`   BIGINT(20) DEFAULT NULL COMMENT '题目ID',
    `is_correct`   TINYINT(2) DEFAULT NULL COMMENT '是否正确 0错 1对',
    `created_by`   VARCHAR(32) DEFAULT NULL COMMENT '创建人',
    `created_time` DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`    VARCHAR(32) DEFAULT NULL COMMENT '更新人',
    `update_time`  DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`   INT(11)     DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_subject_id` (`subject_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='判断题答案表';

-- ----------------------------
-- Table: subject_mapping (题目-分类-标签关联表)
-- ----------------------------
DROP TABLE IF EXISTS `subject_mapping`;
CREATE TABLE `subject_mapping`
(
    `id`           BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `subject_id`   BIGINT(20) DEFAULT NULL COMMENT '题目ID',
    `category_id`  BIGINT(20) DEFAULT NULL COMMENT '分类ID',
    `label_id`     BIGINT(20) DEFAULT NULL COMMENT '标签ID',
    `created_by`   VARCHAR(32) DEFAULT NULL COMMENT '创建人',
    `created_time` DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`    VARCHAR(32) DEFAULT NULL COMMENT '修改人',
    `update_time`  DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `is_deleted`   INT(11)     DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_subject_id` (`subject_id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_label_id` (`label_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='题目分类标签关联表';

-- ----------------------------
-- Table: subject_liked (题目点赞表)
-- ----------------------------
DROP TABLE IF EXISTS `subject_liked`;
CREATE TABLE `subject_liked`
(
    `id`           BIGINT(20)  NOT NULL AUTO_INCREMENT COMMENT '主键',
    `subject_id`   BIGINT(20)  DEFAULT NULL COMMENT '题目ID',
    `like_user_id` VARCHAR(32) DEFAULT NULL COMMENT '点赞人ID',
    `status`       INT(11)     DEFAULT 1 COMMENT '点赞状态 1点赞 0取消点赞',
    `created_by`   VARCHAR(32) DEFAULT NULL COMMENT '创建人',
    `created_time` DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`    VARCHAR(32) DEFAULT NULL COMMENT '修改人',
    `update_time`  DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `is_deleted`   INT(11)     DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_subject_user` (`subject_id`, `like_user_id`) COMMENT '题目+用户唯一索引: 防止重复点赞'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='题目点赞表';

-- ============================================================
-- 模块三: 圈子/动态 (circle/share) — 5 张表
-- ============================================================

-- ----------------------------
-- Table: share_circle (圈子信息表)
-- ----------------------------
DROP TABLE IF EXISTS `share_circle`;
CREATE TABLE `share_circle`
(
    `id`           BIGINT(20)  NOT NULL AUTO_INCREMENT COMMENT '圈子ID',
    `parent_id`    BIGINT(20)  NOT NULL DEFAULT 0 COMMENT '父级ID, 0为大类',
    `circle_name`  VARCHAR(32) NOT NULL COMMENT '圈子名称',
    `icon`         VARCHAR(255) DEFAULT NULL COMMENT '圈子图标',
    `created_by`   VARCHAR(32)  DEFAULT NULL COMMENT '创建人',
    `created_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`    VARCHAR(32)  DEFAULT NULL COMMENT '更新人',
    `update_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`   INT(11)      DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='圈子信息表';

-- ----------------------------
-- Table: share_moment (动态信息表)
-- ----------------------------
DROP TABLE IF EXISTS `share_moment`;
CREATE TABLE `share_moment`
(
    `id`           BIGINT(20)    NOT NULL AUTO_INCREMENT COMMENT '动态ID',
    `circle_id`    BIGINT(20)    NOT NULL COMMENT '圈子ID',
    `content`      VARCHAR(2048) DEFAULT NULL COMMENT '动态内容',
    `pic_urls`     VARCHAR(2048) DEFAULT NULL COMMENT '图片URL列表(JSON数组)',
    `reply_count`  INT(11)       NOT NULL DEFAULT 0 COMMENT '回复数',
    `created_by`   VARCHAR(32)   DEFAULT NULL COMMENT '创建人',
    `created_time` DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`    VARCHAR(32)   DEFAULT NULL COMMENT '更新人',
    `update_time`  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`   INT(11)       DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_circle_id` (`circle_id`),
    KEY `idx_created_by` (`created_by`),
    KEY `idx_created_time` (`created_time`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='动态信息表';

-- ----------------------------
-- Table: share_comment_reply (评论及回复表)
-- ----------------------------
DROP TABLE IF EXISTS `share_comment_reply`;
CREATE TABLE `share_comment_reply`
(
    `id`             BIGINT(20)    NOT NULL AUTO_INCREMENT COMMENT '评论ID',
    `moment_id`      BIGINT(20)    NOT NULL COMMENT '关联动态ID',
    `reply_type`     INT(11)       NOT NULL COMMENT '回复类型 1评论 2回复',
    `to_id`          BIGINT(20)    DEFAULT NULL COMMENT '评论目标ID',
    `to_user`        VARCHAR(32)   DEFAULT NULL COMMENT '被评论人',
    `to_user_author` INT(11)       DEFAULT 0 COMMENT '被评论人是否作者 1=是 0=否',
    `reply_id`       BIGINT(20)    DEFAULT NULL COMMENT '回复目标ID',
    `reply_user`     VARCHAR(32)   DEFAULT NULL COMMENT '回复人',
    `replay_author`  INT(11)       DEFAULT 0 COMMENT '回复人是否作者 1=是 0=否',
    `content`        VARCHAR(1024) DEFAULT NULL COMMENT '评论/回复内容',
    `pic_urls`       VARCHAR(2048) DEFAULT NULL COMMENT '图片URL列表',
    `parent_id`      BIGINT(20)    DEFAULT 0 COMMENT '父评论ID(嵌套回复)',
    `created_by`     VARCHAR(32)   DEFAULT NULL COMMENT '创建人',
    `created_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`      VARCHAR(32)   DEFAULT NULL COMMENT '更新人',
    `update_time`    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`     INT(11)       DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_moment_id` (`moment_id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='评论及回复信息表';

-- ----------------------------
-- Table: share_message (消息通知表)
-- ----------------------------
DROP TABLE IF EXISTS `share_message`;
CREATE TABLE `share_message`
(
    `id`           BIGINT(20)   NOT NULL AUTO_INCREMENT COMMENT '主键',
    `from_id`      VARCHAR(32)  NOT NULL COMMENT '发送人ID',
    `to_id`        VARCHAR(32)  NOT NULL COMMENT '接收人ID',
    `content`      VARCHAR(512) DEFAULT NULL COMMENT '消息内容',
    `is_read`      INT(11)      DEFAULT 0 COMMENT '是否已读 0未读 1已读',
    `created_by`   VARCHAR(32)  DEFAULT NULL COMMENT '创建人',
    `created_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`    VARCHAR(32)  DEFAULT NULL COMMENT '更新人',
    `update_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`   INT(11)      DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_to_id` (`to_id`),
    KEY `idx_from_id` (`from_id`),
    KEY `idx_is_read` (`is_read`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='消息通知表';

-- ----------------------------
-- Table: sensitive_words (敏感词表)
-- ----------------------------
DROP TABLE IF EXISTS `sensitive_words`;
CREATE TABLE `sensitive_words`
(
    `id`         BIGINT(20)    NOT NULL AUTO_INCREMENT COMMENT '主键',
    `words`      VARCHAR(1024) DEFAULT NULL COMMENT '敏感词内容',
    `type`       INT(11)       DEFAULT 0 COMMENT '类型 1=黑名单 2=白名单',
    `is_deleted` INT(11)       DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='敏感词表';

-- ============================================================
-- 模块四: 练习/刷题 (practice) — 4 张表
-- ============================================================

-- ----------------------------
-- Table: practice_set (套题信息表)
-- ----------------------------
DROP TABLE IF EXISTS `practice_set`;
CREATE TABLE `practice_set`
(
    `id`                  BIGINT(20)   NOT NULL AUTO_INCREMENT COMMENT '主键',
    `set_name`            VARCHAR(255) DEFAULT NULL COMMENT '套题名称',
    `set_type`            INT(11)      DEFAULT NULL COMMENT '套题类型 1实时生成 2预设套题',
    `set_heat`            INT(11)      DEFAULT 0 COMMENT '热度',
    `set_desc`            VARCHAR(512) DEFAULT NULL COMMENT '套题描述',
    `primary_category_id` BIGINT(20)   DEFAULT NULL COMMENT '大类ID',
    `created_by`          VARCHAR(32)  DEFAULT NULL COMMENT '创建人',
    `created_time`        DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`           VARCHAR(32)  DEFAULT NULL COMMENT '更新人',
    `update_time`         DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`          INT(11)      DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_primary_category_id` (`primary_category_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='套题信息表';

-- ----------------------------
-- Table: practice_set_detail (套题内容明细表)
-- ----------------------------
DROP TABLE IF EXISTS `practice_set_detail`;
CREATE TABLE `practice_set_detail`
(
    `id`           BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `set_id`       BIGINT(20) NOT NULL COMMENT '套题ID',
    `subject_id`   BIGINT(20) DEFAULT NULL COMMENT '题目ID',
    `subject_type` INT(11)    DEFAULT NULL COMMENT '题目类型 1单选 2多选 3判断 4简答',
    `created_by`   VARCHAR(32) DEFAULT NULL COMMENT '创建人',
    `created_time` DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`    VARCHAR(32) DEFAULT NULL COMMENT '更新人',
    `update_time`  DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`   INT(11)     DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_set_id` (`set_id`),
    KEY `idx_subject_id` (`subject_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='套题内容明细表';

-- ----------------------------
-- Table: practice_info (练习记录表)
-- ----------------------------
DROP TABLE IF EXISTS `practice_info`;
CREATE TABLE `practice_info`
(
    `id`              BIGINT(20)     NOT NULL AUTO_INCREMENT COMMENT '主键',
    `set_id`          BIGINT(20)     DEFAULT NULL COMMENT '套题ID',
    `complete_status` INT(11)        DEFAULT 0 COMMENT '完成状态 0未完成 1已完成',
    `time_use`        VARCHAR(32)    DEFAULT NULL COMMENT '用时(如: 15m30s)',
    `submit_time`     DATETIME       DEFAULT NULL COMMENT '交卷时间',
    `correct_rate`    DECIMAL(10, 2) DEFAULT NULL COMMENT '正确率(百分比)',
    `created_by`      VARCHAR(32)    DEFAULT NULL COMMENT '创建人/答题人',
    `created_time`    DATETIME       DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`       VARCHAR(32)    DEFAULT NULL COMMENT '更新人',
    `update_time`     DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`      INT(11)        DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_created_by` (`created_by`),
    KEY `idx_set_id` (`set_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='练习记录表';

-- ----------------------------
-- Table: practice_detail (练习答题明细表)
-- ----------------------------
DROP TABLE IF EXISTS `practice_detail`;
CREATE TABLE `practice_detail`
(
    `id`             BIGINT(20)   NOT NULL AUTO_INCREMENT COMMENT '主键',
    `practice_id`    BIGINT(20)   DEFAULT NULL COMMENT '练习记录ID (关联 practice_info.id)',
    `subject_id`     BIGINT(20)   DEFAULT NULL COMMENT '题目ID',
    `subject_type`   INT(11)      DEFAULT NULL COMMENT '题目类型 1单选 2多选 3判断 4简答',
    `answer_status`  INT(11)      DEFAULT NULL COMMENT '回答状态 0未答 1正确 2错误',
    `answer_content` VARCHAR(512) DEFAULT NULL COMMENT '回答内容',
    `created_by`     VARCHAR(32)  DEFAULT NULL COMMENT '创建人',
    `created_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`      VARCHAR(32)  DEFAULT NULL COMMENT '更新人',
    `update_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`     INT(11)      DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_practice_id` (`practice_id`),
    KEY `idx_subject_id` (`subject_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='练习答题明细表';

-- ============================================================
-- 模块五: AI 面试 (interview) — 2 张表 【新增】
-- 原 init.sql 中缺失, 根据实体类 InterviewHistory /
-- InterviewQuestionHistory 补充
-- ============================================================

-- ----------------------------
-- Table: interview_history (面试记录表)
-- ----------------------------
DROP TABLE IF EXISTS `interview_history`;
CREATE TABLE `interview_history`
(
    `id`            BIGINT(20)    NOT NULL AUTO_INCREMENT COMMENT '主键',
    `avg_score`     DOUBLE        DEFAULT 0 COMMENT '平均得分',
    `key_words`     VARCHAR(512)  DEFAULT NULL COMMENT '关键词/标签(逗号分隔)',
    `tip`           VARCHAR(1024) DEFAULT NULL COMMENT '面试评语/建议',
    `interview_url` VARCHAR(512)  DEFAULT NULL COMMENT '面试录音/回放URL',
    `created_by`    VARCHAR(32)   DEFAULT NULL COMMENT '创建人',
    `created_time`  DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`     VARCHAR(32)   DEFAULT NULL COMMENT '更新人',
    `update_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`    INT(11)       DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_created_by` (`created_by`),
    KEY `idx_created_time` (`created_time`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='AI面试记录表';

-- ----------------------------
-- Table: interview_question_history (面试题目明细表)
-- ----------------------------
DROP TABLE IF EXISTS `interview_question_history`;
CREATE TABLE `interview_question_history`
(
    `id`           BIGINT(20)    NOT NULL AUTO_INCREMENT COMMENT '主键',
    `interview_id` BIGINT(20)    DEFAULT NULL COMMENT '面试记录ID (关联 interview_history.id)',
    `score`        DOUBLE        DEFAULT 0 COMMENT '该题得分',
    `key_words`    VARCHAR(512)  DEFAULT NULL COMMENT '该题关键词',
    `question`     VARCHAR(2048) DEFAULT NULL COMMENT '面试问题',
    `answer`       MEDIUMTEXT    DEFAULT NULL COMMENT '标准答案',
    `user_answer`  MEDIUMTEXT    DEFAULT NULL COMMENT '用户回答',
    `created_by`   VARCHAR(32)   DEFAULT NULL COMMENT '创建人',
    `created_time` DATETIME      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_by`    VARCHAR(32)   DEFAULT NULL COMMENT '更新人',
    `update_time`  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`   INT(11)       DEFAULT 0 COMMENT '是否删除 0未删除 1已删除',
    PRIMARY KEY (`id`),
    KEY `idx_interview_id` (`interview_id`),
    KEY `idx_created_by` (`created_by`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='AI面试题目明细表';

-- ============================================================
-- 初始种子数据
-- ============================================================

-- ----------------------------
-- auth_role 初始数据
-- ----------------------------
INSERT INTO `auth_role` (`id`, `role_name`, `role_key`, `created_by`, `created_time`)
VALUES (1, '管理员', 'admin_user', 'system', NOW()),
       (2, '普通用户', 'normal_user', 'system', NOW());

-- ----------------------------
-- auth_permission 初始数据
-- ----------------------------
INSERT INTO `auth_permission` (`id`, `name`, `parent_id`, `type`, `menu_url`, `status`, `show`, `icon`,
                               `permission_key`, `created_by`, `created_time`)
VALUES (1, '新增题目', 0, 1, '/subject/add', 0, 0, 'http://1.png', 'subject:add', 'system', NOW());

-- ----------------------------
-- subject_category 初始数据
-- ----------------------------
INSERT INTO `subject_category` (`id`, `category_name`, `category_type`, `image_url`, `parent_id`, `created_by`,
                                `created_time`)
VALUES (1, '后端', 1, 'https://image/category.icon', 0, 'system', NOW()),
       (2, '缓存', 2, 'https://image/category.icon', 1, 'system', NOW());

-- ----------------------------
-- subject_label 初始数据
-- ----------------------------
INSERT INTO `subject_label` (`id`, `label_name`, `sort_num`, `category_id`, `created_by`, `created_time`)
VALUES (1, 'Redis', 1, 1, 'system', NOW()),
       (44, '数据一致性', 1, 1, 'system', NOW());

-- ============================================================
-- 完成
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;
