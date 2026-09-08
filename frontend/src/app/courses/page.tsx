'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useCourses } from '@/hooks/useCourses';
import { CourseCard } from '@/components/shared/CourseCard';
import { Spinner } from '@/components/ui/Spinner';
import { Search, Filter } from 'lucide-react';

export default function CoursesPage() {
  const [subject, setSubject] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const { courses, enrolledCourses, loading, error, enroll } = useCourses({
    subjectArea: subject || undefined,
    gradeLevel: grade || undefined,
  });

  const enrolledIds = new Set(enrolledCourses.map((e) => e.courseId));

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRole="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Explore Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Select a course to start or continue your adaptive learning path.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Subjects</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
            </select>

            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Grades</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">{error}</div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">
            No courses found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledIds.has(course.id);
              const enrolledItem = enrolledCourses.find((e) => e.courseId === course.id);
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={isEnrolled}
                  progressPercent={enrolledItem?.progressPercent}
                  onEnroll={enroll}
                />
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
