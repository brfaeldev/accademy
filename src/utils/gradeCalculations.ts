/**
 * Cálculos Acadêmicos e Médias (gradeCalculations.ts)
 *
 * Centraliza as regras de negócio matemáticas: cálculo de média ponderada,
 * nota necessária no exame final e média global ponderada do estudante.
 */

import { GradeItem, Subject } from '../types';

export interface SubjectAverageResult {
  average: number;
  totalWeight: number;
  passing: boolean;
}

/**
 * Calcula a média ponderada de uma disciplina específica.
 */
export function calculateSubjectAverage(
  grades: GradeItem[],
  subjectId: string,
  targetGrade: number = 7.0
): SubjectAverageResult {
  const items = grades.filter((g) => g.subjectId === subjectId);
  if (items.length === 0) {
    return { average: 0, totalWeight: 0, passing: false };
  }

  const totalWeight = items.reduce((acc, curr) => acc + curr.weight, 0);
  const weightedSum = items.reduce((acc, curr) => acc + curr.grade * curr.weight, 0);
  const average = totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(2)) : 0;

  return {
    average,
    totalWeight,
    passing: average >= targetGrade,
  };
}

/**
 * Calcula a nota necessária na prova final para atingir a média desejada.
 */
export function calculateNeededForFinalExam(
  grades: GradeItem[],
  subjectId: string,
  finalExamWeight: number = 4.0,
  targetGrade: number = 7.0
): number {
  const { average, totalWeight } = calculateSubjectAverage(grades, subjectId, targetGrade);
  if (totalWeight === 0) return targetGrade;
  if (finalExamWeight <= 0) return 0;

  const requiredTotal = targetGrade * (totalWeight + finalExamWeight);
  const currentPoints = average * totalWeight;
  const needed = (requiredTotal - currentPoints) / finalExamWeight;

  return Math.max(0, Number(needed.toFixed(2)));
}

/**
 * Calcula a média global ponderada considerando a média de cada disciplina que possui notas lançadas.
 */
export function calculateGlobalAverage(subjects: Subject[], grades: GradeItem[]): number {
  if (grades.length === 0) return 0;

  const subjectAverages: number[] = [];

  for (const subject of subjects) {
    const stats = calculateSubjectAverage(grades, subject.id, subject.targetGrade ?? 7.0);
    if (stats.totalWeight > 0) {
      subjectAverages.push(stats.average);
    }
  }

  if (subjectAverages.length === 0) {
    return 0;
  }

  const sum = subjectAverages.reduce((acc, avg) => acc + avg, 0);
  return Number((sum / subjectAverages.length).toFixed(1));
}
