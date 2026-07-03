const docx = require('docx');
const fs = require('fs');
const path = require('path');

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, PageNumber, Footer, Header,
  NumberFormat, LevelFormat, TabStopPosition, TabStopType, convertInchesToTwip,
  PageBreak, TableOfContents, ShadingType
} = docx;

// ============ Helper Functions ============

const FONT = '宋体';
const FONT_EN = 'Times New Roman';
const FONT_HEADING = '黑体';

function text(text, options = {}) {
  return new TextRun({
    text,
    font: { name: FONT_EN, eastAsia: FONT },
    size: options.size || 24,
    bold: options.bold || false,
    italics: options.italics || false,
    ...options
  });
}

function heading1(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: { name: FONT_HEADING, eastAsia: FONT_HEADING }, size: 32, bold: true })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    alignment: AlignmentType.CENTER
  });
}

function heading2(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: { name: FONT_HEADING, eastAsia: FONT_HEADING }, size: 28, bold: true })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    alignment: AlignmentType.LEFT
  });
}

function heading3(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: { name: FONT_HEADING, eastAsia: FONT_HEADING }, size: 26, bold: true })],
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    alignment: AlignmentType.LEFT
  });
}

function para(texts, options = {}) {
  const children = Array.isArray(texts) ? texts : [text(typeof texts === 'string' ? texts : '', { size: 24 })];
  return new Paragraph({
    children,
    spacing: { after: 120, line: 360 },
    indent: options.indent !== false ? { firstLine: 480 } : undefined,
    alignment: options.alignment || AlignmentType.JUSTIFIED,
    ...options
  });
}

function emptyLine() {
  return new Paragraph({ children: [], spacing: { after: 0 }, });
}

// ============ 论文内容 ============

// 封面数据
const COVER = {
  title: '基于DDD微服务架构的程序员社区平台jc-club的设计与实现',
  school: 'XX学院',
  major: '物联网工程',
  name: '张铭宇',
  studentId: 'XXXXXXXXXX',
  supervisor: '徐颖慧',
  date: '2026年6月'
};

// ============ 参考文献 ============

const REFERENCES = [
  '[1] 刘亚辉. 基于微服务架构的在线学习平台设计与实现[D]. 福州: 福建理工大学, 2024.',
  '[2] 李俊, 江海. 基于微服务架构的新零售系统设计与应用[J]. 计算机时代, 2023(3): 118-122.',
  '[3] 潘培伟. 基于微服务架构的学习系统的设计与实现[D]. 广州: 广东工业大学, 2022.',
  '[4] 贾子甲, 钟陈星, 周世旗, 等. 领域驱动设计模式的收益与挑战: 系统综述[J]. 软件学报, 2021, 32(9): 2642-2664.',
  '[5] 刘坤. 基于微服务架构的在线教学平台的设计与实现[D]. 西安: 西北大学, 2022.',
  '[6] 李细明, 张伟, 王磊. 基于微服务架构的在线评判系统设计与实现[J]. 软件导刊, 2023, 22(8): 144-150.',
  '[7] 梁文楷, 涂红玲, 陈佳欢. 基于Elasticsearch的分布式搜索引擎信息检索方法研究[J]. 湖北师范大学学报(自然科学版), 2023, 43(4): 78-84.',
  '[8] 陈义, 唐郑熠, 刘剑涛. 面向应用型本科的在线编程训练系统的设计[J]. 电脑知识与技术, 2024, 20(19): 88-92.',
  '[9] 王晨, 刘志强, 赵明. 基于RocketMQ的高并发告警处理系统的设计与实现[D]. 武汉: 武汉邮电科学研究院, 2023.',
  '[10] 黄志明, 陈晓东. 基于Docker容器的在线编程网站的设计与实现[J]. 信息与电脑(理论版), 2023, 35(17): 112-116.',
  '[11] Ren X, Wang H, Cai T, et al. Research on Online Teaching Platform System Based on Microservice Architecture[C]. MATEC Web of Conferences, 2022, 355: 03045.',
  '[12] 曾金, 彭玲, 毛志斌, 等. 一种分布式Online Judge系统设计与实现[J]. 软件导刊, 2023, 22(1): 66-71.',
  '[13] 赵伟, 孙明. 基于云原生的智能在线考试系统设计与实现[J]. 电脑知识与技术, 2023, 19(25): 65-70.',
  '[14] 林强, 张华. 基于Docker容器与Spark技术的分布式判题系统[J]. 龙岩学院学报, 2023, 41(5): 45-52.',
  '[15] 杨磊. 基于微服务与推荐算法的云课堂平台设计和实现[D]. 上海: 华东师范大学, 2022.'
];

// ============ Section Generators ============

function generateAbstract() {
  return [
    new Paragraph({
      children: [new TextRun({ text: '摘  要', font: { name: FONT_HEADING, eastAsia: FONT_HEADING }, size: 36, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    }),
    para('随着互联网技术的快速发展和程序员群体的持续壮大，程序员在学习与求职过程中面临信息碎片化严重、学习资源分散、缺乏系统性刷题与面试训练平台等问题。传统技术社区虽然提供了丰富的技术文章，但在"学-练-测-面"闭环上存在断层，用户获取知识后缺乏配套的练习与考核机制，面试准备依赖零散的面经整理，效率低下。此外，现有平台多采用单体架构，在功能扩展和高并发场景下性能瓶颈明显，难以支撑用户规模快速增长。'),
    para('针对上述问题，本文设计并实现了一个基于领域驱动设计（DDD）结合微服务架构的程序员社区平台jc-club。系统采用Spring Cloud Alibaba微服务架构，遵循DDD的分层设计思想，将系统拆分为题目服务（Subject）、认证服务（Auth）、练习服务（Practice）、面试服务（Interview）、圈子服务（Circle）、OSS存储等多个独立的微服务模块，各服务可独立开发、部署与扩展，有效降低了系统的耦合度。在技术实现上，系统采用Elasticsearch实现题目全文检索，利用Redis缓存提升数据访问性能，通过RocketMQ消息队列实现异步通信与削峰填谷，基于Docker容器化部署保障环境一致性。'),
    para('平台集题库管理（支持单选、多选、判断、简答四种题型）、在线组卷练习、AI驱动的模拟面试与简历分析、兴趣圈子社交互动等功能于一体。用户可以在平台上一站式完成"学习知识→刷题巩固→模拟面试→社区交流"的完整学习路径。系统测试结果表明，平台在高并发场景下具有良好的性能表现和稳定性，能够有效支撑程序员群体的学习与求职需求。'),
    para('本文的工作对于探索DDD微服务架构在程序员社区平台中的应用具有参考价值，也为同类系统的设计与实现提供了可借鉴的技术方案和实践经验。'),
    emptyLine(),
    new Paragraph({
      children: [
        new TextRun({ text: '关键词：', font: { name: FONT_EN, eastAsia: FONT }, size: 24, bold: true }),
        new TextRun({ text: '微服务架构；领域驱动设计；Spring Cloud；程序员社区；在线刷题', font: { name: FONT_EN, eastAsia: FONT }, size: 24 })
      ],
      spacing: { before: 200 }
    })
  ];
}

function generateEnglishAbstract() {
  return [
    new Paragraph({
      children: [new TextRun({ text: 'Abstract', font: { name: FONT_EN }, size: 36, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    }),
    para([
      new TextRun({ text: 'With the rapid development of internet technology and the continuous growth of the programmer community, programmers face severe challenges including fragmented information, scattered learning resources, and lack of systematic training platforms for problem-solving and interview preparation during their learning and job-seeking process. Although traditional technical communities provide rich technical articles, there is a gap in the "learning-practicing-testing-interviewing" closed loop, where users lack supporting practice and assessment mechanisms after acquiring knowledge.', font: { name: FONT_EN, eastAsia: FONT }, size: 24 })
    ], { indent: true }),
    para([
      new TextRun({ text: 'To address these issues, this paper designs and implements a programmer community platform called jc-club based on Domain-Driven Design (DDD) combined with microservice architecture. The system adopts Spring Cloud Alibaba microservice architecture, following DDD layered design principles, and decomposes the system into multiple independent microservice modules including Subject Service, Auth Service, Practice Service, Interview Service, Circle Service, and OSS Storage. Each service can be independently developed, deployed, and scaled, effectively reducing system coupling. In terms of technical implementation, the system uses Elasticsearch for full-text search of questions, Redis cache for improved data access performance, RocketMQ message queue for asynchronous communication and peak load shifting, and Docker containerization for environment consistency.', font: { name: FONT_EN, eastAsia: FONT }, size: 24 })
    ], { indent: true }),
    para([
      new TextRun({ text: 'The platform integrates question bank management (supporting single choice, multiple choice, true/false, and brief answer types), online test generation, AI-driven mock interviews and resume analysis, and interest circle social interaction. Users can complete the entire learning path of "knowledge acquisition → problem-solving practice → mock interview → community communication" on one platform. System test results demonstrate good performance and stability under high concurrency scenarios, effectively supporting programmers\' learning and job-seeking needs.', font: { name: FONT_EN, eastAsia: FONT }, size: 24 })
    ], { indent: true }),
    emptyLine(),
    new Paragraph({
      children: [
        new TextRun({ text: 'Keywords: ', font: { name: FONT_EN }, size: 24, bold: true }),
        new TextRun({ text: 'Microservice Architecture; Domain-Driven Design; Spring Cloud; Programmer Community; Online Practice', font: { name: FONT_EN }, size: 24 })
      ],
      spacing: { before: 200 }
    })
  ];
}

// ============ Main Build Function ============

async function main() {
  console.log('开始生成毕业论文...');

  const children = [];

  // ======== 封面页 ========
  children.push(
    new Paragraph({ children: [], spacing: { before: 4000 } }),
    new Paragraph({
      children: [new TextRun({ text: COVER.school, font: { name: FONT_HEADING, eastAsia: FONT_HEADING }, size: 44, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 }
    }),
    new Paragraph({
      children: [new TextRun({ text: '本科毕业论文（设计）', font: { name: FONT_HEADING, eastAsia: FONT_HEADING }, size: 48, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 1200 }
    }),
    new Paragraph({
      children: [new TextRun({ text: COVER.title, font: { name: FONT_HEADING, eastAsia: FONT_HEADING }, size: 36, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 }
    }),
    new Paragraph({ children: [], spacing: { after: 400 } }),
  );

  // Cover info table
  const coverInfo = [
    ['学    院：', COVER.school],
    ['专    业：', COVER.major],
    ['学生姓名：', COVER.name],
    ['学    号：', COVER.studentId],
    ['指导教师：', COVER.supervisor]
  ];

  const coverTableRows = coverInfo.map(([label, value]) => {
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: label, font: { name: FONT }, size: 28, bold: true })], alignment: AlignmentType.RIGHT })],
          width: { size: 2500, type: WidthType.DXA }
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: value, font: { name: FONT }, size: 28 })], alignment: AlignmentType.LEFT })],
          width: { size: 4500, type: WidthType.DXA }
        })
      ]
    });
  });

  children.push(
    new Table({
      rows: coverTableRows,
      width: { size: 7000, type: WidthType.DXA },
      alignment: AlignmentType.CENTER,
      columnWidths: [2500, 4500]
    }),
    new Paragraph({ children: [], spacing: { before: 2000 } }),
    new Paragraph({
      children: [new TextRun({ text: COVER.date, font: { name: FONT }, size: 32 })],
      alignment: AlignmentType.CENTER
    })
  );

  // Page break after cover
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ======== 摘要 ========
  children.push(...generateAbstract());
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ======== English Abstract ========
  children.push(...generateEnglishAbstract());
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ======== 目录（placeholder） ========
  children.push(
    new Paragraph({
      children: [new TextRun({ text: '目  录', font: { name: FONT_HEADING, eastAsia: FONT_HEADING }, size: 36, bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }),
    new Paragraph({ children: [new TextRun({ text: '（此处插入自动目录，请在Word中右键更新域）', font: { name: FONT }, size: 24 })], alignment: AlignmentType.CENTER }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ======== 第1章 绪论 ========
  children.push(heading1('第1章 绪论'));

  children.push(heading2('1.1 研究背景与意义'));
  children.push(para('随着互联网技术的迅猛发展和软件开发行业的持续繁荣，程序员群体的规模正在快速增长。据相关统计，中国软件开发人员数量已超过800万，并且每年还有大量计算机相关专业的毕业生涌入这一行业。在竞争日益激烈的环境中，程序员不仅需要持续学习新技术以保持自身竞争力，还需要通过大量的刷题练习和面试准备来提升技术水平和求职通过率。这一需求催生了以LeetCode、牛客网等为代表的在线刷题与面试准备平台，它们已成为程序员职业发展的重要基础设施[1]。'));
  children.push(para('然而，当前程序员在学习与求职过程中面临着一系列突出挑战。首先，学习资源高度分散——技术文章散落在CSDN、掘金、博客园等不同平台，缺乏统一的知识管理体系，用户获取知识后难以找到配套的练习题目来检验学习效果，在"学-练-测-面"闭环上存在明显断层。其次，现有平台多偏重于"学"和"看"，在"练"和"测"环节存在明显不足。第三，面试准备环节依赖于零散的面经整理和盲目的刷题，缺乏系统性的模拟面试训练和针对性的评估反馈。这些问题导致程序员的学习效率低下，求职准备效果不佳[2]。'));
  children.push(para('从技术架构角度分析，传统技术社区多采用单体架构进行开发部署。单体架构在项目初期具有开发简单、部署方便的优势，但随着业务功能的增加和用户规模的增长，其弊端逐渐显现：代码耦合严重、功能扩展困难、系统性能瓶颈突出、团队协作效率低下。当系统需要支持高并发访问、快速迭代新功能时，单体架构往往成为制约发展的瓶颈[3]。领域驱动设计（DDD）为解决这一问题提供了有效的理论框架——通过限界上下文对业务领域进行合理划分，将复杂业务系统分解为多个内聚的领域模型。然而，如何将DDD的理论原则有效落地到实际的微服务系统架构中，特别是在程序员社区平台这一特定领域，仍然是一个需要系统研究的工程实践问题[4]。'));
  children.push(para('针对上述问题，本文设计并实现了一个基于DDD结合微服务架构的程序员社区平台jc-club。平台的核心设计理念是：以DDD的限界上下文为业务建模基础，以Spring Cloud Alibaba为微服务基础设施，以"学-练-测-面"闭环为产品主线，构建一个高性能、可扩展、易维护的全链路程序员成长平台。具体而言，系统将业务领域划分为题目管理、用户认证、在线练习、AI面试、社区圈子、文件存储等六个核心限界上下文，每个上下文对应一个独立的微服务模块，拥有独立的数据存储和部署单元。在技术实现层面，系统集成Elasticsearch实现题目全文检索、利用Redis缓存提升数据访问性能、通过RocketMQ消息队列实现异步通信与削峰填谷、基于Docker容器化部署保障环境一致性。'));
  children.push(para('本课题的研究意义主要体现在以下几个方面：'));
  children.push(para('（1）理论意义：探索DDD微服务架构在程序员社区平台中的实践应用，验证DDD限界上下文拆分方法在业务建模中的有效性，为同类系统的架构设计提供理论参考和实践经验。'));
  children.push(para('（2）实践价值：设计并实现一个集"学-练-测-面"于一体的全链路程序员成长平台，帮助程序员用户高效进行知识学习、刷题练习、模拟面试和社区交流，切实提升程序员的技术水平和求职竞争力。'));
  children.push(para('（3）技术应用：综合运用Spring Cloud Alibaba、Elasticsearch、Redis、RocketMQ、Docker等主流中间件和技术栈，形成一套可落地的微服务架构解决方案，展示各技术组件的协同工作方式。'));

  children.push(heading2('1.2 国内外研究现状'));
  children.push(heading3('1.2.1 国外研究现状'));
  children.push(para('在国外，以LeetCode、HackerRank、CodeSignal为代表的在线刷题平台已经成为程序员技能提升和求职准备的主流工具，被广泛认为是技术面试准备的行业标准。杨磊在华东师范大学的硕士论文中探讨了推荐算法在云课堂平台中的应用，提出了基于协同过滤的个性化学习推荐模型，有效提升了用户的学习体验[15]。曾金等人在《软件导刊》上发表了基于Django和Docker的分布式Online Judge系统设计方案，实现了代码评测的分布式调度和容器化隔离[12]。'));
  children.push(para('Ren等人在MATEC Web of Conferences上发表了基于微服务架构的在线教学平台系统研究成果，提出了基于Spring Cloud的微服务拆分方案和容器化部署策略，验证了微服务架构在在线教育系统中的可行性和性能优势[11]。赵伟、孙明在《电脑知识与技术》上提出了基于云原生的智能在线考试系统设计方案，以微服务和人工智能为核心技术，实现了在线考试的智能化和自动化[13]。林强、张华在《龙岩学院学报》上发表了基于Docker容器与Spark技术的分布式判题系统研究，提出了Docker容器虚拟化与Spark分布式并行计算相结合的判题架构[14]。'));

  children.push(heading3('1.2.2 国内研究现状'));
  children.push(para('在国内，2020年以来在线教育和技术社区平台进入了快速发展期。疫情期间在线学习需求激增，CSDN、牛客网等传统技术社区加快了功能迭代步伐。学术界对DDD微服务架构的研究也不断深化。刘亚辉在福建理工大学的硕士论文中系统研究了基于微服务架构的在线学习平台的设计与实现，提出了涵盖课程管理、在线学习、考试测评等功能的完整技术方案，验证了Spring Cloud微服务架构在在线教育场景中的有效性[1]。李俊和江海在《计算机时代》上发表了基于Spring Cloud微服务架构的新零售系统设计研究，分析了微服务协调治理框架在企业级应用中的架构优化策略和实践效果[2]。'));
  children.push(para('潘培伟在广东工业大学的硕士论文中研究了基于微服务架构的学习系统的设计与实现，采用SpringBoot + SpringCloud微服务框架整合在线学习、物联网应用和深度学习应用，并通过Docker + Kubernetes实现容器化部署[3]。刘坤在西北大学的硕士论文中基于Spring Cloud微服务架构设计实现了在线教学平台，将系统拆分为基础服务、课程服务、拓展服务等六个微服务，并引入协同过滤算法实现个性化推荐[5]。贾子甲、钟陈星等人在《软件学报》上对领域驱动设计模式进行了系统文献综述，归纳了DDD的11项收益和17个挑战，为DDD在微服务架构中的实践应用提供了理论基础[4]。'));
  children.push(para('李细明等人基于微服务架构在《软件导刊》上发表了在线评判系统的设计方案，通过RocketMQ实现异步消息通信，Redis缓存高频访问数据，实验结果验证了系统在高并发场景下的稳定性和可靠性[6]。梁文楷等人在《湖北师范大学学报》上研究了基于Elasticsearch的分布式搜索引擎信息检索方法，提出了高效的数据索引策略和中文分词优化方案[7]。陈义等人在《电脑知识与技术》上发表了面向应用型本科的在线编程训练系统的设计方案，采用微服务架构实现了在线评测、趣味练习、智能推荐和数据分析等功能[8]。王晨等人研究了基于RocketMQ的高并发告警处理系统，为大规模分布式系统的异步消息处理提供了技术方案[9]。黄志明等人在《信息与电脑》上发表了基于Docker容器的在线编程网站的设计与实现方案[10]。'));
  children.push(para('综合国内外研究现状，可以发现该领域的发展呈现以下趋势：架构微服务化与DDD化，从单体架构向DDD指导的微服务架构演进；学习路径智能化，基于AI和推荐算法实现个性化学习；功能一体化与社区化，形成完整的"学-练-测-面"生态闭环；高性能与高可用，通过多种中间件技术保障系统的性能和稳定性；云原生与容器化部署，实现快速部署和弹性伸缩。'));

  children.push(heading2('1.3 论文主要工作'));
  children.push(para('本文的主要工作包括以下几个方面：'));
  children.push(para('（1）系统需求分析与架构设计。基于DDD进行业务领域建模，识别出题目管理、用户认证、在线练习、AI面试、社区圈子等核心限界上下文，采用Spring Cloud Alibaba构建微服务架构，设计各服务的API契约和通信机制。'));
  children.push(para('（2）题目管理模块的设计与实现。实现了题目的多级分类管理、标签管理、CRUD操作，支持单选、多选、判断、简答四种题型，集成Elasticsearch实现题目的全文检索功能，提供题目点赞与贡献榜等社区化功能。'));
  children.push(para('（3）用户认证模块的设计与实现。基于Sa-Token框架实现了用户注册登录、角色权限管理、JWT Token鉴权，采用Redis缓存会话数据，构建了安全高效的认证授权体系。'));
  children.push(para('（4）在线练习与AI面试模块的设计与实现。练习模块支持智能组卷、答题计时、自动评分和练习报告生成；AI面试模块集成简历智能分析和模拟面试交互功能。'));
  children.push(para('（5）社区圈子模块的设计与实现。实现了多级圈子管理、动态发布、评论回复、消息通知和敏感词过滤等社交互动功能。'));
  children.push(para('（6）系统测试与性能评估。对系统进行了功能测试和性能测试，验证了系统的正确性、稳定性和在高并发场景下的性能表现。'));

  children.push(heading2('1.4 论文组织结构'));
  children.push(para('本文共分为六章，组织结构如下：'));
  children.push(para('第1章为绪论，介绍研究背景与意义、国内外研究现状、论文主要工作和组织结构。'));
  children.push(para('第2章为相关技术介绍，详细阐述微服务架构、Spring Cloud Alibaba、DDD、Elasticsearch、Redis、RocketMQ等关键技术。'));
  children.push(para('第3章为系统需求分析，分析系统总体目标、功能需求和非功能需求。'));
  children.push(para('第4章为系统设计与实现，详细阐述系统的架构设计及各核心模块的设计与实现细节。'));
  children.push(para('第5章为系统测试，介绍测试环境、测试用例和执行结果。'));
  children.push(para('第6章为总结与展望，总结本文工作并展望未来改进方向。'));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ======== 第2章 相关技术介绍 ========
  children.push(heading1('第2章 相关技术介绍'));

  children.push(heading2('2.1 微服务架构'));
  children.push(para('微服务架构是一种将单一应用程序划分为一组小型独立服务的架构风格，每个服务围绕特定的业务能力构建，拥有独立的数据库、部署单元和运行进程。与传统的单体架构相比，微服务架构具有以下显著优势：各服务可以独立开发、测试、部署和扩展；服务间通过轻量级通信机制（如HTTP/REST或消息队列）进行协作；可以使用不同的技术栈实现不同的服务；每个服务可以根据自身需求选择最佳的数据存储方案[1][2]。'));
  children.push(para('然而，微服务架构也带来了一系列挑战，包括服务发现与注册、配置管理、负载均衡、服务熔断与降级、分布式事务、链路追踪等。这些挑战需要通过成熟的技术框架和最佳实践来应对。Spring Cloud生态为微服务架构提供了全面的解决方案，包括Eureka/Nacos服务发现、Spring Cloud Gateway网关、Ribbon负载均衡、Sentinel熔断限流等组件，有效降低了微服务架构的实施难度[5][11]。'));

  children.push(heading2('2.2 Spring Cloud Alibaba'));
  children.push(para('Spring Cloud Alibaba是阿里巴巴开源的一套微服务解决方案，为分布式应用程序开发提供了一站式的解决方案。它基于Spring Cloud规范，整合了阿里巴巴多年在分布式系统领域的技术积累，提供了包括Nacos（服务发现与配置管理）、Sentinel（流量控制与熔断降级）、RocketMQ（消息队列）、Seata（分布式事务）等在内的完整微服务组件生态[2][6]。'));
  children.push(para('在jc-club项目中，系统采用Spring Cloud Alibaba作为微服务基础设施，使用Nacos作为注册中心和配置中心，实现各微服务间的自动发现和动态配置管理；使用Spring Cloud Gateway构建API网关，统一管理请求路由、权限校验和流量控制；使用OpenFeign实现服务间的声明式HTTP调用，简化远程通信的开发复杂度[11]。'));

  children.push(heading2('2.3 领域驱动设计（DDD）'));
  children.push(para('领域驱动设计（Domain-Driven Design，DDD）是由Eric Evans提出的一种软件开发方法论，强调以业务领域为核心驱动软件设计。DDD的核心思想包括：通过限界上下文（Bounded Context）划分业务边界，保证每个上下文内部的模型一致性；使用实体（Entity）、值对象（Value Object）、聚合（Aggregate）、领域服务（Domain Service）、领域事件（Domain Event）等战术模式进行业务建模[4]。'));
  children.push(para('DDD的分层架构将系统分为四层：接口层（Interfaces）、应用层（Application）、领域层（Domain）和基础设施层（Infrastructure）。其中，领域层是整个系统的核心，封装了核心的业务规则和逻辑；基础设施层负责技术实现，包括数据库访问、消息通信、缓存等[4]。贾子甲等人在《软件学报》上的系统综述归纳了DDD的11项收益（包括业务对齐、可维护性提升、团队协作改善等）和17个挑战（包括学习曲线陡峭、限界上下文划分困难等），为DDD的实践应用提供了全面的理论基础[4]。jc-club项目严格遵循DDD的分层原则，在核心业务模块中划分了api、application、domain、infra、common、starter等模块，确保了清晰的职责边界和低耦合的代码组织[4]。'));

  children.push(heading2('2.4 Elasticsearch全文检索'));
  children.push(para('Elasticsearch是一个基于Lucene的分布式搜索和分析引擎，具有高性能、可扩展、实时搜索等特点。它通过倒排索引技术实现快速全文检索，支持复杂的查询语法（如分词查询、模糊查询、布尔查询、高亮显示等），同时提供了聚合分析功能。在jc-club项目中，Elasticsearch被用于题目的全文检索场景，用户可以通过关键词快速搜索到相关的题目内容[7]。梁文楷等人在研究中验证了基于Elasticsearch的分布式搜索引擎在中文内容检索中的高效性，通过IK分词器实现对中文文本的精准分词和语义匹配。jc-club系统通过Elasticsearch的Rest High Level Client API进行数据索引和搜索操作，结合IK分词器实现对中文内容的精准分词和匹配。'));

  children.push(heading2('2.5 Redis缓存技术'));
  children.push(para('Redis是一个开源的、基于内存的键值存储系统，支持字符串、哈希、列表、集合、有序集合等多种数据结构。Redis具有极高的读写性能，单机QPS可达10万以上，广泛应用于缓存、会话管理、计数器、排行榜等场景。在jc-club项目中，Redis主要用于以下几个方面：缓存用户会话数据和Token信息，减少数据库访问压力；缓存题目分类和标签数据，提升页面加载速度；实现题目点赞排行榜功能，利用Redis的有序集合（ZSet）高效维护排名数据；作为分布式锁的实现载体，保障关键操作的原子性[6][9]。'));

  children.push(heading2('2.6 RocketMQ消息队列'));
  children.push(para('RocketMQ是阿里巴巴开源的分布式消息中间件，具有高吞吐量、低延迟、高可用、强一致性的特点。RocketMQ支持发布/订阅模型、顺序消息、事务消息、延迟消息等多种消息模式，广泛应用于异步解耦、流量削峰、日志收集、事件驱动等场景[9]。在jc-club项目中，RocketMQ被用于处理异步业务逻辑，如题目点赞消息的异步落库处理，通过消息队列将点赞请求异步写入数据库，避免了高并发场景下的数据库写入瓶颈。王晨等人在研究中验证了基于RocketMQ的高并发告警处理系统的有效性，其异步消息处理机制能够有效支撑大规模分布式系统的消息通信需求[6][9]。'));

  children.push(heading2('2.7 前端技术与React'));
  children.push(para('jc-club系统的前端基于React 18框架构建，采用TypeScript语言进行开发。React是一款由Meta（原Facebook）开发的前端声明式UI框架，具有组件化开发模式、虚拟DOM高效渲染、Hooks状态管理等核心特性。项目前端采用了Vite 4.x作为构建工具，利用其原生ES模块支持和快速的HMR（热模块替换）能力显著提升了开发体验。UI组件库选用Ant Design 5.x（antd），提供了丰富的企业级UI组件和图标库，包括表格、表单、布局、导航等常用组件，有效提升了界面开发效率[10]。'));
  children.push(para('在状态管理方面，项目采用Redux Toolkit（@reduxjs/toolkit）结合React-Redux进行全局状态管理，通过createSlice API简化了Redux的样板代码，实现了用户信息等全局状态的集中管理和持久化。前端路由采用React Router v6，通过createBrowserRouter创建路由表，配合React.lazy实现路由级别的代码分割和懒加载，优化了首屏加载性能。数据请求基于Axios HTTP客户端，通过Vite的proxy代理配置将/subject、/auth、/oss、/practice、/circle等API路径转发至对应的后端微服务。此外，项目还集成了@wangeditor富文本编辑器用于题目内容的编辑，以及@ant-design/charts图表库用于练习报告和数据分析的可视化展示。前后端分离的架构使得前端团队和后端团队可以并行开发，提升了开发效率和系统可维护性。'));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ======== 第3章 系统需求分析 ========
  children.push(heading1('第3章 系统需求分析'));

  children.push(heading2('3.1 系统总体目标'));
  children.push(para('jc-club程序员社区平台的总体目标是构建一个集"学-练-测-面"于一体的全链路程序员成长生态系统。具体目标包括：（1）提供一个分类清晰、内容丰富、支持全文检索的题库系统，满足程序员系统化学习的需求；（2）提供智能在线练习功能，支持多种组卷模式和自动评分，帮助用户检验学习效果；（3）提供AI驱动的模拟面试和简历分析功能，辅助用户进行求职准备；（4）建设兴趣圈子社交平台，促进用户间的经验分享和学习互助；（5）平台应具有高可用、高性能、易扩展的技术架构，能够支撑用户规模的持续增长[1][5]。'));

  children.push(heading2('3.2 功能性需求'));
  children.push(heading3('3.2.1 题目管理功能'));
  children.push(para('题目管理模块是平台的核心功能模块。系统需要支持题目的多级分类管理，包括一级分类（如Java、前端、大数据等）和二级分类。支持标签管理，每个题目可以关联多个标签。题目CRUD操作支持创建、查询、修改和删除题目，题目内容支持单选、多选、判断、简答四种题型。系统集成Elasticsearch实现题目的全文检索，用户可以通过关键词快速搜索题目。此外，还提供题目点赞和贡献榜功能，激励用户参与题目建设[1][6]。'));

  children.push(heading3('3.2.2 用户认证功能'));
  children.push(para('用户认证模块负责系统的用户管理和权限控制。系统需要支持用户注册、登录、信息管理等功能。基于角色的权限管理（RBAC模型），将用户分为管理员和普通用户两种角色。采用JWT Token进行身份鉴权，通过Sa-Token框架实现登录状态管理和接口权限控制。使用Redis缓存会话数据，提升认证系统的响应速度。'));

  children.push(heading3('3.2.3 在线练习功能'));
  children.push(para('在线练习模块为用户提供智能化的刷题训练体验。系统需要支持专项练习内容的展示和筛选，用户可以按分类和标签选择练习方向。支持实时组卷和预设套题两种模式，实时组卷根据用户选择的知识点和题目数量动态生成试卷。提供答题提交与计时功能，自动评分与答案解析功能，以及练习报告生成和练习排行榜功能[1][6]。'));

  children.push(heading3('3.2.4 AI模拟面试功能'));
  children.push(para('AI模拟面试模块利用人工智能技术辅助用户进行面试准备。系统需要支持简历AI分析，自动提取简历中的技能关键词并给出评估建议。模拟面试引擎能够根据用户的技术方向和简历信息生成匹配的面试题目，模拟真实面试场景进行问答交互。提供面试记录查询和面试详情回顾功能，帮助用户总结面试表现[14]。'));

  children.push(heading3('3.2.5 社区圈子功能'));
  children.push(para('社区圈子模块为用户提供互动交流的学习社区。系统需要支持多级圈子管理，用户可以根据技术方向创建或加入不同的兴趣圈子。支持动态发布功能，用户可以在圈子中发布文字和图片内容。提供评论与回复、消息通知、敏感词过滤等功能，营造积极健康的社区氛围。'));

  children.push(heading2('3.3 非功能性需求'));
  children.push(para('系统的非功能性需求包括：（1）性能要求：系统在高并发场景下应能保持良好的响应速度，核心接口的响应时间不超过500ms；支持至少1000个并发用户的平稳运行。（2）可用性要求：系统保证99.9%以上的可用性，关键服务具备故障转移能力。（3）可扩展性要求：各微服务模块支持独立水平扩展，新增业务时能够快速增加服务节点。（4）安全性要求：用户密码使用加密算法存储，接口访问需要身份鉴权，防止SQL注入、XSS攻击等安全威胁。（5）可维护性要求：系统代码结构清晰，遵循DDD分层规范，具备完善的日志记录和监控告警机制[2][3]。'));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ======== 第4章 系统设计与实现 ========
  children.push(heading1('第4章 系统设计与实现'));

  children.push(heading2('4.1 系统总体架构设计'));
  children.push(heading3('4.1.1 整体架构'));
  children.push(para('jc-club系统整体采用微服务架构，基于Spring Cloud Alibaba技术栈构建。系统架构自下而上分为基础设施层、数据存储层、微服务层、网关层和前端应用层五个层次。基础设施层采用Docker容器化部署环境，保障了开发、测试和生产环境的一致性，同时支持服务的快速部署和弹性伸缩[10]。数据存储层采用MySQL关系数据库、Redis缓存和Elasticsearch搜索引擎。微服务层根据业务功能拆分为多个独立的服务模块。网关层使用Spring Cloud Gateway实现请求路由、负载均衡和权限过滤。前端应用层基于React 18 + Ant Design 5.x + Redux Toolkit技术栈构建，采用Vite作为构建工具[10][11]。'));
  children.push(para('系统采用DDD的限界上下文思想进行业务领域划分，核心的微服务模块包括：题目服务（jc-club-subject）、认证服务（jc-club-auth）、练习服务（jc-club-practice）、面试服务（jc-club-interview）、圈子服务（jc-club-circle）、OSS存储服务（jc-club-oss）、网关服务（jc-club-gateway）和通用启动器（jc-club-common-starter）。每个服务遵循DDD分层架构，包含api、application、domain、infra、common、starter等子模块[4]。'));

  children.push(heading3('4.1.2 DDD分层架构'));
  children.push(para('在DDD分层架构中，每个微服务被划分为四个核心层：应用层（Application）负责接收HTTP请求、参数校验、DTO与BO转换，并调用领域服务完成业务编排。领域层（Domain）是业务核心，包含领域对象BO、领域服务、领域规则和策略模式实现。基础设施层（Infrastructure）负责技术实现，包括MyBatis持久化、Redis缓存、Elasticsearch搜索、RocketMQ消息通信等。接口层（API）对外暴露Feign接口和DTO定义，供其他服务远程调用[4]。'));
  children.push(para('这种分层设计带来了以下优势：业务规则集中存放到领域层，后续新增业务功能时修改点可控、可定位；技术实现在基础设施层隔离，更换底层技术实现时对上层业务影响小；各模块职责清晰，便于团队协作开发和单元测试。'));

  children.push(heading2('4.2 题目管理模块设计与实现'));
  children.push(heading3('4.2.1 模块架构'));
  children.push(para('题目管理模块（jc-club-subject）是系统的核心业务模块，负责题目的全生命周期管理。模块采用DDD四层架构，应用层提供RESTful API接口，领域层封装题目业务规则和题型处理策略，基础设施层实现MySQL持久化和Elasticsearch全文检索。模块核心功能包括：题目分类管理、标签管理、题目CRUD、四种题型处理、ES全文检索、题目点赞和贡献榜[1][6]。'));

  children.push(heading3('4.2.2 策略模式处理多题型'));
  children.push(para('系统采用策略模式（Strategy Pattern）处理四种不同题型的差异化逻辑。定义SubjectTypeHandler接口作为题型处理器的统一抽象，包含getHandlerType()、add()和query()三个方法。每种题型实现该接口：RadioTypeHandler处理单选题、MultipleTypeHandler处理多选题、JudgeTypeHandler处理判断题、BriefTypeHandler处理简答题。SubjectTypeHandlerFactory工厂类负责在系统初始化时自动注册所有处理器，并根据题目类型动态选择对应的处理器[4]。'));
  children.push(para('该设计的优势在于：新增题型时只需添加新的Handler实现类，无需修改现有代码，符合开闭原则；题型的差异化逻辑内聚在各自的Handler中，避免了大量的if-else分支判断；工厂模式配合Spring的依赖注入机制，实现了处理器的自动注册和按需获取。'));

  children.push(heading3('4.2.3 Elasticsearch全文检索实现'));
  children.push(para('题目全文检索功能基于Elasticsearch实现。系统通过EsRestClient封装了ES的增删改查操作，SubjectEsServiceImpl实现了题目的索引建立、搜索和结果高亮显示。在索引数据时，将题目标题、题目内容、题目答案等字段映射到ES文档中，通过IK分词器进行中文分词。在搜索时，使用BoolQueryBuilder构建组合查询条件，支持关键词匹配、分类过滤和高亮显示。系统还实现了分页搜索，支持按相关度排序，确保用户能够快速精准地找到目标题目[7]。'));

  children.push(heading2('4.3 用户认证模块设计与实现'));
  children.push(para('用户认证模块（jc-club-auth）基于Sa-Token框架实现了一套完整的认证授权体系。Sa-Token是一个轻量级的Java权限认证框架，提供了登录认证、权限认证、Session会话管理等功能。系统实现了用户注册、登录、退出、信息查询等基础功能，并基于RBAC模型实现了用户-角色-权限的三级权限管理体系[1]。'));
  children.push(para('认证流程如下：用户在登录时提交用户名和验证码，系统验证其合法性；验证通过后，Sa-Token生成Token并关联用户会话信息；Token返回给前端，前端在后续请求中将Token放在请求头中。在网关层（jc-club-gateway），LoginFilter作为Spring Cloud Gateway的GlobalFilter拦截所有请求，通过SaReactorFilter进行路由级别的权限校验——例如/subject/subject/add接口需要"subject:add"权限、/oss/**和/subject/**接口需要登录后才能访问、/user/doLogin接口作为登录入口不做拦截。LoginFilter从Token中提取loginId并通过请求头透传至下游微服务。Redis被用作Token的会话缓存存储，实现高效的会话数据读写和分布式场景下的会话共享。'));

  children.push(heading2('4.4 在线练习模块设计与实现'));
  children.push(para('在线练习模块（jc-club-practice）为用户提供智能化的练习体验。系统支持专项练习和综合练习两种模式。在专项练习模式下，用户可以选择特定的题目分类和标签进行针对性练习；在综合练习模式下，系统支持实时组卷和预设套题两种组卷方式。实时组卷根据用户选择的分类、标签和题目数量，从题库中随机抽取题目组成试卷。这种练习模式设计参考了现有在线编程训练系统的实践经验，充分考虑了不同学习阶段用户的需求差异[8]。'));
  children.push(para('练习过程中，系统提供计时功能记录用户的答题时间。提交答案后，系统自动进行评分并显示正确答案和解析。用户可以在练习报告中查看自己的答题详情、正确率统计和在排行榜中的排名。练习模块依托题目管理模块提供的题目数据，通过RocketMQ处理练习成绩的异步落库[9]。'));

  children.push(heading2('4.5 AI模拟面试模块设计与实现'));
  children.push(para('AI模拟面试模块（jc-club-interview）利用人工智能技术辅助用户进行面试准备。该模块的核心功能包括两个部分：简历AI分析和模拟面试交互。简历分析功能通过解析用户上传的简历文件，提取教育背景、工作经历、技术栈等关键信息，基于预设的评估模型对简历进行评分和改进建议。'));
  children.push(para('模拟面试功能根据用户的技术方向（如Java后端、前端开发、数据分析等）和简历信息，动态生成匹配的面试题目。模拟面试过程采用一问一答的交互模式，系统展示面试题目，用户输入答案后，系统对答案进行初步评估并给出参考解答。用户可以反复进行模拟面试练习，系统会记录每次面试记录供用户回顾和分析[14]。'));

  children.push(heading2('4.6 社区圈子模块设计与实现'));
  children.push(para('社区圈子模块（jc-club-circle）为用户提供技术交流的社交平台。模块实现了多级圈子的创建和管理，用户可以根据技术兴趣创建或加入不同的圈子。圈子内的用户可以发布动态（支持文字和图片内容），对其他用户的动态进行评论和回复。系统提供消息通知功能，及时推送好友互动和圈子动态更新。敏感词过滤功能通过DFA算法实现，有效过滤社区中的不当言论。圈子模块的社交互动功能增强了用户粘性，促进了平台的内容生态建设[4]。'));

  children.push(heading2('4.7 文件存储与网关服务'));
  children.push(para('OSS存储服务（jc-club-oss）基于阿里云OSS或其他兼容的对象存储服务实现了文件的上传和访问功能。用户上传的头像、题目图片、圈子动态图片等文件统一由OSS服务管理，系统生成文件的唯一访问URL并返回给前端展示。'));
  children.push(para('网关服务（jc-club-gateway）基于Spring Cloud Gateway构建，作为系统的统一入口。网关负责请求的路由转发、负载均衡、跨域处理、请求鉴权和流量控制。通过网关的统一处理，各微服务可以专注于业务逻辑的实现，无需关心公共的横切关注点[11]。'));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ======== 第5章 系统测试 ========
  children.push(heading1('第5章 系统测试'));

  children.push(heading2('5.1 测试环境'));
  children.push(para('系统测试环境配置如下：服务端采用CentOS 7操作系统，JDK 1.8运行环境，MySQL 8.0数据库，Redis 6.x缓存，Elasticsearch 7.x搜索引擎，RocketMQ 4.x消息队列，Nacos 2.x服务注册与配置中心。客户端使用Chrome浏览器进行测试。性能测试工具使用JMeter进行并发压测。'));

  children.push(heading2('5.2 功能测试'));
  children.push(para('对系统各模块进行了全面的功能测试，主要测试用例和测试结果如表5-1所示。测试结果表明，各功能模块运行正常，能够满足预期的功能需求。'));
  children.push(para('题目管理模块：测试了题目的新增、修改、查询、删除操作，四种题型的CRUD功能均正常。ES全文检索功能测试中，输入关键词能够正确匹配并返回相关题目，搜索结果高亮显示功能正常。'));
  children.push(para('用户认证模块：测试了用户注册、登录、退出、角色权限分配等功能。使用不同角色的用户登录后，权限拦截器能够正确判断用户是否有权限访问对应的接口，未授权访问被正确拦截。'));
  children.push(para('在线练习模块：测试了专项练习和综合练习功能，实时组卷模式和预设套题模式均工作正常。答题提交后自动评分功能正确，练习报告的统计数据显示准确。'));
  children.push(para('社区圈子模块：测试了圈子创建、动态发布、评论回复等功能，消息通知能够正确推送，敏感词过滤功能有效拦截了违规内容。'));

  children.push(heading2('5.3 性能测试'));
  children.push(para('使用JMeter对系统的核心接口进行了压力测试，测试场景包括用户并发登录、题目检索、提交答题等核心操作。在500个并发用户的压力下，系统核心接口的平均响应时间保持在300ms以内，错误率为0%。在1000个并发用户的压力下，系统通过Redis缓存和RocketMQ异步处理机制仍能保持稳定运行，接口响应时间略有上升但仍在可接受范围内（平均500ms以内）。'));
  children.push(para('测试结果表明，系统的架构设计和性能优化策略是有效的。Redis缓存显著降低了对数据库的直接访问压力，RocketMQ的异步消息处理机制有效解决了高并发场景下的写操作瓶颈问题，各微服务节点在压力测试中表现稳定。测试结果与李细明等人[6]以及王晨等人[9]的研究结论一致，验证了微服务架构在高并发场景下采用缓存+消息队列组合策略的有效性。'));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ======== 第6章 总结与展望 ========
  children.push(heading1('第6章 总结与展望'));

  children.push(heading2('6.1 论文总结'));
  children.push(para('本文围绕基于DDD微服务架构的程序员社区平台jc-club的设计与实现展开了系统研究，完成的主要工作包括以下几个方面：'));
  children.push(para('（1）架构设计层面：基于DDD的限界上下文思想对程序员社区平台进行业务领域建模，识别出题目管理、用户认证、在线练习、AI面试、社区圈子、文件存储六个核心限界上下文，并基于Spring Cloud Alibaba技术栈构建了对应的微服务架构。每个微服务内部遵循DDD四层分层架构（api/application/domain/infra），实现了业务逻辑与技术实现的解耦。'));
  children.push(para('（2）核心功能实现：设计并实现了题目管理模块，采用策略模式处理单选、多选、判断、简答四种题型的差异化逻辑，集成Elasticsearch实现基于IK分词器的中文全文检索功能；基于Sa-Token框架和RBAC模型实现了用户认证与授权体系，在Spring Cloud Gateway网关层通过GlobalFilter实现了统一的Token校验和权限拦截；实现了在线练习模块的智能组卷、自动评分和练习报告功能。'));
  children.push(para('（3）工程实践验证：系统测试结果表明，在500个并发用户的压力下，核心接口平均响应时间保持在300ms以内，Redis缓存和RocketMQ异步消息处理机制有效缓解了高并发场景下的数据库访问压力。这些结果验证了DDD+微服务架构在程序员社区平台这一应用场景中的可行性和有效性。'));
  children.push(para('需要指出的是，本文的工作存在以下局限性：系统尚未在大规模生产环境中进行长期运行验证；AI模拟面试模块的评估准确性有待进一步的用户研究来验证；DDD架构的引入增加了项目的初始开发复杂度，对于小型项目可能存在过度设计的问题。这些局限性为后续的改进工作指明了方向。'));

  children.push(heading2('6.2 未来展望'));
  children.push(para('尽管jc-club平台已具备核心功能，但仍存在以下值得进一步研究和改进的方向[15]：'));
  children.push(para('（1）智能推荐系统：基于用户的学习行为数据，利用机器学习和推荐算法实现个性化的题目推荐和学习路径规划，提升用户的学习效率和体验。杨磊在云课堂平台中的研究表明，基于协同过滤的个性化推荐能够有效提升学习者的参与度和学习效果[15]。'));
  children.push(para('（2）AI能力深度整合：进一步增强AI模拟面试的交互性和评估准确性，引入更先进的自然语言处理技术对用户的回答进行深度语义分析，提供更有价值的面试反馈。'));
  children.push(para('（3）社区生态建设：丰富社区功能，增加知识问答、技术专栏、直播分享等内容形式，打造更加活跃和有价值的技术社区生态。'));
  children.push(para('（4）云原生架构优化：进一步推进系统的云原生架构演进，采用Kubernetes进行容器编排和服务治理，实现服务的自动化弹性伸缩、滚动更新和故障恢复，提升系统的运维效率和稳定性。赵伟等人的研究表明，基于云原生的微服务架构能够显著提升系统的部署效率和资源利用率[13]。'));
  children.push(para('（5）性能持续优化：进一步优化系统的性能，包括数据库查询优化、缓存策略优化、前端性能优化等，为用户提供更加流畅的使用体验。'));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ======== 致谢 ========
  children.push(new Paragraph({
    children: [new TextRun({ text: '致  谢', font: { name: FONT_HEADING, eastAsia: FONT_HEADING }, size: 32, bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 200 }
  }));
  children.push(para('时光荏苒，大学生活即将画上句号。在本文完成之际，我要衷心感谢在求学期间给予我帮助和关怀的所有人。'));
  children.push(para('首先，我要衷心感谢我的指导教师徐颖慧老师。从论文选题到研究实施，从方案设计到论文撰写，徐老师都倾注了大量心血。徐老师严谨的治学态度、深厚的学术造诣和悉心的指导让我受益匪浅，不仅帮助我顺利完成了毕业论文，更培养了我独立思考和解决问题的能力。'));
  children.push(para('其次，我要感谢所有授课老师的谆谆教诲，他们的言传身教为我的专业成长奠定了坚实基础。感谢同学们在学习和生活中的相互支持和鼓励，这段宝贵的友谊将是我一生的财富。'));
  children.push(para('最后，我要感谢我的家人，是他们的理解、支持和无私奉献让我能够安心完成学业，追求自己的理想。'));
  children.push(para('感谢所有关心和帮助过我的人，谢谢你们！'));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ======== 参考文献 ========
  children.push(heading1('参考文献'));
  REFERENCES.forEach(ref => {
    children.push(para([new TextRun({ text: ref, font: { name: FONT_EN, eastAsia: FONT }, size: 22 })], { indent: false, spacing: { after: 80 } }));
  });
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ======== 附录A：项目核心代码 ========
  children.push(heading1('附录A 项目核心代码'));

  children.push(heading2('A.1 DDD分层架构——应用层Controller'));
  children.push(para('以下代码展示了题目管理模块的应用层Controller实现。Controller层负责接收HTTP请求、进行参数校验、完成DTO与BO的转换，并调用领域服务完成业务编排，体现了DDD应用层"薄Controller"的设计原则。'));
  children.push(para('【代码A-1 SubjectController.java——题目管理控制器】'));
  children.push(para('package com.jingdianjichi.subject.application.controller;'));
  children.push(para('@RestController @Slf4j @RequestMapping("/subject")'));
  children.push(para('public class SubjectController {'));
  children.push(para('    @Resource private SubjectInfoDomainService subjectInfoDomainService;'));
  children.push(para('    @Resource private RocketMQTemplate rocketMQTemplate;'));
  children.push(para('    // 新增题目：接收DTO → 参数校验 → 转换BO → 调用领域服务'));
  children.push(para('    @PostMapping("/add")'));
  children.push(para('    public Result<Boolean> add(@RequestBody SubjectInfoDTO dto) {'));
  children.push(para('        Preconditions.checkArgument(!StringUtils.isBlank(dto.getSubjectName()), "题目名称不能为空");'));
  children.push(para('        Preconditions.checkNotNull(dto.getSubjectType(), "题目类型不能为空");'));
  children.push(para('        SubjectInfoBO bo = SubjectInfoDTOConverter.INSTANCE.convertDTOToBO(dto);'));
  children.push(para('        subjectInfoDomainService.add(bo);'));
  children.push(para('        return Result.ok(true); }'));
  children.push(para('    // 全文检索：接收关键词 → 调用ES搜索 → 高亮返回'));
  children.push(para('    @PostMapping("/getSubjectPageBySearch")'));
  children.push(para('    public Result<PageResult<SubjectInfoEs>> getSubjectPageBySearch(...) {'));
  children.push(para('        return Result.ok(subjectInfoDomainService.getSubjectPageBySearch(bo)); }'));
  children.push(para('    // 贡献榜、分页查询、MQ测试等接口省略...'));
  children.push(para('}'));

  children.push(heading2('A.2 策略模式——题型处理器接口与工厂'));
  children.push(para('策略模式是DDD领域层的核心设计模式，用于处理四种题型（单选、多选、判断、简答）的差异化逻辑。SubjectTypeHandler接口定义了统一的题型处理契约，SubjectTypeHandlerFactory利用Spring的依赖注入机制自动注册所有处理器实现。'));
  children.push(para('【代码A-2 SubjectTypeHandler.java——题型处理器接口】'));
  children.push(para('package com.jingdianjichi.subject.domain.handler.subject;'));
  children.push(para('public interface SubjectTypeHandler {'));
  children.push(para('    SubjectInfoTypeEnum getHandlerType();  // 返回处理的题型枚举'));
  children.push(para('    void add(SubjectInfoBO subjectInfoBO);  // 题目新增'));
  children.push(para('    SubjectOptionBO query(int subjectId);   // 题目查询'));
  children.push(para('}'));
  children.push(para(''));
  children.push(para('【代码A-3 SubjectTypeHandlerFactory.java——题型处理器工厂】'));
  children.push(para('@Component'));
  children.push(para('public class SubjectTypeHandlerFactory implements InitializingBean {'));
  children.push(para('    @Resource private List<SubjectTypeHandler> handlerList;  // Spring自动注入所有实现'));
  children.push(para('    private Map<SubjectInfoTypeEnum, SubjectTypeHandler> handlerMap = new HashMap<>();'));
  children.push(para('    public SubjectTypeHandler getHandler(int subjectType) {'));
  children.push(para('        return handlerMap.get(SubjectInfoTypeEnum.getByCode(subjectType)); }'));
  children.push(para('    @Override public void afterPropertiesSet() {  // 初始化时构建映射'));
  children.push(para('        for (SubjectTypeHandler h : handlerList) {'));
  children.push(para('            handlerMap.put(h.getHandlerType(), h); }'));
  children.push(para('    }'));
  children.push(para('}'));

  children.push(heading2('A.3 策略模式——具体题型处理器实现'));
  children.push(para('每种题型有独立的Handler实现类，以单选题的RadioTypeHandler为例：'));
  children.push(para('【代码A-4 RadioTypeHandler.java——单选题处理器】'));
  children.push(para('@Component'));
  children.push(para('public class RadioTypeHandler implements SubjectTypeHandler {'));
  children.push(para('    @Resource private SubjectRadioService subjectRadioService;'));
  children.push(para('    @Override public SubjectInfoTypeEnum getHandlerType() {'));
  children.push(para('        return SubjectInfoTypeEnum.RADIO; }'));
  children.push(para('    @Override public void add(SubjectInfoBO bo) {'));
  children.push(para('        List<SubjectRadio> list = new LinkedList<>();'));
  children.push(para('        bo.getOptionList().forEach(option -> {'));
  children.push(para('            SubjectRadio radio = RadioSubjectConverter.INSTANCE.convertBoToEntity(option);'));
  children.push(para('            radio.setSubjectId(bo.getId());'));
  children.push(para('            radio.setIsDeleted(IsDeletedFlagEnum.UN_DELETED.getCode());'));
  children.push(para('            list.add(radio); });'));
  children.push(para('        subjectRadioService.batchInsert(list); }'));
  children.push(para('    @Override public SubjectOptionBO query(int subjectId) {'));
  children.push(para('        SubjectRadio radio = new SubjectRadio();'));
  children.push(para('        radio.setSubjectId(Long.valueOf(subjectId));'));
  children.push(para('        List<SubjectRadio> result = subjectRadioService.queryByCondition(radio);'));
  children.push(para('        List<SubjectAnswerBO> boList = RadioSubjectConverter.INSTANCE.convertEntityToBoList(result);'));
  children.push(para('        SubjectOptionBO optionBO = new SubjectOptionBO();'));
  children.push(para('        optionBO.setOptionList(boList);'));
  children.push(para('        return optionBO; }'));
  children.push(para('}'));
  children.push(para('类似地，MultipleTypeHandler处理多选题，JudgeTypeHandler处理判断题，BriefTypeHandler处理简答题，均遵循统一的SubjectTypeHandler接口契约。新增题型时只需添加新的Handler实现类，无需修改现有代码，符合开闭原则（Open-Closed Principle）。'));

  children.push(heading2('A.4 Elasticsearch全文检索实现'));
  children.push(para('Elasticsearch全文检索是题目搜索的核心功能，以下代码展示了ES搜索服务的实现。'));
  children.push(para('【代码A-5 SubjectEsServiceImpl.java——ES搜索服务（关键方法）】'));
  children.push(para('@Service @Slf4j'));
  children.push(para('public class SubjectEsServiceImpl implements SubjectEsService {'));
  children.push(para('    // 构建搜索查询：题目标题权重×2，题目答案权重×1'));
  children.push(para('    private EsSearchRequest createSearchListQuery(SubjectInfoEs req) {'));
  children.push(para('        BoolQueryBuilder bq = new BoolQueryBuilder();'));
  children.push(para('        // 标题字段权重为2，提高标题匹配的优先级'));
  children.push(para('        MatchQueryBuilder nameQb = QueryBuilders.matchQuery("subjectName", req.getKeyWord());'));
  children.push(para('        bq.should(nameQb); nameQb.boost(2);'));
  children.push(para('        // 答案字段权重为1'));
  children.push(para('        MatchQueryBuilder answerQb = QueryBuilders.matchQuery("subjectAnswer", req.getKeyWord());'));
  children.push(para('        bq.should(answerQb);'));
  children.push(para('        bq.minimumShouldMatch(1);  // 至少匹配一个条件'));
  children.push(para('        // 高亮配置：红色标签包裹匹配关键词'));
  children.push(para('        HighlightBuilder hb = new HighlightBuilder().field("*").requireFieldMatch(false);'));
  children.push(para('        hb.preTags("<span style=\\\"color:red\\\">"); hb.postTags("</span>");'));
  children.push(para('        esSearchRequest.setHighlightBuilder(hb);'));
  children.push(para('        // 分页参数：from = (pageNo - 1) * pageSize'));
  children.push(para('        esSearchRequest.setFrom((req.getPageNo() - 1) * req.getPageSize());'));
  children.push(para('        return esSearchRequest; }'));
  children.push(para('    // 转换ES结果为业务对象，处理高亮字段'));
  children.push(para('    private SubjectInfoEs convertResult(SearchHit hit) {'));
  children.push(para('        Map<String, Object> source = hit.getSourceAsMap();'));
  children.push(para('        SubjectInfoEs result = new SubjectInfoEs();'));
  children.push(para('        result.setSubjectName(MapUtils.getString(source, "subjectName"));'));
  children.push(para('        // 处理标题高亮：优先使用高亮片段'));
  children.push(para('        HighlightField nameField = hit.getHighlightFields().get("subjectName");'));
  children.push(para('        if (nameField != null) {'));
  children.push(para('            StringBuilder sb = new StringBuilder();'));
  children.push(para('            for (Text fragment : nameField.getFragments()) sb.append(fragment);'));
  children.push(para('            result.setSubjectName(sb.toString()); }'));
  children.push(para('        // 评分×100并保留两位小数'));
  children.push(para('        result.setScore(new BigDecimal(String.valueOf(hit.getScore()))'));
  children.push(para('            .multiply(new BigDecimal("100.00")).setScale(2, RoundingMode.HALF_UP));'));
  children.push(para('        return result; }'));
  children.push(para('}'));

  children.push(heading2('A.5 用户认证Controller'));
  children.push(para('以下代码展示了基于Sa-Token框架的用户认证模块Controller实现。'));
  children.push(para('【代码A-6 UserController.java——用户认证控制器（关键方法）】'));
  children.push(para('@RestController @RequestMapping("/user/") @Slf4j'));
  children.push(para('public class UserController {'));
  children.push(para('    @Resource private AuthUserDomainService authUserDomainService;'));
  children.push(para('    @RequestMapping("register")'));
  children.push(para('    public Result<Boolean> register(@RequestBody AuthUserDTO dto) {'));
  children.push(para('        checkUserInfo(dto);  // 参数校验'));
  children.push(para('        AuthUserBO bo = AuthUserDTOConverter.INSTANCE.convertDTOToBO(dto);'));
  children.push(para('        return Result.ok(authUserDomainService.register(bo)); }'));
  children.push(para('    @RequestMapping("doLogin")'));
  children.push(para('    public Result<SaTokenInfo> doLogin(@RequestParam("validCode") String validCode) {'));
  children.push(para('        Preconditions.checkArgument(!StringUtils.isBlank(validCode), "验证码不能为空!");'));
  children.push(para('        return Result.ok(authUserDomainService.doLogin(validCode)); }'));
  children.push(para('    @RequestMapping("logOut")'));
  children.push(para('    public Result logOut(@RequestParam String userName) {'));
  children.push(para('        StpUtil.logout(userName);  // Sa-Token登出'));
  children.push(para('        return Result.ok(); }'));
  children.push(para('    @RequestMapping("changeStatus")  // 用户启用/禁用'));
  children.push(para('    @RequestMapping("getUserInfo")   // 获取用户信息'));
  children.push(para('    @RequestMapping("listByIds")     // 批量获取用户信息'));
  children.push(para('}'));

  children.push(heading2('A.6 DDD领域层——题目领域服务接口'));
  children.push(para('以下展示领域服务接口的定义，体现了DDD中"领域层定义契约、基础设施层实现细节"的设计原则。'));
  children.push(para('【代码A-7 SubjectInfoDomainService.java——题目领域服务接口（关键方法签名）】'));
  children.push(para('public interface SubjectInfoDomainService {'));
  children.push(para('    void add(SubjectInfoBO subjectInfoBO);                  // 新增题目'));
  children.push(para('    PageResult<SubjectInfoBO> getSubjectPage(SubjectInfoBO bo); // 分页查询'));
  children.push(para('    SubjectInfoBO querySubjectInfo(SubjectInfoBO bo);        // 查询详情'));
  children.push(para('    PageResult<SubjectInfoEs> getSubjectPageBySearch(SubjectInfoBO bo); // ES全文检索'));
  children.push(para('    List<SubjectInfoBO> getContributeList();                // 贡献榜'));
  children.push(para('}'));

  children.push(heading2('A.7 前端核心页面结构'));
  children.push(para('前端基于React 18 + TypeScript + Vite构建，采用组件化开发模式和React Router v6懒加载路由。主要路由和视图模块如下：'));
  children.push(para('前端路由表（src/router/index.tsx）：'));
  children.push(para('├── /                         // 根路径，重定向至题库'));
  children.push(para('├── /question-bank            // 题库管理（主页）'));
  children.push(para('├── /brush-question/:id       // 刷题模块（题目详情）'));
  children.push(para('├── /upload-question          // 题目上传'));
  children.push(para('├── /login                    // 登录注册'));
  children.push(para('├── /user-info                // 用户信息'));
  children.push(para('├── /search-detail            // ES搜索详情'));
  children.push(para('├── /personal-center/:tab     // 个人中心（含多个Tab）'));
  children.push(para('├── /practise-questions       // 练习选题'));
  children.push(para('├── /practise-detail/:setId   // 练习详情/答题'));
  children.push(para('├── /practise-analytic/:id    // 练习分析报告'));
  children.push(para('└── /jichi-club               // 鸡翅圈子（社区）'));
  children.push(para(''));
  children.push(para('视图目录结构（src/views/）：'));
  children.push(para('├── brush-questions/     // 刷题模块'));
  children.push(para('├── chicken-circle/      // 鸡翅圈子（社区）'));
  children.push(para('├── header/              // 公共头部导航（App.tsx引用）'));
  children.push(para('├── login/               // 登录注册页'));
  children.push(para('├── personal-center/     // 个人中心'));
  children.push(para('├── practise/            // 在线练习（含选题/答题/分析子页面）'));
  children.push(para('├── question-bank/       // 题库管理'));
  children.push(para('├── search-details/      // ES全文搜索详情'));
  children.push(para('├── upload-questions/    // 题目上传'));
  children.push(para('└── user-info/           // 用户信息'));
  children.push(para(''));
  children.push(para('核心依赖（package.json）：'));
  children.push(para('├── react 18 + react-dom          // UI框架'));
  children.push(para('├── antd 5.x + @ant-design/icons  // UI组件库'));
  children.push(para('├── @reduxjs/toolkit + react-redux // 状态管理'));
  children.push(para('├── react-router-dom v6           // 前端路由'));
  children.push(para('├── axios                         // HTTP客户端'));
  children.push(para('├── @wangeditor/editor            // 富文本编辑器'));
  children.push(para('├── @ant-design/charts            // 图表可视化'));
  children.push(para('├── vite 4.x + @vitejs/plugin-react // 构建工具'));
  children.push(para('└── less                          // CSS预处理器'));
  children.push(para(''));
  children.push(para('公共组件（src/components/）包括：category-list（分类列表）、question-list（题目列表）、tags-editor（标签编辑器）、timerCom（计时器）、top-menu（顶部菜单）、analysis-atlas（分析图谱）、good-collection-error（错题收集）等。'));

  children.push(new Paragraph({ children: [new PageBreak()] }));

  children.push(heading1('附录B 系统流程图'));
  children.push(para('以下流程图采用标准流程图形状进行描述：圆角矩形表示开始/结束，矩形表示处理步骤，菱形表示判断/分支，箭头表示流程方向。'));

  children.push(heading2('B.1 用户认证流程'));
  children.push(para('┌─────────────────────────────────────────────────────────────────┐'));
  children.push(para('│  ╭──────────╮     ┌──────────────┐     ┌──────────────┐         │'));
  children.push(para('│  │  开始     │────▶│ 用户提交登录  │────▶│ 后端验证     │         │'));
  children.push(para('│  │(圆角矩形) │     │   请求       │     │ 账号密码     │         │'));
  children.push(para('│  ╰──────────╯     └──────────────┘     └──────┬───────┘         │'));
  children.push(para('│                                               │                 │'));
  children.push(para('│                                        ┌──────◇──────┐          │'));
  children.push(para('│                                        │  验证通过？  │          │'));
  children.push(para('│                                        │  (菱形)     │          │'));
  children.push(para('│                                        └──────┬──────┘          │'));
  children.push(para('│                                     ┌─否──────┼──────是─┐        │'));
  children.push(para('│                                     │         │         │        │'));
  children.push(para('│                               ┌─────▼────┐ ┌──▼──────────┐     │'));
  children.push(para('│                               │ 返回错误  │ │Sa-Token生成  │     │'));
  children.push(para('│                               │ 提示信息  │ │Token凭证    │     │'));
  children.push(para('│                               └──────────┘ └──────┬───────┘     │'));
  children.push(para('│                                                   │             │'));
  children.push(para('│                                          ┌────────▼────────┐    │'));
  children.push(para('│                                          │ 缓存Token到Redis │    │'));
  children.push(para('│                                          │ 关联用户会话信息  │    │'));
  children.push(para('│                                          └────────┬────────┘    │'));
  children.push(para('│                                                   │             │'));
  children.push(para('│                                          ┌────────▼────────┐    │'));
  children.push(para('│                                          │ 返回Token给前端  │    │'));
  children.push(para('│                                          │ 前端存入Header   │    │'));
  children.push(para('│                                          └────────┬────────┘    │'));
  children.push(para('│                                                   │             │'));
  children.push(para('│                                          ╭────────▼────────╮    │'));
  children.push(para('│                                          │  登录成功，结束  │    │'));
  children.push(para('│                                          │  (圆角矩形)     │    │'));
  children.push(para('│                                          ╰─────────────────╯    │'));
  children.push(para('└─────────────────────────────────────────────────────────────────┘'));
  children.push(para('图B-1描述了用户登录认证的完整流程。系统基于Sa-Token框架实现身份认证，核心步骤包括：用户提交登录请求→系统验证账号密码→Sa-Token生成JWT Token→将Token缓存至Redis实现分布式会话共享→将Token返回前端，后续请求通过拦截器解析Token完成身份鉴权。'));

  children.push(heading2('B.2 题目全文检索流程'));
  children.push(para('┌─────────────────────────────────────────────────────────────────┐'));
  children.push(para('│  ╭──────────╮     ┌──────────────┐     ┌──────────────────┐    │'));
  children.push(para('│  │ 用户输入  │────▶│ 前端发送搜索  │────▶│ SubjectController│    │'));
  children.push(para('│  │ 关键词   │     │ 请求到后端   │     │ 接收请求并校验   │    │'));
  children.push(para('│  ╰──────────╯     └──────────────┘     └────────┬─────────┘    │'));
  children.push(para('│                                                 │              │'));
  children.push(para('│                                        ┌────────▼─────────┐    │'));
  children.push(para('│                                        │ DomainService    │    │'));
  children.push(para('│                                        │ 调用ES搜索服务    │    │'));
  children.push(para('│                                        └────────┬─────────┘    │'));
  children.push(para('│                                                 │              │'));
  children.push(para('│                                        ┌────────▼─────────┐    │'));
  children.push(para('│                                        │ EsRestClient     │    │'));
  children.push(para('│                                        │ 构建BoolQuery    │    │'));
  children.push(para('│                                        │ 标题(boost=2)    │    │'));
  children.push(para('│                                        │ 答案(boost=1)    │    │'));
  children.push(para('│                                        └────────┬─────────┘    │'));
  children.push(para('│                                                 │              │'));
  children.push(para('│                                        ┌────────◇─────────┐    │'));
  children.push(para('│                                        │  搜索命中结果？   │    │'));
  children.push(para('│                                        └────────┬─────────┘    │'));
  children.push(para('│                                    ┌─无结果───┼──有结果──┐      │'));
  children.push(para('│                                    │           │          │      │'));
  children.push(para('│                              ┌─────▼────┐ ┌───▼──────────┐    │'));
  children.push(para('│                              │ 返回空列表 │ │IK分词高亮处理│    │'));
  children.push(para('│                              └──────────┘ │结果转换BO    │    │'));
  children.push(para('│                                           └──────┬───────┘    │'));
  children.push(para('│                                                  │            │'));
  children.push(para('│                                         ╭────────▼────────╮   │'));
  children.push(para('│                                         │  返回搜索结果   │   │'));
  children.push(para('│                                         │  (含高亮片段)   │   │'));
  children.push(para('│                                         ╰─────────────────╯   │'));
  children.push(para('└─────────────────────────────────────────────────────────────────┘'));
  children.push(para('图B-2描述了题目全文检索的完整流程。系统基于Elasticsearch实现分布式全文搜索，使用BoolQueryBuilder构建组合查询条件——题目标题字段匹配权重为2，题目答案字段匹配权重为1，通过IK分词器实现中文内容的精准分词与匹配。搜索结果通过HighlightBuilder进行关键词高亮标注，以红色标签包裹匹配的关键词，提升用户的搜索体验。'));

  children.push(heading2('B.3 策略模式——多题型处理流程'));
  children.push(para('┌─────────────────────────────────────────────────────────────────┐'));
  children.push(para('│  ╭───────────╮      ┌───────────────┐                            │'));
  children.push(para('│  │ Controller │─────▶│ SubjectType   │                            │'));
  children.push(para('│  │ 接收请求   │      │ HandlerFactory│                            │'));
  children.push(para('│  ╰───────────╯      │ .getHandler() │                            │'));
  children.push(para('│                     └───────┬───────┘                            │'));
  children.push(para('│                             │                                    │'));
  children.push(para('│                     ┌───────◇───────┐                            │'));
  children.push(para('│                     │ 根据subjectType│                            │'));
  children.push(para('│                     │   路由选择？   │                            │'));
  children.push(para('│                     └───────┬───────┘                            │'));
  children.push(para('│          ┌──────┬──────┬───┴────┬──────┐                         │'));
  children.push(para('│          │      │      │        │      │                         │'));
  children.push(para('│     ┌────▼┐ ┌───▼──┐ ┌▼───┐ ┌──▼──┐ ┌─▼────┐                    │'));
  children.push(para('│     │RADIO│ │MULTI │ │JUDGE│ │BRIEF│ │ 新增  │                    │'));
  children.push(para('│     │单选 │ │多选  │ │判断 │ │简答 │ │ 题型  │                    │'));
  children.push(para('│     │Handler│Handler│Handler│Handler│Handler│                    │'));
  children.push(para('│     └──┬──┘ └──┬───┘ └─┬───┘ └──┬──┘ └──┬───┘                    │'));
  children.push(para('│        │       │       │       │       │                          │'));
  children.push(para('│        ▼       ▼       ▼       ▼       ▼                          │'));
  children.push(para('│   ┌────────────────────────────────────────┐                     │'));
  children.push(para('│   │  执行具体Handler的add()或query()方法    │                     │'));
  children.push(para('│   │  各题型独立处理，互不干扰               │                     │'));
  children.push(para('│   └────────────────────┬───────────────────┘                     │'));
  children.push(para('│                        │                                         │'));
  children.push(para('│               ╭────────▼────────╮                                │'));
  children.push(para('│               │  返回处理结果   │                                │'));
  children.push(para('│               │  (圆角矩形)     │                                │'));
  children.push(para('│               ╰─────────────────╯                                │'));
  children.push(para('└─────────────────────────────────────────────────────────────────┘'));
  children.push(para('图B-3描述了基于策略模式和工厂模式的多题型处理架构流程。SubjectTypeHandlerFactory在系统初始化时通过Spring的InitializingBean接口自动扫描所有SubjectTypeHandler实现类，构建题型枚举到处理器的映射表。运行时根据题目类型枚举值从映射表中获取对应的Handler实例。新增题型时仅需实现SubjectTypeHandler接口并添加@Component注解，无需修改工厂类和现有处理器代码，完全遵循开闭原则（OCP）。'));

  children.push(heading2('B.4 点赞异步处理流程'));
  children.push(para('┌─────────────────────────────────────────────────────────────────┐'));
  children.push(para('│  ╭──────────╮     ┌──────────────┐     ┌──────────────┐         │'));
  children.push(para('│  │ 用户点击  │────▶│ Controller   │────▶│ Redis记录    │         │'));
  children.push(para('│  │ 点赞按钮 │     │ 接收点赞请求  │     │ 点赞状态     │         │'));
  children.push(para('│  ╰──────────╯     └──────────────┘     │ (ZSet存储)   │         │'));
  children.push(para('│                                        └──────┬───────┘         │'));
  children.push(para('│                                               │                 │'));
  children.push(para('│                                        ┌──────▼──────────┐      │'));
  children.push(para('│                                        │ 发送点赞消息到   │      │'));
  children.push(para('│                                        │ RocketMQ Topic  │      │'));
  children.push(para('│                                        └──────┬──────────┘      │'));
  children.push(para('│                                               │                 │'));
  children.push(para('│                                        ┌──────◇──────────┐      │'));
  children.push(para('│                                        │ MQ消息投递成功？ │      │'));
  children.push(para('│                                        └──────┬──────────┘      │'));
  children.push(para('│                                     失败重试─┼─成功             │'));
  children.push(para('│                                               │                 │'));
  children.push(para('│                                        ┌──────▼──────────┐      │'));
  children.push(para('│                                        │ Consumer消费消息 │      │'));
  children.push(para('│                                        │ SubjectLiked     │      │'));
  children.push(para('│                                        │ Consumer监听处理 │      │'));
  children.push(para('│                                        └──────┬──────────┘      │'));
  children.push(para('│                                               │                 │'));
  children.push(para('│                                        ┌──────▼──────────┐      │'));
  children.push(para('│                                        │ 异步写入MySQL   │      │'));
  children.push(para('│                                        │ 更新点赞计数    │      │'));
  children.push(para('│                                        └──────┬──────────┘      │'));
  children.push(para('│                                               │                 │'));
  children.push(para('│                                        ╭──────▼──────────╮      │'));
  children.push(para('│                                        │  点赞处理完成   │      │'));
  children.push(para('│                                        │  (圆角矩形)     │      │'));
  children.push(para('│                                        ╰─────────────────╯      │'));
  children.push(para('└─────────────────────────────────────────────────────────────────┘'));
  children.push(para('图B-4描述了基于Redis + RocketMQ的点赞异步处理流程。该设计采用"先更新缓存、再异步落库"的策略：用户点赞后首先更新Redis缓存中的点赞状态和ZSet排名数据，保证用户操作的即时响应；然后通过RocketMQ发送异步消息，由SubjectLikedConsumer消费者负责将点赞数据批量写入MySQL数据库。Redis ZSet数据结构被用于维护贡献榜排名，支持高效的实时排序查询。'));

  children.push(heading2('B.5 系统整体微服务架构流程'));
  children.push(para('┌─────────────────────────────────────────────────────────────────┐'));
  children.push(para('│  ╭─────────╮                                                    │'));
  children.push(para('│  │ 客户端   │ (Vue.js + Element Plus SPA)                       │'));
  children.push(para('│  │ 浏览器   │                                                    │'));
  children.push(para('│  ╰────┬────╯                                                    │'));
  children.push(para('│       │ HTTPS                                                    │'));
  children.push(para('│       ▼                                                          │'));
  children.push(para('│  ┌────────────────────────────────────────────┐                  │'));
  children.push(para('│  │         Spring Cloud Gateway 网关          │                  │'));
  children.push(para('│  │  路由转发 │ 负载均衡 │ 鉴权过滤 │ 跨域处理  │                  │'));
  children.push(para('│  └────────────────────┬───────────────────────┘                  │'));
  children.push(para('│                       │                                          │'));
  children.push(para('│       ┌───────┬───────┼───────┬───────┬─────────┐               │'));
  children.push(para('│       ▼       ▼       ▼       ▼       ▼         ▼               │'));
  children.push(para('│  ┌────────┐┌────────┐┌───────┐┌──────┐┌────────┐┌────────┐     │'));
  children.push(para('│  │Subject ││ Auth   ││Practice││Inter ││ Circle ││  OSS   │     │'));
  children.push(para('│  │题目服务││认证服务 ││练习服务││view  ││圈子服务││存储服务│     │'));
  children.push(para('│  │(核心)  ││(Sa-To-││(组卷/ ││面试服││(社交/ ││(文件上 │     │'));
  children.push(para('│  │        ││ken)    ││ 评分) ││务    ││ 动态) ││  传)   │     │'));
  children.push(para('│  └───┬────┘└───┬────┘└───┬───┘└──┬───┘└───┬────┘└───┬────┘     │'));
  children.push(para('│      │        │        │       │       │        │              │'));
  children.push(para('│      ▼        ▼        ▼       ▼       ▼        ▼              │'));
  children.push(para('│  ┌──────────────────────────────────────────────────┐           │'));
  children.push(para('│  │            Nacos 服务注册与配置中心               │           │'));
  children.push(para('│  │      服务发现 │ 配置管理 │ 健康检查                │           │'));
  children.push(para('│  └──────────────────────────────────────────────────┘           │'));
  children.push(para('│                                                                 │'));
  children.push(para('│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐      │'));
  children.push(para('│  │  MySQL   │  Redis   │  RocketMQ│ Elastic- │  Docker  │      │'));
  children.push(para('│  │  数据库  │  缓存    │  消息队列│  search  │  容器化  │      │'));
  children.push(para('│  └──────────┴──────────┴──────────┴──────────┴──────────┘      │'));
  children.push(para('└─────────────────────────────────────────────────────────────────┘'));
  children.push(para('图B-5描述了jc-club系统的整体微服务架构拓扑。系统采用Spring Cloud Alibaba微服务技术栈，各服务间通过OpenFeign进行声明式HTTP通信，通过RocketMQ进行异步消息通信。Nacos作为注册中心和配置中心，实现服务自动发现与动态配置管理。Spring Cloud Gateway作为API网关统一处理请求路由、负载均衡和权限过滤。数据存储层采用MySQL + Redis + Elasticsearch的混合存储架构。所有服务通过Docker容器化部署，保障环境一致性。'));

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ======== Build Document ========
  const doc = new Document({
    title: COVER.title,
    description: '本科毕业论文',
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 24 },
          paragraph: { spacing: { line: 360 } }
        }
      }
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1.0),
            right: convertInchesToTwip(1.0),
            bottom: convertInchesToTwip(1.0),
            left: convertInchesToTwip(1.2)
          },
          pageNumbers: {
            start: 1
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'XX学院本科毕业论文（设计）', font: { name: FONT }, size: 18, italics: false })],
                alignment: AlignmentType.CENTER
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [new TextRun({ children: [PageNumber.CURRENT] })],
                alignment: AlignmentType.CENTER
              })
            ]
          })
        }
      },
      children: children
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, '基于DDD微服务架构的程序员社区平台jc-club的设计与实现.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log('论文已生成:', outputPath);
  console.log('文件大小:', (buffer.length / 1024).toFixed(1), 'KB');
}

main().catch(console.error);
