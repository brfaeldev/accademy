import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useApp } from '../context/AppContext';
import { theme } from '../theme/theme';
import { Header } from '../components/common/Header';
import { ChipSelector, ChipOption } from '../components/common/ChipSelector';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { TaskCard } from '../components/domain/TaskCard';
import { TaskFormModal } from '../components/domain/TaskFormModal';
import { Task, TaskStatus } from '../types';

type FilterTab = 'Todas' | TaskStatus;

export const TasksScreen: React.FC = () => {
  const {
    tasks,
    subjects,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('Todas');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const filterOptions: ChipOption<FilterTab>[] = useMemo(
    () => [
      { value: 'Todas', label: 'Todas', count: tasks.length },
      {
        value: 'Pendente',
        label: 'Pendente',
        count: tasks.filter((t) => t.status === 'Pendente').length,
      },
      {
        value: 'Em Andamento',
        label: 'Em Andamento',
        count: tasks.filter((t) => t.status === 'Em Andamento').length,
      },
      {
        value: 'Concluído',
        label: 'Concluído',
        count: tasks.filter((t) => t.status === 'Concluído').length,
      },
    ],
    [tasks]
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter((t) => {
        if (activeFilter === 'Todas') return true;
        return t.status === activeFilter;
      }),
    [tasks, activeFilter]
  );

  const handleOpenCreate = () => {
    setEditingTask(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleFormSubmit = async (
    data: Omit<Task, 'id'>,
    editingId?: string
  ) => {
    if (editingId) {
      await updateTask({ ...data, id: editingId });
    } else {
      await addTask(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    await deleteTask(taskToDelete.id);
    setTaskToDelete(null);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Agenda e Prazos"
        subtitle="Acompanhamento de entregas e avaliações"
        rightAction={{
          label: '+ Nova Tarefa',
          onPress: handleOpenCreate,
        }}
      />

      <View style={styles.filterBar}>
        <ChipSelector
          options={filterOptions}
          value={activeFilter}
          onChange={setActiveFilter}
          variant="filter"
        />
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title={`Nenhuma atividade (${activeFilter})`}
            description={
              subjects.length === 0
                ? 'Cadastre primeiro suas matérias na aba "Matérias" para adicionar atividades.'
                : 'Toque em "+ Nova Tarefa" para agendar provas, trabalhos ou listas.'
            }
            actionLabel={subjects.length > 0 ? '+ Nova Tarefa' : undefined}
            onAction={subjects.length > 0 ? handleOpenCreate : undefined}
          />
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            subject={subjects.find((s) => s.id === item.subjectId)}
            onToggleStatus={toggleTaskStatus}
            onEdit={handleOpenEdit}
            onDelete={setTaskToDelete}
          />
        )}
      />

      <TaskFormModal
        visible={modalVisible}
        editingTask={editingTask}
        subjects={subjects}
        onClose={() => setModalVisible(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        visible={!!taskToDelete}
        title="Remover Atividade"
        message={
          taskToDelete
            ? `Deseja realmente remover a atividade "${taskToDelete.title}"?`
            : ''
        }
        confirmLabel="Remover"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  filterBar: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
});
