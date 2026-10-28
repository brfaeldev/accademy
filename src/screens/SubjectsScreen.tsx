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
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { ModalWrapper } from '../components/common/ModalWrapper';
import { Subject } from '../types';

export const SubjectsScreen: React.FC = () => {
  const { subjects, addSubject, updateSubject, deleteSubject, getSubjectAverage } = useApp();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [professor, setProfessor] = useState('');
  const [professorEmail, setProfessorEmail] = useState('');
  const [location, setLocation] = useState('');
  const [schedule, setSchedule] = useState('');
  const [color, setColor] = useState('#4F46E5');

  const palette = ['#4F46E5', '#0284C7', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setProfessor('');
    setProfessorEmail('');
    setLocation('');
    setSchedule('');
    setColor(palette[Math.floor(Math.random() * palette.length)]);
    setModalVisible(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setCode(subject.code);
    setProfessor(subject.professor);
    setProfessorEmail(subject.professorEmail);
    setLocation(subject.location);
    setSchedule(subject.schedule);
    setColor(subject.color);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome da disciplina.');
      return;
    }

    if (editingSubject) {
      updateSubject({
        ...editingSubject,
        name,
        code: code || 'DISC',
        professor: professor || 'Não informado',
        professorEmail: professorEmail || 'contato@fho.edu.br',
        location: location || 'Sala a definir',
        schedule: schedule || 'Horário a definir',
        color,
      });
    } else {
      addSubject({
        name,
        code: code || 'DISC',
        professor: professor || 'Não informado',
        professorEmail: professorEmail || 'contato@fho.edu.br',
        location: location || 'Sala a definir',
        schedule: schedule || 'Horário a definir',
        color,
        targetGrade: 7.0,
      });
    }

    setModalVisible(false);
  };

  const handleDelete = (id: string, subjectName: string) => {
    Alert.alert(
      'Remover Disciplina',
      `Deseja realmente remover a matéria "${subjectName}" e suas atividades associadas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => deleteSubject(id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Gestão Acadêmica"
        subtitle="Disciplinas, docentes e locais de aula"
        rightAction={{
          label: '+ Nova Matéria',
          onPress: handleOpenCreate,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.listCount}>
          Total: {subjects.length} matéria{subjects.length !== 1 ? 's' : ''} no período
        </Text>

        {subjects.map((item) => {
          const stats = getSubjectAverage(item.id);
          return (
            <Card key={item.id} highlightColor={item.color} style={styles.subjectCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeBadgeText}>{item.code}</Text>
                  </View>
                  <Text style={styles.subjectName}>{item.name}</Text>
                </View>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeBadgeLabel}>Média Atual</Text>
                  <Text style={[styles.gradeBadgeValue, { color: stats.passing ? theme.colors.success : theme.colors.warning }]}>
                    {stats.average > 0 ? stats.average.toFixed(1) : '—'}
                  </Text>
                </View>
              </View>

              {/* Informações do Docente */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>👨‍🏫</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoTitle}>Docente Responsável</Text>
                    <Text style={styles.infoValue}>{item.professor}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>✉️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoTitle}>Canal de Contato</Text>
                    <Text style={styles.infoValue}>{item.professorEmail}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoTitle}>Localização (Física ou Remota)</Text>
                    <Text style={styles.infoValue}>{item.location}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>🕒</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoTitle}>Dias e Horários</Text>
                    <Text style={styles.infoValue}>{item.schedule}</Text>
                  </View>
                </View>
              </View>

              {/* Ações do Card */}
              <View style={styles.cardActions}>
                <Button
                  title="Editar"
                  variant="outline"
                  size="sm"
                  onPress={() => handleOpenEdit(item)}
                  style={{ marginRight: 8, flex: 1 }}
                />
                <Button
                  title="Excluir"
                  variant="danger"
                  size="sm"
                  onPress={() => handleDelete(item.id, item.name)}
                  style={{ flex: 0.6 }}
                />
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* Modal de Criação / Edição de Disciplina */}
      <ModalWrapper
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingSubject ? 'Editar Disciplina' : 'Cadastrar Nova Disciplina'}
      >
        <Text style={styles.label}>Nome da Disciplina *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Engenharia de Software"
          placeholderTextColor={theme.colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        <View style={styles.rowInputs}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Código / Sigla</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: ES-4B"
              placeholderTextColor={theme.colors.textMuted}
              value={code}
              onChangeText={setCode}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Cor do Tema</Text>
            <View style={styles.colorRow}>
              {palette.map((c) => (
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
          </View>
        </View>

        <Text style={styles.label}>Professor Responsável</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Profa. Mariana Costa"
          placeholderTextColor={theme.colors.textMuted}
          value={professor}
          onChangeText={setProfessor}
        />

        <Text style={styles.label}>E-mail Institucional</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: mariana.costa@fho.edu.br"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="email-address"
          value={professorEmail}
          onChangeText={setProfessorEmail}
        />

        <Text style={styles.label}>Local de Aula (Bloco, sala, lab ou link)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Bloco B - Sala 205 ou Google Meet"
          placeholderTextColor={theme.colors.textMuted}
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Dias e Horários</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Quartas • 19h10 - 20h50"
          placeholderTextColor={theme.colors.textMuted}
          value={schedule}
          onChangeText={setSchedule}
        />

        <View style={styles.modalBtns}>
          <Button
            title="Cancelar"
            variant="ghost"
            onPress={() => setModalVisible(false)}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title={editingSubject ? 'Salvar Alterações' : 'Cadastrar Matéria'}
            variant="primary"
            onPress={handleSave}
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
  listCount: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  subjectCard: {
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  codeBadge: {
    backgroundColor: theme.colors.surfaceSubtle,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  codeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  subjectName: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  gradeBadge: {
    alignItems: 'flex-end',
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
  },
  gradeBadgeLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  gradeBadgeValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  infoSection: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  infoTitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  colorSelected: {
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  modalBtns: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
});
