import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env file
config({ path: resolve(__dirname, "../.env") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set!");
  process.exit(1);
}

// Use HTTP adapter for Neon (better for serverless/edge environments)
const adapter = new PrismaNeonHttp(databaseUrl, {});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Get user ID from environment variable or use default test IDs
  const actualUserID = process.env.SEED_USER_ID || "9e00fddf-e99b-4e68-b384-d49ca8fa4d52";
  const useTestUsers = process.env.USE_TEST_USERS === "true";
  
  const userID1 = useTestUsers ? "user_test_001" : actualUserID;
  const userID2 = useTestUsers ? "user_test_002" : actualUserID;

  console.log(`Using user ID: ${userID1}${useTestUsers ? " (test mode)" : " (production mode)"}`);

  // Clear existing data (optional - comment out if you want to keep existing data)
  // Only clear data for the user we're seeding, or all if using test users
  if (useTestUsers) {
    await prisma.subTask.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.note.deleteMany();
    await prisma.setting.deleteMany();
  } else {
    // Get all projects for this user first
    const userProjects = await prisma.project.findMany({
      where: { userID: actualUserID },
      select: { id: true },
    });
    const projectIds = userProjects.map(p => p.id);

    // Delete subtasks associated with user's projects or tasks
    if (projectIds.length > 0) {
      await prisma.subTask.deleteMany({
        where: {
          OR: [
            { projectID: { in: projectIds } },
            { task: { projectID: { in: projectIds } } },
          ],
        },
      });
      
      // Delete tasks associated with user's projects
      await prisma.task.deleteMany({
        where: {
          projectID: { in: projectIds },
        },
      });
    }
    
    // Delete projects, notes, and settings for the user
    await prisma.project.deleteMany({
      where: {
        userID: actualUserID,
      },
    });
    await prisma.note.deleteMany({
      where: {
        userID: actualUserID,
      },
    });
    await prisma.setting.deleteMany({
      where: {
        userID: actualUserID,
      },
    });
  }

  // Create 6 test projects
  const projects = [
    {
      userID: userID1,
      title: "Website Redesign",
      description: "Complete redesign of the company website with modern UI/UX",
      status: "active",
      priority: 3,
      dueDate: new Date("2024-12-31"),
    },
    {
      userID: userID1,
      title: "Mobile App Development",
      description: "Build a cross-platform mobile application for iOS and Android",
      status: "active",
      priority: 2,
      dueDate: new Date("2025-01-15"),
    },
    {
      userID: userID1,
      title: "Database Migration",
      description: "Migrate legacy database to new cloud infrastructure",
      status: "on_hold",
      priority: 2,
      dueDate: new Date("2025-02-01"),
    },
    {
      userID: userID2,
      title: "Marketing Campaign",
      description: "Launch new marketing campaign for Q1 product release",
      status: "active",
      priority: 3,
      dueDate: new Date("2024-12-20"),
    },
    {
      userID: userID2,
      title: "API Documentation",
      description: "Create comprehensive API documentation for developers",
      status: "active",
      priority: 1,
      dueDate: new Date("2025-01-10"),
    },
    {
      userID: userID1,
      title: "Customer Support Portal",
      description: "Build a self-service portal for customer support tickets",
      status: "completed",
      priority: 2,
      dueDate: new Date("2024-11-15"),
    },
  ];

  const createdProjects = [];
  for (const projectData of projects) {
    const project = await prisma.project.create({
      data: projectData,
    });
    createdProjects.push(project);
    console.log(`✅ Created project: ${project.title} (${project.id})`);
  }

  // Create tasks for projects
  const tasksData = [
    // Tasks for Website Redesign
    {
      projectIndex: 0,
      title: "Design Mockups",
      description: "Create wireframes and high-fidelity mockups for all pages",
      status: "in_progress",
      priority: 3,
      dueDate: new Date("2024-12-15"),
      completed: false,
    },
    {
      projectIndex: 0,
      title: "Frontend Development",
      description: "Implement responsive frontend using React and Tailwind CSS",
      status: "pending",
      priority: 3,
      dueDate: new Date("2024-12-25"),
      completed: false,
    },
    {
      projectIndex: 0,
      title: "Backend Integration",
      description: "Connect frontend to API endpoints and handle data flow",
      status: "pending",
      priority: 2,
      dueDate: new Date("2024-12-28"),
      completed: false,
    },
    {
      projectIndex: 0,
      title: "Testing & QA",
      description: "Perform comprehensive testing and fix bugs",
      status: "pending",
      priority: 2,
      dueDate: new Date("2024-12-30"),
      completed: false,
    },
    // Tasks for Mobile App Development
    {
      projectIndex: 1,
      title: "UI/UX Design",
      description: "Design mobile app interface and user experience flows",
      status: "completed",
      priority: 3,
      dueDate: new Date("2024-12-10"),
      completed: true,
    },
    {
      projectIndex: 1,
      title: "iOS Development",
      description: "Build native iOS app using Swift and SwiftUI",
      status: "in_progress",
      priority: 3,
      dueDate: new Date("2025-01-10"),
      completed: false,
    },
    {
      projectIndex: 1,
      title: "Android Development",
      description: "Build native Android app using Kotlin and Jetpack Compose",
      status: "in_progress",
      priority: 3,
      dueDate: new Date("2025-01-12"),
      completed: false,
    },
    {
      projectIndex: 1,
      title: "Cross-platform Testing",
      description: "Test app on multiple devices and OS versions",
      status: "pending",
      priority: 2,
      dueDate: new Date("2025-01-14"),
      completed: false,
    },
    // Tasks for Database Migration
    {
      projectIndex: 2,
      title: "Backup Current Database",
      description: "Create full backup of existing database before migration",
      status: "completed",
      priority: 3,
      dueDate: new Date("2024-12-01"),
      completed: true,
    },
    {
      projectIndex: 2,
      title: "Schema Migration",
      description: "Migrate database schema to new structure",
      status: "pending",
      priority: 3,
      dueDate: new Date("2025-01-25"),
      completed: false,
    },
    {
      projectIndex: 2,
      title: "Data Migration",
      description: "Transfer all data to new database infrastructure",
      status: "pending",
      priority: 2,
      dueDate: new Date("2025-01-28"),
      completed: false,
    },
    // Tasks for Marketing Campaign
    {
      projectIndex: 3,
      title: "Content Creation",
      description: "Create marketing materials, copy, and visuals",
      status: "in_progress",
      priority: 3,
      dueDate: new Date("2024-12-15"),
      completed: false,
    },
    {
      projectIndex: 3,
      title: "Social Media Setup",
      description: "Set up social media accounts and schedule posts",
      status: "pending",
      priority: 2,
      dueDate: new Date("2024-12-18"),
      completed: false,
    },
    {
      projectIndex: 3,
      title: "Launch Campaign",
      description: "Execute marketing campaign across all channels",
      status: "pending",
      priority: 3,
      dueDate: new Date("2024-12-20"),
      completed: false,
    },
    // Tasks for API Documentation
    {
      projectIndex: 4,
      title: "API Endpoint Inventory",
      description: "List all API endpoints and their functionality",
      status: "completed",
      priority: 2,
      dueDate: new Date("2024-12-05"),
      completed: true,
    },
    {
      projectIndex: 4,
      title: "Write Documentation",
      description: "Write comprehensive documentation for each endpoint",
      status: "in_progress",
      priority: 2,
      dueDate: new Date("2025-01-05"),
      completed: false,
    },
    {
      projectIndex: 4,
      title: "Code Examples",
      description: "Create code examples for common use cases",
      status: "pending",
      priority: 1,
      dueDate: new Date("2025-01-08"),
      completed: false,
    },
    // Tasks for Customer Support Portal
    {
      projectIndex: 5,
      title: "Portal Design",
      description: "Design user-friendly support portal interface",
      status: "completed",
      priority: 2,
      dueDate: new Date("2024-10-20"),
      completed: true,
    },
    {
      projectIndex: 5,
      title: "Ticket System",
      description: "Implement ticket creation and tracking system",
      status: "completed",
      priority: 3,
      dueDate: new Date("2024-11-01"),
      completed: true,
    },
    {
      projectIndex: 5,
      title: "Knowledge Base",
      description: "Build searchable knowledge base with articles",
      status: "completed",
      priority: 2,
      dueDate: new Date("2024-11-10"),
      completed: true,
    },
  ];

  const createdTasks = [];
  for (const taskData of tasksData) {
    const { projectIndex, ...taskFields } = taskData;
    const task = await prisma.task.create({
      data: {
        ...taskFields,
        projectID: createdProjects[projectIndex].id,
      },
    });
    createdTasks.push(task);
    console.log(`✅ Created task: ${task.title} for project: ${createdProjects[projectIndex].title}`);
  }

  // Create subtasks for tasks
  const subtasksData = [
    // Subtasks for "Design Mockups" task
    {
      taskIndex: 0,
      title: "Homepage mockup",
      description: "Create homepage design with hero section",
      completed: true,
    },
    {
      taskIndex: 0,
      title: "Product page mockup",
      description: "Design product listing and detail pages",
      completed: true,
    },
    {
      taskIndex: 0,
      title: "About page mockup",
      description: "Create about us page design",
      completed: false,
    },
    {
      taskIndex: 0,
      title: "Contact page mockup",
      description: "Design contact form page",
      completed: false,
    },
    // Subtasks for "Frontend Development" task
    {
      taskIndex: 1,
      title: "Set up React project",
      description: "Initialize Next.js project with TypeScript",
      completed: true,
    },
    {
      taskIndex: 1,
      title: "Implement homepage",
      description: "Build homepage component with responsive layout",
      completed: false,
    },
    {
      taskIndex: 1,
      title: "Create navigation component",
      description: "Build responsive navigation bar",
      completed: false,
    },
    {
      taskIndex: 1,
      title: "Add routing",
      description: "Set up Next.js routing for all pages",
      completed: false,
    },
    // Subtasks for "iOS Development" task
    {
      taskIndex: 5,
      title: "Set up Xcode project",
      description: "Create new iOS project with proper configuration",
      completed: true,
    },
    {
      taskIndex: 5,
      title: "Implement authentication",
      description: "Add login and signup screens",
      completed: false,
    },
    {
      taskIndex: 5,
      title: "Build main dashboard",
      description: "Create main app dashboard with navigation",
      completed: false,
    },
    // Subtasks for "Android Development" task
    {
      taskIndex: 6,
      title: "Set up Android Studio project",
      description: "Create new Android project with Kotlin",
      completed: true,
    },
    {
      taskIndex: 6,
      title: "Implement authentication",
      description: "Add login and signup activities",
      completed: false,
    },
    {
      taskIndex: 6,
      title: "Build main activity",
      description: "Create main activity with bottom navigation",
      completed: false,
    },
    // Subtasks for "Content Creation" task
    {
      taskIndex: 12,
      title: "Write blog posts",
      description: "Create 5 blog posts for content marketing",
      completed: false,
    },
    {
      taskIndex: 12,
      title: "Design graphics",
      description: "Create social media graphics and banners",
      completed: false,
    },
    {
      taskIndex: 12,
      title: "Record video content",
      description: "Record product demo videos",
      completed: false,
    },
    // Subtasks for "Write Documentation" task
    {
      taskIndex: 15,
      title: "Authentication endpoints",
      description: "Document login, signup, and token refresh endpoints",
      completed: true,
    },
    {
      taskIndex: 15,
      title: "User endpoints",
      description: "Document user profile and settings endpoints",
      completed: false,
    },
    {
      taskIndex: 15,
      title: "Data endpoints",
      description: "Document CRUD endpoints for main resources",
      completed: false,
    },
  ];

  for (const subtaskData of subtasksData) {
    const { taskIndex, ...subtaskFields } = subtaskData;
    const subtask = await prisma.subTask.create({
      data: {
        ...subtaskFields,
        taskID: createdTasks[taskIndex].id,
        projectID: createdTasks[taskIndex].projectID,
      },
    });
    console.log(`✅ Created subtask: ${subtask.title} for task: ${createdTasks[taskIndex].title}`);
  }

  // Create some project-level subtasks (not associated with a specific task)
  const projectSubtasks = [
    {
      projectIndex: 0,
      title: "Set up development environment",
      description: "Configure local development setup for team",
      completed: true,
    },
    {
      projectIndex: 0,
      title: "Deploy staging environment",
      description: "Set up staging server for testing",
      completed: false,
    },
    {
      projectIndex: 1,
      title: "App Store preparation",
      description: "Prepare assets and metadata for app stores",
      completed: false,
    },
    {
      projectIndex: 2,
      title: "Performance testing",
      description: "Test database performance under load",
      completed: false,
    },
  ];

  for (const subtaskData of projectSubtasks) {
    const { projectIndex, ...subtaskFields } = subtaskData;
    const subtask = await prisma.subTask.create({
      data: {
        ...subtaskFields,
        projectID: createdProjects[projectIndex].id,
      },
    });
    console.log(`✅ Created project subtask: ${subtask.title} for project: ${createdProjects[projectIndex].title}`);
  }

  // Create test notes
  const notesData = [
    {
      userID: userID1,
      title: "Meeting Notes - Q4 Planning",
      content: "Discussed upcoming Q4 goals and priorities. Key focus areas:\n- Website redesign completion\n- Mobile app launch preparation\n- Team expansion planning\n\nAction items: Schedule follow-up meeting next week.",
      tags: "meeting, planning, q4",
      pinned: true,
    },
    {
      userID: userID1,
      title: "Project Ideas",
      content: "Random ideas for future projects:\n1. AI-powered task prioritization\n2. Team collaboration dashboard\n3. Automated reporting system\n\nNeed to research feasibility and market demand.",
      tags: "ideas, future, brainstorming",
      pinned: false,
    },
    {
      userID: userID2,
      title: "Quick Reference - API Endpoints",
      content: "Common API endpoints for quick reference:\n- GET /api/projects - List all projects\n- POST /api/projects - Create new project\n- PATCH /api/projects/:id - Update project\n- DELETE /api/projects/:id - Delete project\n\nRemember to include authentication headers.",
      tags: "api, reference, documentation",
      pinned: false,
    },
  ];

  for (const noteData of notesData) {
    const note = await prisma.note.create({
      data: noteData,
    });
    console.log(`✅ Created note: ${note.title} (${note.id})`);
  }

  // Create default settings for test users
  const settingsData = [
    // User 1 settings
    {
      userID: userID1,
      key: "theme",
      value: "light",
      category: "appearance",
      description: "Application theme preference",
    },
    {
      userID: userID1,
      key: "default_priority",
      value: "2",
      category: "projects",
      description: "Default priority for new projects",
    },
    {
      userID: userID1,
      key: "default_status",
      value: "todo",
      category: "projects",
      description: "Default status for new projects",
    },
    {
      userID: userID1,
      key: "default_start_page",
      value: "goals",
      category: "app",
      description: "Default page to show on dashboard load",
    },
    {
      userID: userID1,
      key: "default_sorting",
      value: "updated",
      category: "app",
      description: "Default sorting method",
    },
    {
      userID: userID1,
      key: "default_grouping",
      value: "none",
      category: "app",
      description: "Default grouping method",
    },
    // User 2 settings
    {
      userID: userID2,
      key: "theme",
      value: "dark",
      category: "appearance",
      description: "Application theme preference",
    },
    {
      userID: userID2,
      key: "default_priority",
      value: "1",
      category: "projects",
      description: "Default priority for new projects",
    },
    {
      userID: userID2,
      key: "default_status",
      value: "in_progress",
      category: "projects",
      description: "Default status for new projects",
    },
    {
      userID: userID2,
      key: "default_start_page",
      value: "tasks",
      category: "app",
      description: "Default page to show on dashboard load",
    },
    {
      userID: userID2,
      key: "default_sorting",
      value: "priority",
      category: "app",
      description: "Default sorting method",
    },
    {
      userID: userID2,
      key: "default_grouping",
      value: "status",
      category: "app",
      description: "Default grouping method",
    },
  ];

  for (const settingData of settingsData) {
    const setting = await prisma.setting.create({
      data: settingData,
    });
    console.log(`✅ Created setting: ${setting.key} for user ${setting.userID}`);
  }

  console.log("✨ Seed completed successfully!");
  console.log(`📊 Created ${createdProjects.length} projects, ${createdTasks.length} tasks, ${subtasksData.length + projectSubtasks.length} subtasks, ${notesData.length} notes, and ${settingsData.length} settings`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

