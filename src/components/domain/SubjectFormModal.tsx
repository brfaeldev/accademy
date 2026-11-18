/**
 * Componente SubjectFormModal (Formulário de Disciplina)
 *
 * Modal para criação e edição de disciplinas, incluindo código institucional,
 * nome do docente, e-mail de contato, sala, horários e meta de nota.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Subject } from '../../types';
import { theme } from '../../theme/theme';
import { ModalWrapper } from '../common/ModalWrapper';
import { FormField } from '../common/FormField';
import { Button } from '../common/Button';
import { parseDecimalInput } from '../../utils/formatters';

interface SubjectFormModalProps {
  visible: boolean;
  editingSubject: Subject | null;
  onClose: () => void;
  onSubmit: (data: Omit<Subject, 'id'>, editingId?: string) => Promise<void> | void;
}

const PALETTE = ['#4F46E5', '#0284C7', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

const SubjectFormContent: React.FC<Omit<SubjectFormModalProps, 'visible'>> = ({
  editingSubject,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(editingSubject?.name ?? '');
  const [code, setCode] = useState(editingSubject?.code ?? '');
  const [professor, setProfessor] = useState(editingSubject?.professor ?? '');
  const [professorEmail, setProfessorEmail] = useState(
    editingSubject?.professorEmail ?? ''
  );
  const [location, setLocation] = useState(editingSubject?.location ?? '');
  const [schedule, setSchedule] = useState(editingSubject?.schedule ?? '');
  const [targetGrade, setTargetGrade] = useState(
    String(editingSubject?.targetGrade ?? 7.0)
  );
  const [color, setColor] = useState(editingSubject?.color ?? PALETTE[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Por favor, informe o nome da disciplina.');
      return;
    }

    const parsedTarget = parseDecimalInput(targetGrade, 7.0);
    if (parsedTarget <= 0 || parsedTarget > 10) {
      setErrorMsg('A meta de aprovação deve estar entre 0,1 e 10,0.');
      return;
    }

    await onSubmit(
      {
        name: name.trim(),
        code: code.trim() || 'DISC',
        professor: professor.trim() || 'Não informado',
        professorEmail: professorEmail.trim() || 'contato@fho.edu.br',
        location: location.trim() || 'Sala a definir',
        schedule: schedule.trim() || 'Horário a definir',
        color,
        targetGrade: parsedTarget,
      },
      editingSubject?.id
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
        label="Nome da Disciplina"
        required
        placeholder="Ex: Engenharia de Software"
        value={name}
        onChangeText={(t) => {
          setName(t);
          if (errorMsg) setErrorMsg(null);
        }}
      />

      <View style={styles.rowInputs}>
        <FormField
          label="Código / Sigla"
          placeholder="Ex: ES-4B"
          value={code}
          onChangeText={setCode}
          containerStyle={{ flex: 1, marginRight: 8 }}
        />

        <FormField
          label="Meta de Aprovação"
          placeholder="Ex: 7,0"
          keyboardType="decimal-pad"
          value={targetGrade}
          onChangeText={setTargetGrade}
          containerStyle={{ flex: 1 }}
        />
      </View>

      <Text style={styles.label}>Cor do Tema</Text>
      <View style={styles.colorRow}>
        {PALETTE.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorCircle,
              { backgroundColor: c },
              color === c && styles.colorSelected,
            ]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>

      <FormField
        label="Professor Responsável"
        placeholder="Ex: Profa. Mariana Costa"
        value={professor}
        onChangeText={setProfessor}
      />

      <FormField
        label="E-mail Institucional"
        placeholder="Ex: mariana.costa@fho.edu.br"
        keyboardType="email-address"
        autoCapitalize="none"
        value={professorEmail}
        onChangeText={setProfessorEmail}
      />

      <FormField
        label="Local de Aula (Bloco, sala, lab ou link)"
        placeholder="Ex: Bloco B - Sala 205 ou Google Meet"
        value={location}
        onChangeText={setLocation}
      />

      <FormField
        label="Dias e Horários"
        placeholder="Ex: Segundas e Quartas • 19h10 - 20h50"
        value={schedule}
        onChangeText={setSchedule}
      />

      <View style={styles.modalBtns}>
        <Button
          title="Cancelar"
          variant="ghost"
          onPress={onClose}
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button
          title={editingSubject ? 'Salvar Alterações' : 'Cadastrar Matéria'}
          variant="primary"
          onPress={handleSave}
          style={{ flex: 1.5 }}
        />
      </View>
    </>
  );
};

export const SubjectFormModal: React.FC<SubjectFormModalProps> = ({
  visible,
  editingSubject,
  onClose,
  onSubmit,
}) => {
  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={editingSubject ? 'Editar Disciplina' : 'Cadastrar Nova Disciplina'}
    >
      {visible ? (
        <SubjectFormContent
          key={editingSubject?.id ?? 'new'}
          editingSubject={editingSubject}
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 10,
    marginBottom: 6,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
  },
  colorSelected: {
    borderWidth: 2.5,
    borderColor: '#0F172A',
  },
  modalBtns: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
});
