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
const adapter = new PrismaNeonHttp(databaseUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.subTask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();

  // Create 6 test projects
  const projects = [
    {
      userID: "user_test_001",
      title: "Website Redesign",
      description: "Complete redesign of the company website with modern UI/UX",
      status: "active",
      priority: 3,
      dueDate: new Date("2024-12-31"),
    },
    {
      userID: "user_test_001",
      title: "Mobile App Development",
      description: "Build a cross-platform mobile application for iOS and Android",
      status: "active",
      priority: 2,
      dueDate: new Date("2025-01-15"),
    },
    {
      userID: "user_test_001",
      title: "Database Migration",
      description: "Migrate legacy database to new cloud infrastructure",
      status: "on_hold",
      priority: 2,
      dueDate: new Date("2025-02-01"),
    },
    {
      userID: "user_test_002",
      title: "Marketing Campaign",
      description: "Launch new marketing campaign for Q1 product release",
      status: "active",
      priority: 3,
      dueDate: new Date("2024-12-20"),
    },
    {
      userID: "user_test_002",
      title: "API Documentation",
      description: "Create comprehensive API documentation for developers",
      status: "active",
      priority: 1,
      dueDate: new Date("2025-01-10"),
    },
    {
      userID: "user_test_001",
      title: "Customer Support Portal",
      description: "Build a self-service portal for customer support tickets",
      status: "completed",
      priority: 2,
      dueDate: new Date("2024-11-15"),
    },
  ];

  for (const projectData of projects) {
    const project = await prisma.project.create({
      data: projectData,
    });
    console.log(`✅ Created project: ${project.title} (${project.id})`);
  }

  console.log("✨ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

