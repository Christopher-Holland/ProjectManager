"use client";

export default function LearnMore() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
                        ProjectManager Documentation
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 text-center">
                        A full-stack project management system designed for real-world productivity and scalable architecture.
                    </p>

                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-10">

                        {/* Overview */}
                        <section>
                            <h2>Overview</h2>
                            <p>
                                ProjectManager is a modern web-based project management application built to help
                                individuals and small teams organize work, track progress, and stay focused on what matters.
                                The application provides structured task tracking, project organization, and a clean user experience
                                powered by a secure and scalable backend.
                            </p>
                        </section>

                        {/* Core Features */}
                        <section>
                            <h2>Core Features</h2>
                            <ul>
                                <li>Create and manage multiple projects</li>
                                <li>Add, edit, and delete tasks within each project</li>
                                <li>Task status tracking (To Do, In Progress, Completed)</li>
                                <li>Priority levels and due dates</li>
                                <li>Real-time UI updates</li>
                                <li>Secure authentication and protected routes</li>
                            </ul>
                        </section>

                        {/* Technology Stack */}
                        <section>
                            <h2>Technology Stack</h2>
                            <ul>
                                <li><strong>Frontend:</strong> Next.js (App Router), React, TypeScript, Tailwind CSS</li>
                                <li><strong>Backend:</strong> API Routes / Server Actions</li>
                                <li><strong>Database:</strong> MongoDB</li>
                                <li><strong>Authentication:</strong> JWT / Secure Sessions</li>
                                <li><strong>Deployment:</strong> Vercel</li>
                            </ul>
                        </section>

                        {/* Architecture */}
                        <section>
                            <h2>Application Architecture</h2>
                            <p>
                                The application follows a modular full-stack architecture where the frontend communicates
                                with secured API endpoints for all data operations. Server-side logic handles authentication,
                                validation, and database operations, while client components provide fast and responsive
                                user interaction.
                            </p>
                        </section>

                        {/* Security */}
                        <section>
                            <h2>Security</h2>
                            <p>
                                Security is handled through authenticated sessions, protected API routes, and strict data
                                validation. Sensitive operations such as task creation, updates, and deletions require verified
                                user access.
                            </p>
                        </section>

                        {/* Purpose */}
                        <section>
                            <h2>Project Purpose</h2>
                            <p>
                                This application was built as a portfolio project to demonstrate real-world full-stack
                                development skills, including frontend architecture, backend development, database design,
                                authentication, deployment, and production-level UI/UX standards.
                            </p>
                        </section>

                        {/* Future Improvements */}
                        <section>
                            <h2>Planned Enhancements</h2>
                            <ul>
                                <li>Team collaboration and shared projects</li>
                                <li>Activity logs and task history</li>
                                <li>File attachments</li>
                                <li>Advanced filtering and search</li>
                                <li>Role-based access control</li>
                            </ul>
                        </section>

                        {/* Footer Note */}
                        <section>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-12">
                                Built as part of a professional full-stack development portfolio project.
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-12">
                                Christopher Holland - 2025
                            </p>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}