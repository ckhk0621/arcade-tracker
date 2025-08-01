{
  "version": "1.0",
  "projectName": "Arcade Machine Tracker",
  "projectType": "payloadcms-nextjs",
  "context": {
    "description": "Hong Kong arcade machine information tracking application",
    "techStack": [
      "PayloadCMS 2.x",
      "Next.js 14",
      "TypeScript",
      "Tailwind CSS",
      "MongoDB",
      "Cloudinary"
    ],
    "features": [
      "User authentication and points system",
      "Store location management",
      "Machine photo uploads",
      "Community comments feature",
      "Map integration"
    ]
  },
  "agents": {
    "backend": ".claude/agents/backend-agent.json",
    "frontend": ".claude/agents/frontend-agent.json",
    "database": ".claude/agents/database-agent.json",
    "deployment": ".claude/agents/deployment-agent.json",
    "testing": ".claude/agents/testing-agent.json"
  },
  "workingDirectory": "src",
  "outputPreferences": {
    "codeStyle": "TypeScript + ESNext",
    "formatting": "Prettier",
    "linting": "ESLint"
  }
}