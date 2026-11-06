# JC-Club 程序员学习社区

基于 Spring Boot + Spring Cloud 的程序员刷题、练习、模拟面试与技术交流平台。

## 项目简介

JC-Club 是一个面向程序员的在线学习社区，把刷题、专项练习、模拟面试和技术交流整合在同一个系统里，解决学习平台功能分散的问题。

项目采用前后端分离和微服务架构：

- 后端按业务域拆分为网关、认证、题库、练习、面试、圈子、文件存储、微信公众号 8 个 Spring Boot 服务。
- 服务通过 Nacos 完成注册发现和配置管理，由 Spring Cloud Gateway 统一路由，服务间通过 OpenFeign 调用。
- 题库、认证等核心服务采用 DDD 分层，划分为 `api`、`application`、`domain`、`infra`、`starter`、`common`，将业务规则与数据库、缓存、消息队列等技术实现解耦。
- 前端为 React 18 + TypeScript 单页应用。

项目为毕业设计项目，仓库内包含完整的前后端代码、数据库脚本和设计文档。

## 技术栈

### 后端

| 类别 | 技术 |
| --- | --- |
| 开发语言 | Java 8 |
| 基础框架 | Spring Boot 2.4.2 |
| 微服务框架 | Spring Cloud 2020.0.6、Spring Cloud Alibaba 2021.1 |
| 服务注册与配置 | Nacos、Spring Cloud Starter Bootstrap |
| 网关 | Spring Cloud Gateway |
| 服务调用 | OpenFeign、Spring Cloud LoadBalancer |
| 权限认证 | Sa-Token 1.37.0 |
| 持久层 | MyBatis-Plus 3.4.0、Druid 1.1.22 |
| 数据库 | MySQL 8.0 |
| 缓存 | Redis（Lettuce 连接池） |
| 全文检索 | Elasticsearch 7.5.2（RestHighLevelClient） |
| 消息队列 | RocketMQ（rocketmq-spring-boot-starter 2.1.1） |
| 定时任务 | XXL-JOB 2.3.1 |
| 对象存储 | MinIO 8.2.0 |
| 其他工具 | Lombok、MapStruct 1.4.2、FastJSON、Log4j2 |

### 前端

| 类别 | 技术 |
| --- | --- |
| 开发语言 | TypeScript 4.6 |
| UI 框架 | React 18.1、Ant Design 5.9 |
| 构建工具 | Vite 4.5 |
| 状态管理 | Redux Toolkit 1.9、React Redux 8 |
| 路由 | React Router 6.16 |
| 网络请求 | Axios |
| 样式 | Less |
| 富文本与图表 | wangEditor 5、Ant Design Charts |
| 包管理 | pnpm |

### 基础设施

| 组件 | 用途 | 默认端口 |
| --- | --- | --- |
| MySQL | 业务数据存储 | 3306 |
| Redis | 登录态、点赞计数、贡献排行榜、验证码 | 6379 |
| Nacos | 服务注册发现、配置中心 | 8848 |
| Elasticsearch | 题目全文检索 | 9200 |
| RocketMQ | 点赞等异步消息 | 9876 |
| MinIO | 图片和文件存储 | 9000 |
| XXL-JOB | 点赞数据补偿任务 | 8080 |

## 核心功能

### 1. 题库与刷题（jc-club-subject）

- 题库管理：分类、标签、难度维护，支持单选、多选、判断、简答四种题型。
- 在线刷题：按分类和标签筛选题目，分页加载，查看答案与解析，支持上一题、下一题切换。
- 全文检索：题目写入 Elasticsearch，支持按关键词检索题目。
- 题目点赞：点赞状态和计数先写 Redis，再通过 RocketMQ 异步同步到数据库。
- 贡献排行榜：使用 Redis ZSet 统计用户出题数量，生成题目贡献榜。

### 2. 在线练习（jc-club-practice）

- 专项练习：按分类和标签随机组卷，针对薄弱知识点练习。
- 模拟套卷：展示套题列表、未完成练习，支持继续作答。
- 练习记录：保存每次练习及逐题作答明细。
- 练习报告：统计得分和答题情况，输出题目、技能维度的分析结果。

### 3. 模拟面试（jc-club-interview）

- 简历分析：解析 PDF 简历文本，结合题库标签提取技术关键词。
- 题目生成：支持本地题库引擎和阿里百炼大模型引擎，大模型使用通义千问 qwen 生成面试题。
- 答案评分：使用 CompletableFuture 并发调用大模型，返回得分、参考答案和改进建议。
- 面试记录：保存面试历史和逐题作答详情，支持分页查询。

### 4. 技术圈子（jc-club-circle）

- 圈子与动态：发布图文动态，支持评论和回复。
- 内容安全：基于敏感词词库对动态、评论进行过滤。
- 消息通知：通过 WebSocket 推送消息，支持未读消息查询。
- 社区互动：评论回复、消息列表等互动能力。

