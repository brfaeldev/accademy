import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useApp } from '../context/AppContext';
import { theme } from '../theme/theme';
import { Header } from '../components/common/Header';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { FinalExamSimulatorCard } from '../components/domain/FinalExamSimulatorCard';
import { SubjectGradeCard } from '../components/domain/SubjectGradeCard';
import { GradeFormModal } from '../components/domain/GradeFormModal';
import { GradeItem } from '../types';

export const GradesScreen: React.FC = () => {
  const {
    subjects,
    grades,
    addGrade,
    updateGrade,
    deleteGrade,
    getSubjectAverage,
    calculateNeededGrade,
  } = useApp();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeItem | null>(null);
  const [initialSubjectId, setInitialSubjectId] = useState<string>('');
  const [gradeToDelete, setGradeToDelete] = useState<GradeItem | null>(null);

  const handleOpenAddGrade = (subId?: string) => {
    setEditingGrade(null);
    setInitialSubjectId(subId || subjects[0]?.id || '');
    setModalVisible(true);
  };

  const handleOpenEditGrade = (grade: GradeItem) => {
    setEditingGrade(grade);
    setInitialSubjectId(grade.subjectId);
    setModalVisible(true);
  };

  const handleFormSubmit = async (
    data: Omit<GradeItem, 'id'>,
    editingId?: string
  ) => {
    if (editingId) {
      await updateGrade({ ...data, id: editingId });
    } else {
      await addGrade(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (!gradeToDelete) return;
    await deleteGrade(gradeToDelete.id);
    setGradeToDelete(null);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Boletim e Simulador"
        subtitle="Média ponderada e cálculo de aprovação"
        rightAction={{
          label: '+ Lançar Nota',
          onPress: () => handleOpenAddGrade(),
        }}
      />

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <FinalExamSimulatorCard
              subjects={subjects}
              getSubjectAverage={getSubjectAverage}
              calculateNeededGrade={calculateNeededGrade}
            />
            <Text style={styles.sectionHeader}>
              📊 Média Atingida por Disciplina
            </Text>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="📊"
            title="Nenhuma disciplina cadastrada"
            description='Cadastre suas matérias na aba "Matérias" para lançar avaliações e acompanhar suas médias.'
          />
        }
        renderItem={({ item }) => (
          <SubjectGradeCard
            subject={item}
            stats={getSubjectAverage(item.id)}
            grades={grades.filter((g) => g.subjectId === item.id)}
            onAddGrade={handleOpenAddGrade}
            onEditGrade={handleOpenEditGrade}
            onDeleteGrade={setGradeToDelete}
          />
        )}
      />

      <GradeFormModal
        visible={modalVisible}
        editingGrade={editingGrade}
        initialSubjectId={initialSubjectId}
        subjects={subjects}
        onClose={() => setModalVisible(false)}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        visible={!!gradeToDelete}
        title="Remover Nota"
        message={
          gradeToDelete
            ? `Deseja realmente excluir a nota "${gradeToDelete.name}" (${gradeToDelete.grade.toFixed(1)})?`
            : ''
        }
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setGradeToDelete(null)}
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
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginVertical: theme.spacing.md,
  },
});
