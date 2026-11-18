/**
 * Componente FinalExamSimulatorCard (Simulador de Exame / Prova Final)
 *
 * Calculadora interativa que permite ao estudante projetar a nota mínima
 * necessária na avaliação final para alcançar a meta de aprovação da disciplina.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Subject } from '../../types';
import { theme } from '../../theme/theme';
import { Card } from '../common/Card';
import { SubjectSelector } from '../common/SubjectSelector';
import { FormField } from '../common/FormField';
import { parseDecimalInput } from '../../utils/formatters';
import { SubjectAverageResult } from '../../utils/gradeCalculations';

interface FinalExamSimulatorCardProps {
  subjects: Subject[];
  getSubjectAverage: (subjectId: string) => SubjectAverageResult;
  calculateNeededGrade: (
    subjectId: string,
    finalExamWeight?: number,
    targetGrade?: number
  ) => number;
}

export const FinalExamSimulatorCard: React.FC<FinalExamSimulatorCardProps> = ({
  subjects,
  getSubjectAverage,
  calculateNeededGrade,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id ?? ''
  );
  const [simulatedWeight, setSimulatedWeight] = useState<string>('4.0');
  const [customTarget, setCustomTarget] = useState<string | null>(null);

  const currentSubject =
    subjects.find((s) => s.id === selectedSubjectId) ?? subjects[0];

  const simulatedTarget =
    customTarget ?? String(currentSubject?.targetGrade ?? 7.0);

  const handleSelectSubject = (subId: string) => {
    setSelectedSubjectId(subId);
    setCustomTarget(null);
  };

  const currentCalc = currentSubject
    ? getSubjectAverage(currentSubject.id)
    : { average: 0, totalWeight: 0, passing: false };

  const parsedWeight = parseDecimalInput(simulatedWeight, 4.0);
  const parsedTarget = parseDecimalInput(
    simulatedTarget,
    currentSubject?.targetGrade ?? 7.0
  );

  const neededOnFinal = currentSubject
    ? calculateNeededGrade(currentSubject.id, parsedWeight, parsedTarget)
    : 0;

  return (
    <Card highlightColor={theme.colors.secondary} style={styles.simulatorCard}>
      <View style={styles.simulatorHeader}>
        <Text style={styles.simulatorTitle}>🧮 Calculadora de Prova Final</Text>
        <Text style={styles.simulatorSub}>
          &quot;Quanto preciso tirar na avaliação final para passar?&quot;
        </Text>
      </View>

      <SubjectSelector
        label="Selecione a Disciplina:"
        subjects={subjects}
        selectedId={currentSubject?.id ?? ''}
        onSelect={handleSelectSubject}
        activeColor={theme.colors.secondary}
        emptyMessage="Cadastre uma disciplina na aba Matérias para simular notas."
      />

      <View style={styles.simulationParams}>
        <FormField
          label="Peso da Prova Final"
          keyboardType="decimal-pad"
          value={simulatedWeight}
          onChangeText={setSimulatedWeight}
          containerStyle={{ flex: 1, marginRight: 8, marginTop: 4 }}
        />
        <FormField
          label="Média Desejada"
          keyboardType="decimal-pad"
          value={simulatedTarget}
          onChangeText={setCustomTarget}
          containerStyle={{ flex: 1, marginTop: 4 }}
        />
      </View>

      <View style={styles.resultBox}>
        <Text style={styles.resultTitle}>
          {!currentSubject
            ? 'Nenhuma disciplina selecionada'
            : neededOnFinal <= 0
            ? '🎉 Você já atingiu a média necessária!'
            : 'Você precisa tirar no mínimo:'}
        </Text>
        <Text
          style={[
            styles.resultScore,
            {
              color:
                neededOnFinal > 10
                  ? theme.colors.danger
                  : theme.colors.secondary,
            },
          ]}
        >
          {!currentSubject
            ? '—'
            : neededOnFinal <= 0
            ? '0.0'
            : neededOnFinal > 10
            ? `${neededOnFinal.toFixed(2)} (Atenção!)`
            : neededOnFinal.toFixed(2)}
        </Text>
        <Text style={styles.resultTip}>
          {!currentSubject
            ? 'Adicione matérias e notas para simular o exame final.'
            : neededOnFinal > 10
            ? '⚠️ Atenção: A nota necessária ultrapassa 10.0 com os pesos atuais.'
            : `Com base na sua média parcial atual de ${currentCalc.average.toFixed(1)}.`}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  simulatorCard: {
    backgroundColor: theme.colors.surface,
  },
  simulatorHeader: {
    marginBottom: 4,
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
  simulationParams: {
    flexDirection: 'row',
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
});
