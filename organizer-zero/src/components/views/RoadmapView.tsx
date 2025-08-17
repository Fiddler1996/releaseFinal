// components/views/RoadmapView.tsx
import React, { useState } from 'react';
import {
  Map,
  CheckCircle,
  Circle,
  Clock,
  Target,
  Rocket,
  Star,
  Code,
  Smartphone,
  Shield,
  Zap,
  Brain,
  Globe,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  GitBranch,
  Users,
  Heart
} from 'lucide-react';
import { Button } from '../ui';
import { useNotifications } from '../../store/hooks';

interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'planned';
  progress: number;
  estimated: string;
  features: RoadmapFeature[];
}

interface RoadmapFeature {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'planned';
  priority: 'high' | 'medium' | 'low';
  category: 'frontend' | 'backend' | 'design' | 'feature';
}

/**
 * Вид роадмапа с планом развития проекта
 */
export const RoadmapView: React.FC = () => {
  const { addNotification } = useNotifications();
  const [expandedPhases, setExpandedPhases] = useState<string[]>(['current']);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'frontend' | 'backend' | 'design' | 'feature'>('all');

  // Данные роадмапа
  const roadmapPhases: RoadmapPhase[] = [
    {
      id: 'phase1',
      title: 'ФАЗА 1: Базовая архитектура',
      description: 'Создание модульной архитектуры и основных компонентов',
      status: 'completed',
      progress: 100,
      estimated: 'Завершено',
      features: [
        {
          id: 'arch1',
          title: 'TypeScript типизация',
          description: 'Полная система типов для всех компонентов',
          status: 'completed',
          priority: 'high',
          category: 'frontend'
        },
        {
          id: 'arch2',
          title: 'Context + Reducer',
          description: 'Централизованное управление состоянием',
          status: 'completed',
          priority: 'high',
          category: 'frontend'
        },
        {
          id: 'arch3',
          title: 'Модульная структура',
          description: 'Разделение кода по модулям и зависимостям',
          status: 'completed',
          priority: 'high',
          category: 'frontend'
        }
      ]
    },
    {
      id: 'phase2',
      title: 'ФАЗА 2: Пользовательский интерфейс',
      description: 'Создание всех UI компонентов и экранов',
      status: 'current',
      progress: 85,
      estimated: 'В процессе',
      features: [
        {
          id: 'ui1',
          title: 'Layout компоненты',
          description: 'Header, Footer, навигация',
          status: 'completed',
          priority: 'high',
          category: 'frontend'
        },
        {
          id: 'ui2',
          title: 'Calendar View',
          description: 'Календарная сетка и список событий',
          status: 'completed',
          priority: 'high',
          category: 'frontend'
        },
        {
          id: 'ui3',
          title: 'Schedule View',
          description: 'Детальное расписание на день',
          status: 'completed',
          priority: 'high',
          category: 'frontend'
        },
        {
          id: 'ui4',
          title: 'Analytics View',
          description: 'Статистика и аналитика',
          status: 'completed',
          priority: 'medium',
          category: 'frontend'
        },
        {
          id: 'ui5',
          title: 'CRUD формы',
          description: 'EventForm, QuickAdd для управления событиями',
          status: 'current',
          priority: 'high',
          category: 'frontend'
        }
      ]
    },
    {
      id: 'phase3',
      title: 'ФАЗА 3: Качество и безопасность',
      description: 'Тестирование, оптимизация и защита данных',
      status: 'planned',
      progress: 15,
      estimated: '2-3 недели',
      features: [
        {
          id: 'qa1',
          title: 'Error Boundaries',
          description: 'Защита от падений приложения',
          status: 'planned',
          priority: 'high',
          category: 'frontend'
        },
        {
          id: 'qa2',
          title: 'Unit тесты',
          description: 'Автоматические тесты для ключевых модулей',
          status: 'planned',
          priority: 'medium',
          category: 'frontend'
        },
        {
          id: 'qa3',
          title: 'Performance оптимизация',
          description: 'React.memo, мемоизация, lazy loading',
          status: 'planned',
          priority: 'medium',
          category: 'frontend'
        },
        {
          id: 'qa4',
          title: 'Система аутентификации',
          description: 'Безопасный вход и защита данных',
          status: 'planned',
          priority: 'high',
          category: 'backend'
        }
      ]
    },
    {
      id: 'phase4',
      title: 'ФАЗА 4: Умные функции',
      description: 'AI-модули и интеллектуальные возможности',
      status: 'planned',
      progress: 0,
      estimated: '1-2 месяца',
      features: [
        {
          id: 'ai1',
          title: 'Smart парсинг билетов',
          description: 'Автоматическое извлечение данных из билетов',
          status: 'planned',
          priority: 'high',
          category: 'feature'
        },
        {
          id: 'ai2',
          title: 'Push уведомления',
          description: 'Уведомления даже при закрытом приложении',
          status: 'planned',
          priority: 'high',
          category: 'backend'
        },
        {
          id: 'ai3',
          title: 'AI-ядро SmartCore',
          description: 'Персональные подсказки и оптимизация',
          status: 'planned',
          priority: 'medium',
          category: 'feature'
        },
        {
          id: 'ai4',
          title: 'Когнитивная поддержка',
          description: 'Модуль помощи в принятии решений',
          status: 'planned',
          priority: 'low',
          category: 'feature'
        }
      ]
    },
    {
      id: 'phase5',
      title: 'ФАЗА 5: Деплой и поддержка',
      description: 'Публичный релиз и долгосрочная поддержка',
      status: 'planned',
      progress: 0,
      estimated: '1 месяц',
      features: [
        {
          id: 'deploy1',
          title: 'PWA манифест',
          description: 'Превращение в полноценное PWA приложение',
          status: 'planned',
          priority: 'high',
          category: 'frontend'
        },
        {
          id: 'deploy2',
          title: 'Публичный деплой',
          description: 'Размещение на Netlify/Vercel',
          status: 'planned',
          priority: 'high',
          category: 'backend'
        },
        {
          id: 'deploy3',
          title: 'Мониторинг и аналитика',
          description: 'Отслеживание использования и ошибок',
          status: 'planned',
          priority: 'medium',
          category: 'backend'
        },
        {
          id: 'deploy4',
          title: 'Система обновлений',
          description: 'Автоматические обновления приложения',
          status: 'planned',
          priority: 'low',
          category: 'backend'
        }
      ]
    }
  ];

  const togglePhaseExpansion = (phaseId: string) => {
    setExpandedPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const getStatusIcon = (status: 'completed' | 'current' | 'planned') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'current':
        return <Zap className="w-5 h-5 text-blue-400" />;
      case 'planned':
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: 'completed' | 'current' | 'planned') => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-900';
      case 'current':
        return 'border-blue-500 bg-blue-900';
      case 'planned':
        return 'border-gray-500 bg-gray-750';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: 'frontend' | 'backend' | 'design' | 'feature') => {
    switch (category) {
      case 'frontend':
        return <Code className="w-4 h-4" />;
      case 'backend':
        return <Globe className="w-4 h-4" />;
      case 'design':
        return <Star className="w-4 h-4" />;
      case 'feature':
        return <Brain className="w-4 h-4" />;
    }
  };

  // Фильтрация функций по категории
  const filteredFeatures = selectedCategory === 'all' 
    ? roadmapPhases.flatMap(phase => phase.features)
    : roadmapPhases.flatMap(phase => phase.features.filter(f => f.category === selectedCategory));

  // Общая статистика
  const totalFeatures = roadmapPhases.flatMap(phase => phase.features).length;
  const completedFeatures = roadmapPhases.flatMap(phase => phase.features.filter(f => f.status === 'completed')).length;
  const currentFeatures = roadmapPhases.flatMap(phase => phase.features.filter(f => f.status === 'current')).length;
  const overallProgress = Math.round((completedFeatures / totalFeatures) * 100);

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            🗺️ Роадмап развития
          </h1>
          <p className="text-gray-400">
            План развития Organizer Zero и текущий прогресс
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Фильтр по категориям */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="all">Все категории</option>
            <option value="frontend">🎨 Frontend</option>
            <option value="backend">🔧 Backend</option>
            <option value="design">✨ Дизайн</option>
            <option value="feature">🚀 Функции</option>
          </select>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open('https://github.com/organizer-zero/issues', '_blank')}
            icon={ExternalLink}
          >
            GitHub Issues
          </Button>
        </div>
      </div>

      {/* Общий прогресс */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Target className="w-6 h-6" />
            <span>Общий прогресс</span>
          </h3>
          <div className="text-3xl font-bold text-blue-400">
            {overallProgress}%
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-4 bg-gray-750 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{completedFeatures}</div>
            <div className="text-sm text-gray-400">Завершено</div>
          </div>
          <div className="text-center p-4 bg-gray-750 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{currentFeatures}</div>
            <div className="text-sm text-gray-400">В работе</div>
          </div>
          <div className="text-center p-4 bg-gray-750 rounded-lg">
            <div className="text-2xl font-bold text-gray-400">{totalFeatures - completedFeatures - currentFeatures}</div>
            <div className="text-sm text-gray-400">Запланировано</div>
          </div>
          <div className="text-center p-4 bg-gray-750 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{totalFeatures}</div>
            <div className="text-sm text-gray-400">Всего</div>
          </div>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Фазы разработки */}
      <div className="space-y-4">
        {roadmapPhases.map((phase) => {
          const isExpanded = expandedPhases.includes(phase.id);
          const completedInPhase = phase.features.filter(f => f.status === 'completed').length;
          const currentInPhase = phase.features.filter(f => f.status === 'current').length;

          return (
            <div
              key={phase.id}
              className={`rounded-lg border-2 transition-all ${getStatusColor(phase.status)}`}
            >
              {/* Заголовок фазы */}
              <div
                className="p-6 cursor-pointer"
                onClick={() => togglePhaseExpansion(phase.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(phase.status)}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {phase.title}
                      </h3>
                      <p className="text-gray-300">{phase.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Прогресс фазы */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {phase.progress}%
                      </div>
                      <div className="text-sm text-gray-400">
                        {completedInPhase}/{phase.features.length} функций
                      </div>
                    </div>

                    {/* Статус и время */}
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        phase.status === 'completed' ? 'text-green-400' :
                        phase.status === 'current' ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {phase.status === 'completed' ? '✅ Завершено' :
                         phase.status === 'current' ? '🔄 В работе' : '⏳ Запланировано'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {phase.estimated}
                      </div>
                    </div>

                    {/* Кнопка раскрытия */}
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Прогресс бар фазы */}
                <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      phase.status === 'completed' ? 'bg-green-500' :
                      phase.status === 'current' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}
                    style={{ width: `${phase.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Детали фазы */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-600">
                  <div className="pt-4 space-y-3">
                    {phase.features
                      .filter(feature => selectedCategory === 'all' || feature.category === selectedCategory)
                      .map((feature) => (
                        <div
                          key={feature.id}
                          className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            {getStatusIcon(feature.status)}
                            {getCategoryIcon(feature.category)}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white mb-1">
                                {feature.title}
                              </h4>
                              <p className="text-sm text-gray-400">
                                {feature.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(feature.priority)}`}>
                              {feature.priority === 'high' ? '🚨' :
                               feature.priority === 'medium' ? '⚡' : '📝'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              feature.status === 'completed' ? 'bg-green-600 text-green-100' :
                              feature.status === 'current' ? 'bg-blue-600 text-blue-100' :
                              'bg-gray-600 text-gray-300'
                            }`}>
                              {feature.status === 'completed' ? 'Готово' :
                               feature.status === 'current' ? 'В работе' : 'Планируется'}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Планы на будущее */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Rocket className="w-6 h-6" />
          <span>Долгосрочные планы</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-white">Технологические цели</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-750 rounded-lg">
                <Brain className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-white font-medium">Искусственный интеллект</div>
                  <div className="text-sm text-gray-400">Интеграция ML для умных предложений</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-750 rounded-lg">
                <Smartphone className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-white font-medium">Мобильные приложения</div>
                  <div className="text-sm text-gray-400">Нативные iOS и Android приложения</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-750 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-white font-medium">Совместная работа</div>
                  <div className="text-sm text-gray-400">Планирование в команде</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-white">Бизнес-цели</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-750 rounded-lg">
                <Globe className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-white font-medium">Глобальный запуск</div>
                  <div className="text-sm text-gray-400">Доступность во всех странах</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-750 rounded-lg">
                <Heart className="w-5 h-5 text-pink-400" />
                <div>
                  <div className="text-white font-medium">Сообщество пользователей</div>
                  <div className="text-sm text-gray-400">10,000+ активных пользователей</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-750 rounded-lg">
                <Star className="w-5 h-5 text-orange-400" />
                <div>
                  <div className="text-white font-medium">Премиум функции</div>
                  <div className="text-sm text-gray-400">Расширенная аналитика и AI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Вклад в развитие */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <GitBranch className="w-6 h-6" />
          <span>Принять участие</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-750 rounded-lg">
            <Code className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h4 className="font-medium text-white mb-2">Разработка</h4>
            <p className="text-sm text-gray-400 mb-4">
              Помогите улучшить код и добавить новые функции
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.open('https://github.com/organizer-zero', '_blank')}
              className="w-full"
            >
              Contribute
            </Button>
          </div>

          <div className="text-center p-4 bg-gray-750 rounded-lg">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <h4 className="font-medium text-white mb-2">Идеи</h4>
            <p className="text-sm text-gray-400 mb-4">
              Предложите новые функции и улучшения
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => addNotification({
                type: 'info',
                title: 'Обратная связь',
                message: 'Форма для предложений будет добавлена в следующей версии',
                autoRemove: true
              })}
              className="w-full"
            >
              Предложить
            </Button>
          </div>

          <div className="text-center p-4 bg-gray-750 rounded-lg">
            <Heart className="w-8 h-8 text-pink-400 mx-auto mb-3" />
            <h4 className="font-medium text-white mb-2">Поддержка</h4>
            <p className="text-sm text-gray-400 mb-4">
              Поддержите проект звездочкой на GitHub
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open('https://github.com/organizer-zero', '_blank')}
              className="w-full"
            >
              ⭐ Star
            </Button>
          </div>
        </div>
      </div>

      {/* Техническая информация */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Shield className="w-6 h-6" />
          <span>Техническая информация</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-white">Архитектура</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Framework:</span>
                <span className="text-blue-400">React 18.2.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">State Management:</span>
                <span className="text-green-400">Context + Reducer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Language:</span>
                <span className="text-purple-400">TypeScript 4.9.5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Styling:</span>
                <span className="text-teal-400">Tailwind CSS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Icons:</span>
                <span className="text-orange-400">Lucide React</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-white">Особенности</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Модульная архитектура</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Полная типизация</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Responsive дизайн</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Accessibility поддержка</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Circle className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">PWA функции (планируется)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Circle className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Офлайн режим (планируется)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Команда и благодарности */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <Users className="w-6 h-6" />
          <span>Команда проекта</span>
        </h3>

        <div className="text-center">
          <div className="inline-flex items-center space-x-4 p-6 bg-gray-750 rounded-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              OZ
            </div>
            <div className="text-left">
              <h4 className="text-lg font-semibold text-white">Organizer Zero Team</h4>
              <p className="text-gray-400">Архитектура и разработка</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm text-gray-500">Powered by Claude Sonnet 4</span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-400">
            <p>
              Organizer Zero создан с использованием современных технологий
              и лучших практик разработки React приложений.
            </p>
            <p className="mt-2">
              Благодарим всех, кто вносит вклад в развитие проекта! 💙
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapView;