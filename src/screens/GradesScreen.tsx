import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { theme } from '../theme/theme';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { ModalWrapper } from '../components/common/ModalWrapper';

export const GradesScreen: React.FC = () => {
  const {
    subjects,
    grades,
    addGrade,
    deleteGrade,
    getSubjectAverage,
    calculateNeededGrade,
  } = useApp();

  // Seleção para a Calculadora Dinâmica
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id ?? ''
  );
  const [simulatedWeight, setSimulatedWeight] = useState<string>('4.0');
  const [simulatedTarget, setSimulatedTarget] = useState<string>('7.0');

  // Modal para Adicionar Nota
  const [modalVisible, setModalVisible] = useState(false);
  const [gradeName, setGradeName] = useState('');
  const [gradeValue, setGradeValue] = useState('');
  const [gradeWeight, setGradeWeight] = useState('3.0');
  const [modalSubjectId, setModalSubjectId] = useState('');

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) ?? subjects[0];
  const currentCalc = currentSubject ? getSubjectAverage(currentSubject.id) : { average: 0, totalWeight: 0, passing: false };
  const neededOnFinal = currentSubject
    ? calculateNeededGrade(
        currentSubject.id,
        parseFloat(simulatedWeight) || 4.0,
        parseFloat(simulatedTarget) || 7.0
      )
    : 0;

  const handleOpenAddGrade = (subId?: string) => {
    setModalSubjectId(subId || selectedSubjectId || (subjects[0]?.id ?? ''));
    setGradeName('');
    setGradeValue('');
    setGradeWeight('3.0');
    setModalVisible(true);
  };

  const handleSaveGrade = () => {
    if (!gradeName.trim()) {
      Alert.alert('Erro', 'Informe a identificação da avaliação (ex: Prova P1).');
      return;
    }
    const val = parseFloat(gradeValue);
    if (isNaN(val) || val < 0 || val > 10) {
      Alert.alert('Erro', 'A nota deve estar entre 0.0 e 10.0.');
      return;
    }
    const w = parseFloat(gradeWeight) || 1.0;

    addGrade({
      subjectId: modalSubjectId,
      name: gradeName,
      grade: val,
      weight: w,
    });

    setModalVisible(false);
  };

  const handleDeleteGrade = (id: string, name: string) => {
    Alert.alert(
      'Remover Nota',
      `Deseja excluir a nota "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteGrade(id) },
      ]
    );
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SIMULADOR DINÂMICO (Item 4 do Escopo) */}
        <Card highlightColor={theme.colors.secondary} style={styles.simulatorCard}>
          <View style={styles.simulatorHeader}>
            <Text style={styles.simulatorTitle}>🧮 Calculadora de Prova Final</Text>
            <Text style={styles.simulatorSub}>
              &quot;Quanto preciso tirar na avaliação final para passar?&quot;
            </Text>
          </View>

          <Text style={styles.fieldLabel}>Selecione a Disciplina:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
            {subjects.map((sub) => {
              const isSelected = (currentSubject?.id ?? '') === sub.id;
              return (
                <TouchableOpacity
                  key={sub.id}
                  style={[
                    styles.subChip,
                    isSelected && { backgroundColor: theme.colors.secondary, borderColor: theme.colors.secondary },
                  ]}
                  onPress={() => setSelectedSubjectId(sub.id)}
                >
                  <Text style={[styles.subChipText, isSelected && { color: '#FFF', fontWeight: '700' }]}>
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.simulationParams}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.fieldLabel}>Peso da Prova Final:</Text>
              <TextInput
                style={styles.simInput}
                keyboardType="numeric"
                value={simulatedWeight}
                onChangeText={setSimulatedWeight}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Média Desejada:</Text>
              <TextInput
                style={styles.simInput}
                keyboardType="numeric"
                value={simulatedTarget}
                onChangeText={setSimulatedTarget}
              />
            </View>
          </View>

          {/* Resultado do Cálculo */}
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>
              {neededOnFinal <= 0 ? '🎉 Você já atingiu a média necessária!' : 'Você precisa tirar no mínimo:'}
            </Text>
            <Text
              style={[
                styles.resultScore,
                { color: neededOnFinal > 10 ? theme.colors.danger : theme.colors.secondary },
              ]}
            >
              {neededOnFinal <= 0 ? '0.0' : neededOnFinal > 10 ? `${neededOnFinal} (Atenção!)` : neededOnFinal.toFixed(2)}
            </Text>
            <Text style={styles.resultTip}>
              {neededOnFinal > 10
                ? '⚠️ Atenção: A nota necessária ultrapassa 10.0 com os pesos atuais.'
                : `Com base na sua média parcial atual de ${currentCalc.average.toFixed(1)}.`}
            </Text>
          </View>
        </Card>

        {/* VISÃO GERAL: BARRAS DE PROGRESSO POR MATÉRIA */}
        <Text style={styles.sectionHeader}>📊 Média Atingida por Disciplina</Text>

        {subjects.map((sub) => {
          const stats = getSubjectAverage(sub.id);
          const subGrades = grades.filter((g) => g.subjectId === sub.id);
          const target = sub.targetGrade ?? 7.0;
          const progress = stats.average / 10;

          return (
            <Card key={sub.id} highlightColor={sub.color} style={styles.subjectGradeCard}>
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subjectTitle}>{sub.name}</Text>
                  <Text style={styles.subjectProf}>{sub.professor}</Text>
                </View>
                <View style={styles.averageBadge}>
                  <Text style={[styles.averageValue, { color: stats.average >= target ? theme.colors.success : theme.colors.warning }]}>
                    {stats.average > 0 ? stats.average.toFixed(1) : 'Sem notas'}
                  </Text>
                  <Text style={styles.targetLabel}>Meta: {target.toFixed(1)}</Text>
                </View>
              </View>

              {/* Barra de Progresso da Média */}
              <View style={{ marginTop: 8 }}>
                <ProgressBar
                  progress={progress}
                  color={stats.average >= target ? theme.colors.success : theme.colors.warning}
                  height={8}
                />
              </View>

              {/* Avaliações Lançadas */}
              <View style={styles.gradesList}>
                <View style={styles.gradesListHeader}>
                  <Text style={styles.gradesListTitle}>Avaliações ({subGrades.length})</Text>
                  <TouchableOpacity onPress={() => handleOpenAddGrade(sub.id)}>
                    <Text style={styles.addGradeLink}>+ Nota</Text>
                  </TouchableOpacity>
                </View>

                {subGrades.length === 0 ? (
                  <Text style={styles.emptyGradesText}>Nenhuma avaliação registrada ainda.</Text>
                ) : (
                  subGrades.map((g) => (
                    <View key={g.id} style={styles.gradeItemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.gradeItemName}>{g.name}</Text>
                        <Text style={styles.gradeItemWeight}>Peso: {g.weight.toFixed(1)}</Text>
                      </View>
                      <Text style={styles.gradeItemScore}>{g.grade.toFixed(1)}</Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteGrade(g.id, g.name)}
                        style={styles.deleteGradeBtn}
                      >
                        <Text style={styles.deleteGradeText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* Modal Lançar Nova Nota */}
      <ModalWrapper
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Lançar Nota de Avaliação"
      >
        <Text style={styles.fieldLabel}>Identificação da Avaliação *</Text>
        <TextInput
          style={styles.simInput}
          placeholder="Ex: Prova P1, Trabalho Semestral"
          placeholderTextColor={theme.colors.textMuted}
          value={gradeName}
          onChangeText={setGradeName}
        />

        <View style={styles.simulationParams}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.fieldLabel}>Nota Obtida (0 a 10) *</Text>
            <TextInput
              style={styles.simInput}
              placeholder="Ex: 8.5"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              value={gradeValue}
              onChangeText={setGradeValue}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Peso da Avaliação</Text>
            <TextInput
              style={styles.simInput}
              placeholder="Ex: 3.0"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              value={gradeWeight}
              onChangeText={setGradeWeight}
            />
          </View>
        </View>

        <View style={styles.modalBtns}>
          <Button
            title="Cancelar"
            variant="ghost"
            onPress={() => setModalVisible(false)}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="Salvar Nota"
            variant="primary"
            onPress={handleSaveGrade}
            style={{ flex: 1.5 }}
          />
        </View>
      </ModalWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  simulatorCard: {
    backgroundColor: theme.colors.surface,
  },
  simulatorHeader: {
    marginBottom: 8,
  },
  simulatorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  simulatorSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 6,
    marginBottom: 4,
  },
  subChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginRight: 6,
  },
  subChipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  simulationParams: {
    flexDirection: 'row',
    marginTop: 6,
  },
  simInput: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  resultBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: theme.colors.secondaryLight,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.secondary,
  },
  resultScore: {
    fontSize: 28,
    fontWeight: '900',
    marginVertical: 4,
  },
  resultTip: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginVertical: theme.spacing.md,
  },
  subjectGradeCard: {
    marginBottom: theme.spacing.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subjectProf: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  averageBadge: {
    alignItems: 'flex-end',
  },
  averageValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  targetLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  gradesList: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  gradesListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  gradesListTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  addGradeLink: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  emptyGradesText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  gradeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceSubtle,
  },
  gradeItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  gradeItemWeight: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  gradeItemScore: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginRight: 10,
  },
  deleteGradeBtn: {
    padding: 4,
  },
  deleteGradeText: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  modalBtns: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
});
