// components/forms/EventForm.tsx
import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Tag, AlertCircle } from 'lucide-react';
import { useTimeBlocks, useModal } from '../../store/hooks';
import { Button } from '../ui';
import type { TimeBlock, TimeBlockType, Priority } from '../../types';

interface EventFormProps {
  timeBlock?: TimeBlock | null;
  onSave: (data: Omit<TimeBlock, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

/**
 * Форма создания и редактирования событий
 */
export const EventForm: React.FC<EventFormProps> = ({
  timeBlock,
  onSave,
  onCancel,
  isOpen
}) => {
  const { addTimeBlock, updateTimeBlock } = useTimeBlocks();
  const { closeEditModal } = useModal();

  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    date: new Date().toISOString().split('T')[0],
    type: 'personal' as TimeBlockType,
    description: '',
    location: '',
    priority: 'medium' as Priority,
    tags: [] as string[],
    completed: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  // Заполнение формы при редактировании
  useEffect(() => {
    if (timeBlock) {
      setFormData({
        title: timeBlock.title || '',
        start: timeBlock.start || '',
        end: timeBlock.end || '',
        date: timeBlock.date || new Date().toISOString().split('T')[0],
        type: timeBlock.type || 'personal',
        description: timeBlock.description || '',
        location: timeBlock.location || '',
        priority: timeBlock.priority || 'medium',
        tags: timeBlock.tags || [],
        completed: timeBlock.completed || false
      });
    } else {
      // Сброс формы для нового события
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const endTime = new Date(now.getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5);
      
      setFormData({
        title: '',
        start: currentTime,
        end: endTime,
        date: now.toISOString().split('T')[0],
        type: 'personal',
        description: '',
        location: '',
        priority: 'medium',
        tags: [],
        completed: false
      });
    }
    setErrors({});
  }, [timeBlock, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название события обязательно';
    }

    if (!formData.start) {
      newErrors.start = 'Время начала обязательно';
    }

    if (!formData.end) {
      newErrors.end = 'Время окончания обязательно';
    }

    if (formData.start && formData.end && formData.start >= formData.end) {
      newErrors.end = 'Время окончания должно быть после времени начала';
    }

    if (!formData.date) {
      newErrors.date = 'Дата обязательна';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const eventData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      location: formData.location.trim() || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined
    };

    if (timeBlock) {
      updateTimeBlock(timeBlock.id, eventData);
    } else {
      addTimeBlock(eventData);
    }

    closeEditModal();
  };

  const handleCancel = () => {
    closeEditModal();
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === document.querySelector('#tag-input')) {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {timeBlock ? 'Редактировать событие' : 'Новое событие'}
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCancel}
            icon={X}
            className="w-8 h-8 p-0"
            aria-label="Закрыть"
          />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Название */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Название события *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Введите название события..."
            />
            {errors.title && (
              <div className="flex items-center space-x-1 mt-1 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.title}</span>
              </div>
            )}
          </div>

          {/* Дата и время */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                Дата *
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.date && (
                <div className="flex items-center space-x-1 mt-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.date}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="start" className="block text-sm font-medium text-gray-300 mb-2">
                Начало *
              </label>
              <input
                type="time"
                id="start"
                value={formData.start}
                onChange={(e) => setFormData(prev => ({ ...prev, start: e.target.value }))}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.start ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.start && (
                <div className="flex items-center space-x-1 mt-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.start}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="end" className="block text-sm font-medium text-gray-300 mb-2">
                Окончание *
              </label>
              <input
                type="time"
                id="end"
                value={formData.end}
                onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
                className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.end ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.end && (
                <div className="flex items-center space-x-1 mt-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.end}</span>
                </div>
              )}
            </div>
          </div>

          {/* Тип и приоритет */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
                Тип события
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TimeBlockType }))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="practice">Практика</option>
                <option value="concert">Концерт</option>
                <option value="lesson">Урок</option>
                <option value="travel">Поездка</option>
                <option value="meal">Еда</option>
                <option value="break">Перерыв</option>
                <option value="personal">Личное</option>
                <option value="free">Свободное время</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-2">
                Приоритет
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>
          </div>

          {/* Местоположение */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Местоположение
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Где проходит событие?"
            />
          </div>

          {/* Описание */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Описание
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Дополнительная информация о событии..."
            />
          </div>

          {/* Теги */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Теги
            </label>
            
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                id="tag-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Добавить тег..."
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Добавить
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Завершено (только при редактировании) */}
          {timeBlock && (
            <div>
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.completed}
                  onChange={(e) => setFormData(prev => ({ ...prev, completed: e.target.checked }))}
                  className="rounded"
                />
                <span>Событие завершено</span>
              </label>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              {timeBlock ? 'Сохранить изменения' : 'Создать событие'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};