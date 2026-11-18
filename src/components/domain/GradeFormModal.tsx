/**
 * Componente GradeFormModal (Formulário de Notas e Avaliações)
 *
 * Modal para lançamento e edição de notas individuais (P1, P2, Trabalhos),
 * incluindo seleção da matéria vinculada, valor da nota e respectivo peso acadêmico.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GradeItem, Subject } from '../../types';
import { theme } from '../../theme/theme';
import { ModalWrapper } from '../common/ModalWrapper';
import { FormField } from '../common/FormField';
import { SubjectSelector } from '../common/SubjectSelector';
import { Button } from '../common/Button';
import { parseDecimalInput } from '../../utils/formatters';

interface GradeFormModalProps {
  visible: boolean;
  editingGrade: GradeItem | null;
  initialSubjectId?: string;
  subjects: Subject[];
  onClose: () => void;
  onSubmit: (
    data: Omit<GradeItem, 'id'>,
    editingId?: string
  ) => Promise<void> | void;
}

const GradeFormContent: React.FC<Omit<GradeFormModalProps, 'visible'>> = ({
  editingGrade,
  initialSubjectId,
  subjects,
  onClose,
  onSubmit,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    editingGrade?.subjectId || initialSubjectId || subjects[0]?.id || ''
  );
  const [gradeName, setGradeName] = useState(editingGrade?.name ?? '');
  const [gradeValue, setGradeValue] = useState(
    editingGrade ? String(editingGrade.grade) : ''
  );
  const [gradeWeight, setGradeWeight] = useState(
    editingGrade ? String(editingGrade.weight) : '3.0'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorMsg(null);

    if (subjects.length === 0) {
      setErrorMsg(
        'Cadastre pelo menos uma disciplina na aba "Matérias" antes de lançar notas.'
      );
      return;
    }

    const finalSubjectId = selectedSubjectId || subjects[0]?.id;
    if (!finalSubjectId) {
      setErrorMsg('Selecione a disciplina da avaliação.');
      return;
    }

    if (!gradeName.trim()) {
      setErrorMsg('Informe a identificação da avaliação (ex: Prova P1).');
      return;
    }

    if (!gradeValue.trim()) {
      setErrorMsg('Informe a nota obtida na avaliação.');
      return;
    }

    const parsedGrade = parseDecimalInput(gradeValue, NaN);
    if (Number.isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 10) {
      setErrorMsg('A nota deve estar entre 0,0 e 10,0.');
      return;
    }

    const parsedWeight = parseDecimalInput(gradeWeight, 1.0);
    if (parsedWeight <= 0) {
      setErrorMsg('O peso da avaliação deve ser maior que zero.');
      return;
    }

    await onSubmit(
      {
        subjectId: finalSubjectId,
        name: gradeName.trim(),
        grade: parsedGrade,
        weight: parsedWeight,
      },
      editingGrade?.id
    );

    onClose();
  };

  return (
    <>
      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
        </View>
      ) : null}

      <SubjectSelector
        label="Disciplina da Avaliação *"
        subjects={subjects}
        selectedId={selectedSubjectId}
        onSelect={(id) => {
          setSelectedSubjectId(id);
          if (errorMsg) setErrorMsg(null);
        }}
        emptyMessage="⚠️ Nenhuma matéria cadastrada! Cadastre uma disciplina na aba Matérias antes de lançar notas."
      />

      <FormField
        label="Identificação da Avaliação"
        required
        placeholder="Ex: Prova P1, Trabalho Semestral"
        value={gradeName}
        onChangeText={(t) => {
          setGradeName(t);
          if (errorMsg) setErrorMsg(null);
        }}
      />

      <View style={styles.rowInputs}>
        <FormField
          label="Nota Obtida (0 a 10)"
          required
          placeholder="Ex: 8,5"
          keyboardType="decimal-pad"
          value={gradeValue}
          onChangeText={(t) => {
            setGradeValue(t);
            if (errorMsg) setErrorMsg(null);
          }}
          containerStyle={{ flex: 1, marginRight: 8 }}
        />

        <FormField
          label="Peso da Avaliação"
          placeholder="Ex: 3,0"
          keyboardType="decimal-pad"
          value={gradeWeight}
          onChangeText={setGradeWeight}
          containerStyle={{ flex: 1 }}
        />
      </View>

      <View style={styles.modalBtns}>
        <Button
          title="Cancelar"
          variant="ghost"
          onPress={onClose}
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button
          title={editingGrade ? 'Salvar Alterações' : 'Salvar Nota'}
          variant="primary"
          disabled={subjects.length === 0}
          onPress={handleSave}
          style={{ flex: 1.5 }}
        />
      </View>
    </>
  );
};

export const GradeFormModal: React.FC<GradeFormModalProps> = ({
  visible,
  editingGrade,
  initialSubjectId,
  subjects,
  onClose,
  onSubmit,
}) => {
  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={editingGrade ? 'Editar Nota de Avaliação' : 'Lançar Nota de Avaliação'}
    >
      {visible ? (
        <GradeFormContent
          key={`${editingGrade?.id ?? 'new'}-${initialSubjectId ?? ''}`}
          editingGrade={editingGrade}
          initialSubjectId={initialSubjectId}
          subjects={subjects}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null}
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  errorBox: {
    backgroundColor: theme.colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: theme.borderRadius.md,
    padding: 10,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.dangerText,
    fontWeight: '600',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  modalBtns: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
});