### 5. 认证与权限（jc-club-auth、jc-club-gateway、jc-club-wx）

- 微信公众号登录：用户关注公众号后发送“验证码”，凭验证码完成登录。
- 会话鉴权：使用 Sa-Token 管理登录态，网关统一做鉴权和路由转发。
- RBAC 权限模型：用户、角色、权限及三张关联表，支持按角色分配权限。
- 用户管理：注册、登录、信息修改、批量查询、退出登录。

### 其他模块

- 文件存储（jc-club-oss）：基于 MinIO 提供图片和文件上传接口。
- 代码生成（jc-club-gen）：基于 MyBatis-Plus 和自定义 Starter 生成基础 CRUD 代码。
- 并行任务工具（asyncTool）：提供任务编排示例，用于并行任务场景。

## 项目结构

```text
jc-club
├─ jc-club-code/                          后端 Maven 工程
│  ├─ jc-club-gateway/                    网关服务，端口 5000
│  ├─ jc-club-auth/                       认证权限服务，端口 3011
│  ├─ jc-club-subject/                    题库刷题服务，端口 3010
│  ├─ jc-club-practice/                   在线练习服务，端口 3013
│  ├─ jc-club-interview/                  模拟面试服务，端口 3015
│  ├─ jc-club-circle/                     社区圈子服务，端口 3014
│  ├─ jc-club-oss/                        对象存储服务，端口 4000
│  ├─ jc-club-wx/                         微信公众号服务，端口 3012
│  ├─ jc-club-common-starter/             公共 Starter
│  ├─ jc-club-gen/                        代码生成器
│  ├─ asyncTool/                          并行任务编排工具
│  └─ doc/                                数据库脚本与设计文档
│     ├─ jc-club-complete.sql             完整建表及初始化数据
│     ├─ jc-club-init.sql                 精简初始化脚本
│     └─ 本选题在国内外的研究状况及发展趋势.md
└─ jc-club-front/                         前端工程（React + Vite）
   ├─ src/views/                          页面
   ├─ src/components/                     公共组件
   ├─ src/router/                         路由
   ├─ src/store/                          Redux 状态管理
   └─ src/utils/                          请求封装等工具
```

核心服务采用 DDD 分层，以 `jc-club-subject` 为例：

```text
jc-club-subject
├─ jc-club-subject-api/          对外接口契约、DTO、请求和响应对象
├─ jc-club-application/          应用层：Controller、MQ 消费者、定时任务入口
├─ jc-club-domain/               领域层：领域对象、领域服务、题型处理器、工厂
├─ jc-club-infra/                基础设施层：Mapper、数据库实体、ES、RPC
├─ jc-club-common/               公共枚举、常量和工具
└─ jc-club-starter/              启动模块和配置装配
```

## 如何运行

### 环境要求

| 软件 | 版本要求 |
| --- | --- |
| JDK | 1.8 |
| Maven | 3.6 及以上 |
| MySQL | 8.0 及以上 |
| Redis | 5.0 及以上 |
| Nacos | 1.4 及以上 |
| Elasticsearch | 7.5.x |
| RocketMQ | 4.9.x |
| MinIO | 任意可用版本 |
| XXL-JOB | 2.3.x，可选 |
| Node.js | 16 及以上 |
| pnpm | 8 及以上 |

模拟面试的大模型能力需要阿里云百炼 API Key；微信公众号登录需要已认证的公众号和可公网访问的回调地址。这两项属于外部依赖，不配置时无法使用对应功能，但不影响题库、练习等主流程。

### 1. 初始化数据库

创建数据库：

```sql
CREATE DATABASE `jc-club` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

导入完整脚本：

```bash
mysql -u root -p jc-club < jc-club-code/doc/jc-club-complete.sql
```

脚本中已包含建表语句和部分题库初始化数据。

### 2. 启动中间件

按以下顺序启动本地依赖：

1. MySQL，创建好 `jc-club` 数据库。
2. Redis，确认网络和密码可用。
3. Nacos，使用单机模式启动。
4. Elasticsearch 7.5.x，单节点即可。
5. RocketMQ NameServer 和 Broker。
6. MinIO，创建用于存储图片的 Bucket。
7. XXL-JOB Admin，可选，用于点赞数据同步任务。

### 3. 修改配置

仓库中的配置是开发环境示例，地址、密码和密钥需要替换为本地环境。主要修改以下内容：

- 各服务 `src/main/resources/bootstrap.yml`：Nacos 的 `server-addr`。
- 各服务 `src/main/resources/application.yml`：MySQL 地址、账号、密码，Redis 地址和密码，Elasticsearch 节点，RocketMQ NameServer，MinIO 地址和密钥。
- 网关 `jc-club-gateway/src/main/resources/application.yml`：Redis 配置，以及各路由的 `lb://` 服务名。
- 数据库密码使用 Druid 加密配置。本地运行时可以改成明文密码，同时删除 `connectionProperties: config.decrypt=true;...` 这一行，或者使用 Druid 的 `ConfigTools` 重新生成密文和 `publicKey`。
- 模拟面试 `AlBLInterviewEngine` 中的 `apiKey` 替换为自己的阿里云百炼 Key。
- 微信公众号 `CallBackController` 中的 `token` 替换为公众号后台配置的 Token。
- 前端 `jc-club-front/.env.development` 中的 `VITE_API_HOST` 改为本地网关地址，例如 `http://localhost:5000`。

