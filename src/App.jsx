import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectForm from './pages/ProjectForm';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import TaskForm from './pages/TaskForm';
import TaskDetail from './pages/TaskDetail';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import MyTasks from './pages/MyTasks';
import Users from './pages/Users';
import UserForm from './pages/UserForm';
import UserDetail from './pages/UserDetail';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/projects" element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } />

          <Route path="/projects/new" element={
            <ProtectedRoute>
              <ProjectForm />
            </ProtectedRoute>
          } />

          <Route path="/projects/:id" element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } />

          <Route path="/projects/:id/edit" element={
            <ProtectedRoute>
              <ProjectForm />
            </ProtectedRoute>
          } />

          <Route path="/tasks" element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          } />

          <Route path="/tasks/new" element={
            <ProtectedRoute>
              <TaskForm />
            </ProtectedRoute>
          } />

          <Route path="/tasks/:id" element={
            <ProtectedRoute>
              <TaskDetail />
            </ProtectedRoute>
          } />

          <Route path="/tasks/:id/edit" element={
            <ProtectedRoute>
              <TaskForm />
            </ProtectedRoute>
          } />

          <Route path="/calendar" element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />

          <Route path="/my-tasks" element={
            <ProtectedRoute>
              <MyTasks />
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } />

          <Route path="/users/new" element={
            <ProtectedRoute>
              <UserForm />
            </ProtectedRoute>
          } />

          <Route path="/users/:id" element={
            <ProtectedRoute>
              <UserDetail />
            </ProtectedRoute>
          } />

          <Route path="/users/:id/edit" element={
            <ProtectedRoute>
              <UserForm />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
