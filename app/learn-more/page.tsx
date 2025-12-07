"use client";

import Link from "next/link";

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

                    <div className="space-y-10 text-gray-700 dark:text-gray-300">

                        {/* Overview */}
                        <section>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Overview</h2>
                            <p className="text-lg leading-relaxed">
                                ProjectManager is a modern web-based project management application built to help
                                individuals and small teams organize work, track progress, and stay focused on what matters.
                                The application provides structured task tracking, project organization, and a clean user experience
                                powered by a secure and scalable backend.
                            </p>
                        </section>

                        {/* Core Features */}
                        <section>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Core Features</h2>
                            <ul className="list-disc list-inside space-y-2 text-lg">
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
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Technology Stack</h2>
                            <ul className="list-disc list-inside space-y-2 text-lg">
                                <li><strong className="text-gray-900 dark:text-gray-100">Frontend:</strong> Next.js (App Router), React, TypeScript, Tailwind CSS</li>
                                <li className="pl-6 -indent-6">
                                        <strong className="min-w-[90px] text-gray-900 dark:text-gray-100">
                                            Backend:
                                        </strong>
                                        <span>
                                            Next.js API Routes and Server Actions with secure authentication,
                                            RESTful endpoints, and PostgreSQL (Neon) integration
                                        </span>
                                </li>
                                <li><strong className="text-gray-900 dark:text-gray-100">Database:</strong> PostgreSQL</li>
                                <li><strong className="text-gray-900 dark:text-gray-100">Authentication:</strong> Stack Auth</li>
                                <li><strong className="text-gray-900 dark:text-gray-100">Deployment:</strong> Vercel</li>
                            </ul>
                        </section>

                        {/* Architecture */}
                        <section>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Application Architecture</h2>
                            <p className="text-lg leading-relaxed">
                                The application follows a modular full-stack architecture where the frontend communicates
                                with secured API endpoints for all data operations. Server-side logic handles authentication,
                                validation, and database operations, while client components provide fast and responsive
                                user interaction.
                            </p>
                        </section>

                        {/* Security */}
                        <section>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Security</h2>
                            <p className="text-lg leading-relaxed">
                                Security is handled through authenticated sessions, protected API routes, and strict data
                                validation. Sensitive operations such as task creation, updates, and deletions require verified
                                user access.
                            </p>
                        </section>

                        {/* Purpose */}
                        <section>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Project Purpose</h2>
                            <p className="text-lg leading-relaxed">
                                This application was built as a portfolio project to demonstrate real-world full-stack
                                development skills, including frontend architecture, backend development, database design,
                                authentication, deployment, and production-level UI/UX standards.
                            </p>
                        </section>

                        {/* Future Improvements */}
                        <section>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Planned Enhancements</h2>
                            <ul className="list-disc list-inside space-y-2 text-lg">
                                <li>Team collaboration and shared projects</li>
                                <li>Activity logs and task history</li>
                                <li>File attachments</li>
                                <li>Advanced filtering and search</li>
                                <li>Role-based access control</li>
                            </ul>
                        </section>

                        {/* Return to login button */}
                        <div className="flex justify-center">
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Return to Home
                            </Link>
                        </div>

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