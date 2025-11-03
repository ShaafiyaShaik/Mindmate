"use client";

import React from 'react';
import Link from 'next/link';

export default function DashboardPage(): JSX.Element {
	return (
		<div className="min-h-screen p-8 bg-gray-50">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
				<p className="text-gray-600 mb-6">Welcome to the MindMate dashboard. This is a placeholder dashboard page.</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="p-4 bg-white rounded-lg shadow">
						<h2 className="font-medium">Student Chat</h2>
						<p className="text-sm text-gray-500">Open the student chat interface to message MindMate.</p>
						<Link href="/student" className="mt-3 inline-block text-soft-blue-600">Open Student Chat</Link>
					</div>

					<div className="p-4 bg-white rounded-lg shadow">
						<h2 className="font-medium">Resources</h2>
						<p className="text-sm text-gray-500">Browse resources or view the resources admin area.</p>
						<Link href="/resources" className="mt-3 inline-block text-soft-blue-600">View Resources</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