网关通过 `lb://服务名` 转发请求，路由中的服务名必须与 Nacos 中注册的 `spring.application.name` 完全一致，启动后请在 Nacos 服务列表确认。

### 4. 构建并启动后端

后端没有统一的根 `pom.xml`，各服务独立构建。`jc-club-subject`、`jc-club-practice`、`jc-club-interview` 等模块依赖 `jc-club-auth-api`，所以先安装认证服务，再构建其他服务：

```bash
cd jc-club-code

mvn -f jc-club-auth/pom.xml clean install -DskipTests
mvn -f jc-club-subject/pom.xml clean install -DskipTests
mvn -f jc-club-practice/pom.xml clean install -DskipTests
mvn -f jc-club-interview/pom.xml clean install -DskipTests
mvn -f jc-club-circle/pom.xml clean install -DskipTests
mvn -f jc-club-gateway/pom.xml clean install -DskipTests
mvn -f jc-club-oss/pom.xml clean install -DskipTests
mvn -f jc-club-wx/pom.xml clean install -DskipTests
```

也可以直接在 IDEA 中分别打开各服务模块，运行对应的启动类：

| 服务 | 启动类 | 端口 |
| --- | --- | --- |
| 认证服务 | `com.jingdianjichi.auth.AuthApplication` | 3011 |
| 题库服务 | `com.jingdianjichi.subject.SubjectApplication` | 3010 |
| 练习服务 | `com.jingdianjichi.practice.server.PracticeApplication` | 3013 |
| 面试服务 | `com.jingdianjichi.interview.server.InterviewApplication` | 3015 |
| 圈子服务 | `com.jingdianjichi.circle.server.CircleApplication` | 3014 |
| 文件服务 | `com.jingdianjichi.oss.OssApplication` | 4000 |
| 公众号服务 | `com.jingdianjichi.wx.WxApplication` | 3012 |
| 网关服务 | `com.jingdianjichi.club.gateway.GatewayApplication` | 5000 |

建议启动顺序：Nacos → 认证服务 → 题库、练习、面试、圈子、文件、公众号服务 → 网关。

使用 Maven 打包时，可执行 Jar 位于对应启动模块的 `target` 目录，例如：

```bash
java -jar jc-club-auth/jc-club-auth-starter/target/jc-club-auth-starter.jar
java -jar jc-club-subject/jc-club-starter/target/jc-club-starter.jar
java -jar jc-club-practice/jc-club-practice-server/target/jc-club-practice-server.jar
java -jar jc-club-interview/jc-club-interview-server/target/jc-club-interview-server.jar
java -jar jc-club-circle/jc-club-circle-server/target/jc-club-circle-server.jar
java -jar jc-club-oss/target/jc-club-oss.jar
java -jar jc-club-wx/target/jc-club-wx.jar
java -jar jc-club-gateway/target/jc-club-gateway.jar
```

### 5. 启动前端

```bash
cd jc-club-front
pnpm install
pnpm dev
```

Vite 默认启动在 `http://localhost:5173`。前端通过 Vite 代理把 `/subject`、`/auth`、`/oss`、`/practice`、`/circle` 请求转发到网关。

### 6. 登录说明

系统默认使用微信公众号验证码登录，登录页会引导用户关注公众号并发送“验证码”。如果没有公众号环境，可以在本地 Redis 的 1 号库写入一条登录码用于调试：

```bash
redis-cli -n 1 SET loginCode.123 test_openid EX 300
```

然后在登录页输入 `123` 即可登录，系统会自动以 `test_openid` 创建用户。

## 本地运行注意事项

- 认证、公众号、网关和圈子服务使用 Redis 的 1 号库，题库服务使用 0 号库，配置时注意保持一致。
- 网关配置中的 Redis 地址需要和其他服务统一，仓库示例中存在不同环境的地址，启动前请检查。
- 点赞链路依赖 RocketMQ，题目点赞后由消费者异步落库；MQ 不可用时点赞会失败或无法落库。
- Elasticsearch 未启动时，题目新增和全文检索会失败，普通分页刷题不受影响。
- 模拟面试和公众号登录依赖外部服务，本地验证主流程时可以先跳过这两个模块。
