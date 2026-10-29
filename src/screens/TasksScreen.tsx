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
import { Badge } from '../components/common/Badge';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { ModalWrapper } from '../components/common/ModalWrapper';
import { Task, TaskStatus, TaskType } from '../types';

export const TasksScreen: React.FC = () => {
  const { tasks, subjects, addTask, updateTask, deleteTask, toggleTaskStatus } = useApp();

  const [activeFilter, setActiveFilter] = useState<string>('Todas');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [weight, setWeight] = useState('2.0');
  const [type, setType] = useState<TaskType>('Trabalho');
  const [status, setStatus] = useState<TaskStatus>('Pendente');

  const filterTabs = ['Todas', 'Pendente', 'Em Andamento', 'Concluído'];
  const taskTypes: TaskType[] = ['Prova', 'Trabalho', 'Lista', 'Seminário', 'Outro'];
  const statusList: TaskStatus[] = ['Pendente', 'Em Andamento', 'Concluído'];

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'Todas') return true;
    return t.status === activeFilter;
  });

  const handleOpenCreate = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setSelectedSubjectId(subjects[0]?.id ?? '');
    setDueDate(new Date().toISOString().split('T')[0]);
    setWeight('2.0');
    setType('Trabalho');
    setStatus('Pendente');
    setModalVisible(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setSelectedSubjectId(task.subjectId);
    setDueDate(task.dueDate);
    setWeight(task.weight.toString());
    setType(task.type);
    setStatus(task.status);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Por favor, informe o título da atividade.');
      return;
    }

    const parsedWeight = parseFloat(weight) || 1.0;
    const finalSubjectId = selectedSubjectId || (subjects[0]?.id ?? 'sub-1');

    if (editingTask) {
      updateTask({
        ...editingTask,
        title,
        description,
        subjectId: finalSubjectId,
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        weight: parsedWeight,
        type,
        status,
      });
    } else {
      addTask({
        title,
        description,
        subjectId: finalSubjectId,
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        weight: parsedWeight,
        type,
        status,
      });
    }

    setModalVisible(false);
  };

  const handleDelete = (id: string, taskTitle: string) => {
    Alert.alert(
      'Remover Atividade',
      `Deseja realmente remover a atividade "${taskTitle}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => deleteTask(id) },
      ]
    );
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

      {/* Filtros em Abas */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab;
            const count =
              tab === 'Todas'
                ? tasks.length
                : tasks.filter((t) => t.status === tab).length;

            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setActiveFilter(tab)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {tab} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredTasks.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>
              Nenhuma atividade encontrada com o status &quot;{activeFilter}&quot;.
            </Text>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const subject = subjects.find((s) => s.id === task.subjectId);

            return (
              <Card key={task.id} highlightColor={subject?.color} style={styles.taskCard}>
                <View style={styles.cardTop}>
                  <View style={styles.tagRow}>
                    <Badge
                      label={subject?.name ?? 'Disciplina'}
                      color={subject?.color}
                      variant="subject"
                      size="sm"
                    />
                    <Badge
                      label={task.type}
                      variant="neutral"
                      size="sm"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleTaskStatus(task.id)}
                    activeOpacity={0.7}
                  >
                    <Badge
                      label={task.status}
                      status={task.status}
                      variant="status"
                      size="sm"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.description ? (
                  <Text style={styles.taskDescription}>{task.description}</Text>
                ) : null}

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>📅 Entrega: {task.dueDate}</Text>
                  <Text style={styles.metaText}>⚖️ Peso Acadêmico: {task.weight.toFixed(1)}</Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.statusCycleBtn}
                    onPress={() => toggleTaskStatus(task.id)}
                  >
                    <Text style={styles.statusCycleText}>
                      🔄 Mudar Status: <Text style={{ fontWeight: '700' }}>{task.status}</Text>
                    </Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      onPress={() => handleOpenEdit(task)}
                      style={styles.iconBtn}
                    >
                      <Text style={styles.iconBtnText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(task.id, task.title)}
                      style={[styles.iconBtn, { marginLeft: 6 }]}
                    >
                      <Text style={styles.iconBtnText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Modal de Criação / Edição de Tarefa */}
      <ModalWrapper
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingTask ? 'Editar Atividade' : 'Cadastrar Nova Atividade'}
      >
        <Text style={styles.label}>Título da Atividade *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Entrega do Protótipo Navegável"
          placeholderTextColor={theme.colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Descrição / Escopo</Text>
        <TextInput
          style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
          placeholder="Detalhes, requisitos ou links para entrega"
          placeholderTextColor={theme.colors.textMuted}
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Disciplina Associada</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
          {subjects.map((sub) => {
            const isSelected = selectedSubjectId === sub.id;
            return (
              <TouchableOpacity
                key={sub.id}
                style={[
                  styles.subjectSelectChip,
                  isSelected && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
                ]}
                onPress={() => setSelectedSubjectId(sub.id)}
              >
                <Text
                  style={[
                    styles.subjectSelectChipText,
                    isSelected && { color: theme.colors.primary, fontWeight: '700' },
                  ]}
                >
                  {sub.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.rowInputs}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Data de Entrega</Text>
            <TextInput
              style={styles.input}
              placeholder="AAAA-MM-DD"
              placeholderTextColor={theme.colors.textMuted}
              value={dueDate}
              onChangeText={setDueDate}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Peso na Média</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 3.0"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        </View>

        <Text style={styles.label}>Tipo de Atividade</Text>
        <View style={styles.chipGroup}>
          {taskTypes.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeChip, type === t && styles.typeChipActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Status de Progresso</Text>
        <View style={styles.chipGroup}>
          {statusList.map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.typeChip, status === st && styles.typeChipActive]}
              onPress={() => setStatus(st)}
            >
              <Text style={[styles.typeChipText, status === st && styles.typeChipTextActive]}>
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.modalBtns}>
          <Button
            title="Cancelar"
            variant="ghost"
            onPress={() => setModalVisible(false)}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title={editingTask ? 'Salvar Alterações' : 'Criar Atividade'}
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
  filterBar: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceSubtle,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  taskCard: {
    marginBottom: theme.spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginVertical: 4,
  },
  taskDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    paddingVertical: 4,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  statusCycleBtn: {
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.sm,
  },
  statusCycleText: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  iconBtn: {
    padding: 6,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.sm,
  },
  iconBtnText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
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
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  typeChipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  typeChipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  typeChipTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  subjectSelectChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginRight: 6,
  },
  subjectSelectChipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  modalBtns: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
});
