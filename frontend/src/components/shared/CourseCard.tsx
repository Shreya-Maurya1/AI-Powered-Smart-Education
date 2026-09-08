import React from 'react';
import Link from 'next/link';
import { Course } from '@/types';
import { BookOpen, User, ArrowRight } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
  progressPercent?: number;
  onEnroll?: (courseId: string) => void;
}

export function CourseCard({ course, isEnrolled, progressPercent, onEnroll }: CourseCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="h-40 bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex flex-col justify-between text-white relative">
          <div className="flex gap-2">
            <span className="bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-medium">
              {course.subjectArea}
            </span>
            <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-medium">
              Grade {course.gradeLevel}
            </span>
          </div>
          <h3 className="font-bold text-lg leading-snug line-clamp-2">{course.title}</h3>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>

          {course.teacher?.user && (
            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
              <User className="w-3.5 h-3.5" />
              <span>{course.teacher.user.name}</span>
            </div>
          )}

          {isEnrolled && progressPercent !== undefined && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-500">Progress</span>
                <span className="text-indigo-600 font-bold">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 border-t border-gray-50">
        <Link
          href={`/courses/${course.id}`}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-lg text-sm transition-colors"
        >
          {isEnrolled ? 'Continue Learning' : 'View Details'}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
