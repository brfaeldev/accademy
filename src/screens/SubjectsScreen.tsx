import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useApp } from '../context/AppContext';
import { theme } from '../theme/theme';
import { Header } from '../components/common/Header';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { SubjectCard } from '../components/domain/SubjectCard';
import { SubjectFormModal } from '../components/domain/SubjectFormModal';
import { Subject } from '../types';

export const SubjectsScreen: React.FC = () => {
  const {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    getSubjectAverage,
  } = useApp();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setModalVisible(true);
  };

  const handleFormSubmit = async (
    data: Omit<Subject, 'id'>,
    editingId?: string
  ) => {
    if (editingId) {
      await updateSubject({ ...data, id: editingId });
    } else {
      await addSubject(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;
    await deleteSubject(subjectToDelete.id);
    setSubjectToDelete(null);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Gestão Acadêmica"
        subtitle="Disciplinas, docentes, metas e locais de aula"
        rightAction={{
          label: '+ Nova Matéria',
          onPress: handleOpenCreate,
        }}
      />

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.listCount}>
            Total: {subjects.length} matéria{subjects.length !== 1 ? 's' : ''} no período
          </Text>
        }
        ListEmptyComponent={
          <EmptyState
            icon="📚"
            title="Nenhuma matéria cadastrada"
            description='Toque no botão "+ Nova Matéria" acima para adicionar sua primeira disciplina.'
            actionLabel="+ Cadastrar Primeira Matéria"
            onAction={handleOpenCreate}
          />
        }
        renderItem={({ item }) => (
          <SubjectCard
            subject={item}
            stats={getSubjectAverage(item.id)}
            onEdit={handleOpenEdit}
            onDelete={setSubjectToDelete}
          />
        )}
      />

      <SubjectFormModal
        visible={modalVisible}
        editingSubject={editingSubject}
        onClose={() => setModalVisible(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        visible={!!subjectToDelete}
        title="Remover Disciplina"
        message={
          subjectToDelete
            ? `Deseja realmente remover a matéria "${subjectToDelete.name}" e todas as suas tarefas e notas associadas?`
            : ''
        }
        confirmLabel="Remover"
        onConfirm={handleConfirmDelete}
        onCancel={() => setSubjectToDelete(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  listCount: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
});
