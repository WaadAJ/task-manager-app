import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import useTheme from '../hooks/useTheme'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/auth/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center transition-colors">
      <button
        onClick={toggle}
        className="fixed top-4 right-4 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg text-sm transition"
      >
        {dark ? '☀️ Light' : '🌙 Dark'}
      </button>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md transition-colors">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create account</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Start managing your tasks</p>

        {error && <p className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-600 dark:text-gray-400 text-sm mb-1 block">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="your username"
            />
          </div>
          <div>
            <label className="text-gray-600 dark:text-gray-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-gray-600 dark:text-gray-400 text-sm mb-1 block">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition"
          >
            Create account
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-500 hover:text-indigo-400">Sign in</Link>
        </p>
      </div>
    </div>
  )
}