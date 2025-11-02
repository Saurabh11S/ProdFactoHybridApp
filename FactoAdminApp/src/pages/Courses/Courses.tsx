import React, { useEffect, useState } from 'react';
import HeaderBar from '@/components/common/HeaderBar';
import CourseForm from '@/components/Courses/CourseForm';
import CourseTable from '@/components/Courses/CoursesTable';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';

const Courses: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'allCourses' | 'addCourse'>('allCourses');
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  useEffect(() => {
    if (courseId) {
      setActiveTab('addCourse'); // courseId exists in the params
    }
  }, [courseId]);

  return (
    <div className="w-11/12 m-auto">
      <HeaderBar pageTitle="Courses" />

      <div className="p-3 flex justify-start my-2 space-x-2">
        <Button
        variant={activeTab === 'allCourses' ? 'default' : 'outline'}
          onClick={() =>{
            setActiveTab("allCourses")
            navigate("/courses")
          }}
        >
          All Courses
        </Button>
        <Button
        variant={activeTab === 'addCourse' ? 'default' : 'outline'}
          onClick={() => setActiveTab('addCourse')}
        >
          Add New Course
        </Button>
      </div>

      {activeTab === 'allCourses' && <CourseTable />}
      {activeTab === 'addCourse' && <CourseForm />}
    </div>
  );
};

export default Courses;
