'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { collection, query, where, orderBy, onSnapshot, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type ActivityType = 'task_completed' | 'task_created' | 'note_created' | 'checklist_completed';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  timestamp: Timestamp;
  metadata?: any;
}

export function useActivities(limitCount: number = 10) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    // 由于我们没有专门的activities集合，我们需要从各个集合中获取最近的活动
    let allActivities: Activity[] = [];

    const updateAllActivities = () => {
      const uniqueActivities = allActivities.filter((activity, index, self) =>
        index === self.findIndex(a => a.id === activity.id)
      );

      const sortedActivities = uniqueActivities
        .sort((a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime())
        .slice(0, limitCount);

      setActivities(sortedActivities);
    };

    try {
      // 获取最近的任务（作为任务创建活动）
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        limit(10)
      );

      const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        const taskActivities: Activity[] = [];

        snapshot.docs.forEach(doc => {
          const data = doc.data();

          // 只处理有效的时间戳
          if (data.createdAt) {
            // 任务创建活动
            taskActivities.push({
              id: `task_created_${doc.id}`,
              type: 'task_created' as ActivityType,
              title: `创建了任务：${data.title}`,
              timestamp: data.createdAt,
              metadata: {
                taskId: doc.id,
                category: data.category,
                priority: data.priority,
                isAIGenerated: data.isAIGenerated
              }
            });
          }

          // 任务完成活动
          if (data.status === 'completed' && data.completedAt) {
            taskActivities.push({
              id: `task_completed_${doc.id}`,
              type: 'task_completed' as ActivityType,
              title: `完成了任务：${data.title}`,
              timestamp: data.completedAt,
              metadata: {
                taskId: doc.id,
                category: data.category,
                priority: data.priority
              }
            });
          }
        });

        // 更新任务活动
        allActivities = allActivities.filter(a => !a.id.includes('task_'));
        allActivities.push(...taskActivities);
        updateAllActivities();
      }, (error) => {
        console.error('获取任务活动失败:', error);
        setLoading(false);
      });

      // 获取最近的笔记（作为笔记创建活动）
      const notesQuery = query(
        collection(db, 'notes'),
        where('uid', '==', user.uid),
        limit(10)
      );

      const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
        const noteActivities = snapshot.docs
          .filter(doc => doc.data().createdAt) // 只处理有效的时间戳
          .map(doc => {
            const data = doc.data();
            return {
              id: `note_created_${doc.id}`,
              type: 'note_created' as ActivityType,
              title: `记录了新灵感：${data.title}`,
              timestamp: data.createdAt,
              metadata: {
                noteId: doc.id,
                tags: data.tags || []
              }
            };
          });

        // 更新笔记活动
        allActivities = allActivities.filter(a => !a.id.includes('note_'));
        allActivities.push(...noteActivities);
        updateAllActivities();
      }, (error) => {
        console.error('获取笔记活动失败:', error);
        setLoading(false);
      });

      setLoading(false);

      return () => {
        unsubscribeTasks();
        unsubscribeNotes();
      };
    } catch (error) {
      console.error('获取活动数据失败:', error);
      setLoading(false);
    }
  }, [user, limitCount]);

  return { activities, loading };
}
