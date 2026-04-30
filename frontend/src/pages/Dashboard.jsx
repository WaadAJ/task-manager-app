import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import useTheme from '../hooks/useTheme'

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', due_date: '' })
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()

  useEffect(() => {
    fetchUser()
    fetchTasks()
  }, [filter, search])

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data)
    } catch {}
  }

  const fetchTasks = async () => {
    try {
      const params = {}
      if (filter !== null) params.completed = filter
      if (search) params.search = search
      const res = await api.get('/tasks', { params })
      setTasks(res.data)
    } catch {}
  }

  const handleSubmit = async () => {
    const payload = {
      title: form.title,
      description: form.description,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
    }
    try {
      if (editTask) {
        await api.put(`/tasks/${editTask.id}`, payload)
      } else {
        await api.post('/tasks', payload)
      }
      setForm({ title: '', description: '', due_date: '' })
      setShowForm(false)
      setEditTask(null)
      fetchTasks()
    } catch {}
  }

  const toggleComplete = async (task) => {
    await api.patch(`/tasks/${task.id}/complete`)
    fetchTasks()
  }

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`)
    fetchTasks()
  }

  const startEdit = (task) => {
    setEditTask(task)
    setForm({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date ? task.due_date.slice(0, 16) : '',
    })
    setShowForm(true)
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const pending = total - completed

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between transition-colors">
        <h1 className="text-xl font-bold text-indigo-500">TaskManager</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggle}
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm transition"
          >
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
          <span className="text-gray-500 dark:text-gray-400 text-sm">@{user?.username}</span>
          <button onClick={logout} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total', value: total, color: 'text-indigo-500' },
            { label: 'Completed', value: completed, color: 'text-green-500' },
            { label: 'Pending', value: pending, color: 'text-yellow-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 transition-colors">
              <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <div className="flex gap-2">
            {[
              { label: 'All', value: null },
              { label: 'Pending', value: false },
              { label: 'Done', value: true },
            ].map(f => (
              <button
                key={f.label}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setShowForm(true); setEditTask(null); setForm({ title: '', description: '', due_date: '' }) }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Add Task
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6 transition-colors">
            <h2 className="text-lg font-semibold mb-4">{editTask ? 'Edit Task' : 'New Task'}</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Task title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <input
                type="datetime-local"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  {editTask ? 'Save' : 'Create'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditTask(null) }}
                  className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-3">
          {tasks.length === 0 && (
            <div className="text-center text-gray-400 py-16">No tasks found</div>
          )}
          {tasks.map(task => (
            <div
              key={task.id}
              className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex items-start gap-4 transition-colors ${task.completed ? 'opacity-60' : ''}`}
            >
              <button
                onClick={() => toggleComplete(task)}
                className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 transition ${
                  task.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-400 dark:border-gray-600 hover:border-indigo-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{task.description}</p>
                )}
                {task.due_date && (
                  <p className="text-xs text-indigo-500 mt-2">
                    Due: {new Date(task.due_date).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => startEdit(task)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition">
                  Edit
                </button>
                <button onClick={() => deleteTask(task.id)} className="text-red-400 hover:text-red-500 text-sm transition">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}