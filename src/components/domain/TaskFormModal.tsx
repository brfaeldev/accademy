import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Subject, Task, TaskStatus, TaskType } from '../../types';
import { theme } from '../../theme/theme';
import { ModalWrapper } from '../common/ModalWrapper';
import { FormField } from '../common/FormField';
import { SubjectSelector } from '../common/SubjectSelector';
import { ChipSelector, ChipOption } from '../common/ChipSelector';
import { Button } from '../common/Button';
import { parseDecimalInput } from '../../utils/formatters';
import {
  getTodayISO,
  addDaysISO,
  normalizeDateInput,
  formatDateDisplay,
} from '../../utils/dateUtils';

interface TaskFormModalProps {
  visible: boolean;
  editingTask: Task | null;
  subjects: Subject[];
  onClose: () => void;
  onSubmit: (data: Omit<Task, 'id'>, editingId?: string) => Promise<void> | void;
}

const TASK_TYPE_OPTIONS: ChipOption<TaskType>[] = [
  { value: 'Prova', label: 'Prova' },
  { value: 'Trabalho', label: 'Trabalho' },
  { value: 'Lista', label: 'Lista' },
  { value: 'Seminário', label: 'Seminário' },
  { value: 'Outro', label: 'Outro' },
];

const STATUS_OPTIONS: ChipOption<TaskStatus>[] = [
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Em Andamento', label: 'Em Andamento' },
  { value: 'Concluído', label: 'Concluído' },
];

const TaskFormContent: React.FC<Omit<TaskFormModalProps, 'visible'>> = ({
  editingTask,
  subjects,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState(editingTask?.title ?? '');
  const [description, setDescription] = useState(
    editingTask?.description || ''
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    editingTask?.subjectId || subjects[0]?.id || ''
  );
  const [dueDate, setDueDate] = useState(
    formatDateDisplay(editingTask?.dueDate ?? getTodayISO())
  );
  const [weight, setWeight] = useState(
    editingTask ? String(editingTask.weight) : '2.0'
  );
  const [type, setType] = useState<TaskType>(editingTask?.type ?? 'Trabalho');
  const [status, setStatus] = useState<TaskStatus>(
    editingTask?.status ?? 'Pendente'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuickDate = (isoDate: string) => {
    setDueDate(formatDateDisplay(isoDate));
    if (errorMsg) setErrorMsg(null);
  };

  const handleSave = async () => {
    setErrorMsg(null);

    if (subjects.length === 0) {
      setErrorMsg(
        'Cadastre pelo menos uma disciplina na aba "Matérias" antes de criar uma atividade.'
      );
      return;
    }

    const finalSubjectId = selectedSubjectId || subjects[0]?.id;
    if (!finalSubjectId) {
      setErrorMsg('Selecione uma disciplina associada para esta atividade.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Por favor, informe o título da atividade.');
      return;
    }

    const normalizedDate = normalizeDateInput(dueDate);
    if (!normalizedDate) {
      setErrorMsg('Informe uma data válida no formato DD/MM/AAAA ou AAAA-MM-DD.');
      return;
    }

    const parsedWeight = parseDecimalInput(weight, 1.0);
    if (parsedWeight <= 0) {
      setErrorMsg('O peso da atividade deve ser maior que zero.');
      return;
    }

    await onSubmit(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId: finalSubjectId,
        dueDate: normalizedDate,
        weight: parsedWeight,
        type,
        status,
      },
      editingTask?.id
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

      <FormField
        label="Título da Atividade"
        required
        placeholder="Ex: Entrega do Protótipo Navegável"
        value={title}
        onChangeText={(t) => {
          setTitle(t);
          if (errorMsg) setErrorMsg(null);
        }}
      />

      <FormField
        label="Descrição / Escopo"
        placeholder="Detalhes, requisitos ou links para entrega"
        multiline
        numberOfLines={3}
        value={description}
        onChangeText={setDescription}
      />

      <SubjectSelector
        label="Disciplina Associada *"
        subjects={subjects}
        selectedId={selectedSubjectId}
        onSelect={(id) => {
          setSelectedSubjectId(id);
          if (errorMsg) setErrorMsg(null);
        }}
        emptyMessage="⚠️ Nenhuma disciplina cadastrada! Cadastre uma disciplina na aba Matérias antes de criar tarefas."
      />

      <View style={styles.rowInputs}>
        <FormField
          label="Data de Entrega"
          required
          placeholder="DD/MM/AAAA"
          value={dueDate}
          onChangeText={(t) => {
            setDueDate(t);
            if (errorMsg) setErrorMsg(null);
          }}
          containerStyle={{ flex: 1.2, marginRight: 8 }}
        />

        <FormField
          label="Peso na Média"
          placeholder="Ex: 3,0"
          keyboardType="decimal-pad"
          value={weight}
          onChangeText={setWeight}
          containerStyle={{ flex: 0.8 }}
        />
      </View>

      <View style={styles.quickDateRow}>
        <Text style={styles.quickDateLabel}>Atalhos de prazo:</Text>
        <TouchableOpacity
          style={styles.quickDateChip}
          onPress={() => handleQuickDate(getTodayISO())}
        >
          <Text style={styles.quickDateText}>Hoje</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickDateChip}
          onPress={() => handleQuickDate(addDaysISO(1))}
        >
          <Text style={styles.quickDateText}>Amanhã</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickDateChip}
          onPress={() => handleQuickDate(addDaysISO(7))}
        >
          <Text style={styles.quickDateText}>+7 dias</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Tipo de Atividade</Text>
      <ChipSelector
        options={TASK_TYPE_OPTIONS}
        value={type}
        onChange={setType}
        variant="chips"
      />

      <Text style={styles.sectionLabel}>Status de Progresso</Text>
      <ChipSelector
        options={STATUS_OPTIONS}
        value={status}
        onChange={setStatus}
        variant="chips"
      />

      <View style={styles.modalBtns}>
        <Button
          title="Cancelar"
          variant="ghost"
          onPress={onClose}
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button
          title={editingTask ? 'Salvar Alterações' : 'Criar Atividade'}
          variant="primary"
          disabled={subjects.length === 0}
          onPress={handleSave}
          style={{ flex: 1.5 }}
        />
      </View>
    </>
  );
};

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  editingTask,
  subjects,
  onClose,
  onSubmit,
}) => {
  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={editingTask ? 'Editar Atividade' : 'Cadastrar Nova Atividade'}
    >
      {visible ? (
        <TaskFormContent
          key={editingTask?.id ?? 'new'}
          editingTask={editingTask}
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
  quickDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  quickDateLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginRight: 4,
  },
  quickDateChip: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  quickDateText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  modalBtns: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
});
