const Blog = require("../models/Blog");

const topics = [
  { title: "Node.js", tags: ["nodejs", "javascript", "backend"] },
  { title: "React", tags: ["react", "frontend", "javascript"] },
  { title: "MongoDB", tags: ["mongodb", "database", "nosql"] },
  { title: "Express.js", tags: ["express", "nodejs", "backend"] },
  { title: "TypeScript", tags: ["typescript", "javascript", "programming"] },
  { title: "Docker", tags: ["docker", "devops", "containers"] },
  { title: "Kubernetes", tags: ["kubernetes", "devops", "orchestration"] },
  { title: "GraphQL", tags: ["graphql", "api", "web-development"] },
  { title: "REST API", tags: ["rest", "api", "web-development"] },
  { title: "JWT", tags: ["jwt", "authentication", "security"] },
  { title: "Microservices", tags: ["microservices", "architecture", "scalability"] },
  { title: "Testing", tags: ["testing", "jest", "quality-assurance"] },
  { title: "CI/CD", tags: ["cicd", "devops", "automation"] },
  { title: "AWS", tags: ["aws", "cloud", "infrastructure"] },
  { title: "Vue.js", tags: ["vue", "frontend", "javascript"] },
  { title: "Python", tags: ["python", "programming", "backend"] },
  { title: "PostgreSQL", tags: ["postgresql", "database", "sql"] },
  { title: "Redis", tags: ["redis", "cache", "database"] },
  { title: "WebSockets", tags: ["websockets", "realtime", "networking"] },
  { title: "OAuth", tags: ["oauth", "authentication", "security"] },
];

const prefixes = [
  "Getting Started with",
  "Advanced Guide to",
  "Understanding",
  "Mastering",
  "Introduction to",
  "Deep Dive into",
  "Best Practices for",
  "Complete Guide to",
  "Building with",
  "Exploring",
];

const suffixes = [
  "for Beginners",
  "in Production",
  "Best Practices",
  "Tips and Tricks",
  "Performance Optimization",
  "Security Guide",
  "Architecture Patterns",
  "Common Pitfalls",
  "Real-World Examples",
  "Advanced Techniques",
];

const bodyTemplates = [
  (topic) =>
    `${topic} has become an essential tool in modern web development. This comprehensive guide explores the core concepts, best practices, and real-world applications. We'll cover everything from basic setup to advanced techniques, helping you build robust and scalable applications. Whether you're just starting out or looking to deepen your knowledge, this article provides valuable insights and practical examples that you can apply immediately to your projects. Learn how to leverage ${topic} effectively and avoid common mistakes that developers make.`,
  (topic) =>
    `In this detailed tutorial, we'll explore ${topic} and its role in modern software development. You'll learn about key features, implementation strategies, and how to integrate ${topic} into your workflow. We'll discuss common challenges and their solutions, performance considerations, and best practices that will help you write better code. This guide includes practical examples and step-by-step instructions to help you master ${topic} and use it effectively in your projects.`,
  (topic) =>
    `${topic} is revolutionizing how developers build applications. This article provides an in-depth look at ${topic}, covering fundamental concepts, advanced features, and practical use cases. We'll explore the ecosystem, tools, and techniques that make ${topic} powerful and efficient. You'll discover how to optimize your workflow, improve code quality, and build scalable solutions. By the end of this guide, you'll have a solid understanding of ${topic} and how to apply it to real-world scenarios.`,
  (topic) =>
    `Understanding ${topic} is crucial for modern developers. This comprehensive guide breaks down complex concepts into digestible pieces, making it easy to grasp the fundamentals and advance to more sophisticated techniques. We'll cover architecture patterns, design principles, and implementation details that will help you build better applications. Learn from real-world examples and discover how leading companies use ${topic} to solve complex problems and deliver exceptional user experiences.`,
  (topic) =>
    `This article explores ${topic} from the ground up, providing you with the knowledge and skills needed to excel. We'll discuss core principles, common patterns, and advanced strategies that professionals use daily. You'll learn how to avoid pitfalls, optimize performance, and write maintainable code. Whether you're building a small project or a large-scale application, this guide will help you leverage ${topic} effectively and efficiently in your development workflow.`,
];

const generateBlogPost = (index, topic) => {
  const prefix = prefixes[index % prefixes.length];
  const suffix = suffixes[Math.floor(index / prefixes.length) % suffixes.length];
  const bodyTemplate = bodyTemplates[index % bodyTemplates.length];

  const titleVariations = [
    `${prefix} ${topic.title}`,
    `${topic.title}: ${suffix}`,
    `${prefix} ${topic.title} ${suffix}`,
    `How to Master ${topic.title}`,
    `${topic.title} Explained`,
  ];

  const title = titleVariations[index % titleVariations.length];

  return {
    title: `${title} - Part ${Math.floor(index / topics.length) + 1}`,
    description: `Learn about ${topic.title} and how to use it effectively in your projects`,
    body: bodyTemplate(topic.title),
    tags: topic.tags,
    state: index % 4 === 0 ? "draft" : "published",
  };
};

const seedBlogs = async (users, count = 100) => {
  try {
    await Blog.deleteMany({});

    const blogs = [];
    for (let i = 0; i < count; i++) {
      const topic = topics[i % topics.length];
      const blogPost = generateBlogPost(i, topic);
      blogs.push({
        ...blogPost,
        author: users[i % users.length]._id,
      });
    }

    const createdBlogs = await Blog.create(blogs);
    console.log(`${createdBlogs.length} blogs seeded successfully`);

    const publishedCount = createdBlogs.filter((b) => b.state === "published")
      .length;
    const draftCount = createdBlogs.filter((b) => b.state === "draft").length;
    console.log(`  - Published: ${publishedCount}`);
    console.log(`  - Drafts: ${draftCount}`);

    return createdBlogs;
  } catch (error) {
    console.error("Error seeding blogs:", error.message);
    throw error;
  }
};

module.exports = { seedBlogs };
