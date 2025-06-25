'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
  CheckCircle2,
  Circle,
  Search,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

interface Reply {
  id: string
  content: string
  author: string
  createdAt: Date
}

interface SubTodo {
  id: string
  title: string
  completed: boolean
  createdAt: Date
  completedAt?: Date
}

interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  subTodos: SubTodo[]
  replies: Reply[]
  createdAt: Date
  completedAt?: Date
  expanded: boolean
}

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: '1',
      title: '完成项目文档',
      description: '需要完成用户手册和API文档的编写工作',
      completed: false,
      subTodos: [
        {
          id: '1-1',
          title: '编写用户手册',
          completed: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          id: '1-2',
          title: '编写API文档',
          completed: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ],
      replies: [{ id: 'r1', content: '记得添加示例代码', author: '张三', createdAt: new Date() }],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      expanded: false,
    },
    {
      id: '2',
      title: '准备会议材料',
      description: '为下周的项目评审会议准备相关材料',
      completed: true,
      subTodos: [],
      replies: [],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expanded: false,
    },
  ])

  const [newTodo, setNewTodo] = useState({ title: '', description: '' })
  const [newSubTodo, setNewSubTodo] = useState('')
  const [newReply, setNewReply] = useState('')
  const [activeSubTodoInput, setActiveSubTodoInput] = useState<string | null>(null)
  const [activeReplyInput, setActiveReplyInput] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // 统计数据
  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter((todo) => todo.completed).length
    const pending = total - completed

    const totalSubTodos = todos.reduce((acc, todo) => acc + todo.subTodos.length, 0)
    const completedSubTodos = todos.reduce((acc, todo) => acc + todo.subTodos.filter((sub) => sub.completed).length, 0)

    return {
      total,
      completed,
      pending,
      totalSubTodos,
      completedSubTodos,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }, [todos])

  // 搜索过滤
  const filteredTodos = useMemo(() => {
    if (!searchQuery.trim()) return todos

    const query = searchQuery.toLowerCase()
    return todos.filter(
      (todo) =>
        todo.title.toLowerCase().includes(query) ||
        todo.description.toLowerCase().includes(query) ||
        todo.subTodos.some((sub) => sub.title.toLowerCase().includes(query)) ||
        todo.replies.some((reply) => reply.content.toLowerCase().includes(query))
    )
  }, [todos, searchQuery])

  const addTodo = () => {
    if (newTodo.title.trim()) {
      const todo: Todo = {
        id: Date.now().toString(),
        title: newTodo.title,
        description: newTodo.description,
        completed: false,
        subTodos: [],
        replies: [],
        createdAt: new Date(),
        expanded: false,
      }
      setTodos([todo, ...todos])
      setNewTodo({ title: '', description: '' })
    }
  }

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              completedAt: !todo.completed ? new Date() : undefined,
            }
          : todo
      )
    )
  }

  const toggleSubTodo = (todoId: string, subTodoId: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subTodos: todo.subTodos.map((subTodo) =>
                subTodo.id === subTodoId
                  ? {
                      ...subTodo,
                      completed: !subTodo.completed,
                      completedAt: !subTodo.completed ? new Date() : undefined,
                    }
                  : subTodo
              ),
            }
          : todo
      )
    )
  }

  const addSubTodo = (todoId: string) => {
    if (newSubTodo.trim()) {
      const subTodo: SubTodo = {
        id: `${todoId}-${Date.now()}`,
        title: newSubTodo,
        completed: false,
        createdAt: new Date(),
      }
      setTodos(todos.map((todo) => (todo.id === todoId ? { ...todo, subTodos: [...todo.subTodos, subTodo] } : todo)))
      setNewSubTodo('')
      setActiveSubTodoInput(null)
    }
  }

  const addReply = (todoId: string) => {
    if (newReply.trim()) {
      const reply: Reply = {
        id: `r-${Date.now()}`,
        content: newReply,
        author: '当前用户',
        createdAt: new Date(),
      }
      setTodos(todos.map((todo) => (todo.id === todoId ? { ...todo, replies: [...todo.replies, reply] } : todo)))
      setNewReply('')
      setActiveReplyInput(null)
    }
  }

  const toggleExpanded = (id: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, expanded: !todo.expanded } : todo)))
  }

  const getCompletionStats = (todo: Todo) => {
    const total = todo.subTodos.length
    const completed = todo.subTodos.filter((sub) => sub.completed).length
    return { total, completed }
  }

  const isAllSubTodosCompleted = (todo: Todo) => {
    return todo.subTodos.length > 0 && todo.subTodos.every((sub) => sub.completed)
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">待办事项管理</h1>
        <p className="text-muted-foreground">管理你的任务、子任务和团队协作</p>
      </div>

      {/* 统计面板 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">总待办</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">已完成</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">未完成</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">完成率</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索框 */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索待办事项、描述、子任务或回复..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">找到 {filteredTodos.length} 个匹配的待办事项</p>
          )}
        </CardContent>
      </Card>

      {/* 添加新待办 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            添加新待办
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="待办标题..."
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          />
          <Textarea
            placeholder="详细描述..."
            value={newTodo.description}
            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
          />
          <Button onClick={addTodo} className="w-full">
            添加待办
          </Button>
        </CardContent>
      </Card>

      {/* 待办列表 */}
      <div className="space-y-4">
        {filteredTodos.map((todo) => {
          const stats = getCompletionStats(todo)
          return (
            <Card key={todo.id} className={`transition-all ${todo.completed ? 'opacity-75' : ''}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-lg font-semibold ${
                          todo.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {todo.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {stats.total > 0 && (
                          <Badge variant="secondary">
                            {stats.completed}/{stats.total}
                          </Badge>
                        )}
                        {todo.replies.length > 0 && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {todo.replies.length}
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => toggleExpanded(todo.id)}>
                          {todo.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    {todo.description && (
                      <p
                        className={`text-sm ${
                          todo.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {todo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        创建：{formatDate(todo.createdAt)}
                      </span>
                      {todo.completedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          完成：{formatDate(todo.completedAt)}
                        </span>
                      )}
                      {todo.completed && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          已完成
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              {todo.expanded && (
                <CardContent className="space-y-4">
                  {/* 子待办 */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      {isAllSubTodosCompleted(todo) ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      子待办 ({stats.completed}/{stats.total})
                      {isAllSubTodosCompleted(todo) && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          全部完成
                        </Badge>
                      )}
                    </h4>

                    {todo.subTodos.map((subTodo) => (
                      <div key={subTodo.id} className="space-y-2">
                        <div className="flex items-center gap-3 pl-6">
                          <Checkbox
                            checked={subTodo.completed}
                            onCheckedChange={() => toggleSubTodo(todo.id, subTodo.id)}
                          />
                          <span className={`flex-1 ${subTodo.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {subTodo.title}
                          </span>
                          {subTodo.completed && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pl-9">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            创建：{formatDateTime(subTodo.createdAt)}
                          </span>
                          {subTodo.completedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              完成：{formatDateTime(subTodo.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {activeSubTodoInput === todo.id ? (
                      <div className="flex gap-2 pl-6">
                        <Input
                          placeholder="子待办标题..."
                          value={newSubTodo}
                          onChange={(e) => setNewSubTodo(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSubTodo(todo.id)}
                        />
                        <Button size="sm" onClick={() => addSubTodo(todo.id)}>
                          添加
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setActiveSubTodoInput(null)}>
                          取消
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveSubTodoInput(todo.id)}
                        className="ml-6"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        添加子待办
                      </Button>
                    )}
                  </div>

                  <Separator />

                  {/* 回复/评论 */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      回复 ({todo.replies.length})
                    </h4>

                    {todo.replies.map((reply) => (
                      <div key={reply.id} className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{reply.author}</span>
                          <span className="text-muted-foreground">{formatDateTime(reply.createdAt)}</span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                      </div>
                    ))}

                    {activeReplyInput === todo.id ? (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="添加回复..."
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => addReply(todo.id)}>
                            发送回复
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setActiveReplyInput(null)}>
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setActiveReplyInput(todo.id)}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        添加回复
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {filteredTodos.length === 0 && searchQuery && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">未找到匹配的待办事项</h3>
            <p className="text-muted-foreground">尝试使用不同的关键词搜索</p>
          </CardContent>
        </Card>
      )}

      {todos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Circle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无待办事项</h3>
            <p className="text-muted-foreground">添加你的第一个待办事项开始管理任务吧！</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
